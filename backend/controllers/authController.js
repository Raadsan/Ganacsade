import prisma from '../lib/config/prisma.js';
import { hashPassword, comparePassword } from '../lib/utils/password.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../lib/utils/jwt.js';
import { sendResetOTP } from '../lib/services/emailService.js';
import { getCustomerRole } from '../lib/utils/roles.js';

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizePhone = (value) => String(value || '').replace(/\s+/g, '').trim();

const authUserSelect = {
  id: true,
  email: true,
  phone_number: true,
  password_hash: true,
  role: true,
  role_id: true,
  first_name: true,
  last_name: true,
  display_name: true,
  status: true,
  roleModel: {
    select: {
      id: true,
      name: true,
    },
  },
};

const getRoleName = (user) => String(user?.roleModel?.name || user?.role || '').trim().toLowerCase();

const isCustomerAccount = (user) => {
  const roleName = getRoleName(user);
  return roleName === 'customer' || user?.role === 'customer';
};

const isDashboardAccount = (user) => {
  if (isCustomerAccount(user)) return false;
  const roleName = getRoleName(user);
  return (
    roleName.includes('admin')
    || roleName.includes('staff')
    || roleName.includes('staf')
    || roleName.includes('delivery')
    || ['admin', 'staff', 'delivery_person'].includes(user?.role)
  );
};

const resolveEffectiveRole = async (user) => {
  const roleName = getRoleName(user);
  if (roleName.includes('delivery') || user?.role === 'delivery_person') {
    return roleName.includes('delivery') ? roleName : 'delivery';
  }
  if (await isDeliveryDashboardUser(user)) {
    return 'delivery';
  }
  return roleName || user?.role || 'customer';
};

const serializeAuthUser = (user, roleOverride = null) => ({
  id: user.id,
  email: user.email,
  phoneNumber: user.phone_number,
  role: roleOverride || getRoleName(user) || user.role,
  roleId: user.role_id,
  roleModel: user.roleModel || null,
  firstName: user.first_name,
  lastName: user.last_name,
  displayName: user.display_name,
});

const findLinkedDeliveryPerson = async (user) => {
  const email = normalizeEmail(user?.email);
  const phone = normalizePhone(user?.phone_number);
  const orFilters = [];
  if (email) orFilters.push({ email });
  if (phone) orFilters.push({ phone });
  if (!orFilters.length) return null;

  return prisma.delivery_persons.findFirst({
    where: { is_active: true, OR: orFilters },
  });
};

const isDeliveryDashboardUser = async (user) => {
  if (!user) return false;

  if (user.role_id) {
    const role = await prisma.role.findUnique({
      where: { id: user.role_id },
      select: { name: true },
    });
    if (role?.name?.toLowerCase().includes('delivery')) {
      return true;
    }
  }

  const linked = await findLinkedDeliveryPerson(user);
  return Boolean(linked);
};

const syncDeliveryPersonFromUser = async (user, overrides = {}) => {
  const linked = await findLinkedDeliveryPerson(user);
  if (!linked) return null;

  const name =
    overrides.name
    || user.display_name
    || `${user.first_name || ''} ${user.last_name || ''}`.trim()
    || linked.name;

  return prisma.delivery_persons.update({
    where: { id: linked.id },
    data: {
      name,
      ...(user.email ? { email: user.email } : {}),
      ...(user.phone_number ? { phone: user.phone_number } : {}),
      ...overrides,
    },
  });
};

/**
 * Register new user
 */
export const register = async (req, res, next) => {
  try {
    const { email, phoneNumber, password, firstName, lastName } = req.body;
    const role = 'customer';

    if ((!email && !phoneNumber) || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email or Phone number and password are required',
      });
    }

    const OR_conditions = [];
    if (email) OR_conditions.push({ email });
    if (phoneNumber) OR_conditions.push({ phone_number: phoneNumber });

    const existingUser = await prisma.users.findFirst({
      where: { deleted_at: null, OR: OR_conditions },
      select: { id: true, email: true, phone_number: true },
    });

    if (existingUser) {
      let message = 'An account with this email or phone number already exists';
      if (email && existingUser.email === email) {
        message = 'An account with this email already exists';
      } else if (phoneNumber && existingUser.phone_number === phoneNumber) {
        message = 'An account with this phone number already exists';
      }
      return res.status(409).json({ success: false, message });
    }

    const passwordHash = await hashPassword(password);
    const customerRole = await getCustomerRole();

    const user = await prisma.users.create({
      data: {
        email: email || null,
        phone_number: phoneNumber || null,
        password_hash: passwordHash,
        first_name: firstName || 'User',
        last_name: lastName || '',
        role,
        role_id: customerRole?.id || null,
        status: 'active',
      },
      select: authUserSelect,
    });

    const token = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: serializeAuthUser(user),
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, phoneNumber, identifier, password } = req.body;
    const loginIdentifier = String(identifier || email || phoneNumber || '').trim();
    const normalizedPhone = normalizePhone(loginIdentifier);

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email/Phone number and password are required',
      });
    }

    const loginOrConditions = [{ email: loginIdentifier }, { phone_number: loginIdentifier }];
    if (normalizedPhone && normalizedPhone !== loginIdentifier) {
      loginOrConditions.push({ phone_number: normalizedPhone });
    }

    const user = await prisma.users.findFirst({
      where: {
        OR: loginOrConditions,
        deleted_at: null,
      },
      select: authUserSelect,
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please contact support.',
      });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date(), token_invalidated_at: null },
    });

    const effectiveRole = await resolveEffectiveRole(user);
    const token = generateAccessToken(user.id, effectiveRole);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: serializeAuthUser(user, effectiveRole),
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin login (alias of unified login — kept for backward compatibility)
 */
export const adminLogin = async (req, res, next) => {
  try {
    const { email, phoneNumber, identifier, password } = req.body;
    const loginIdentifier = String(identifier || email || phoneNumber || '').trim();
    const normalizedPhone = normalizePhone(loginIdentifier);

    const loginOrConditions = [{ email: loginIdentifier }, { phone_number: loginIdentifier }];
    if (normalizedPhone && normalizedPhone !== loginIdentifier) {
      loginOrConditions.push({ phone_number: normalizedPhone });
    }

    const user = await prisma.users.findFirst({
      where: {
        OR: loginOrConditions,
        deleted_at: null,
      },
      select: authUserSelect,
    });

    if (!user || !isDashboardAccount(user)) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or not authorized' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ success: false, message: 'Your account is not active' });
    }

    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or not authorized' });
    }

    await prisma.users.update({
      where: { id: user.id },
      data: { last_login_at: new Date(), token_invalidated_at: null },
    });

    const token = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      message: 'Admin login successful',
      data: {
        user: serializeAuthUser(user),
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.users.findFirst({
      where: { id: req.user.id, deleted_at: null },
      select: {
        id: true, email: true, phone_number: true, role: true, role_id: true,
        first_name: true, last_name: true, display_name: true,
        profile_image_url: true, gender: true, date_of_birth: true,
        preferred_language: true, preferred_currency: true,
        is_email_verified: true, is_phone_verified: true,
        status: true, preferences: true, created_at: true,
        roleModel: {
          select: { id: true, name: true },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const effectiveRole = await resolveEffectiveRole(user);

    res.json({
      success: true,
      data: {
        ...user,
        role: effectiveRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, displayName, phoneNumber, gender, dateOfBirth, preferredLanguage, email, profileImageUrl } = req.body;

    const dataToUpdate = {};
    if (firstName !== undefined) dataToUpdate.first_name = firstName;
    if (lastName !== undefined) dataToUpdate.last_name = lastName;
    if (displayName !== undefined) dataToUpdate.display_name = displayName;
    if (phoneNumber !== undefined) dataToUpdate.phone_number = phoneNumber;
    if (gender !== undefined) dataToUpdate.gender = gender;
    if (dateOfBirth !== undefined) dataToUpdate.date_of_birth = new Date(dateOfBirth);
    if (preferredLanguage !== undefined) dataToUpdate.preferred_language = preferredLanguage;
    if (email !== undefined) dataToUpdate.email = email;
    if (profileImageUrl !== undefined) dataToUpdate.profile_image_url = profileImageUrl;

    const user = await prisma.users.update({
      where: { id: req.user.id },
      data: dataToUpdate,
      select: {
        id: true, email: true, phone_number: true, role: true, role_id: true,
        first_name: true, last_name: true, display_name: true, profile_image_url: true,
      },
    });

    if (await isDeliveryDashboardUser(user)) {
      await syncDeliveryPersonFromUser(user);
    }

    res.json({ success: true, message: 'Profile updated successfully', data: user });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    next(error);
  }
};

/**
 * Upload profile image
 */
export const uploadProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' });
    }

    const imageUrl = req.file.path; // Cloudinary URL

    const user = await prisma.users.update({
      where: { id: req.user.id },
      data: { profile_image_url: imageUrl },
      select: { id: true, profile_image_url: true },
    });

    res.json({
      success: true,
      message: 'Profile image uploaded successfully',
      data: { profileImageUrl: user.profile_image_url },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change password
 */
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
      select: { password_hash: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    const newPasswordHash = await hashPassword(newPassword);
    await prisma.users.update({
      where: { id: req.user.id },
      data: { password_hash: newPasswordHash },
    });

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
export const logout = async (req, res, next) => {
  try {
    await prisma.users.update({
      where: { id: req.user.id },
      data: { token_invalidated_at: new Date() },
    });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 */
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ success: false, message: 'Refresh token is required' });
    }

    const decoded = verifyRefreshToken(refreshToken);

    const user = await prisma.users.findFirst({
      where: { id: decoded.userId, deleted_at: null, status: 'active' },
      select: { id: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token' });
    }

    const newToken = generateAccessToken(user.id, user.role);
    res.json({ success: true, data: { token: newToken } });
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
  }
};

/**
 * Request password reset OTP
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await prisma.users.findFirst({
      where: { email, deleted_at: null },
      select: { id: true, email: true },
    });

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists with this email, you will receive an OTP code shortly.',
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await prisma.passwordresets.create({
      data: { email, otp, expiresat: expiresAt },
    });

    const emailSent = await sendResetOTP(email, otp);

    if (!emailSent) {
      return res.status(500).json({ success: false, message: 'Error sending email. Please try again later.' });
    }

    res.json({ success: true, message: 'OTP code sent to your email.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify OTP code
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const otpRecord = await prisma.passwordresets.findFirst({
      where: { email, otp, expiresat: { gt: new Date() }, isused: false },
      orderBy: { createdat: 'desc' },
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    res.json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset password using OTP
 */
export const getDeliveryProfile = async (req, res, next) => {
  try {
    const user = await prisma.users.findFirst({
      where: { id: req.user.id, deleted_at: null },
      select: {
        id: true,
        email: true,
        phone_number: true,
        role: true,
        role_id: true,
        first_name: true,
        last_name: true,
        display_name: true,
        profile_image_url: true,
        preferred_language: true,
      },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!(await isDeliveryDashboardUser(user))) {
      return res.status(403).json({
        success: false,
        message: 'Delivery profile is only available for delivery users',
      });
    }

    const delivery = await findLinkedDeliveryPerson(user);

    return res.json({
      success: true,
      data: {
        user,
        delivery,
        stats: {
          totalDeliveries: delivery?.total_deliveries || 0,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateDeliveryProfile = async (req, res, next) => {
  try {
    const {
      firstName,
      lastName,
      displayName,
      phoneNumber,
      preferredLanguage,
      vehicleType,
      vehicleNumber,
      licenseNumber,
      isAvailable,
    } = req.body;

    const existingUser = await prisma.users.findFirst({
      where: { id: req.user.id, deleted_at: null },
      select: {
        id: true,
        email: true,
        phone_number: true,
        role: true,
        role_id: true,
        first_name: true,
        last_name: true,
        display_name: true,
      },
    });

    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!(await isDeliveryDashboardUser(existingUser))) {
      return res.status(403).json({
        success: false,
        message: 'Delivery profile is only available for delivery users',
      });
    }

    const userData = {};
    if (firstName !== undefined) userData.first_name = firstName;
    if (lastName !== undefined) userData.last_name = lastName;
    if (displayName !== undefined) userData.display_name = displayName;
    if (phoneNumber !== undefined) userData.phone_number = phoneNumber;
    if (preferredLanguage !== undefined) userData.preferred_language = preferredLanguage;

    const user = await prisma.users.update({
      where: { id: req.user.id },
      data: userData,
      select: {
        id: true,
        email: true,
        phone_number: true,
        role: true,
        first_name: true,
        last_name: true,
        display_name: true,
        profile_image_url: true,
        preferred_language: true,
      },
    });

    const deliveryOverrides = {};
    if (vehicleType !== undefined) deliveryOverrides.vehicle_type = vehicleType || null;
    if (vehicleNumber !== undefined) deliveryOverrides.vehicle_number = vehicleNumber || null;
    if (licenseNumber !== undefined) deliveryOverrides.license_number = licenseNumber || null;
    if (isAvailable !== undefined) deliveryOverrides.is_available = Boolean(isAvailable);
    if (firstName !== undefined || lastName !== undefined || displayName !== undefined) {
      deliveryOverrides.name =
        displayName
        || `${firstName ?? user.first_name ?? ''} ${lastName ?? user.last_name ?? ''}`.trim()
        || user.display_name
        || 'Delivery Person';
    }

    const delivery = await syncDeliveryPersonFromUser(user, deliveryOverrides);

    return res.json({
      success: true,
      message: 'Delivery profile updated successfully',
      data: { user, delivery },
    });
  } catch (error) {
    return next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const otpRecord = await prisma.passwordresets.findFirst({
      where: { email, otp, expiresat: { gt: new Date() }, isused: false },
      orderBy: { createdat: 'desc' },
    });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP code.' });
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.users.updateMany({
      where: { email, deleted_at: null },
      data: { password_hash: passwordHash },
    });

    await prisma.passwordresets.update({
      where: { id: otpRecord.id },
      data: { isused: true },
    });

    res.json({ success: true, message: 'Password reset successfully. You can now login with your new password.' });
  } catch (error) {
    next(error);
  }
};

export const registerFcmToken = async (req, res, next) => {
  try {
    const { token, platform } = req.body;
    const { saveUserFcmToken } = await import('../lib/services/fcmService.js');
    const result = await saveUserFcmToken(req.user.id, token, platform);

    if (!result.success) {
      return res.status(400).json({ success: false, message: result.message });
    }

    res.json({ success: true, message: 'FCM token saved' });
  } catch (error) {
    next(error);
  }
};
