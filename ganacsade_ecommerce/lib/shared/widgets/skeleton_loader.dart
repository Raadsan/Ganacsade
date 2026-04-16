import 'package:flutter/material.dart';

/// A shimmer/skeleton loading effect widget
class SkeletonBox extends StatefulWidget {
  final double width;
  final double height;
  final double borderRadius;

  const SkeletonBox({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 8,
  });

  @override
  State<SkeletonBox> createState() => _SkeletonBoxState();
}

class _SkeletonBoxState extends State<SkeletonBox>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);
    _animation = Tween<double>(begin: 0.4, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final baseColor = isDark ? const Color(0xFF2A2A2A) : const Color(0xFFE0E0E0);
    final highlightColor = isDark ? const Color(0xFF3A3A3A) : const Color(0xFFF5F5F5);

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) => Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(widget.borderRadius),
          color: Color.lerp(baseColor, highlightColor, _animation.value),
        ),
      ),
    );
  }
}

/// Home screen skeleton
class HomeScreenSkeleton extends StatelessWidget {
  const HomeScreenSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          // App bar area
          Row(
            children: [
              const SkeletonBox(width: 120, height: 20, borderRadius: 6),
              const Spacer(),
              const SkeletonBox(width: 36, height: 36, borderRadius: 18),
              const SizedBox(width: 12),
              const SkeletonBox(width: 36, height: 36, borderRadius: 18),
            ],
          ),
          const SizedBox(height: 16),
          // Search bar
          const SkeletonBox(width: double.infinity, height: 50, borderRadius: 12),
          const SizedBox(height: 20),
          // Banner
          const SkeletonBox(width: double.infinity, height: 160, borderRadius: 16),
          const SizedBox(height: 24),
          // Section title
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              SkeletonBox(width: 160, height: 22, borderRadius: 6),
              SkeletonBox(width: 60, height: 18, borderRadius: 6),
            ],
          ),
          const SizedBox(height: 16),
          // Category cards
          Row(
            children: const [
              Expanded(child: _CategoryCardSkeleton()),
              SizedBox(width: 12),
              Expanded(child: _CategoryCardSkeleton()),
            ],
          ),
          const SizedBox(height: 24),
          // Featured section title
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              SkeletonBox(width: 180, height: 22, borderRadius: 6),
              SkeletonBox(width: 60, height: 18, borderRadius: 6),
            ],
          ),
          const SizedBox(height: 16),
          // Featured products row
          SizedBox(
            height: 200,
            child: ListView.separated(
              scrollDirection: Axis.horizontal,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: 3,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (_, __) => const _ProductCardSkeleton(),
            ),
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _CategoryCardSkeleton extends StatelessWidget {
  const _CategoryCardSkeleton();

  @override
  Widget build(BuildContext context) {
    return Column(
      children: const [
        SkeletonBox(width: 70, height: 70, borderRadius: 20),
        SizedBox(height: 8),
        SkeletonBox(width: 80, height: 14, borderRadius: 4),
        SizedBox(height: 4),
        SkeletonBox(width: 50, height: 11, borderRadius: 4),
      ],
    );
  }
}

class _ProductCardSkeleton extends StatelessWidget {
  const _ProductCardSkeleton();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: const [
        SkeletonBox(width: 150, height: 130, borderRadius: 12),
        SizedBox(height: 8),
        SkeletonBox(width: 120, height: 14, borderRadius: 4),
        SizedBox(height: 4),
        SkeletonBox(width: 70, height: 14, borderRadius: 4),
      ],
    );
  }
}

/// Orders screen skeleton
class OrdersScreenSkeleton extends StatelessWidget {
  const OrdersScreenSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (_, __) => const _OrderCardSkeleton(),
    );
  }
}

class _OrderCardSkeleton extends StatelessWidget {
  const _OrderCardSkeleton();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              SkeletonBox(width: 110, height: 16, borderRadius: 4),
              SkeletonBox(width: 80, height: 24, borderRadius: 12),
            ],
          ),
          const SizedBox(height: 12),
          const SkeletonBox(width: double.infinity, height: 1, borderRadius: 1),
          const SizedBox(height: 12),
          Row(
            children: const [
              SkeletonBox(width: 50, height: 50, borderRadius: 8),
              SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SkeletonBox(width: 140, height: 14, borderRadius: 4),
                  SizedBox(height: 6),
                  SkeletonBox(width: 90, height: 14, borderRadius: 4),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: const [
              SkeletonBox(width: 100, height: 14, borderRadius: 4),
              SkeletonBox(width: 70, height: 14, borderRadius: 4),
            ],
          ),
        ],
      ),
    );
  }
}

/// Cart screen skeleton
class CartScreenSkeleton extends StatelessWidget {
  const CartScreenSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Expanded(
          child: ListView.separated(
            padding: const EdgeInsets.all(16),
            itemCount: 4,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (_, __) => const _CartItemSkeleton(),
          ),
        ),
        // Summary box at bottom
        const _CartSummarySkeleton(),
      ],
    );
  }
}

class _CartItemSkeleton extends StatelessWidget {
  const _CartItemSkeleton();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          const SkeletonBox(width: 80, height: 80, borderRadius: 12),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                SkeletonBox(width: double.infinity, height: 14, borderRadius: 4),
                SizedBox(height: 6),
                SkeletonBox(width: 80, height: 14, borderRadius: 4),
                SizedBox(height: 10),
                Row(
                  children: [
                    SkeletonBox(width: 90, height: 32, borderRadius: 20),
                    Spacer(),
                    SkeletonBox(width: 60, height: 18, borderRadius: 4),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _CartSummarySkeleton extends StatelessWidget {
  const _CartSummarySkeleton();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 16,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: Column(
        children: const [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              SkeletonBox(width: 80, height: 14, borderRadius: 4),
              SkeletonBox(width: 70, height: 14, borderRadius: 4),
            ],
          ),
          SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              SkeletonBox(width: 100, height: 18, borderRadius: 4),
              SkeletonBox(width: 80, height: 18, borderRadius: 4),
            ],
          ),
          SizedBox(height: 16),
          SkeletonBox(width: double.infinity, height: 52, borderRadius: 14),
        ],
      ),
    );
  }
}

/// Profile screen skeleton
class ProfileScreenSkeleton extends StatelessWidget {
  const ProfileScreenSkeleton({super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      physics: const NeverScrollableScrollPhysics(),
      child: Column(
        children: [
          // Header / avatar area
          Container(
            height: 280,
            color: const Color(0xFF4CAF50),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: const [
                SkeletonBox(width: 90, height: 90, borderRadius: 45),
                SizedBox(height: 14),
                SkeletonBox(width: 140, height: 20, borderRadius: 6),
                SizedBox(height: 8),
                SkeletonBox(width: 180, height: 16, borderRadius: 6),
              ],
            ),
          ),
          const SizedBox(height: 20),
          // Stats row
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: const [
                Expanded(child: _StatSkeleton()),
                SizedBox(width: 12),
                Expanded(child: _StatSkeleton()),
                SizedBox(width: 12),
                Expanded(child: _StatSkeleton()),
              ],
            ),
          ),
          const SizedBox(height: 24),
          // Menu items
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Column(
              children: List.generate(
                6,
                (i) => Padding(
                  padding: const EdgeInsets.only(bottom: 8),
                  child: _MenuItemSkeleton(),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _StatSkeleton extends StatelessWidget {
  const _StatSkeleton();

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
          ),
        ],
      ),
      child: Column(
        children: const [
          SkeletonBox(width: 40, height: 22, borderRadius: 4),
          SizedBox(height: 6),
          SkeletonBox(width: 60, height: 12, borderRadius: 4),
        ],
      ),
    );
  }
}

class _MenuItemSkeleton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Row(
        children: const [
          SkeletonBox(width: 40, height: 40, borderRadius: 12),
          SizedBox(width: 14),
          SkeletonBox(width: 130, height: 16, borderRadius: 4),
          Spacer(),
          SkeletonBox(width: 20, height: 20, borderRadius: 4),
        ],
      ),
    );
  }
}
