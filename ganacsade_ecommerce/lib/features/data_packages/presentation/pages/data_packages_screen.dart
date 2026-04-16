import 'package:flutter/material.dart';
import 'provider_selection_screen.dart';

/// Main screen for Data Packages category
/// This redirects to the Provider Selection Screen
class DataPackagesScreen extends StatelessWidget {
  const DataPackagesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Directly show the provider selection screen
    return const ProviderSelectionScreen();
  }
}
