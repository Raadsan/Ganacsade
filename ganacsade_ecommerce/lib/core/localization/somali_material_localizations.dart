import 'package:flutter/cupertino.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

/// Custom MaterialLocalizations delegate for Somali
/// Falls back to English for Material widgets since Flutter doesn't support Somali natively
class SomaliMaterialLocalizations extends DefaultMaterialLocalizations {
  const SomaliMaterialLocalizations();

  @override
  String get alertDialogLabel => 'Digniin';

  @override
  String get anteMeridiemAbbreviation => 'AM';

  @override
  String get postMeridiemAbbreviation => 'PM';

  @override
  String get backButtonTooltip => 'Dib u noqo';

  @override
  String get cancelButtonLabel => 'Jooji';

  @override
  String get closeButtonLabel => 'Xir';

  @override
  String get closeButtonTooltip => 'Xir';

  @override
  String get continueButtonLabel => 'Sii wad';

  @override
  String get copyButtonLabel => 'Koobiye';

  @override
  String get cutButtonLabel => 'Jar';

  @override
  String get deleteButtonTooltip => 'Tirtir';

  @override
  String get dialogLabel => 'Wada hadal';

  @override
  String get drawerLabel => 'Menu';

  @override
  String get hideAccountsLabel => 'Qari akoonka';

  @override
  String get licensesPageTitle => 'Shatiyada';

  @override
  String get menuBarMenuLabel => 'Menu';

  @override
  String get modalBarrierDismissLabel => 'Iska xir';

  @override
  String get moreButtonTooltip => 'Wax badan';

  @override
  String get nextMonthTooltip => 'Bisha xigta';

  @override
  String get nextPageTooltip => 'Bogga xiga';

  @override
  String get okButtonLabel => 'Hagaag';

  @override
  String get openAppDrawerTooltip => 'Fur menu-ga';

  @override
  String get pasteButtonLabel => 'Dhaji';

  @override
  String get popupMenuLabel => 'Menu';

  @override
  String get previousMonthTooltip => 'Bishii hore';

  @override
  String get previousPageTooltip => 'Bogga hore';

  @override
  String get refreshIndicatorSemanticLabel => 'Cusboonaysii';

  @override
  String get searchFieldLabel => 'Raadi';

  @override
  String get selectAllButtonLabel => 'Dooro dhammaan';

  @override
  String get selectYearSemanticsLabel => 'Dooro sannadka';

  @override
  String get showAccountsLabel => 'Tus akoonka';

  @override
  String get showMenuTooltip => 'Tus menu-ga';

  @override
  String get signedInLabel => 'Waa la galay';

  static const LocalizationsDelegate<MaterialLocalizations> delegate =
      _SomaliMaterialLocalizationsDelegate();
}

class _SomaliMaterialLocalizationsDelegate
    extends LocalizationsDelegate<MaterialLocalizations> {
  const _SomaliMaterialLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => locale.languageCode == 'so';

  @override
  Future<MaterialLocalizations> load(Locale locale) {
    return SynchronousFuture<MaterialLocalizations>(
      const SomaliMaterialLocalizations(),
    );
  }

  @override
  bool shouldReload(_SomaliMaterialLocalizationsDelegate old) => false;
}

/// Custom CupertinoLocalizations delegate for Somali
class SomaliCupertinoLocalizations extends DefaultCupertinoLocalizations {
  const SomaliCupertinoLocalizations();

  @override
  String get alertDialogLabel => 'Digniin';

  @override
  String get modalBarrierDismissLabel => 'Iska xir';

  static const LocalizationsDelegate<CupertinoLocalizations> delegate =
      _SomaliCupertinoLocalizationsDelegate();
}

class _SomaliCupertinoLocalizationsDelegate
    extends LocalizationsDelegate<CupertinoLocalizations> {
  const _SomaliCupertinoLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) => locale.languageCode == 'so';

  @override
  Future<CupertinoLocalizations> load(Locale locale) {
    return SynchronousFuture<CupertinoLocalizations>(
      const SomaliCupertinoLocalizations(),
    );
  }

  @override
  bool shouldReload(_SomaliCupertinoLocalizationsDelegate old) => false;
}
