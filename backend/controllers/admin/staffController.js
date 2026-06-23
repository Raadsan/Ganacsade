import prisma from '../../lib/config/prisma.js';
import { hashPassword } from '../../lib/utils/password.js';

const staffSelect = {
  id: true,
  first_name: true,
  last_name: true,
  display_name: true,
  email: true,
  phone_number: true,
  role: true,
  status: true,
  is_email_verified: true,
  created_at: true,
  last_login_at: true,
};

const staffWhere = {
  role: { in: ['admin', 'staff'] },
  deleted_at: null,
};

export const getStaff = async (req, res, next) => {
  try {
    const {
      search, role, status, page = 1, limit = 50,
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      ...staffWhere,
      ...(role && ['admin', 'staff'].includes(role) ? { role } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { first_name: { contains: search, mode: 'insensitive' } },
              { last_name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [records, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: staffSelect,
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.users.count({ where }),
    ]);

    return res.json({
      success: true,
      data: records,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createStaff = async (req, res, next) => {
  try {
    const {
      firstName, lastName, email, phoneNumber, password, role,
    } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'firstName, lastName, email, phoneNumber, password, and role are required',
      });
    }

    if (!['admin', 'staff'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'role must be "admin" or "staff"',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phoneNumber).trim();

    const existingUser = await prisma.users.findFirst({
      where: {
        deleted_at: null,
        OR: [{ email: normalizedEmail }, { phone_number: normalizedPhone }],
      },
      select: { id: true, role: true, email: true, phone_number: true },
    });

    if (existingUser) {
      if (['admin', 'staff'].includes(existingUser.role)) {
        return res.status(409).json({
          success: false,
          message: 'A staff member with this email already exists',
        });
      }

      const promotedHash = await hashPassword(password);
      const promoted = await prisma.users.update({
        where: { id: existingUser.id },
        data: {
          role,
          first_name: firstName,
          last_name: lastName,
          phone_number: normalizedPhone,
          password_hash: promotedHash,
          token_invalidated_at: new Date(),
          updated_at: new Date(),
        },
        select: staffSelect,
      });

      return res.status(200).json({
        success: true,
        message: 'Existing user promoted to staff successfully',
        data: promoted,
      });
    }

    const passwordHash = await hashPassword(password);
    const created = await prisma.users.create({
      data: {
        first_name: firstName,
        last_name: lastName,
        email: normalizedEmail,
        phone_number: normalizedPhone,
        password_hash: passwordHash,
        role,
        status: 'active',
      },
      select: staffSelect,
    });

    return res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      data: created,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A user with this email or phone number already exists',
      });
    }
    return next(error);
  }
};

export const getStaffById = async (req, res, next) => {
  try {
    const record = await prisma.users.findFirst({
      where: {
        id: req.params.id,
        ...staffWhere,
      },
      select: staffSelect,
    });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    return res.json({ success: true, data: record });
  } catch (error) {
    return next(error);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const {
      firstName, lastName, email, phoneNumber, role, status,
    } = req.body;

    if (role && !['admin', 'staff'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'role must be "admin" or "staff"',
      });
    }

    if (req.params.id === req.user.id && role && role !== req.user.role) {
      return res.status(400).json({
        success: false,
        message: 'You cannot change your own role',
      });
    }

    const existing = await prisma.users.findFirst({
      where: { id: req.params.id, ...staffWhere },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const updated = await prisma.users.update({
      where: { id: req.params.id },
      data: {
        ...(firstName !== undefined ? { first_name: firstName } : {}),
        ...(lastName !== undefined ? { last_name: lastName } : {}),
        ...(email !== undefined ? { email: String(email).trim().toLowerCase() } : {}),
        ...(phoneNumber !== undefined ? { phone_number: String(phoneNumber).trim() } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(status !== undefined ? { status } : {}),
        updated_at: new Date(),
      },
      select: staffSelect,
    });

    return res.json({
      success: true,
      message: 'Staff member updated successfully',
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
};

export const resetStaffPassword = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters',
      });
    }

    const existing = await prisma.users.findFirst({
      where: { id: req.params.id, ...staffWhere },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    const passwordHash = await hashPassword(password);
    await prisma.users.update({
      where: { id: req.params.id },
      data: {
        password_hash: passwordHash,
        token_invalidated_at: new Date(),
        updated_at: new Date(),
      },
    });

    return res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) {
    return next(error);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account',
      });
    }

    const existing = await prisma.users.findFirst({
      where: { id: req.params.id, ...staffWhere },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    await prisma.users.update({
      where: { id: req.params.id },
      data: {
        deleted_at: new Date(),
        token_invalidated_at: new Date(),
        updated_at: new Date(),
      },
    });

    return res.json({ success: true, message: 'Staff member removed successfully' });
  } catch (error) {
    return next(error);
  }
};
