import { axiosInstance } from './client';

export interface Role {
  id: number;
  name: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
  usersCount?: number;
}

export interface Menu {
  id: number;
  title: string;
  icon?: string | null;
  url?: string | null;
  isCollapsible?: boolean;
  order?: number;
  canView?: boolean;
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canAssign?: boolean;
  canViewAllOrders?: boolean;
  canViewByRole?: boolean;
  subMenus?: SubMenu[];
}

export interface SubMenu {
  id: number;
  menuId: number;
  title: string;
  url: string;
  order?: number;
  canView?: boolean;
  canAdd?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export interface PermissionFlags {
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAssign?: boolean;
  canViewAllOrders?: boolean;
  canViewByRole?: boolean;
}

export interface RoleSubMenuPermission extends PermissionFlags {
  subMenuId: number;
}

export interface RoleMenuPermission extends PermissionFlags {
  menuId: number;
  subMenus: RoleSubMenuPermission[];
}

export const rbacApi = {
  getRoles: async () => {
    const response = await axiosInstance.get('/admin/roles');
    return response.data;
  },

  createRole: async (payload: { name: string; description?: string }) => {
    const response = await axiosInstance.post('/admin/roles', payload);
    return response.data;
  },

  updateRole: async (id: number, payload: { name?: string; description?: string }) => {
    const response = await axiosInstance.put(`/admin/roles/${id}`, payload);
    return response.data;
  },

  deleteRole: async (id: number) => {
    const response = await axiosInstance.delete(`/admin/roles/${id}`);
    return response.data;
  },

  getMenus: async () => {
    const response = await axiosInstance.get('/admin/menus/all');
    return response.data;
  },

  getMyMenus: async () => {
    const response = await axiosInstance.get('/admin/menus');
    return response.data;
  },

  createMenu: async (payload: {
    title: string;
    icon?: string;
    url?: string;
    isCollapsible?: boolean;
    order?: number;
  }) => {
    const response = await axiosInstance.post('/admin/menus', payload);
    return response.data;
  },

  updateMenu: async (
    menuId: number,
    payload: {
      title?: string;
      icon?: string;
      url?: string;
      isCollapsible?: boolean;
      order?: number;
    }
  ) => {
    const response = await axiosInstance.put(`/admin/menus/${menuId}`, payload);
    return response.data;
  },

  deleteMenu: async (menuId: number) => {
    const response = await axiosInstance.delete(`/admin/menus/${menuId}`);
    return response.data;
  },

  createSubMenu: async (payload: { menuId: number; title: string; url: string; order?: number }) => {
    const response = await axiosInstance.post('/admin/menus/submenus', payload);
    return response.data;
  },

  updateSubMenu: async (
    subMenuId: number,
    payload: { menuId?: number; title?: string; url?: string; order?: number }
  ) => {
    const response = await axiosInstance.put(`/admin/menus/submenus/${subMenuId}`, payload);
    return response.data;
  },

  deleteSubMenu: async (subMenuId: number) => {
    const response = await axiosInstance.delete(`/admin/menus/submenus/${subMenuId}`);
    return response.data;
  },

  getRolePermissions: async (roleId: number) => {
    const response = await axiosInstance.get(`/admin/role-permissions/${roleId}`);
    return response.data;
  },

  updateRolePermissions: async (roleId: number, menus: RoleMenuPermission[]) => {
    const response = await axiosInstance.put(`/admin/role-permissions/${roleId}`, { menus });
    return response.data;
  },
};
