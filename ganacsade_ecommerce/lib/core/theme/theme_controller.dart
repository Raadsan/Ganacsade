import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:hive_flutter/hive_flutter.dart';

/// Theme Controller for managing dark/light mode
class ThemeController extends GetxController {
  static const String _themeBoxName = 'theme_storage';
  static const String _themeModeKey = 'theme_mode';
  
  final Rx<ThemeMode> _themeMode = ThemeMode.system.obs;
  
  ThemeMode get themeMode => _themeMode.value;
  bool get isDarkMode => _themeMode.value == ThemeMode.dark || 
      (_themeMode.value == ThemeMode.system && 
       WidgetsBinding.instance.platformDispatcher.platformBrightness == Brightness.dark);
  
  @override
  void onInit() {
    super.onInit();
    _loadThemeMode();
  }
  
  /// Load saved theme mode from storage
  Future<void> _loadThemeMode() async {
    try {
      final box = await Hive.openBox(_themeBoxName);
      final savedMode = box.get(_themeModeKey, defaultValue: 'system');
      
      switch (savedMode) {
        case 'light':
          _themeMode.value = ThemeMode.light;
          break;
        case 'dark':
          _themeMode.value = ThemeMode.dark;
          break;
        default:
          _themeMode.value = ThemeMode.system;
      }
      
      update();
    } catch (e) {
      print('Error loading theme mode: $e');
      _themeMode.value = ThemeMode.system;
    }
  }
  
  /// Save theme mode to storage
  Future<void> _saveThemeMode(ThemeMode mode) async {
    try {
      final box = await Hive.openBox(_themeBoxName);
      String modeString;
      
      switch (mode) {
        case ThemeMode.light:
          modeString = 'light';
          break;
        case ThemeMode.dark:
          modeString = 'dark';
          break;
        default:
          modeString = 'system';
      }
      
      await box.put(_themeModeKey, modeString);
    } catch (e) {
      print('Error saving theme mode: $e');
    }
  }
  
  /// Set theme mode
  void setThemeMode(ThemeMode mode) {
    _themeMode.value = mode;
    Get.changeThemeMode(mode);
    _saveThemeMode(mode);
    update();
  }
  
  /// Toggle between light and dark mode
  void toggleTheme() {
    if (_themeMode.value == ThemeMode.dark) {
      setThemeMode(ThemeMode.light);
    } else {
      setThemeMode(ThemeMode.dark);
    }
  }
  
  /// Set to system default
  void setSystemDefault() {
    setThemeMode(ThemeMode.system);
  }
  
  /// Set to light mode
  void setLightMode() {
    setThemeMode(ThemeMode.light);
  }
  
  /// Set to dark mode
  void setDarkMode() {
    setThemeMode(ThemeMode.dark);
  }
  
  /// Get theme mode display name
  String getThemeModeName() {
    switch (_themeMode.value) {
      case ThemeMode.light:
        return 'Light';
      case ThemeMode.dark:
        return 'Dark';
      default:
        return 'System';
    }
  }
}
