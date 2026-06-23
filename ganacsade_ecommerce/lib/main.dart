import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:get/get.dart';
import 'package:hive_flutter/hive_flutter.dart';

import 'core/theme/app_theme.dart';
import 'core/theme/theme_controller.dart';
import 'core/localization/app_translations.dart';
import 'core/localization/language_controller.dart';
import 'core/localization/somali_material_localizations.dart';
import 'features/auth/presentation/pages/splash_screen.dart';
import 'features/cart/presentation/controllers/cart_controller.dart';
import 'features/navigation/navigation_controller.dart';
import 'features/profile/presentation/controllers/profile_controller.dart';
import 'features/orders/presentation/pages/orders_screen.dart';
import 'features/products/presentation/controllers/search_controller.dart'
    as search_ctrl;
import 'features/auth/presentation/controllers/auth_controller.dart';
import 'features/auth/presentation/pages/sign_in_screen_enhanced.dart';
import 'features/auth/presentation/pages/sign_up_screen.dart';
import 'features/navigation/main_navigation.dart';
import 'features/navigation/delivery_main_navigation.dart';
import 'features/wishlist/presentation/controllers/wishlist_controller.dart';
import 'features/notifications/presentation/controllers/app_notifications_controller.dart';
import 'core/services/push_notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Hive.initFlutter();

  Get.put(ThemeController());
  Get.put(LanguageController());
  Get.put(AuthController());
  Get.put(NavigationController());
  Get.put(CartController());
  Get.put(ProfileController());
  Get.put(search_ctrl.SearchController());
  Get.put(WishlistController());
  Get.put(AppNotificationsController());

  await PushNotificationService().initialize();

  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(const GStoreApp());
}

class GStoreApp extends StatelessWidget {
  const GStoreApp({super.key});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // Dismiss keyboard when tapping outside
        FocusManager.instance.primaryFocus?.unfocus();
      },
      child: GetBuilder<ThemeController>(
        builder: (themeController) => GetMaterialApp(
          title: 'GANACSADE',
          debugShowCheckedModeBanner: false,

          // Theme
          theme: AppTheme.lightTheme,
          darkTheme: AppTheme.darkTheme,
          themeMode: themeController.themeMode,

          // Localization
          translations: AppTranslations(),
          localizationsDelegates: const [
            SomaliMaterialLocalizations.delegate,
            SomaliCupertinoLocalizations.delegate,
            GlobalMaterialLocalizations.delegate,
            GlobalWidgetsLocalizations.delegate,
            GlobalCupertinoLocalizations.delegate,
          ],
          supportedLocales: const [
            Locale('en', 'US'), // English
            Locale('so', 'SO'), // Somali
            Locale('ar', 'SA'), // Arabic
          ],
          locale: const Locale('en', 'US'),
          fallbackLocale: const Locale('en', 'US'),

          // Initial route
          home: const SplashScreen(),

          // Routes
          getPages: [
            GetPage(name: '/orders', page: () => const OrdersScreen()),
            GetPage(name: '/login', page: () => const SignInScreenEnhanced()),
            GetPage(name: '/register', page: () => const SignUpScreen()),
            GetPage(name: '/main', page: () => const MainNavigation()),
            GetPage(name: '/delivery-main', page: () => const DeliveryMainNavigation()),
          ],

          // GetX configuration
          defaultTransition: Transition.cupertino,
          transitionDuration: const Duration(milliseconds: 300),
        ),
      ),
    );
  }
}
