import 'package:flutter/material.dart';

/// Responsive breakpoints for different device sizes
class Breakpoints {
  static const double mobile = 600;
  static const double tablet = 900;
  static const double desktop = 1200;
  static const double largeDesktop = 1800;
}

/// Device type enumeration
enum DeviceType { mobile, tablet, desktop }

/// Responsive utility class for handling different screen sizes
class Responsive extends StatelessWidget {
  final Widget mobile;
  final Widget? tablet;
  final Widget? desktop;

  const Responsive({
    super.key,
    required this.mobile,
    this.tablet,
    this.desktop,
  });

  /// Check if the current device is mobile
  static bool isMobile(BuildContext context) =>
      MediaQuery.of(context).size.width < Breakpoints.mobile;

  /// Check if the current device is tablet
  static bool isTablet(BuildContext context) =>
      MediaQuery.of(context).size.width >= Breakpoints.mobile &&
      MediaQuery.of(context).size.width < Breakpoints.desktop;

  /// Check if the current device is desktop
  static bool isDesktop(BuildContext context) =>
      MediaQuery.of(context).size.width >= Breakpoints.desktop;

  /// Get the current device type
  static DeviceType getDeviceType(BuildContext context) {
    final width = MediaQuery.of(context).size.width;
    if (width < Breakpoints.mobile) return DeviceType.mobile;
    if (width < Breakpoints.desktop) return DeviceType.tablet;
    return DeviceType.desktop;
  }

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.of(context).size.width;

    if (width >= Breakpoints.desktop && desktop != null) {
      return desktop!;
    }
    if (width >= Breakpoints.mobile && tablet != null) {
      return tablet!;
    }
    return mobile;
  }
}

/// Extension on BuildContext for easy responsive access
extension ResponsiveExtension on BuildContext {
  /// Screen width
  double get screenWidth => MediaQuery.of(this).size.width;

  /// Screen height
  double get screenHeight => MediaQuery.of(this).size.height;

  /// Check if device is mobile
  bool get isMobile => screenWidth < Breakpoints.mobile;

  /// Check if device is tablet
  bool get isTablet =>
      screenWidth >= Breakpoints.mobile && screenWidth < Breakpoints.desktop;

  /// Check if device is desktop
  bool get isDesktop => screenWidth >= Breakpoints.desktop;

  /// Check if device is tablet or larger
  bool get isTabletOrLarger => screenWidth >= Breakpoints.mobile;

  /// Check if device is in landscape mode
  bool get isLandscape => screenWidth > screenHeight;

  /// Check if device is in portrait mode
  bool get isPortrait => screenHeight > screenWidth;

  /// Get device type
  DeviceType get deviceType => Responsive.getDeviceType(this);

  /// Get responsive value based on device type
  T responsive<T>({
    required T mobile,
    T? tablet,
    T? desktop,
  }) {
    if (isDesktop && desktop != null) return desktop;
    if (isTabletOrLarger && tablet != null) return tablet;
    return mobile;
  }
}

/// Responsive sizing utilities
class ResponsiveSizing {
  final BuildContext context;

  ResponsiveSizing(this.context);

  /// Get screen width
  double get width => MediaQuery.of(context).size.width;

  /// Get screen height
  double get height => MediaQuery.of(context).size.height;

  /// Get safe area padding
  EdgeInsets get safePadding => MediaQuery.of(context).padding;

  /// Responsive horizontal padding
  double get horizontalPadding {
    if (width >= Breakpoints.desktop) return 48.0;
    if (width >= Breakpoints.tablet) return 32.0;
    if (width >= Breakpoints.mobile) return 24.0;
    return 16.0;
  }

  /// Responsive vertical padding
  double get verticalPadding {
    if (width >= Breakpoints.desktop) return 32.0;
    if (width >= Breakpoints.tablet) return 24.0;
    return 16.0;
  }

  /// Responsive content padding
  EdgeInsets get contentPadding => EdgeInsets.symmetric(
        horizontal: horizontalPadding,
        vertical: verticalPadding,
      );

  /// Get grid cross axis count based on screen width
  int get gridCrossAxisCount {
    if (width >= Breakpoints.largeDesktop) return 6;
    if (width >= Breakpoints.desktop) return 5;
    if (width >= Breakpoints.tablet) return 4;
    if (width >= Breakpoints.mobile) return 3;
    return 2;
  }

  /// Get product grid cross axis count
  int get productGridCount {
    if (width >= Breakpoints.largeDesktop) return 5;
    if (width >= Breakpoints.desktop) return 4;
    if (width >= Breakpoints.tablet) return 3;
    if (width >= Breakpoints.mobile) return 3;
    return 2;
  }

  /// Get category grid cross axis count
  int get categoryGridCount {
    if (width >= Breakpoints.largeDesktop) return 6;
    if (width >= Breakpoints.desktop) return 5;
    if (width >= Breakpoints.tablet) return 4;
    if (width >= Breakpoints.mobile) return 3;
    return 2;
  }

  /// Get banner height
  double get bannerHeight {
    if (width >= Breakpoints.desktop) return 400.0;
    if (width >= Breakpoints.tablet) return 300.0;
    if (width >= Breakpoints.mobile) return 220.0;
    return 180.0;
  }

  /// Get category card size
  double get categoryCardSize {
    if (width >= Breakpoints.desktop) return 140.0;
    if (width >= Breakpoints.tablet) return 120.0;
    if (width >= Breakpoints.mobile) return 100.0;
    return 85.0;
  }

  /// Get icon size
  double get iconSize {
    if (width >= Breakpoints.tablet) return 28.0;
    return 24.0;
  }

  /// Get large icon size
  double get largeIconSize {
    if (width >= Breakpoints.tablet) return 48.0;
    return 32.0;
  }

  /// Get font scale factor
  double get fontScale {
    if (width >= Breakpoints.desktop) return 1.2;
    if (width >= Breakpoints.tablet) return 1.1;
    return 1.0;
  }

  /// Get dialog width
  double get dialogWidth {
    if (width >= Breakpoints.desktop) return 600.0;
    if (width >= Breakpoints.tablet) return 500.0;
    return width * 0.9;
  }

  /// Get max content width for centering on large screens
  double get maxContentWidth {
    if (width >= Breakpoints.largeDesktop) return 1400.0;
    if (width >= Breakpoints.desktop) return 1200.0;
    return width;
  }

  /// Check if should use side navigation (tablet/desktop)
  bool get useSideNavigation => width >= Breakpoints.tablet;

  /// Get navigation rail width
  double get navigationRailWidth {
    if (width >= Breakpoints.desktop) return 280.0;
    if (width >= Breakpoints.tablet) return 80.0;
    return 0.0;
  }

  /// Get bottom navigation height
  double get bottomNavHeight => 80.0;

  /// Get app bar height
  double get appBarHeight {
    if (width >= Breakpoints.tablet) return 70.0;
    return 56.0;
  }
}

/// Extension to easily access ResponsiveSizing
extension ResponsiveSizingExtension on BuildContext {
  ResponsiveSizing get sizing => ResponsiveSizing(this);
}

/// Responsive wrapper that constrains content width on large screens
class ResponsiveContainer extends StatelessWidget {
  final Widget child;
  final double? maxWidth;
  final EdgeInsetsGeometry? padding;
  final bool center;

  const ResponsiveContainer({
    super.key,
    required this.child,
    this.maxWidth,
    this.padding,
    this.center = true,
  });

  @override
  Widget build(BuildContext context) {
    final sizing = context.sizing;
    final effectiveMaxWidth = maxWidth ?? sizing.maxContentWidth;

    Widget content = child;

    if (padding != null) {
      content = Padding(padding: padding!, child: content);
    }

    if (center && sizing.width > effectiveMaxWidth) {
      content = Center(
        child: ConstrainedBox(
          constraints: BoxConstraints(maxWidth: effectiveMaxWidth),
          child: content,
        ),
      );
    }

    return content;
  }
}

/// Responsive grid view that adapts to screen size
class ResponsiveGridView extends StatelessWidget {
  final List<Widget> children;
  final int? crossAxisCount;
  final double crossAxisSpacing;
  final double mainAxisSpacing;
  final double childAspectRatio;
  final EdgeInsetsGeometry? padding;
  final ScrollPhysics? physics;
  final bool shrinkWrap;

  const ResponsiveGridView({
    super.key,
    required this.children,
    this.crossAxisCount,
    this.crossAxisSpacing = 16,
    this.mainAxisSpacing = 16,
    this.childAspectRatio = 1.0,
    this.padding,
    this.physics,
    this.shrinkWrap = false,
  });

  @override
  Widget build(BuildContext context) {
    final sizing = context.sizing;
    final effectiveCrossAxisCount = crossAxisCount ?? sizing.gridCrossAxisCount;

    return GridView.builder(
      padding: padding ?? EdgeInsets.all(sizing.horizontalPadding),
      physics: physics,
      shrinkWrap: shrinkWrap,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: effectiveCrossAxisCount,
        crossAxisSpacing: crossAxisSpacing,
        mainAxisSpacing: mainAxisSpacing,
        childAspectRatio: childAspectRatio,
      ),
      itemCount: children.length,
      itemBuilder: (context, index) => children[index],
    );
  }
}

/// Responsive sliver grid delegate
class ResponsiveSliverGridDelegate extends SliverGridDelegateWithFixedCrossAxisCount {
  ResponsiveSliverGridDelegate({
    required BuildContext context,
    int? crossAxisCount,
    double crossAxisSpacing = 16,
    double mainAxisSpacing = 16,
    double childAspectRatio = 1.0,
  }) : super(
          crossAxisCount: crossAxisCount ?? context.sizing.gridCrossAxisCount,
          crossAxisSpacing: crossAxisSpacing,
          mainAxisSpacing: mainAxisSpacing,
          childAspectRatio: childAspectRatio,
        );
}
