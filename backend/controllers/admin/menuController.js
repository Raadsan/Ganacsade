import prisma from '../../lib/config/prisma.js';

export const getMenus = async (_req, res, next) => {
  try {
    const menus = await prisma.menu.findMany({
      include: {
        subMenus: { orderBy: { order: 'asc' } },
      },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });

    res.json({
      success: true,
      data: menus,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyMenus = async (req, res, next) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await prisma.users.findFirst({
      where: { id: userId, deleted_at: null, status: 'active' },
      select: {
        id: true,
        role: true,
        role_id: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let effectiveRoleId = user.role_id || null;
    if (!effectiveRoleId && user.role) {
      const role = await prisma.role.findUnique({
        where: { name: user.role },
        select: { id: true },
      });
      effectiveRoleId = role?.id || null;
    }

    if (!effectiveRoleId) {
      return res.json({ success: true, data: [] });
    }

    const rolePermissions = await prisma.rolePermissions.findUnique({
      where: { roleId: effectiveRoleId },
      include: {
        menus: {
          where: { canView: true },
          include: {
            menu: {
              include: { subMenus: { orderBy: { order: 'asc' } } },
            },
            subMenus: true,
          },
          orderBy: { menu: { order: 'asc' } },
        },
      },
    });

    const result = (rolePermissions?.menus || []).map((menuAccess) => {
      const subAccessMap = new Map(
        (menuAccess.subMenus || [])
          .filter((s) => s.canView)
          .map((s) => [s.subMenuId, s])
      );

      return {
        id: menuAccess.menu.id,
        title: menuAccess.menu.title,
        icon: menuAccess.menu.icon,
        url: menuAccess.menu.url,
        isCollapsible: menuAccess.menu.isCollapsible,
        order: menuAccess.menu.order,
        canView: menuAccess.canView,
        canAdd: menuAccess.canAdd,
        canEdit: menuAccess.canEdit,
        canDelete: menuAccess.canDelete,
        canAssign: menuAccess.canAssign,
        canViewAllOrders: menuAccess.canViewAllOrders,
        canViewByRole: menuAccess.canViewByRole,
        subMenus: (menuAccess.menu.subMenus || [])
          .filter((sub) => subAccessMap.has(sub.id))
          .map((sub) => {
            const access = subAccessMap.get(sub.id);
            return {
              id: sub.id,
              menuId: sub.menuId,
              title: sub.title,
              url: sub.url,
              order: sub.order,
              canView: access?.canView || false,
              canAdd: access?.canAdd || false,
              canEdit: access?.canEdit || false,
              canDelete: access?.canDelete || false,
            };
          }),
      };
    });

    return res.json({ success: true, data: result });
  } catch (error) {
    return next(error);
  }
};

export const createMenu = async (req, res, next) => {
  try {
    const {
      title, icon, url, isCollapsible = false, order = 0, subMenus = [],
    } = req.body;

    if (!title || !String(title).trim()) {
      return res.status(400).json({ success: false, message: 'Menu title is required' });
    }

    if (!Array.isArray(subMenus)) {
      return res.status(400).json({ success: false, message: 'subMenus must be an array' });
    }

    const invalidSubMenu = subMenus.find(
      (sub) => !sub || !String(sub.title || '').trim() || !String(sub.url || '').trim(),
    );
    if (invalidSubMenu) {
      return res.status(400).json({
        success: false,
        message: 'Each submenu requires title and url',
      });
    }

    const createdMenu = await prisma.$transaction(async (tx) => {
      const menu = await tx.menu.create({
        data: {
          title: String(title).trim(),
          icon: icon?.trim() || null,
          url: url?.trim() || null,
          isCollapsible: Boolean(isCollapsible),
          order: Number(order) || 0,
        },
      });

      if (subMenus.length > 0) {
        await tx.subMenu.createMany({
          data: subMenus.map((sub, index) => ({
            menuId: menu.id,
            title: String(sub.title).trim(),
            url: String(sub.url).trim(),
            order: Number(sub.order) || index + 1,
          })),
        });
      }

      const menuWithSubMenus = await tx.menu.findUnique({
        where: { id: menu.id },
        include: {
          subMenus: { orderBy: { order: 'asc' } },
        },
      });

      return menuWithSubMenus;
    });

    return res.status(201).json({
      success: true,
      message: 'Menu created successfully',
      data: createdMenu,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Menu title already exists' });
    }
    return next(error);
  }
};

export const updateMenu = async (req, res, next) => {
  try {
    const menuId = Number(req.params.menuId);
    if (!Number.isInteger(menuId)) {
      return res.status(400).json({ success: false, message: 'Invalid menu id' });
    }

    const {
      title, icon, url, isCollapsible, order,
    } = req.body;

    const existingMenu = await prisma.menu.findUnique({ where: { id: menuId } });
    if (!existingMenu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    const menu = await prisma.menu.update({
      where: { id: menuId },
      data: {
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        ...(icon !== undefined ? { icon: icon?.trim() || null } : {}),
        ...(url !== undefined ? { url: url?.trim() || null } : {}),
        ...(isCollapsible !== undefined ? { isCollapsible: Boolean(isCollapsible) } : {}),
        ...(order !== undefined ? { order: Number(order) || 0 } : {}),
      },
    });

    return res.json({
      success: true,
      message: 'Menu updated successfully',
      data: menu,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Menu title already exists' });
    }
    return next(error);
  }
};

export const deleteMenu = async (req, res, next) => {
  try {
    const menuId = Number(req.params.menuId);
    if (!Number.isInteger(menuId)) {
      return res.status(400).json({ success: false, message: 'Invalid menu id' });
    }

    const existingMenu = await prisma.menu.findUnique({ where: { id: menuId } });
    if (!existingMenu) {
      return res.status(404).json({ success: false, message: 'Menu not found' });
    }

    await prisma.menu.delete({ where: { id: menuId } });

    return res.json({
      success: true,
      message: 'Menu deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const createSubMenu = async (req, res, next) => {
  try {
    const {
      menuId, title, url, order = 0,
    } = req.body;

    if (!Number.isInteger(Number(menuId))) {
      return res.status(400).json({ success: false, message: 'Valid menuId is required' });
    }

    if (!title || !String(title).trim() || !url || !String(url).trim()) {
      return res.status(400).json({ success: false, message: 'Submenu title and url are required' });
    }

    const menu = await prisma.menu.findUnique({ where: { id: Number(menuId) } });
    if (!menu) {
      return res.status(404).json({ success: false, message: 'Parent menu not found' });
    }

    const subMenu = await prisma.subMenu.create({
      data: {
        menuId: Number(menuId),
        title: String(title).trim(),
        url: String(url).trim(),
        order: Number(order) || 0,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Submenu created successfully',
      data: subMenu,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSubMenu = async (req, res, next) => {
  try {
    const subMenuId = Number(req.params.subMenuId);
    if (!Number.isInteger(subMenuId)) {
      return res.status(400).json({ success: false, message: 'Invalid submenu id' });
    }

    const {
      menuId, title, url, order,
    } = req.body;

    const existingSubMenu = await prisma.subMenu.findUnique({ where: { id: subMenuId } });
    if (!existingSubMenu) {
      return res.status(404).json({ success: false, message: 'Submenu not found' });
    }

    if (menuId !== undefined) {
      const menu = await prisma.menu.findUnique({ where: { id: Number(menuId) } });
      if (!menu) {
        return res.status(404).json({ success: false, message: 'Parent menu not found' });
      }
    }

    const subMenu = await prisma.subMenu.update({
      where: { id: subMenuId },
      data: {
        ...(menuId !== undefined ? { menuId: Number(menuId) } : {}),
        ...(title !== undefined ? { title: String(title).trim() } : {}),
        ...(url !== undefined ? { url: String(url).trim() } : {}),
        ...(order !== undefined ? { order: Number(order) || 0 } : {}),
      },
    });

    return res.json({
      success: true,
      message: 'Submenu updated successfully',
      data: subMenu,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteSubMenu = async (req, res, next) => {
  try {
    const subMenuId = Number(req.params.subMenuId);
    if (!Number.isInteger(subMenuId)) {
      return res.status(400).json({ success: false, message: 'Invalid submenu id' });
    }

    const existingSubMenu = await prisma.subMenu.findUnique({ where: { id: subMenuId } });
    if (!existingSubMenu) {
      return res.status(404).json({ success: false, message: 'Submenu not found' });
    }

    await prisma.subMenu.delete({ where: { id: subMenuId } });

    return res.json({
      success: true,
      message: 'Submenu deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};
