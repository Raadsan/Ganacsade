import prisma from '../../lib/config/prisma.js';

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

export const getRoles = async (_req, res, next) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        _count: { select: { users: true } },
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
      orderBy: { createdAt: 'asc' },
    });

    res.json({
      success: true,
      data: roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        usersCount: role._count.users,
        permissions: formatRolePermissions(role.rolePermissions),
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getRoleById = async (req, res, next) => {
  try {
    const roleId = Number(req.params.id);
    if (!Number.isInteger(roleId)) {
      return res.status(400).json({ success: false, message: 'Invalid role id' });
    }

    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: { select: { users: true } },
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
        id: role.id,
        name: role.name,
        description: role.description,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        usersCount: role._count.users,
        permissions: formatRolePermissions(role.rolePermissions),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createRole = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ success: false, message: 'Role name is required' });
    }

    const role = await prisma.role.create({
      data: {
        name: String(name).trim(),
        description: description?.trim() || null,
      },
    });

    await prisma.rolePermissions.create({
      data: { roleId: role.id },
    });

    return res.status(201).json({
      success: true,
      message: 'Role created successfully',
      data: role,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Role name already exists' });
    }
    return next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    const roleId = Number(req.params.id);
    if (!Number.isInteger(roleId)) {
      return res.status(400).json({ success: false, message: 'Invalid role id' });
    }

    const { name, description } = req.body;
    const existingRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!existingRole) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const role = await prisma.role.update({
      where: { id: roleId },
      data: {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(description !== undefined ? { description: description?.trim() || null } : {}),
      },
    });

    return res.json({
      success: true,
      message: 'Role updated successfully',
      data: role,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Role name already exists' });
    }
    return next(error);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    const roleId = Number(req.params.id);
    if (!Number.isInteger(roleId)) {
      return res.status(400).json({ success: false, message: 'Invalid role id' });
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const assignedUsers = await prisma.users.count({ where: { role_id: roleId, deleted_at: null } });
    if (assignedUsers > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete role assigned to users',
      });
    }

    await prisma.role.delete({ where: { id: roleId } });

    return res.json({
      success: true,
      message: 'Role deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const assignRoleToUser = async (req, res, next) => {
  try {
    const roleId = Number(req.params.id);
    const { userId } = req.body;

    if (!Number.isInteger(roleId)) {
      return res.status(400).json({ success: false, message: 'Invalid role id' });
    }

    if (!userId || !String(userId).trim()) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      return res.status(404).json({ success: false, message: 'Role not found' });
    }

    const user = await prisma.users.findFirst({
      where: { id: String(userId), deleted_at: null },
      select: { id: true, email: true, phone_number: true, display_name: true, role_id: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const updatedUser = await prisma.users.update({
      where: { id: user.id },
      data: { role_id: roleId },
      select: {
        id: true,
        email: true,
        phone_number: true,
        display_name: true,
        role_id: true,
        roleModel: { select: { id: true, name: true, description: true } },
      },
    });

    return res.json({
      success: true,
      message: 'Role assigned to user successfully',
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};
