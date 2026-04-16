import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/constants/app_text_styles.dart';
import '../../../../shared/models/category.dart';
import 'subcategory_products_screen.dart';

class SubcategoriesScreen extends StatelessWidget {
  final CategoryType categoryType;

  const SubcategoriesScreen({
    super.key,
    required this.categoryType,
  });

  @override
  Widget build(BuildContext context) {
    final subcategories = _getSubcategories(categoryType);
    
    return Scaffold(
      appBar: AppBar(
        title: Text(_getCategoryName(categoryType)),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: AppColors.white,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Get.back(),
          icon: const Icon(Icons.arrow_back),
        ),
      ),
      body: SafeArea(
        child: Column(
          children: [
            _buildCategoryHeader(),
            Expanded(
              child: _buildSubcategoriesList(subcategories),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCategoryHeader() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.primaryGreen,
            AppColors.primaryGreen.withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Column(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Icon(
              _getCategoryIcon(categoryType),
              size: 40,
              color: AppColors.white,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _getCategoryName(categoryType),
            style: AppTextStyles.headlineMedium.copyWith(
              color: AppColors.white,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            _getCategoryDescription(categoryType),
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.white.withOpacity(0.9),
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(duration: 600.ms)
        .slideY(begin: -0.3, end: 0);
  }

  Widget _buildSubcategoriesList(List<SubcategoryItem> subcategories) {
    return GridView.builder(
      padding: const EdgeInsets.all(16),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        childAspectRatio: 0.85,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: subcategories.length,
      itemBuilder: (context, index) {
        final subcategory = subcategories[index];
        return _buildSubcategoryCard(subcategory, index);
      },
    );
  }

  Widget _buildSubcategoryCard(SubcategoryItem subcategory, int index) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.lightImpact();
          Get.to(() => SubcategoryProductsScreen(
            categoryType: categoryType,
            subcategoryName: subcategory.nameEn,
          ));
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: AppColors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: AppColors.grey200,
              width: 1,
            ),
            boxShadow: [
              BoxShadow(
                color: AppColors.shadowLight,
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: categoryType.color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: subcategory.imagePath != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.asset(
                          subcategory.imagePath!,
                          width: 40,
                          height: 40,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) {
                            return Icon(
                              Icons.image_not_supported,
                              size: 20,
                              color: categoryType.color,
                            );
                          },
                        ),
                      )
                    : Icon(
                        subcategory.icon!,
                        size: 20,
                        color: categoryType.color,
                      ),
              ),
              const SizedBox(height: 8),
              Flexible(
                child: Text(
                  subcategory.nameEn,
                  style: AppTextStyles.labelMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 2),
              Flexible(
                child: Text(
                  subcategory.nameSo,
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.grey600,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 6),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 6,
                  vertical: 2,
                ),
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '${subcategory.productCount}',
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.primaryGreen,
                    fontWeight: FontWeight.w600,
                    fontSize: 10,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    )
        .animate()
        .fadeIn(duration: 600.ms, delay: Duration(milliseconds: 100 * index))
        .scale(begin: const Offset(0.8, 0.8), end: const Offset(1.0, 1.0));
  }

  List<SubcategoryItem> _getSubcategories(CategoryType categoryType) {
    switch (categoryType) {
      case CategoryType.internet:
        return [
          SubcategoryItem(
            nameEn: 'Hormuud',
            nameSo: 'Hormuud Telecom',
            nameAr: 'هرمود تيليكوم',
            description: 'Data packages and mobile services',
            imagePath: 'assets/images/Hormuud.png',
            productCount: 25,
          ),
          SubcategoryItem(
            nameEn: 'Somnet',
            nameSo: 'Somnet Telecom',
            nameAr: 'سومنت تيليكوم',
            description: 'Internet and communication services',
            imagePath: 'assets/images/somnet.jpeg',
            productCount: 18,
          ),
          SubcategoryItem(
            nameEn: 'Somtel',
            nameSo: 'Somtel Telecom',
            nameAr: 'سومتل تيليكوم',
            description: 'Mobile and internet solutions',
            imagePath: 'assets/images/somtel.png',
            productCount: 32,
          ),
          SubcategoryItem(
            nameEn: 'Somlink',
            nameSo: 'Somlink Telecom',
            nameAr: 'سوملينك تيليكوم',
            description: 'Digital communication services',
            imagePath: 'assets/images/somlink.png',
            productCount: 28,
          ),
          SubcategoryItem(
            nameEn: 'Amtel',
            nameSo: 'Amtel Telecom',
            nameAr: 'أمتل تيليكوم',
            description: 'Telecommunications and data services',
            imagePath: 'assets/images/Amtel.png',
            productCount: 21,
          ),
        ];

      case CategoryType.gifts:
        return [
          SubcategoryItem(
            nameEn: 'Kids Gifts',
            nameSo: 'Hadiyadaha Caruurta',
            nameAr: 'هدايا الأطفال',
            description: 'Special gifts and toys for children',
            imagePath: 'assets/images/Gifts1.png',
            productCount: 45,
          ),
          SubcategoryItem(
            nameEn: 'Gift Packages',
            nameSo: 'Xirmaha Hadiyada',
            nameAr: 'حزم الهدايا',
            description: 'Curated gift packages and bundles',
            imagePath: 'assets/images/Gifts2.png',
            productCount: 38,
          ),
        ];

      case CategoryType.electronics:
        return [
          SubcategoryItem(
            nameEn: 'Laptops',
            nameSo: 'Kombiyuutarka',
            nameAr: 'أجهزة الكمبيوتر المحمولة',
            description: 'Laptops, desktops and accessories',
            imagePath: 'assets/images/Electronics1.png',
            productCount: 43,
          ),
          SubcategoryItem(
            nameEn: 'Phones',
            nameSo: 'Taleefannada Gacanta',
            nameAr: 'الهواتف المحمولة',
            description: 'Smartphones and feature phones',
            imagePath: 'assets/images/Electronics2.png',
            productCount: 67,
          ),
        ];

      case CategoryType.mens:
        return [
          SubcategoryItem(
            nameEn: 'Men\'s Wear',
            nameSo: 'Dharka Ragga',
            nameAr: 'ملابس الرجال',
            description: 'Traditional and casual men\'s clothing',
            imagePath: 'assets/images/Men\'s-Market1.png',
            productCount: 78,
          ),
          SubcategoryItem(
            nameEn: 'Formal Wear',
            nameSo: 'Dharka Rasmiga ah',
            nameAr: 'الملابس الرسمية',
            description: 'Suits, formal shirts and pants',
            imagePath: 'assets/images/Men\'s-Market2.png',
            productCount: 52,
          ),
        ];

      case CategoryType.womens:
        return [
          SubcategoryItem(
            nameEn: 'Women\'s Wear',
            nameSo: 'Dharka Dumarka',
            nameAr: 'ملابس النساء',
            description: 'Traditional and modern women\'s clothing',
            imagePath: 'assets/images/Women\'s-Market1.png',
            productCount: 156,
          ),
          SubcategoryItem(
            nameEn: 'Formal Wear',
            nameSo: 'Dharka Rasmiga ah',
            nameAr: 'الملابس الرسمية',
            description: 'Elegant formal dresses and attire',
            imagePath: 'assets/images/Womwn\'s-Market2.png',
            productCount: 89,
          ),
        ];

      case CategoryType.kids:
        return [
          SubcategoryItem(
            nameEn: 'Kids Games',
            nameSo: 'Ciyaaraha Caruurta',
            nameAr: 'ألعاب الأطفال',
            description: 'Educational and fun games for children',
            imagePath: 'assets/images/Kids-Market1.png',
            productCount: 126,
          ),
          SubcategoryItem(
            nameEn: 'Kids Toys',
            nameSo: 'Alaabtii Ciyaaraha',
            nameAr: 'لعب الأطفال',
            description: 'Quality toys and playthings',
            imagePath: 'assets/images/Kids-Market2.png',
            productCount: 98,
          ),
        ];

      case CategoryType.cosmetics:
        return [
          SubcategoryItem(
            nameEn: 'Skincare',
            nameSo: 'Daryeelka Maqaarka',
            nameAr: 'العناية بالبشرة',
            description: 'Face and body skincare products',
            icon: Icons.face,
            productCount: 94,
          ),
          SubcategoryItem(
            nameEn: 'Makeup',
            nameSo: 'Qurxinta Wajiga',
            nameAr: 'المكياج',
            description: 'Cosmetics and makeup products',
            icon: Icons.brush,
            productCount: 112,
          ),
          SubcategoryItem(
            nameEn: 'Hair Care',
            nameSo: 'Daryeelka Timaha',
            nameAr: 'العناية بالشعر',
            description: 'Shampoos, conditioners and treatments',
            icon: Icons.content_cut,
            productCount: 67,
          ),
          SubcategoryItem(
            nameEn: 'Fragrances',
            nameSo: 'Udgoonka',
            nameAr: 'العطور',
            description: 'Perfumes and body sprays',
            icon: Icons.local_florist,
            productCount: 45,
          ),
        ];

      case CategoryType.goods:
        return [
          SubcategoryItem(
            nameEn: 'Household',
            nameSo: 'Alaabta Guriga',
            nameAr: 'أدوات المنزل',
            description: 'Kitchen and home essentials',
            imagePath: 'assets/images/General-Goods1.png',
            productCount: 156,
          ),
          SubcategoryItem(
            nameEn: 'Goods',
            nameSo: 'Alaabta Guud',
            nameAr: 'البضائع',
            description: 'General goods and daily essentials',
            imagePath: 'assets/images/General-Goods2.png',
            productCount: 89,
          ),
        ];
    }
  }

  String _getCategoryName(CategoryType categoryType) {
    switch (categoryType) {
      case CategoryType.internet:
        return 'Internet Services';
      case CategoryType.gifts:
        return 'Gifts Market';
      case CategoryType.electronics:
        return 'Electronics';
      case CategoryType.mens:
        return 'Men\'s Market';
      case CategoryType.womens:
        return 'Women\'s Market';
      case CategoryType.kids:
        return 'Kids Market';
      case CategoryType.cosmetics:
        return 'Cosmetics';
      case CategoryType.goods:
        return 'General Goods';
    }
  }

  String _getCategoryDescription(CategoryType categoryType) {
    switch (categoryType) {
      case CategoryType.internet:
        return 'Data packages, WiFi devices, and internet services';
      case CategoryType.gifts:
        return 'Traditional crafts, jewelry, and special gifts';
      case CategoryType.electronics:
        return 'Phones, laptops, and electronic devices';
      case CategoryType.mens:
        return 'Traditional and modern men\'s clothing';
      case CategoryType.womens:
        return 'Traditional dresses and women\'s fashion';
      case CategoryType.kids:
        return 'Children\'s clothing, toys, and educational items';
      case CategoryType.cosmetics:
        return 'Beauty products and traditional cosmetics';
      case CategoryType.goods:
        return 'Food, spices, and household items';
    }
  }

  IconData _getCategoryIcon(CategoryType categoryType) {
    switch (categoryType) {
      case CategoryType.internet:
        return Icons.wifi;
      case CategoryType.gifts:
        return Icons.card_giftcard;
      case CategoryType.electronics:
        return Icons.devices;
      case CategoryType.mens:
        return Icons.man;
      case CategoryType.womens:
        return Icons.woman;
      case CategoryType.kids:
        return Icons.child_care;
      case CategoryType.cosmetics:
        return Icons.face_retouching_natural;
      case CategoryType.goods:
        return Icons.shopping_cart;
    }
  }
}

class SubcategoryItem {
  final String nameEn;
  final String nameSo;
  final String nameAr;
  final String description;
  final IconData? icon;
  final String? imagePath;
  final int productCount;

  SubcategoryItem({
    required this.nameEn,
    required this.nameSo,
    required this.nameAr,
    required this.description,
    this.icon,
    this.imagePath,
    required this.productCount,
  }) : assert(icon != null || imagePath != null, 'Either icon or imagePath must be provided');
}

