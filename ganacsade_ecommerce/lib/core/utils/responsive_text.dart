import 'package:flutter/material.dart';
import 'responsive.dart';

/// Responsive text styles that scale based on device size
class ResponsiveText {
  final BuildContext context;

  ResponsiveText(this.context);

  double get _scale => context.sizing.fontScale;

  /// Display Large - Hero text
  TextStyle get displayLarge => TextStyle(
        fontSize: 57 * _scale,
        fontWeight: FontWeight.w400,
        letterSpacing: -0.25,
      );

  /// Display Medium
  TextStyle get displayMedium => TextStyle(
        fontSize: 45 * _scale,
        fontWeight: FontWeight.w400,
      );

  /// Display Small
  TextStyle get displaySmall => TextStyle(
        fontSize: 36 * _scale,
        fontWeight: FontWeight.w400,
      );

  /// Headline Large
  TextStyle get headlineLarge => TextStyle(
        fontSize: 32 * _scale,
        fontWeight: FontWeight.w600,
      );

  /// Headline Medium
  TextStyle get headlineMedium => TextStyle(
        fontSize: 28 * _scale,
        fontWeight: FontWeight.w600,
      );

  /// Headline Small
  TextStyle get headlineSmall => TextStyle(
        fontSize: 24 * _scale,
        fontWeight: FontWeight.w600,
      );

  /// Title Large
  TextStyle get titleLarge => TextStyle(
        fontSize: 22 * _scale,
        fontWeight: FontWeight.w500,
      );

  /// Title Medium
  TextStyle get titleMedium => TextStyle(
        fontSize: 16 * _scale,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.15,
      );

  /// Title Small
  TextStyle get titleSmall => TextStyle(
        fontSize: 14 * _scale,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
      );

  /// Body Large
  TextStyle get bodyLarge => TextStyle(
        fontSize: 16 * _scale,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.5,
      );

  /// Body Medium
  TextStyle get bodyMedium => TextStyle(
        fontSize: 14 * _scale,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.25,
      );

  /// Body Small
  TextStyle get bodySmall => TextStyle(
        fontSize: 12 * _scale,
        fontWeight: FontWeight.w400,
        letterSpacing: 0.4,
      );

  /// Label Large
  TextStyle get labelLarge => TextStyle(
        fontSize: 14 * _scale,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.1,
      );

  /// Label Medium
  TextStyle get labelMedium => TextStyle(
        fontSize: 12 * _scale,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
      );

  /// Label Small
  TextStyle get labelSmall => TextStyle(
        fontSize: 11 * _scale,
        fontWeight: FontWeight.w500,
        letterSpacing: 0.5,
      );
}

/// Extension to easily access ResponsiveText
extension ResponsiveTextExtension on BuildContext {
  ResponsiveText get responsiveText => ResponsiveText(this);
}
