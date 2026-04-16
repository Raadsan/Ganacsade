import 'dart:ui';
import 'package:get/get.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageController extends GetxController {
  static const String _languageKey = 'selected_language';
  
  final RxString _currentLanguageCode = 'en'.obs;
  final RxString _currentLanguageName = 'English'.obs;
  
  String get currentLanguageCode => _currentLanguageCode.value;
  String get currentLanguageName => _currentLanguageName.value;
  
  // Available languages
  final List<Map<String, String>> languages = [
    {
      'code': 'en',
      'name': 'English',
      'nativeName': 'English',
      'flag': '🇺🇸',
      'locale': 'en_US',
    },
    {
      'code': 'so',
      'name': 'Somali',
      'nativeName': 'Soomaali',
      'flag': '🇸🇴',
      'locale': 'so_SO',
    },
    {
      'code': 'ar',
      'name': 'Arabic',
      'nativeName': 'العربية',
      'flag': '🇸🇦',
      'locale': 'ar_SA',
    },
  ];

  @override
  void onInit() {
    super.onInit();
    _loadSavedLanguage();
  }

  Future<void> _loadSavedLanguage() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final savedCode = prefs.getString(_languageKey) ?? 'en';
      await changeLanguage(savedCode, save: false);
    } catch (e) {
      print('Error loading saved language: $e');
    }
  }

  Future<void> changeLanguage(String languageCode, {bool save = true}) async {
    final language = languages.firstWhere(
      (lang) => lang['code'] == languageCode,
      orElse: () => languages.first,
    );
    
    _currentLanguageCode.value = language['code']!;
    _currentLanguageName.value = language['name']!;
    
    // Update GetX locale
    final localeParts = language['locale']!.split('_');
    final locale = Locale(localeParts[0], localeParts.length > 1 ? localeParts[1] : '');
    Get.updateLocale(locale);
    
    // Save preference
    if (save) {
      try {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(_languageKey, languageCode);
      } catch (e) {
        print('Error saving language preference: $e');
      }
    }
    
    update();
  }

  bool isRTL() {
    return _currentLanguageCode.value == 'ar';
  }

  Map<String, String>? getLanguageByCode(String code) {
    try {
      return languages.firstWhere((lang) => lang['code'] == code);
    } catch (e) {
      return null;
    }
  }
}
