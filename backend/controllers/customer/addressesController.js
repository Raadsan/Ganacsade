import prisma from '../../lib/config/prisma.js';

function parseAddressId(rawId) {
  const id = parseInt(rawId, 10);
  return Number.isNaN(id) ? null : id;
}

export const getAddresses = async (req, res, next) => {
  try {
    const addresses = await prisma.user_addresses.findMany({
      where: { user_id: req.user.id },
      orderBy: [{ is_default: 'desc' }, { created_at: 'desc' }],
    });
    res.json({ success: true, data: { addresses } });
  } catch (error) {
    next(error);
  }
};

export const getAddressById = async (req, res, next) => {
  try {
    const id = parseAddressId(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, message: 'Invalid address id' });
    }
    const address = await prisma.user_addresses.findFirst({
      where: { id, user_id: req.user.id },
    });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
    res.json({ success: true, data: address });
  } catch (error) {
    next(error);
  }
};

export const createAddress = async (req, res, next) => {
  try {
    const { title, fullName, phoneNumber, street, city, state, country, postalCode, isDefault } = req.body;
    if (!title || !fullName || !phoneNumber || !street || !city || !country) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const count = await prisma.user_addresses.count({ where: { user_id: req.user.id } });
    const shouldBeDefault = count === 0 || isDefault === true;

    const address = await prisma.user_addresses.create({
      data: {
        user_id: req.user.id,
        title,
        full_name: fullName,
        phone_number: phoneNumber,
        street,
        city,
        state: state || null,
        country,
        postal_code: postalCode || null,
        is_default: shouldBeDefault,
      },
    });

    res.status(201).json({ success: true, message: 'Address created successfully', data: address });
  } catch (error) {
    next(error);
  }
};

export const updateAddress = async (req, res, next) => {
  try {
    const id = parseAddressId(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, message: 'Invalid address id' });
    }
    const existing = await prisma.user_addresses.findFirst({
      where: { id, user_id: req.user.id },
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Address not found' });

    const { title, fullName, phoneNumber, street, city, state, country, postalCode, isDefault } = req.body;
    const data = {};
    if (title !== undefined) data.title = title;
    if (fullName !== undefined) data.full_name = fullName;
    if (phoneNumber !== undefined) data.phone_number = phoneNumber;
    if (street !== undefined) data.street = street;
    if (city !== undefined) data.city = city;
    if (state !== undefined) data.state = state;
    if (country !== undefined) data.country = country;
    if (postalCode !== undefined) data.postal_code = postalCode;
    if (isDefault !== undefined) data.is_default = isDefault;

    const address = await prisma.user_addresses.update({ where: { id }, data });
    res.json({ success: true, message: 'Address updated successfully', data: address });
  } catch (error) {
    next(error);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const id = parseAddressId(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, message: 'Invalid address id' });
    }
    const address = await prisma.user_addresses.findFirst({
      where: { id, user_id: req.user.id },
    });
    if (!address) return res.status(404).json({ success: false, message: 'Address not found' });

    const wasDefault = address.is_default;
    await prisma.user_addresses.delete({ where: { id } });

    if (wasDefault) {
      const nextAddress = await prisma.user_addresses.findFirst({
        where: { user_id: req.user.id },
        orderBy: { created_at: 'desc' },
      });
      if (nextAddress) {
        await prisma.user_addresses.update({ where: { id: nextAddress.id }, data: { is_default: true } });
      }
    }

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const setDefaultAddress = async (req, res, next) => {
  try {
    const id = parseAddressId(req.params.id);
    if (id === null) {
      return res.status(400).json({ success: false, message: 'Invalid address id' });
    }
    const existing = await prisma.user_addresses.findFirst({
      where: { id, user_id: req.user.id },
    });
    if (!existing) return res.status(404).json({ success: false, message: 'Address not found' });

    await prisma.user_addresses.updateMany({ where: { user_id: req.user.id }, data: { is_default: false } });
    const address = await prisma.user_addresses.update({ where: { id }, data: { is_default: true } });

    res.json({ success: true, message: 'Default address updated successfully', data: address });
  } catch (error) {
    next(error);
  }
};
