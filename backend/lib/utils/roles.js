import prisma from '../config/prisma.js';

export const roleNameMatches = (roleName, filterName) => {
  const normalizedRole = String(roleName || '').trim().toLowerCase();
  const normalizedFilter = String(filterName || '').trim().toLowerCase();
  if (!normalizedRole || !normalizedFilter) return false;
  if (normalizedFilter.includes('delivery')) {
    return normalizedRole.includes('delivery');
  }
  return normalizedRole === normalizedFilter;
};

export const findRoleByName = async (name) => prisma.role.findFirst({
  where: { name: { equals: String(name), mode: 'insensitive' } },
  select: { id: true, name: true },
});

export const findRolesMatchingNames = async (names) => {
  const filters = String(names)
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (!filters.length) return [];

  const allRoles = await prisma.role.findMany({
    select: { id: true, name: true },
  });

  return allRoles.filter((role) =>
    filters.some((filterName) => roleNameMatches(role.name, filterName))
  );
};

export const getDeliveryRole = () => findRoleByName('delivery');

export const getCustomerRole = () => findRoleByName('customer');

export const buildRoleIdIncludeFilter = async (roleName) => {
  const role = await findRoleByName(roleName);
  if (!role) return null;
  return { role_id: role.id };
};

export const buildRoleIdsExcludeFilter = async (excludeRoleNames) => {
  const roles = await findRolesMatchingNames(excludeRoleNames);
  const excludedIds = roles.map((role) => role.id);
  if (!excludedIds.length) return null;
  return { role_id: { notIn: excludedIds } };
};
