import prisma from '../../lib/config/prisma.js';
import { hashPassword } from '../../lib/utils/password.js';
import { getDeliveryRole } from '../../lib/utils/roles.js';

const deliveryPersonSelect = {
  id: true,
  user_id: true,
  name: true,
  email: true,
  phone: true,
  user_photo_url: true,
  vehicle_photos: true,
  location: true,
  latitude: true,
  longitude: true,
  vehicle_type: true,
  vehicle_number: true,
  license_number: true,
  is_active: true,
  is_available: true,
  current_assignments: true,
  total_deliveries: true,
  rating: true,
  created_at: true,
  updated_at: true,
  users: {
    select: {
      id: true,
      status: true,
      last_login_at: true,
    },
  },
};

const parseVehiclePhotos = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const splitName = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || 'Delivery',
    lastName: parts.slice(1).join(' '),
  };
};

const toPayload = (record) => ({
  ...record,
  vehicle_photos: parseVehiclePhotos(record.vehicle_photos),
  rating: record.rating ? Number(record.rating) : 5,
  latitude: record.latitude ? Number(record.latitude) : null,
  longitude: record.longitude ? Number(record.longitude) : null,
});

export const getDeliveryPersons = async (req, res, next) => {
  try {
    const {
      search,
      status,
      availability,
      page = 1,
      limit = 50,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...(status === 'active' ? { is_active: true } : {}),
      ...(status === 'inactive' ? { is_active: false } : {}),
      ...(availability === 'available' ? { is_available: true } : {}),
      ...(availability === 'unavailable' ? { is_available: false } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { location: { contains: search, mode: 'insensitive' } },
              { vehicle_number: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [records, total] = await Promise.all([
      prisma.delivery_persons.findMany({
        where,
        select: deliveryPersonSelect,
        orderBy: [{ created_at: 'desc' }],
        skip,
        take: limitNum,
      }),
      prisma.delivery_persons.count({ where }),
    ]);

    return res.json({
      success: true,
      data: records.map(toPayload),
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getDeliveryPersonById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const record = await prisma.delivery_persons.findUnique({
      where: { id },
      select: deliveryPersonSelect,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Delivery person not found',
      });
    }

    return res.json({
      success: true,
      data: toPayload(record),
    });
  } catch (error) {
    return next(error);
  }
};

export const createDeliveryPerson = async (req, res, next) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      vehicleType,
      vehicleNumber,
      licenseNumber,
      location,
      latitude,
      longitude,
      userPhotoUrl,
      vehiclePhotos,
      isAvailable,
    } = req.body;

    if (!name?.trim() || !email?.trim() || !phone?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, phone, and password are required',
      });
    }

    const deliveryRole = await getDeliveryRole();
    if (!deliveryRole) {
      return res.status(400).json({
        success: false,
        message: 'Delivery role is not configured. Create a "delivery" role in the admin Roles panel first.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).trim();

    const [existingUser, existingDelivery] = await Promise.all([
      prisma.users.findFirst({
        where: {
          deleted_at: null,
          OR: [{ email: normalizedEmail }, { phone_number: normalizedPhone }],
        },
        select: { id: true },
      }),
      prisma.delivery_persons.findFirst({
        where: {
          OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
        },
        select: { id: true },
      }),
    ]);

    if (existingUser || existingDelivery) {
      return res.status(409).json({
        success: false,
        message: 'A user or delivery account with this email or phone already exists',
      });
    }

    const passwordHash = await hashPassword(password);
    const { firstName, lastName } = splitName(name);
    const photos = parseVehiclePhotos(vehiclePhotos);

    const created = await prisma.$transaction(async (tx) => {
      const user = await tx.users.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          display_name: name.trim(),
          email: normalizedEmail,
          phone_number: normalizedPhone,
          password_hash: passwordHash,
          role: 'delivery_person',
          role_id: deliveryRole.id,
          profile_image_url: userPhotoUrl || null,
          status: 'active',
        },
      });

      const deliveryPerson = await tx.delivery_persons.create({
        data: {
          user_id: user.id,
          name: name.trim(),
          email: normalizedEmail,
          phone: normalizedPhone,
          password_hash: passwordHash,
          user_photo_url: userPhotoUrl || null,
          vehicle_photos: photos,
          location: location?.trim() || null,
          latitude: latitude !== undefined && latitude !== '' ? Number(latitude) : null,
          longitude: longitude !== undefined && longitude !== '' ? Number(longitude) : null,
          vehicle_type: vehicleType || null,
          vehicle_number: vehicleNumber?.trim() || null,
          license_number: licenseNumber?.trim() || null,
          is_active: true,
          is_available: isAvailable !== false,
        },
        select: deliveryPersonSelect,
      });

      return deliveryPerson;
    });

    return res.status(201).json({
      success: true,
      message: 'Delivery person created successfully',
      data: toPayload(created),
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Email or phone already exists',
      });
    }
    return next(error);
  }
};

export const updateDeliveryPerson = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      password,
      vehicleType,
      vehicleNumber,
      licenseNumber,
      location,
      latitude,
      longitude,
      userPhotoUrl,
      vehiclePhotos,
      isActive,
      isAvailable,
      status,
    } = req.body;

    const existing = await prisma.delivery_persons.findUnique({
      where: { id },
      select: {
        id: true,
        user_id: true,
        email: true,
        phone: true,
      },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Delivery person not found',
      });
    }

    const deliveryData = {
      ...(name !== undefined ? { name: String(name).trim() } : {}),
      ...(email !== undefined ? { email: String(email).trim().toLowerCase() } : {}),
      ...(phone !== undefined ? { phone: String(phone).trim() } : {}),
      ...(vehicleType !== undefined ? { vehicle_type: vehicleType || null } : {}),
      ...(vehicleNumber !== undefined ? { vehicle_number: vehicleNumber?.trim() || null } : {}),
      ...(licenseNumber !== undefined ? { license_number: licenseNumber?.trim() || null } : {}),
      ...(location !== undefined ? { location: location?.trim() || null } : {}),
      ...(latitude !== undefined ? { latitude: latitude === '' || latitude === null ? null : Number(latitude) } : {}),
      ...(longitude !== undefined ? { longitude: longitude === '' || longitude === null ? null : Number(longitude) } : {}),
      ...(userPhotoUrl !== undefined ? { user_photo_url: userPhotoUrl || null } : {}),
      ...(vehiclePhotos !== undefined ? { vehicle_photos: parseVehiclePhotos(vehiclePhotos) } : {}),
      ...(isActive !== undefined ? { is_active: Boolean(isActive) } : {}),
      ...(isAvailable !== undefined ? { is_available: Boolean(isAvailable) } : {}),
      updated_at: new Date(),
    };

    if (password?.trim()) {
      deliveryData.password_hash = await hashPassword(password);
    }

    const userData = {};
    if (name !== undefined) {
      const { firstName, lastName } = splitName(name);
      userData.first_name = firstName;
      userData.last_name = lastName;
      userData.display_name = String(name).trim();
    }
    if (email !== undefined) userData.email = String(email).trim().toLowerCase();
    if (phone !== undefined) userData.phone_number = String(phone).trim();
    if (userPhotoUrl !== undefined) userData.profile_image_url = userPhotoUrl || null;
    if (status !== undefined) userData.status = status;
    if (password?.trim()) userData.password_hash = deliveryData.password_hash;

    const updated = await prisma.$transaction(async (tx) => {
      if (existing.user_id && Object.keys(userData).length > 0) {
        await tx.users.update({
          where: { id: existing.user_id },
          data: userData,
        });
      }

      return tx.delivery_persons.update({
        where: { id },
        data: deliveryData,
        select: deliveryPersonSelect,
      });
    });

    return res.json({
      success: true,
      message: 'Delivery person updated successfully',
      data: toPayload(updated),
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Email or phone already exists',
      });
    }
    return next(error);
  }
};

export const deleteDeliveryPerson = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.delivery_persons.findUnique({
      where: { id },
      select: { id: true, user_id: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Delivery person not found',
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.delivery_persons.update({
        where: { id },
        data: {
          is_active: false,
          is_available: false,
          updated_at: new Date(),
        },
      });

      if (existing.user_id) {
        await tx.users.update({
          where: { id: existing.user_id },
          data: {
            status: 'inactive',
            updated_at: new Date(),
          },
        });
      }
    });

    return res.json({
      success: true,
      message: 'Delivery person deactivated successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const uploadDeliveryUserPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    return res.json({
      success: true,
      data: {
        imageUrl: req.file.path,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const uploadDeliveryVehiclePhotos = async (req, res, next) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({
        success: false,
        message: 'No image files provided',
      });
    }

    return res.json({
      success: true,
      data: {
        imageUrls: req.files.map((file) => file.path),
      },
    });
  } catch (error) {
    return next(error);
  }
};
