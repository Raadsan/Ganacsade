import prisma from '../../lib/config/prisma.js';
import { sendOrderAdvanceNotifications } from '../../lib/services/notificationService.js';

const toOrderPayload = (order) => ({
  ...order,
  customer_name: `${order.users?.first_name || ''} ${order.users?.last_name || ''}`.trim(),
  customer_email: order.users?.email || null,
  users: undefined,
});

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizePhone = (value) => String(value || '').replace(/\s+/g, '').trim();

const getDeliveryRoleIds = async () => {
  const deliveryRoles = await prisma.role.findMany({
    where: {
      name: {
        contains: 'delivery',
        mode: 'insensitive',
      },
    },
    select: { id: true },
  });
  return deliveryRoles.map((role) => role.id);
};

const ORDER_STATUS_FLOW = ['pending', 'processing', 'delivered'];

const getStatusStep = (status) => {
  const normalized = String(status || 'pending').toLowerCase();
  return ORDER_STATUS_FLOW.indexOf(normalized);
};

const getNextStatus = (currentStatus) => ORDER_STATUS_FLOW[getStatusStep(currentStatus) + 1] || null;

const dispatchOrderNotifications = (payload) => {
  void sendOrderAdvanceNotifications(payload).catch((error) => {
    console.error('Order notification dispatch failed:', error?.message || error);
  });
};

const getLinkedDeliveryPersonIdsForUser = async (user) => {
  const email = normalizeEmail(user?.email);
  const phone = normalizePhone(user?.phone_number);
  const orFilters = [];

  if (email) {
    orFilters.push({ email });
  }
  if (phone) {
    orFilters.push({ phone });
  }
  if (orFilters.length === 0) {
    return [];
  }

  const linkedDeliveryPersons = await prisma.delivery_persons.findMany({
    where: {
      is_active: true,
      OR: orFilters,
    },
    select: { id: true },
  });

  return linkedDeliveryPersons.map((deliveryPerson) => deliveryPerson.id);
};

const getOrdersAccess = async (user) => {
  const linkedDeliveryPersonIds = await getLinkedDeliveryPersonIdsForUser(user);
  const roleName = String(user?.role || '').toLowerCase();
  const isDeliveryUser =
    linkedDeliveryPersonIds.length > 0
    || roleName.includes('delivery')
    || roleName === 'delivery_person';

  if (isDeliveryUser) {
    return {
      canView: true,
      canAdd: false,
      canEdit: true,
      canDelete: false,
      canAssign: false,
      assignedOnly: true,
    };
  }

  let roleId = user?.role_id || null;
  if (!roleId && user?.role) {
    const role = await prisma.role.findUnique({
      where: { name: user.role },
      select: { id: true },
    });
    roleId = role?.id || null;
  }

  if (!roleId) {
    return {
      canView: false,
      canAdd: false,
      canEdit: false,
      canDelete: false,
      canAssign: false,
      assignedOnly: true,
    };
  }

  const rolePermissions = await prisma.rolePermissions.findUnique({
    where: { roleId },
    include: {
      menus: {
        where: {
          menu: {
            OR: [
              { url: '/orders' },
              { title: { equals: 'Orders', mode: 'insensitive' } },
            ],
          },
        },
        select: {
          canView: true,
          canAdd: true,
          canEdit: true,
          canDelete: true,
          canAssign: true,
          canViewAllOrders: true,
          canViewByRole: true,
        },
        take: 1,
      },
    },
  });

  const orderPermission = rolePermissions?.menus?.[0];
  const canView = Boolean(orderPermission?.canView);
  const canAdd = Boolean(orderPermission?.canAdd);
  const canEdit = Boolean(orderPermission?.canEdit);
  const canDelete = Boolean(orderPermission?.canDelete);
  const canAssign = Boolean(orderPermission?.canAssign);

  let assignedOnly = false;
  if (orderPermission?.canViewAllOrders) {
    assignedOnly = false;
  } else if (orderPermission?.canViewByRole) {
    assignedOnly = true;
  } else {
    assignedOnly = canView && !canAssign;
  }

  return {
    canView,
    canAdd,
    canEdit,
    canDelete,
    canAssign,
    assignedOnly,
  };
};

const toOrdersMeta = (access, pagination = {}) => ({
  ...pagination,
  assignedOnly: access.assignedOnly,
  canAssign: access.canAssign,
  canAdd: access.canAdd,
  canEdit: access.canEdit,
  canDelete: access.canDelete,
});

export const getOrders = async (req, res, next) => {
  try {
    const {
      status,
      search,
      dateFrom,
      dateTo,
      assignmentFilter = 'all',
      page = 1,
      limit = 50,
    } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;
    const access = await getOrdersAccess(req.user);

    if (!access.canView) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view orders',
      });
    }

    const linkedDeliveryPersonIds = access.assignedOnly
      ? await getLinkedDeliveryPersonIdsForUser(req.user)
      : [];

    const where = {
      ...(access.assignedOnly
        ? {
            delivery_person_id: linkedDeliveryPersonIds.length
              ? { in: linkedDeliveryPersonIds }
              : '__no_delivery_person__',
          }
        : {}),
      AND: [
        {
          OR: [{ order_type: null }, { order_type: { not: 'data_package' } }],
        },
        ...(status && status !== 'all' ? [{ status }] : []),
        ...(search
          ? [
              {
                OR: [
                  { order_number: { contains: search, mode: 'insensitive' } },
                  {
                    users: {
                      OR: [
                        { first_name: { contains: search, mode: 'insensitive' } },
                        { last_name: { contains: search, mode: 'insensitive' } },
                      ],
                    },
                  },
                ],
              },
            ]
          : []),
        ...(dateFrom || dateTo
          ? [
              {
                created_at: {
                  ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                  ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59`) } : {}),
                },
              },
            ]
          : []),
        ...(assignmentFilter === 'assigned'
          ? [{ delivery_person_id: { not: null } }]
          : assignmentFilter === 'not_assigned'
            ? [{ delivery_person_id: null }]
            : []),
      ],
    };

    const [result, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        select: {
          id: true,
          order_number: true,
          user_id: true,
          subtotal: true,
          tax: true,
          shipping: true,
          discount: true,
          total: true,
          status: true,
          payment_status: true,
          shipping_address: true,
          payment_method: true,
          tracking_number: true,
          notes: true,
          delivery_person_id: true,
          delivery_person_name: true,
          created_at: true,
          updated_at: true,
          users: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.orders.count({ where }),
    ]);

    res.json({
      success: true,
      data: result.map(toOrderPayload),
      meta: toOrdersMeta(access, {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }),
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const access = await getOrdersAccess(req.user);

    if (!access.canView) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view this order',
      });
    }

    const linkedDeliveryPersonIds = access.assignedOnly
      ? await getLinkedDeliveryPersonIdsForUser(req.user)
      : [];

    const order = await prisma.orders.findFirst({
      where: {
        id,
        ...(access.assignedOnly
          ? {
              delivery_person_id: linkedDeliveryPersonIds.length
                ? { in: linkedDeliveryPersonIds }
                : '__no_delivery_person__',
            }
          : {}),
      },
      include: {
        users: {
          select: { first_name: true, last_name: true, email: true, phone_number: true },
        },
        order_items: true,
        order_status_history: { orderBy: { created_at: 'desc' } },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.json({
      success: true,
      data: {
        ...order,
        customer_name: `${order.users?.first_name || ''} ${order.users?.last_name || ''}`.trim(),
        customer_email: order.users?.email || null,
        customer_phone: order.users?.phone_number || null,
        items: order.order_items,
        statusHistory: order.order_status_history,
        users: undefined,
        order_items: undefined,
        order_status_history: undefined,
      },
    });
  } catch (error) {
    
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const access = await getOrdersAccess(req.user);

    if (!access.canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update orders',
      });
    }

    const existing = await prisma.orders.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const currentStep = getStatusStep(existing.status);
    const requestedStep = getStatusStep(status);
    if (requestedStep <= currentStep) {
      return res.status(400).json({
        success: false,
        message: 'Statuskan waa la dhaafay. U gudub midka xiga.',
      });
    }

    const nextStatus = getNextStatus(existing.status);
    if (status !== nextStatus) {
      return res.status(400).json({
        success: false,
        message: 'You can only advance to the next status',
      });
    }

    const updateData = { status };
    if (status !== 'delivered') {
      updateData.delivery_delivered_at = null;
      updateData.actual_delivery = null;
    }

    const result = await prisma.orders.update({
      where: { id },
      data: updateData,
    });

    await prisma.order_status_history.create({
      data: {
        order_id: id,
        status,
        notes: notes || `Status updated to ${status}`,
        updated_by: req.user.id,
        updated_by_name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Admin',
      },
    });

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const advanceOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      status,
      assignmentType = 'delivery',
      deliveryPersonId,
      customContactName,
      customContactPhone,
      pickupTimeStart,
      pickupTimeEnd,
      description,
    } = req.body;
    const access = await getOrdersAccess(req.user);

    if (!access.canEdit) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update orders',
      });
    }

    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true,
          },
        },
        order_items: {
          select: {
            product_name: true,
            quantity: true,
            unit_price: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const currentStep = getStatusStep(order.status);
    const requestedStep = getStatusStep(status);
    if (requestedStep <= currentStep) {
      return res.status(400).json({
        success: false,
        message: 'Step-kan horey ayaad u martay. U gudub step-ka xiga.',
        code: 'STATUS_ALREADY_PASSED',
      });
    }

    const nextStatus = getNextStatus(order.status);
    if (status !== nextStatus) {
      return res.status(400).json({
        success: false,
        message: 'Ma boodi kartid step-kan. Dhammeystir step-ka hore marka hore.',
        code: 'STATUS_SKIP_NOT_ALLOWED',
      });
    }

    const notes = String(description || '').trim();
    const historyNote = notes || `Status advanced to ${status}`;
    const updateData = { status };
    let deliveryPerson = null;
    let pickupStart = null;
    let pickupEnd = null;

    if (status === 'processing') {
      const updatedOrder = await prisma.orders.update({
        where: { id },
        data: updateData,
        include: {
          users: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
      });

      await prisma.order_status_history.create({
        data: {
          order_id: id,
          status,
          notes: historyNote,
          updated_by: req.user.id,
          updated_by_name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Admin',
        },
      });

      dispatchOrderNotifications({
        order: {
          ...updatedOrder,
          order_items: order.order_items,
          users: order.users,
        },
        deliveryPerson: null,
        pickupTimeStart: null,
        pickupTimeEnd: null,
        description: notes,
        newStatus: status,
      });

      return res.json({
        success: true,
        message: 'Order status advanced successfully',
        data: toOrderPayload(updatedOrder),
      });
    }

    if (status === 'delivered') {
      if (!pickupTimeStart || !pickupTimeEnd) {
        return res.status(400).json({
          success: false,
          message: 'pickupTimeStart and pickupTimeEnd are required',
        });
      }

      pickupStart = new Date(pickupTimeStart);
      pickupEnd = new Date(pickupTimeEnd);
      if (Number.isNaN(pickupStart.getTime()) || Number.isNaN(pickupEnd.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid pickup time range',
        });
      }

      if (pickupEnd <= pickupStart) {
        return res.status(400).json({
          success: false,
          message: 'Pickup end time must be after start time',
        });
      }

      if (assignmentType === 'custom') {
        const contactName = String(customContactName || '').trim();
        const contactPhone = String(customContactPhone || '').trim();
        if (!contactName || !contactPhone) {
          return res.status(400).json({
            success: false,
            message: 'customContactName and customContactPhone are required for Me assignment',
          });
        }

        deliveryPerson = {
          user_id: null,
          name: contactName,
          phone: contactPhone,
          email: null,
        };

        updateData.delivery_person_id = null;
        updateData.delivery_person_name = contactName;
        updateData.delivery_assigned_at = new Date();
        updateData.delivery_picked_up_at = pickupStart;
        updateData.estimated_delivery = pickupEnd;
        updateData.delivery_delivered_at = new Date();
        updateData.actual_delivery = new Date();

        const contactNote = `Pickup contact: ${contactName} (${contactPhone})`;
        updateData.admin_notes = notes ? `${notes}\n${contactNote}` : contactNote;
      } else {
        if (!deliveryPersonId) {
          return res.status(400).json({
            success: false,
            message: 'deliveryPersonId is required for Delivery assignment',
          });
        }

        deliveryPerson = await prisma.delivery_persons.findFirst({
          where: {
            id: deliveryPersonId,
            is_active: true,
          },
          select: {
            id: true,
            user_id: true,
            name: true,
            email: true,
            phone: true,
          },
        });

        if (!deliveryPerson) {
          return res.status(404).json({
            success: false,
            message: 'Delivery person not found',
          });
        }

        updateData.delivery_person_id = deliveryPerson.id;
        updateData.delivery_person_name = deliveryPerson.name || 'Delivery Person';
        updateData.delivery_assigned_at = new Date();
        updateData.delivery_picked_up_at = pickupStart;
        updateData.estimated_delivery = pickupEnd;
        updateData.delivery_delivered_at = new Date();
        updateData.actual_delivery = new Date();

        if (notes) {
          updateData.admin_notes = notes;
        }
      }
    }

    const updatedOrder = await prisma.orders.update({
      where: { id },
      data: updateData,
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
          },
        },
      },
    });

    await prisma.order_status_history.create({
      data: {
        order_id: id,
        status,
        notes: deliveryPerson
          ? `${historyNote} | Delivery: ${deliveryPerson.name}`
          : historyNote,
        updated_by: req.user.id,
        updated_by_name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Admin',
      },
    });

    const responsePayload = toOrderPayload(updatedOrder);

    res.json({
      success: true,
      message: 'Order marked as delivered successfully',
      data: responsePayload,
    });

    dispatchOrderNotifications({
      order: {
        ...updatedOrder,
        order_items: order.order_items,
        users: order.users,
      },
      deliveryPerson,
      pickupTimeStart: pickupStart,
      pickupTimeEnd: pickupEnd,
      description: notes,
      newStatus: status,
    });
  } catch (error) {
    next(error);
  }
};

export const assignOrderDelivery = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { deliveryPersonId } = req.body;
    const access = await getOrdersAccess(req.user);

    if (!access.canAssign) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to assign orders',
      });
    }

    if (!deliveryPersonId || typeof deliveryPersonId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'deliveryPersonId is required',
      });
    }

    const order = await prisma.orders.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const deliveryRoleIds = await getDeliveryRoleIds();
    if (deliveryRoleIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No delivery roles configured',
      });
    }

    const deliveryPerson = await prisma.delivery_persons.findFirst({
      where: {
        id: deliveryPersonId,
        is_active: true,
      },
      select: {
        id: true,
        user_id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!deliveryPerson) {
      return res.status(404).json({
        success: false,
        message: 'Delivery person not found',
      });
    }

    const nextStatus = order.status === 'delivered' ? 'processing' : (order.status || 'processing');

    const updatedOrder = await prisma.orders.update({
      where: { id },
      data: {
        delivery_person_id: deliveryPerson.id,
        delivery_person_name: deliveryPerson.name || 'Delivery Person',
        delivery_assigned_at: new Date(),
        delivery_delivered_at: null,
        actual_delivery: null,
        status: nextStatus === 'pending' ? 'processing' : nextStatus,
      },
      include: {
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true,
          },
        },
        order_items: {
          select: {
            quantity: true,
            product_name: true,
          },
        },
      },
    });

    await prisma.order_status_history.create({
      data: {
        order_id: id,
        status: 'processing',
        notes: `Assigned to delivery: ${deliveryPerson.name || 'Delivery Person'}`,
        updated_by: req.user.id,
        updated_by_name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Admin',
      },
    });

    const responsePayload = toOrderPayload(updatedOrder);

    res.json({
      success: true,
      message: 'Delivery person assigned successfully',
      data: responsePayload,
    });

    dispatchOrderNotifications({
      order: updatedOrder,
      deliveryPerson,
      pickupTimeStart: null,
      pickupTimeEnd: null,
      description: `Assigned to ${deliveryPerson.name || 'delivery person'}`,
      newStatus: updatedOrder.status,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAssignableDeliveryUsers = async (req, res, next) => {
  try {
    const access = await getOrdersAccess(req.user);
    if (!access.canAssign) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to assign orders',
      });
    }

    const deliveryPersons = await prisma.delivery_persons.findMany({
      where: {
        is_active: true,
        is_available: true,
      },
      select: {
        id: true,
        user_id: true,
        name: true,
        email: true,
        phone: true,
        user_photo_url: true,
        vehicle_type: true,
        vehicle_number: true,
        location: true,
      },
      orderBy: [{ name: 'asc' }],
    });

    return res.json({
      success: true,
      data: deliveryPersons.map((person) => ({
        id: person.user_id || person.id,
        deliveryPersonId: person.id,
        deliveryPersonName: person.name,
        display_name: person.name,
        first_name: person.name.split(' ')[0] || person.name,
        last_name: person.name.split(' ').slice(1).join(' '),
        email: person.email,
        phone_number: person.phone,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

const getMenuAccessForUser = async (user, menuUrl) => {
  let roleId = user?.role_id || null;
  if (!roleId && user?.role) {
    const role = await prisma.role.findUnique({
      where: { name: user.role },
      select: { id: true },
    });
    roleId = role?.id || null;
  }

  if (!roleId) {
    return { canView: false };
  }

  const menuAccess = await prisma.roleMenuAccess.findFirst({
    where: {
      rolePermissions: { roleId },
      menu: { url: menuUrl },
    },
    select: {
      canView: true,
      canAdd: true,
      canEdit: true,
      canDelete: true,
    },
  });

  return menuAccess || { canView: false };
};

const assignedOrdersBaseWhere = (linkedDeliveryPersonIds) => ({
  delivery_person_id: linkedDeliveryPersonIds.length
    ? { in: linkedDeliveryPersonIds }
    : '__no_delivery_person__',
  AND: [
    {
      OR: [{ order_type: null }, { order_type: { not: 'data_package' } }],
    },
  ],
});

export const getDeliveryDashboard = async (req, res, next) => {
  try {
    const access = await getOrdersAccess(req.user);
    const menuAccess = await getMenuAccessForUser(req.user, '/delivery-dashboard');
    if (!access.canView && !menuAccess.canView) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view delivery dashboard',
      });
    }

    const linkedDeliveryPersonIds = await getLinkedDeliveryPersonIdsForUser(req.user);
    const baseWhere = assignedOrdersBaseWhere(linkedDeliveryPersonIds);
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const orderListSelect = {
      id: true,
      order_number: true,
      total: true,
      status: true,
      payment_status: true,
      created_at: true,
      delivery_delivered_at: true,
      users: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
    };

    const [
      activeCount,
      deliveredCount,
      totalAssigned,
      todayDelivered,
      processingCount,
      pendingCount,
      recentActive,
      recentDelivered,
      deliveryPerson,
    ] = await Promise.all([
      prisma.orders.count({
        where: {
          ...baseWhere,
          status: { not: 'delivered' },
        },
      }),
      prisma.orders.count({
        where: {
          ...baseWhere,
          status: 'delivered',
        },
      }),
      prisma.orders.count({ where: baseWhere }),
      prisma.orders.count({
        where: {
          ...baseWhere,
          status: 'delivered',
          delivery_delivered_at: { gte: startOfToday },
        },
      }),
      prisma.orders.count({
        where: {
          ...baseWhere,
          status: 'processing',
        },
      }),
      prisma.orders.count({
        where: {
          ...baseWhere,
          status: 'pending',
        },
      }),
      prisma.orders.findMany({
        where: {
          ...baseWhere,
          status: { not: 'delivered' },
        },
        select: orderListSelect,
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
      prisma.orders.findMany({
        where: {
          ...baseWhere,
          status: 'delivered',
        },
        select: orderListSelect,
        orderBy: { delivery_delivered_at: 'desc' },
        take: 5,
      }),
      linkedDeliveryPersonIds[0]
        ? prisma.delivery_persons.findUnique({
            where: { id: linkedDeliveryPersonIds[0] },
            select: {
              id: true,
              name: true,
              total_deliveries: true,
              rating: true,
              is_available: true,
            },
          })
        : null,
    ]);

    return res.json({
      success: true,
      data: {
        stats: {
          activeCount,
          deliveredCount,
          totalAssigned,
          todayDelivered,
          processingCount,
          pendingCount,
          totalDeliveries: deliveryPerson?.total_deliveries || deliveredCount,
          rating: deliveryPerson?.rating ? Number(deliveryPerson.rating) : 5,
          isAvailable: deliveryPerson?.is_available ?? true,
        },
        recentActive: recentActive.map(toOrderPayload),
        recentDelivered: recentDelivered.map(toOrderPayload),
        deliveryPerson,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getMyAssignedOrders = async (req, res, next) => {
  try {
    const {
      status,
      excludeStatus,
      search,
      dateFrom,
      dateTo,
      assignmentFilter = 'all',
      page = 1,
      limit = 50,
    } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const access = await getOrdersAccess(req.user);
    if (!access.canView) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to view assigned orders',
      });
    }

    const linkedDeliveryPersonIds = await getLinkedDeliveryPersonIdsForUser(req.user);

    const where = {
      delivery_person_id: linkedDeliveryPersonIds.length ? { in: linkedDeliveryPersonIds } : '__no_delivery_person__',
      AND: [
        {
          OR: [{ order_type: null }, { order_type: { not: 'data_package' } }],
        },
        ...(status && status !== 'all' ? [{ status }] : []),
        ...(excludeStatus && excludeStatus !== 'all' ? [{ status: { not: excludeStatus } }] : []),
        ...(search
          ? [
              {
                OR: [
                  { order_number: { contains: search, mode: 'insensitive' } },
                  {
                    users: {
                      OR: [
                        { first_name: { contains: search, mode: 'insensitive' } },
                        { last_name: { contains: search, mode: 'insensitive' } },
                      ],
                    },
                  },
                ],
              },
            ]
          : []),
        ...(dateFrom || dateTo
          ? [
              {
                created_at: {
                  ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
                  ...(dateTo ? { lte: new Date(`${dateTo}T23:59:59`) } : {}),
                },
              },
            ]
          : []),
        ...(assignmentFilter === 'not_assigned' ? [{ id: '__never__' }] : []),
      ],
    };

    const [result, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        select: {
          id: true,
          order_number: true,
          user_id: true,
          subtotal: true,
          tax: true,
          shipping: true,
          discount: true,
          total: true,
          status: true,
          payment_status: true,
          shipping_address: true,
          payment_method: true,
          tracking_number: true,
          notes: true,
          created_at: true,
          updated_at: true,
          delivery_person_id: true,
          delivery_person_name: true,
          delivery_assigned_at: true,
          delivery_picked_up_at: true,
          delivery_delivered_at: true,
          users: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.orders.count({ where }),
    ]);

    return res.json({
      success: true,
      data: result.map(toOrderPayload),
      meta: toOrdersMeta(access, {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      }),
    });
  } catch (error) {
    return next(error);
  }
};

export const markAssignedOrderDelivered = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    const access = await getOrdersAccess(req.user);
    if (!access.canView || !access.assignedOnly || !access.canEdit) {
      return res.status(403).json({
        success: false,
        message: 'Only assigned delivery users can mark order as delivered',
      });
    }

    const linkedDeliveryPersonIds = await getLinkedDeliveryPersonIdsForUser(req.user);

    const existing = await prisma.orders.findUnique({
      where: { id },
      select: {
        id: true,
        delivery_person_id: true,
        status: true,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (!linkedDeliveryPersonIds.includes(existing.delivery_person_id)) {
      return res.status(403).json({
        success: false,
        message: 'You can only update orders assigned to you',
      });
    }

    const updatedOrder = await prisma.orders.update({
      where: { id },
      data: {
        status: 'delivered',
        delivery_delivered_at: new Date(),
        actual_delivery: new Date(),
      },
    });

    if (existing.delivery_person_id) {
      await prisma.delivery_persons.updateMany({
        where: { id: existing.delivery_person_id },
        data: { total_deliveries: { increment: 1 } },
      });
    }

    await prisma.order_status_history.create({
      data: {
        order_id: id,
        status: 'delivered',
        notes: notes || 'Order delivered by assigned delivery person',
        updated_by: req.user.id,
        updated_by_name: `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || 'Delivery',
      },
    });

    return res.json({
      success: true,
      message: 'Order marked as delivered',
      data: updatedOrder,
    });
  } catch (error) {
    return next(error);
  }
};
