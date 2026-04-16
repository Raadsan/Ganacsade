export interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  contactEmail: string;
  contactPhone: string;
  logo?: string;
  favicon?: string;
  language: string;
  timezone: string;
  currency: string;
}

export interface PaymentSettings {
  waafiPayEnabled: boolean;
  waafiPayApiKey?: string;
  waafiPayMerchantId?: string;
  edahabEnabled: boolean;
  edahabApiKey?: string;
  edahabMerchantId?: string;
  premierWalletEnabled: boolean;
  premierWalletApiKey?: string;
  cashOnDeliveryEnabled: boolean;
  creditCardEnabled: boolean;
  stripePublicKey?: string;
  stripeSecretKey?: string;
}

export interface ShippingSettings {
  freeShippingThreshold: number;
  standardShippingCost: number;
  expressShippingCost: number;
  estimatedDeliveryDays: number;
  allowInternationalShipping: boolean;
}

export interface TaxSettings {
  taxEnabled: boolean;
  taxRate: number;
  taxIncludedInPrice: boolean;
  taxLabel: string;
}

export interface NotificationSettings {
  emailNotificationsEnabled: boolean;
  smsNotificationsEnabled: boolean;
  orderConfirmationEmail: boolean;
  orderShippedEmail: boolean;
  orderDeliveredEmail: boolean;
  lowStockAlert: boolean;
  lowStockThreshold: number;
}

export interface AppearanceSettings {
  theme: "light" | "dark" | "system";
  primaryColor: string;
  secondaryColor: string;
  showProductReviews: boolean;
  showProductRatings: boolean;
  productsPerPage: number;
}

export interface Settings {
  general: GeneralSettings;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  tax: TaxSettings;
  notifications: NotificationSettings;
  appearance: AppearanceSettings;
}
