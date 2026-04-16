# 🛍️ GANACSADE - Premium Somali E-commerce Platform

<div align="center">

**A comprehensive Flutter e-commerce application designed specifically for the Somali market**

[![Flutter](https://img.shields.io/badge/Flutter-3.0+-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev)
[![Dart](https://img.shields.io/badge/Dart-3.0+-0175C2?style=for-the-badge&logo=dart&logoColor=white)](https://dart.dev)
[![GetX](https://img.shields.io/badge/GetX-State%20Management-9C27B0?style=for-the-badge)](https://pub.dev/packages/get)
[![Hive](https://img.shields.io/badge/Hive-Local%20Storage-FF6B35?style=for-the-badge)](https://pub.dev/packages/hive)

</div>

## 🌟 Features

### 🔐 **Complete Authentication System**
- **Sign In/Sign Up** with local storage (Hive)
- **Password encryption** with SHA256 hashing
- **Remember Me** functionality
- **Auto-login** on app restart
- **Demo mode** for testing without registration

### 🛒 **Full E-commerce Experience**
- **Product Catalog** with 8 main categories and 32+ subcategories
- **Advanced Search** with real-time filtering and sorting
- **Shopping Cart** with quantity management
- **Checkout System** with Somali payment methods integration
- **Order Management** and tracking
- **Reviews & Ratings** system

### 💳 **Somali Payment Integration**
- **Hormuud Telecom** (EVC Plus)
- **Somtel** (Mobile Money)
- **Sonnet Telecom** (Wallet)
- **Amtel** (Mobile Payment)
- **SomLink Telecom** (Digital Wallet)

### 🌍 **Multilingual Support**
- **English** - International users
- **Somali** - Local users
- **Arabic** - Arabic-speaking community
- Real-time language switching

### 📱 **Professional UI/UX**
- **Material Design 3** components
- **GANACSADE brand colors** and theming
- **Responsive design** for all screen sizes
- **Smooth animations** and transitions
- **Haptic feedback** throughout the app

## 🏗️ Architecture

### **Clean Architecture + MVVM Pattern**
```
lib/
├── core/                    # Core functionality
│   ├── constants/          # App constants and colors
│   ├── network/           # API services and HTTP client
│   ├── theme/             # App theming and styles
│   └── utils/             # Utility functions
├── features/              # Feature modules
│   ├── auth/              # Authentication
│   ├── home/              # Home screen
│   ├── products/          # Product catalog & search
│   ├── cart/              # Shopping cart
│   ├── checkout/          # Checkout process
│   ├── orders/            # Order management
│   ├── profile/           # User profile
│   └── navigation/        # App navigation
├── shared/                # Shared components
│   ├── models/            # Data models (Freezed)
│   └── widgets/           # Reusable widgets
└── l10n/                  # Localization files
```

## 🛠️ Tech Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Flutter** | Cross-platform framework | 3.0+ |
| **Dart** | Programming language | 3.0+ |
| **GetX** | State management & navigation | ^4.6.6 |
| **Hive** | Local database | ^2.2.3 |
| **Freezed** | Immutable models | ^2.4.7 |
| **JSON Annotation** | JSON serialization | ^4.8.1 |
| **Dio** | HTTP client | ^5.3.2 |
| **Flutter Localizations** | Internationalization | Built-in |

## 🚀 Getting Started

### Prerequisites
- Flutter SDK (3.0 or higher)
- Dart SDK (3.0 or higher)
- Android Studio / VS Code
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/maxamedxuseen/Ganacsade-Ecommerce.git
   cd Ganacsade-Ecommerce
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Generate code (models, routes)**
   ```bash
   flutter packages pub run build_runner build
   ```

4. **Run the app**
   ```bash
   flutter run
   ```

### Build for Production

**Android APK:**
```bash
flutter build apk --release
```

**iOS (requires macOS):**
```bash
flutter build ios --release
```

**Web:**
```bash
flutter build web
```

## 🎯 Key Features Breakdown

### **🏠 Home Screen**
- **Promotional banners** with auto-scroll
- **Category grid** with 8 main categories
- **Featured products** with discount badges
- **Flash sales** section with countdown timers
- **Recently viewed** products

### **🔍 Advanced Search**
- **Real-time search** as you type
- **Category filtering** with 9 filter options
- **Sort options**: Price, Rating, Newest, Popular
- **Recent searches** history
- **Trending searches** suggestions

### **📦 Product Management**
- **4-level navigation**: Categories → Subcategories → Products → Details
- **Product details** with image gallery
- **Reviews & ratings** system
- **Related products** suggestions
- **Stock management** with availability indicators

### **🛒 Shopping Cart**
- **Add to cart** from product details
- **Quantity management** with +/- controls
- **Real-time price** calculations
- **Shipping & tax** calculations
- **Cart badge** in navigation

### **💰 Checkout Process**
- **Order summary** with itemized costs
- **Delivery information** form
- **Payment method** selection (5 Somali providers)
- **Order confirmation** and processing

### **👤 User Profile**
- **Profile editing** with validation
- **Address management** (CRUD operations)
- **Payment methods** management
- **Notification settings**
- **Language preferences**
- **Order history**

## 🌍 Localization

The app supports three languages with complete translations:

### **Supported Languages:**
- 🇺🇸 **English** (`en`) - Default
- 🇸🇴 **Somali** (`so`) - Primary market
- 🇸🇦 **Arabic** (`ar`) - Regional support

### **Localized Content:**
- All UI text and labels
- Product categories and descriptions
- Error messages and notifications
- Date and number formatting
- Currency display (USD)

## 🎨 Design System

### **Color Palette**
```dart
// Primary Colors
primaryGreen: #2E7D32    // GANACSADE brand color
lightGreen: #4CAF50      // Success states
darkGreen: #1B5E20       // Dark theme

// Accent Colors
orange: #FF9800          // Highlights and CTAs
red: #F44336             // Errors and alerts
blue: #2196F3            // Information
purple: #9C27B0          // Special features
```

### **Typography**
- **Headings**: Roboto Bold (24px, 20px, 18px)
- **Body Text**: Roboto Regular (16px, 14px)
- **Captions**: Roboto Light (12px, 10px)
- **Buttons**: Roboto Medium (16px)

## 📈 Performance

### **Optimization Features**
- **Lazy loading** for product lists
- **Image caching** with network optimization
- **State management** with GetX for minimal rebuilds
- **Local storage** with Hive for fast data access
- **Code splitting** by features

### **Bundle Size**
- **Android APK**: ~15MB (release)
- **iOS IPA**: ~18MB (release)
- **Web**: ~2.5MB (gzipped)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### **Coding Standards**
- Follow [Dart style guide](https://dart.dev/guides/language/effective-dart/style)
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Developer

**Mohamed Hussein**  
*Full-Stack Flutter Developer*

- 📧 Email: maxamedxuseen@gmail.com
- 🐙 GitHub: [@maxamedxuseen](https://github.com/maxamedxuseen)
- 💼 LinkedIn: [Mohamed Hussein](https://linkedin.com/in/maxamedxuseen)

## 🙏 Acknowledgments

- **Flutter Team** for the amazing framework
- **GetX Community** for state management solutions
- **Somali Community** for cultural insights and feedback
- **Material Design** for UI/UX guidelines

## 🔮 Future Enhancements

### **Planned Features**
- [ ] **Backend API** integration
- [ ] **Real-time notifications** with Firebase
- [ ] **Social login** (Google, Facebook)
- [ ] **Wishlist** functionality
- [ ] **Product comparison** feature
- [ ] **Advanced analytics** dashboard
- [ ] **Multi-vendor** marketplace
- [ ] **Live chat** customer support

### **Technical Improvements**
- [ ] **Unit test** coverage (80%+)
- [ ] **CI/CD pipeline** with GitHub Actions
- [ ] **Performance monitoring** with Firebase
- [ ] **Offline mode** with sync capability
- [ ] **Dark theme** support
- [ ] **Accessibility** improvements

---

<div align="center">

**Built with ❤️ by Mohamed Hussein (@maxamedxuseen) for the Somali community**

[⭐ Star this repo](https://github.com/maxamedxuseen/Ganacsade-Ecommerce) | [🐛 Report Bug](https://github.com/maxamedxuseen/Ganacsade-Ecommerce/issues) | [💡 Request Feature](https://github.com/maxamedxuseen/Ganacsade-Ecommerce/issues)

</div>
