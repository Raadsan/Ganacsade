import bcrypt from 'bcryptjs';
import prisma from '../../lib/config/prisma.js';
import {
  buildRoleIdIncludeFilter,
  buildRoleIdsExcludeFilter,
} from '../../lib/utils/roles.js';

export const getUsers = async (req, res) => {
  try {
    const {
      roleName,
      excludeRoleNames,
      roleId,
      status,
      is_verified,
      search,
      page = 1,
      limit = 50,
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const andConditions = [];

    if (roleName) {
      const roleNameFilter = await buildRoleIdIncludeFilter(roleName);
      if (roleNameFilter) andConditions.push(roleNameFilter);
    }

    if (roleId !== undefined && roleId !== '') {
      andConditions.push({ role_id: Number(roleId) });
    }

    if (excludeRoleNames) {
      const roleNameExcludeFilter = await buildRoleIdsExcludeFilter(excludeRoleNames);
      if (roleNameExcludeFilter) andConditions.push(roleNameExcludeFilter);
    }

    const where = {
      deleted_at: null,
      ...(status ? { status } : {}),
      ...(is_verified !== undefined ? { is_email_verified: is_verified === 'true' } : {}),
      ...(andConditions.length ? { AND: andConditions } : {}),
      ...(search
        ? {
            OR: [
              { first_name: { contains: search, mode: 'insensitive' } },
              { last_name: { contains: search, mode: 'insensitive' } },
              { display_name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone_number: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [result, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true,
          first_name: true,
          last_name: true,
          display_name: true,
          email: true,
          phone_number: true,
          role_id: true,
          role: true,
          status: true,
          is_email_verified: true,
          created_at: true,
          updated_at: true,
          last_login_at: true,
          roleModel: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.users.count({ where }),
    ]);

    res.json({
      success: true,
      data: result.map((u) => ({ ...u, is_verified: u.is_email_verified, is_email_verified: undefined })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

export const getUserStats = async (_req, res) => {
  try {
    const [totalUsers, totalCustomers, activeUsers, verifiedUsers, newUsers30d] = await Promise.all([
      prisma.users.count({ where: { deleted_at: null } }),
      prisma.users.count({ where: { deleted_at: null, role: 'customer' } }),
      prisma.users.count({ where: { deleted_at: null, status: 'active' } }),
      prisma.users.count({ where: { deleted_at: null, is_email_verified: true } }),
      prisma.users.count({
        where: {
          deleted_at: null,
          created_at: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total_users: totalUsers,
        total_customers: totalCustomers,
        active_users: activeUsers,
        verified_users: verifiedUsers,
        new_users_30d: newUsers30d,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics',
      error: error.message,
    });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.users.findFirst({
      where: { id, deleted_at: null },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        display_name: true,
        email: true,
        phone_number: true,
        profile_image_url: true,
        gender: true,
        date_of_birth: true,
        preferred_language: true,
        preferred_currency: true,
        role_id: true,
        role: true,
        status: true,
        is_email_verified: true,
        is_phone_verified: true,
        created_at: true,
        updated_at: true,
        last_login_at: true,
        roleModel: {
          select: {
            id: true,
            name: true,
          },
        },
        user_addresses: {
          orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
          select: {
            id: true,
            title: true,
            full_name: true,
            phone_number: true,
            street: true,
            city: true,
            state: true,
            country: true,
            postal_code: true,
            is_default: true,
          },
        },
        orders: {
          orderBy: { created_at: 'desc' },
          select: {
            id: true,
            order_number: true,
            order_type: true,
            subtotal: true,
            tax: true,
            shipping: true,
            discount: true,
            total: true,
            status: true,
            payment_status: true,
            created_at: true,
            delivery_delivered_at: true,
            order_items: {
              select: {
                id: true,
                product_name: true,
                product_image_url: true,
                quantity: true,
                unit_price: true,
                total: true,
                package_name: true,
                provider_name: true,
                recipient_phone: true,
              },
            },
          },
        },
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const orders = result.orders || [];
    const totalSpent = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const deliveredOrders = orders.filter((order) => order.status === 'delivered').length;
    const pendingOrders = orders.filter(
      (order) => order.status !== 'delivered' && order.status !== 'cancelled' && order.status !== 'refunded'
    ).length;

    res.json({
      success: true,
      data: {
        ...result,
        stats: {
          totalOrders: orders.length,
          totalSpent,
          deliveredOrders,
          pendingOrders,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, phone, password, roleId } = req.body;
    const [firstName = 'User', ...rest] = String(name || '').trim().split(' ');
    const lastName = rest.join(' ');

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    const existingUser = await prisma.users.findFirst({
      where: { email, deleted_at: null },
      select: { id: true },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    if (roleId === undefined || roleId === null || roleId === '') {
      return res.status(400).json({
        success: false,
        message: 'roleId is required',
      });
    }

    const parsedRoleId = Number(roleId);
    if (!Number.isInteger(parsedRoleId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid roleId',
      });
    }

    const existingRole = await prisma.role.findUnique({
      where: { id: parsedRoleId },
      select: { id: true, name: true },
    });

    if (!existingRole) {
      return res.status(404).json({
        success: false,
        message: 'Role not found',
      });
    }

    if (existingRole.name.toLowerCase().includes('delivery')) {
      return res.status(400).json({
        success: false,
        message: 'Delivery accounts must be created from Permissions > Delivery',
      });
    }

    const result = await prisma.users.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        display_name: name,
        email,
        phone_number: phone || null,
        password_hash: hashedPassword,
        role_id: parsedRoleId,
      },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        email: true,
        phone_number: true,
        role_id: true,
        role: true,
        status: true,
        is_email_verified: true,
        created_at: true,
        roleModel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to create user',
      error: error.message,
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, roleId, status } = req.body;
    const [firstName = 'User', ...rest] = String(name || '').trim().split(' ');
    const lastName = rest.join(' ');

    const existing = await prisma.users.findFirst({ where: { id, deleted_at: null }, select: { id: true } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const dataToUpdate = {
      ...(name !== undefined ? { display_name: name, first_name: firstName, last_name: lastName } : {}),
      ...(email !== undefined ? { email } : {}),
      ...(phone !== undefined ? { phone_number: phone } : {}),
      ...(status !== undefined ? { status } : {}),
    };

    if (roleId !== undefined) {
      const parsedRoleId = Number(roleId);
      if (!Number.isInteger(parsedRoleId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid roleId',
        });
      }

      const existingRole = await prisma.role.findUnique({
        where: { id: parsedRoleId },
        select: { id: true, name: true },
      });

      if (!existingRole) {
        return res.status(404).json({
          success: false,
          message: 'Role not found',
        });
      }

      if (existingRole.name.toLowerCase().includes('delivery')) {
        return res.status(400).json({
          success: false,
          message: 'Delivery accounts must be managed from Permissions > Delivery',
        });
      }

      dataToUpdate.role_id = parsedRoleId;
    }

    const result = await prisma.users.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        display_name: true,
        email: true,
        phone_number: true,
        role_id: true,
        role: true,
        status: true,
        is_email_verified: true,
        updated_at: true,
        roleModel: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const result = await prisma.users.updateMany({
      where: { id, deleted_at: null },
      data: { status },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = await prisma.users.findUnique({
      where: { id },
      select: { id: true, display_name: true, email: true, status: true },
    });

    res.json({
      success: true,
      message: 'User status updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user status',
      error: error.message,
    });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await prisma.users.updateMany({
      where: { id, deleted_at: null },
      data: { deleted_at: new Date() },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
};
