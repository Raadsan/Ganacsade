import prisma from '../../lib/config/prisma.js';

const ROLE_PERMISSIONS_TX_TIMEOUT_MS = 20000;
const ROLE_PERMISSIONS_TX_MAX_WAIT_MS = 10000;

const normalizeBasePermission = (permission = {}) => ({
  canView: permission.canView ?? true,
  canAdd: permission.canAdd ?? false,
  canEdit: permission.canEdit ?? false,
  canDelete: permission.canDelete ?? false,
});

const normalizeMenuPermission = (permission = {}) => ({
  ...normalizeBasePermission(permission),
  canAssign: permission.canAssign ?? false,
  canViewAllOrders: permission.canViewAllOrders ?? false,
  canViewByRole: permission.canViewByRole ?? false,
});

const formatRolePermissions = (rolePermissions) => {
  if (!rolePermissions) {
    return { id: null, roleId: null, menus: [] };
  }

  return {
    id: rolePermissions.id,
    roleId: rolePermissions.roleId,
    menus: rolePermissions.menus.map((menuAccess) => ({
      id: menuAccess.id,
      menuId: menuAccess.menuId,
      menu: menuAccess.menu,
      canView: menuAccess.canView,
      canAdd: menuAccess.canAdd,
      canEdit: menuAccess.canEdit,
      canDelete: menuAccess.canDelete,
      canAssign: menuAccess.canAssign,
      canViewAllOrders: menuAccess.canViewAllOrders,
      canViewByRole: menuAccess.canViewByRole,
      subMenus: menuAccess.subMenus.map((subMenuAccess) => ({
        id: subMenuAccess.id,
        subMenuId: subMenuAccess.subMenuId,
        subMenu: subMenuAccess.subMenu,
        canView: subMenuAccess.canView,
        canAdd: subMenuAccess.canAdd,
        canEdit: subMenuAccess.canEdit,
        canDelete: subMenuAccess.canDelete,
      })),
    })),
  };
};

export const getRolePermissions = async (req, res, next) => {
  try {
    const roleId = Number(req.params.id);
    if (!Number.isInteger(roleId)) {
      return res.status(400).json({ success: false, message: 'Invalid role id' });
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            menus: {
              include: {
                menu: true,
                subMenus: {
                  include: { subMenu: true },
                  orderBy: { subMenuId: 'asc' },
                },
              },
              orderBy: { menuId: 'asc' },
            },
          },
        },
      },
    });

    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    return res.json({
      success: true,
      data: {
        role: {
          id: role.id,
          name: role.name,
          description: role.description,
        },
        permissions: formatRolePermissions(role.rolePermissions),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const upsertRolePermissions = async (req, res, next) => {
  try {
    const roleId = Number(req.params.id);
    if (!Number.isInteger(roleId)) {
      return res.status(400).json({ success: false, message: 'Invalid role id' });
    }

    const menus = Array.isArray(req.body.menus) ? req.body.menus : [];

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const rolePermissions = await prisma.rolePermissions.upsert({
      where: { roleId },
      update: {},
      create: { roleId },
    });

    const requestedMenuIds = menus.map((item) => Number(item.menuId)).filter((id) => Number.isInteger(id));
    const existingMenus = requestedMenuIds.length
      ? await prisma.menu.findMany({ where: { id: { in: requestedMenuIds } }, select: { id: true } })
      : [];
    const existingMenuIdSet = new Set(existingMenus.map((menu) => menu.id));

    if (requestedMenuIds.some((menuId) => !existingMenuIdSet.has(menuId))) {
      return res.status(400).json({ success: false, message: 'One or more menu ids are invalid' });
    }

    await prisma.$transaction(
      async (tx) => {
        const keptRoleMenuAccessIds = [];

        for (const menuInput of menus) {
          const menuId = Number(menuInput.menuId);
          const permission = normalizeMenuPermission(menuInput);

          const roleMenuAccess = await tx.roleMenuAccess.upsert({
            where: {
              rolePermissionsId_menuId: {
                rolePermissionsId: rolePermissions.id,
                menuId,
              },
            },
            update: permission,
            create: {
              rolePermissionsId: rolePermissions.id,
              menuId,
              ...permission,
            },
          });

          keptRoleMenuAccessIds.push(roleMenuAccess.id);

          const requestedSubMenus = Array.isArray(menuInput.subMenus) ? menuInput.subMenus : [];
          const requestedSubMenuIds = requestedSubMenus
            .map((item) => Number(item.subMenuId))
            .filter((id) => Number.isInteger(id));

          if (requestedSubMenuIds.length) {
            const existingSubMenus = await tx.subMenu.findMany({
              where: { id: { in: requestedSubMenuIds }, menuId },
              select: { id: true },
            });
            const existingSubMenuIdSet = new Set(existingSubMenus.map((subMenu) => subMenu.id));

            if (requestedSubMenuIds.some((subMenuId) => !existingSubMenuIdSet.has(subMenuId))) {
              throw new Error(`Invalid submenu for menu ${menuId}`);
            }
          }

          for (const subMenuInput of requestedSubMenus) {
            const subMenuId = Number(subMenuInput.subMenuId);
            const subPermission = normalizeBasePermission(subMenuInput);

            await tx.roleSubMenuAccess.upsert({
              where: {
                roleMenuAccessId_subMenuId: {
                  roleMenuAccessId: roleMenuAccess.id,
                  subMenuId,
                },
              },
              update: subPermission,
              create: {
                roleMenuAccessId: roleMenuAccess.id,
                subMenuId,
                ...subPermission,
              },
            });
          }

          await tx.roleSubMenuAccess.deleteMany({
            where: {
              roleMenuAccessId: roleMenuAccess.id,
              ...(requestedSubMenuIds.length
                ? { subMenuId: { notIn: requestedSubMenuIds } }
                : {}),
            },
          });
        }

        await tx.roleMenuAccess.deleteMany({
          where: {
            rolePermissionsId: rolePermissions.id,
            ...(keptRoleMenuAccessIds.length ? { id: { notIn: keptRoleMenuAccessIds } } : {}),
          },
        });
      },
      {
        maxWait: ROLE_PERMISSIONS_TX_MAX_WAIT_MS,
        timeout: ROLE_PERMISSIONS_TX_TIMEOUT_MS,
      }
    );

    const updatedPermissions = await prisma.rolePermissions.findUnique({
      where: { roleId },
      include: {
        menus: {
          include: {
            menu: true,
            subMenus: {
              include: { subMenu: true },
              orderBy: { subMenuId: 'asc' },
            },
          },
          orderBy: { menuId: 'asc' },
        },
      },
    });

    return res.json({
      success: true,
      message: 'Role permissions updated successfully',
      data: formatRolePermissions(updatedPermissions),
    });
  } catch (error) {
    if (error.message?.startsWith('Invalid submenu')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    return next(error);
  }
};
