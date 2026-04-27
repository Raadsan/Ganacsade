import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/models/address.dart';
import '../controllers/profile_controller.dart';

class AddressesScreen extends StatelessWidget {
  const AddressesScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final ProfileController controller = Get.find<ProfileController>();
    print('📍 AddressesScreen build - addresses count: ${controller.addresses.length}');
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Addresses'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        leading: IconButton(
          onPressed: () {
            // Dismiss keyboard before going back
            FocusManager.instance.primaryFocus?.unfocus();
            Navigator.pop(context);
          },
          icon: const Icon(Icons.arrow_back),
        ),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.add),
            onPressed: () {
              HapticFeedback.lightImpact();
              _showAddAddressDialog(context, controller);
            },
          ),
        ],
      ),
      body: GetBuilder<ProfileController>(
        builder: (controller) {
          if (controller.addresses.isEmpty) {
            return RefreshIndicator(
              onRefresh: () async {
                await controller.reloadAddresses();
              },
              color: AppColors.primaryGreen,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                child: SizedBox(
                  height: MediaQuery.of(context).size.height - 200,
                  child: _buildEmptyState(context, controller),
                ),
              ),
            );
          }
          
          return RefreshIndicator(
            onRefresh: () async {
              await controller.reloadAddresses();
            },
            color: AppColors.primaryGreen,
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: controller.addresses.length,
              itemBuilder: (context, index) {
                final address = controller.addresses[index];
                return _buildAddressCard(context, address, controller, index);
              },
            ),
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          HapticFeedback.lightImpact();
          _showAddAddressDialog(context, controller);
        },
        backgroundColor: AppColors.primaryGreen,
        child: const Icon(Icons.add, color: AppColors.white),
      ),
    );
  }

  Widget _buildEmptyState(BuildContext context, ProfileController controller) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: AppColors.primaryGreen.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(
              Icons.location_on_outlined,
              size: 60,
              color: AppColors.primaryGreen,
            ),
          ),
          const SizedBox(height: 24),
          Text(
            'No Addresses Added',
            style: AppTextStyles.titleLarge.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.grey900,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Add your delivery addresses to make\ncheckout faster and easier',
            textAlign: TextAlign.center,
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.grey600,
            ),
          ),
          const SizedBox(height: 32),
          ElevatedButton.icon(
            onPressed: () {
              HapticFeedback.lightImpact();
              _showAddAddressDialog(context, controller);
            },
            icon: const Icon(Icons.add),
            label: const Text('Add Address'),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              foregroundColor: AppColors.white,
              padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 16),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 600.ms)
        .slideY(begin: 0.3, end: 0);
  }

  Widget _buildAddressCard(BuildContext context, Address address, ProfileController controller, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: address.isDefault 
            ? Border.all(color: AppColors.primaryGreen, width: 2)
            : Border.all(color: AppColors.grey200),
        boxShadow: [
          BoxShadow(
            color: AppColors.shadowLight,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            HapticFeedback.lightImpact();
            _showAddressOptions(context, address, controller);
          },
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Address Header
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: address.isDefault 
                            ? AppColors.primaryGreen
                            : AppColors.grey100,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        address.title,
                        style: AppTextStyles.labelMedium.copyWith(
                          color: address.isDefault 
                              ? AppColors.white
                              : AppColors.grey700,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    if (address.isDefault) ...[
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.success.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          'Default',
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.success,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                    const Spacer(),
                    PopupMenuButton<String>(
                      onSelected: (value) {
                        HapticFeedback.lightImpact();
                        switch (value) {
                          case 'edit':
                            _showEditAddressDialog(context, address, controller);
                            break;
                          case 'default':
                            controller.setDefaultAddress(address.id);
                            break;
                          case 'delete':
                            _showDeleteConfirmation(context, address, controller);
                            break;
                        }
                      },
                      itemBuilder: (context) => [
                        const PopupMenuItem(
                          value: 'edit',
                          child: Row(
                            children: [
                              Icon(Icons.edit_outlined, size: 18),
                              SizedBox(width: 8),
                              Text('Edit'),
                            ],
                          ),
                        ),
                        if (!address.isDefault)
                          const PopupMenuItem(
                            value: 'default',
                            child: Row(
                              children: [
                                Icon(Icons.star_outline, size: 18),
                                SizedBox(width: 8),
                                Text('Set as Default'),
                              ],
                            ),
                          ),
                        const PopupMenuItem(
                          value: 'delete',
                          child: Row(
                            children: [
                              Icon(Icons.delete_outline, size: 18, color: AppColors.error),
                              SizedBox(width: 8),
                              Text('Delete', style: TextStyle(color: AppColors.error)),
                            ],
                          ),
                        ),
                      ],
                      child: Icon(
                        Icons.more_vert,
                        color: AppColors.grey600,
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 16),
                
                // Contact Info
                Row(
                  children: [
                    Icon(
                      Icons.person_outline,
                      size: 18,
                      color: AppColors.grey600,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      address.fullName,
                      style: AppTextStyles.titleSmall.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 8),
                
                Row(
                  children: [
                    Icon(
                      Icons.phone_outlined,
                      size: 18,
                      color: AppColors.grey600,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      address.phoneNumber,
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.grey700,
                      ),
                    ),
                  ],
                ),
                
                const SizedBox(height: 12),
                
                // Address
                Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(
                      Icons.location_on_outlined,
                      size: 18,
                      color: AppColors.grey600,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        address.fullAddress,
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.grey700,
                          height: 1.4,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    )
        .animate(delay: Duration(milliseconds: index * 100))
        .fadeIn(duration: 600.ms)
        .slideX(begin: 0.3, end: 0);
  }

  void _showAddressOptions(BuildContext context, Address address, ProfileController controller) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 40,
              height: 4,
              decoration: BoxDecoration(
                color: AppColors.grey300,
                borderRadius: BorderRadius.circular(2),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              address.title,
              style: AppTextStyles.titleLarge.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 20),
            _buildOptionTile(
              icon: Icons.edit_outlined,
              title: 'Edit Address',
              onTap: () {
                Get.back();
                _showEditAddressDialog(context, address, controller);
              },
            ),
            if (!address.isDefault)
              _buildOptionTile(
                icon: Icons.star_outline,
                title: 'Set as Default',
                onTap: () {
                  Get.back();
                  controller.setDefaultAddress(address.id);
                },
              ),
            _buildOptionTile(
              icon: Icons.delete_outline,
              title: 'Delete Address',
              color: AppColors.error,
              onTap: () {
                Get.back();
                _showDeleteConfirmation(context, address, controller);
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOptionTile({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? color,
  }) {
    return ListTile(
      leading: Icon(icon, color: color ?? AppColors.grey700),
      title: Text(
        title,
        style: AppTextStyles.titleSmall.copyWith(
          color: color ?? AppColors.grey900,
        ),
      ),
      onTap: () {
        HapticFeedback.lightImpact();
        onTap();
      },
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
    );
  }

  void _showAddAddressDialog(BuildContext context, ProfileController controller) {
    _showAddressFormDialog(context, controller, null);
  }

  void _showEditAddressDialog(BuildContext context, Address address, ProfileController controller) {
    _showAddressFormDialog(context, controller, address);
  }

  void _showAddressFormDialog(BuildContext context, ProfileController controller, Address? existingAddress) {
    final formKey = GlobalKey<FormState>();
    
    // Address title options
    final addressTitles = ['Home', 'Office', 'Work', 'Other'];
    String selectedTitle = existingAddress?.title ?? addressTitles[0];
    
    // Somalia cities
    final somaliaCities = [
      'Mogadishu', 'Hargeisa', 'Kismayo', 'Marka', 'Baidoa', 
      'Bosaso', 'Galkayo', 'Garowe', 'Beledweyne', 'Burao',
      'Berbera', 'Jowhar', 'Afgooye', 'Bossaso', 'Luuq'
    ];
    String selectedCity = existingAddress?.city ?? somaliaCities[0];
    
    // Somalia regions
    final somaliaRegions = [
      'Banaadir', 'Woqooyi Galbeed', 'Lower Juba', 'Lower Shabelle', 'Bay',
      'Bari', 'Mudug', 'Nugaal', 'Hiraan', 'Togdheer',
      'Sanaag', 'Middle Shabelle', 'Gedo', 'Awdal', 'Sool',
      'Bakool', 'Middle Juba', 'Galmudug'
    ];
    String selectedRegion = existingAddress?.state ?? somaliaRegions[0];
    
    final nameController = TextEditingController(text: existingAddress?.fullName ?? '');
    final phoneController = TextEditingController(text: existingAddress?.phoneNumber ?? '');
    final streetController = TextEditingController(text: existingAddress?.street ?? '');
    bool isDefault = existingAddress?.isDefault ?? false;

    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Text(existingAddress != null ? 'Edit Address' : 'Add New Address'),
        content: SizedBox(
          width: double.maxFinite,
          child: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  StatefulBuilder(
                    builder: (context, setState) {
                      return DropdownButtonFormField<String>(
                        value: selectedTitle,
                        decoration: const InputDecoration(
                          labelText: 'Address Title',
                          prefixIcon: Icon(Icons.label_outline),
                        ),
                        items: addressTitles.map((title) {
                          return DropdownMenuItem(
                            value: title,
                            child: Text(title),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            selectedTitle = value!;
                          });
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: nameController,
                    decoration: const InputDecoration(
                      labelText: 'Full Name',
                      prefixIcon: Icon(Icons.person_outline),
                    ),
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Please enter full name';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: phoneController,
                    decoration: const InputDecoration(
                      labelText: 'Phone Number',
                      prefixIcon: Icon(Icons.phone_outlined),
                    ),
                    keyboardType: TextInputType.phone,
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Please enter phone number';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: streetController,
                    decoration: const InputDecoration(
                      labelText: 'Street Address',
                      prefixIcon: Icon(Icons.location_on_outlined),
                    ),
                    maxLines: 2,
                    validator: (value) {
                      if (value == null || value.trim().isEmpty) {
                        return 'Please enter street address';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  StatefulBuilder(
                    builder: (context, setState) {
                      return DropdownButtonFormField<String>(
                        value: selectedCity,
                        decoration: const InputDecoration(
                          labelText: 'City',
                          prefixIcon: Icon(Icons.location_city_outlined),
                        ),
                        items: somaliaCities.map((city) {
                          return DropdownMenuItem(
                            value: city,
                            child: Text(city),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            selectedCity = value!;
                          });
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                  StatefulBuilder(
                    builder: (context, setState) {
                      return DropdownButtonFormField<String>(
                        value: selectedRegion,
                        decoration: const InputDecoration(
                          labelText: 'Region',
                          prefixIcon: Icon(Icons.map_outlined),
                        ),
                        items: somaliaRegions.map((region) {
                          return DropdownMenuItem(
                            value: region,
                            child: Text(region),
                          );
                        }).toList(),
                        onChanged: (value) {
                          setState(() {
                            selectedRegion = value!;
                          });
                        },
                      );
                    },
                  ),
                  const SizedBox(height: 16),
                  StatefulBuilder(
                    builder: (context, setState) {
                      return CheckboxListTile(
                        title: const Text('Set as default address'),
                        value: isDefault,
                        onChanged: (value) {
                          setState(() {
                            isDefault = value ?? false;
                          });
                        },
                        activeColor: AppColors.primaryGreen,
                        contentPadding: EdgeInsets.zero,
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              if (formKey.currentState!.validate()) {
                final address = Address(
                  id: existingAddress?.id ?? 'addr_${DateTime.now().millisecondsSinceEpoch}',
                  title: selectedTitle,
                  fullName: nameController.text.trim(),
                  phoneNumber: phoneController.text.trim(),
                  street: streetController.text.trim(),
                  city: selectedCity,
                  state: selectedRegion,
                  country: 'Somalia',
                  postalCode: '',
                  isDefault: isDefault,
                );

                Navigator.of(dialogContext).pop();
                
                if (existingAddress != null) {
                  await controller.updateAddress(address);
                } else {
                  await controller.addAddress(address);
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primaryGreen,
              foregroundColor: AppColors.white,
            ),
            child: Text(existingAddress != null ? 'Update' : 'Add'),
          ),
        ],
      ),
    );
  }

  void _showDeleteConfirmation(BuildContext context, Address address, ProfileController controller) {
    showDialog(
      context: context,
      builder: (dialogContext) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: const Text('Delete Address'),
        content: Text('Are you sure you want to delete "${address.title}" address?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.of(dialogContext).pop();
              await controller.deleteAddress(address.id);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.error,
              foregroundColor: AppColors.white,
            ),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}
