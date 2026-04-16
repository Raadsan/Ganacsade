export type UserGender = 'male' | 'female' | 'not_specified';
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'deleted';
export type AddressType = 'home' | 'work' | 'other';
export type PaymentMethodType = 
  | 'waafi_pay' 
  | 'edahab' 
  | 'premier_wallet' 
  | 'cash_on_delivery' 
  | 'credit_card' 
  | 'debit_card';

export interface Address {
  id: string;
  label: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
  type: AddressType;
  latitude?: number;
  longitude?: number;
}

export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  displayName: string;
  isDefault: boolean;
  isActive: boolean;
  details?: Record<string, any>;
}

export interface UserPreferences {
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  darkMode: boolean;
  biometricAuth: boolean;
  themeMode: string;
}

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  displayName: string;
  profileImageUrl: string;
  gender: UserGender;
  preferredLanguage: 'en' | 'so' | 'ar';
  preferredCurrency: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  status: UserStatus;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  dateOfBirth?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  lastLoginAt?: Date | string;
  preferences?: UserPreferences;
}
