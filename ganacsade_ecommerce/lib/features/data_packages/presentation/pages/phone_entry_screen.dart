import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/constants/app_colors.dart';
import '../../../../core/network/data_package_orders_api_service.dart';
import '../../../../core/services/audio_service.dart';
import '../../data/data_packages_api_service.dart';
import '../../models/telecom_provider.dart';
import '../controllers/data_packages_controller.dart';

/// Screen for entering recipient phone number before sending data package
class PhoneEntryScreen extends StatefulWidget {
  final DataPackageApi package;
  final TelecomProvider provider;

  const PhoneEntryScreen({
    super.key,
    required this.package,
    required this.provider,
  });

  @override
  State<PhoneEntryScreen> createState() => _PhoneEntryScreenState();
}

class _PhoneEntryScreenState extends State<PhoneEntryScreen> {
  final _fromPhoneController = TextEditingController();
  final _recipientPhoneController = TextEditingController();
  final _fromPhoneFocusNode = FocusNode();
  final _recipientPhoneFocusNode = FocusNode();
  final DataPackagesApiService _dataPackagesApi = DataPackagesApiService();
  final DataPackageOrdersApiService _ordersApi = DataPackageOrdersApiService();
  final AudioService _audioService = AudioService();
  bool _isProcessing = false;
  bool _isAudioPlaying = true;
  bool _hasPlayedFromAudio = false;
  bool _hasPlayedRecipientAudio = false;
  bool _hasPlayedVerifyAudio = false;
  String _selectedPaymentMethod = ''; // 'evc' or 'edahab'

  @override
  void initState() {
    super.initState();
    _fromPhoneFocusNode.addListener(_onFromPhoneFocusChange);
    _recipientPhoneFocusNode.addListener(_onRecipientPhoneFocusChange);
    _fromPhoneController.addListener(_checkBothFieldsFilled);
    _recipientPhoneController.addListener(_checkBothFieldsFilled);
  }

  @override
  void dispose() {
    _fromPhoneController.dispose();
    _recipientPhoneController.dispose();
    _fromPhoneFocusNode.dispose();
    _recipientPhoneFocusNode.dispose();
    _audioService.stop();
    super.dispose();
  }

  void _onFromPhoneFocusChange() {
    if (_fromPhoneFocusNode.hasFocus && !_hasPlayedFromAudio && _isAudioPlaying) {
      _audioService.play('audio/from.mp3');
      _hasPlayedFromAudio = true;
    }
  }

  void _onRecipientPhoneFocusChange() {
    if (_recipientPhoneFocusNode.hasFocus && !_hasPlayedRecipientAudio && _isAudioPlaying) {
      _audioService.play(_getProviderAudio());
      _hasPlayedRecipientAudio = true;
    }
  }

  String _getProviderAudio() {
    final providerName = widget.provider.name.toLowerCase();
    if (providerName.contains('hormuud')) {
      return 'audio/to_hormuud.mp3';
    } else if (providerName.contains('telesom')) {
      return 'audio/to_somtel.mp3';
    } else if (providerName.contains('somtel')) {
      return 'audio/to_somtel.mp3';
    } else if (providerName.contains('somnet')) {
      return 'audio/to_somnet.mp3';
    } else if (providerName.contains('somlink')) {
      return 'audio/to_somlink.mp3';
    } else if (providerName.contains('amtel')) {
      return 'audio/to_amtel.mp3';
    } else if (providerName.contains('adsl')) {
      return 'audio/to_adsl.mp3';
    }
    return 'audio/to_hormuud.mp3'; // Default
  }

  void _checkBothFieldsFilled() {
    if (!_hasPlayedVerifyAudio && _isFromPhoneValid && _isRecipientPhoneValid && _isAudioPlaying) {
      _audioService.play('audio/verify.mp3');
      _hasPlayedVerifyAudio = true;
    }
  }

  void _toggleAudio() {
    setState(() {
      _isAudioPlaying = !_isAudioPlaying;
      if (!_isAudioPlaying) {
        _audioService.stop();
      }
    });
  }

  // From phone prefixes based on selected payment method
  List<String> get _fromValidPrefixes {
    if (_selectedPaymentMethod == 'evc') return ['61', '77'];
    if (_selectedPaymentMethod == 'edahab') return ['62', '63', '65', '66', '68', '90'];
    return ['61', '62', '63', '65', '66', '68', '77', '90'];
  }

  // Valid prefixes for recipient based on telecom provider
  List<String> get _recipientValidPrefixes {
    // Map provider names to prefixes since id is now int from API
    final providerName = widget.provider.name.toLowerCase();
    if (providerName.contains('hormuud') || providerName.contains('amtel')) {
      return ['61', '77'];
    } else if (providerName.contains('telesom')) {
      return ['63'];
    } else if (providerName.contains('golis')) {
      return ['90'];
    } else if (providerName.contains('somnet')) {
      return ['68'];
    } else if (providerName.contains('somtel')) {
      return ['62', '65', '66'];
    }
    return ['6'];
  }


  bool get _isFromPhoneValid {
    final phone = _fromPhoneController.text;
    if (phone.length < 9) return false;
    return _fromValidPrefixes.any((prefix) => phone.startsWith(prefix));
  }

  bool get _isRecipientPhoneValid {
    final phone = _recipientPhoneController.text;
    if (phone.length < 9) return false;
    return _recipientValidPrefixes.any((prefix) => phone.startsWith(prefix));
  }

  bool get _canSubmit => _selectedPaymentMethod.isNotEmpty && _isFromPhoneValid && _isRecipientPhoneValid;

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF121212) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF1A1A1A);

    return Scaffold(
      backgroundColor: bgColor,
      body: SafeArea(
        child: Column(
          children: [
            // Custom App Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Get.back(),
                    icon: Icon(Icons.arrow_back_ios_new, color: textColor, size: 22),
                  ),
                  const Spacer(),
                  // Audio toggle button
                  IconButton(
                    icon: Icon(                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
                      _isAudioPlaying ? Icons.volume_up : Icons.volume_off,
                      color: textColor,
                      size: 24,
                    ),
                    onPressed: _toggleAudio,
                    tooltip: _isAudioPlaying ? 'Mute' : 'Unmute',
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 16),

                    // Payment Method Selector
                    Text(
                      'Payment Method',
                      style: TextStyle(
                        color: textColor,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ).animate().fadeIn(duration: 300.ms),
                    const SizedBox(height: 12),
                    Row(
                      children: [
                        Expanded(
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                _selectedPaymentMethod = 'evc';
                                _fromPhoneController.clear();
                                _hasPlayedFromAudio = false;
                                _hasPlayedVerifyAudio = false;
                              });
                              HapticFeedback.lightImpact();
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
                              decoration: BoxDecoration(
                                color: _selectedPaymentMethod == 'evc'
                                    ? const Color(0xFF133191).withOpacity(0.1)
                                    : (isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF5F5F5)),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: _selectedPaymentMethod == 'evc'
                                      ? const Color(0xFF133191)
                                      : Colors.transparent,
                                  width: 2,
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  if (_selectedPaymentMethod == 'evc')
                                    const Icon(Icons.check_circle, color: Color(0xFF133191), size: 18)
                                  else
                                    const Icon(Icons.radio_button_unchecked, color: Colors.grey, size: 18),
                                  const SizedBox(width: 8),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'EVC Plus',
                                        style: TextStyle(
                                          color: _selectedPaymentMethod == 'evc'
                                              ? const Color(0xFF133191)
                                              : textColor,
                                          fontWeight: FontWeight.w700,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Text(
                                        '61, 77',
                                        style: TextStyle(
                                          color: Colors.grey.shade500,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                _selectedPaymentMethod = 'edahab';
                                _fromPhoneController.clear();
                                _hasPlayedFromAudio = false;
                                _hasPlayedVerifyAudio = false;
                              });
                              HapticFeedback.lightImpact();
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 200),
                              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
                              decoration: BoxDecoration(
                                color: _selectedPaymentMethod == 'edahab'
                                    ? const Color(0xFF7EB725).withOpacity(0.1)
                                    : (isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF5F5F5)),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: _selectedPaymentMethod == 'edahab'
                                      ? const Color(0xFF7EB725)
                                      : Colors.transparent,
                                  width: 2,
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  if (_selectedPaymentMethod == 'edahab')
                                    const Icon(Icons.check_circle, color: Color(0xFF7EB725), size: 18)
                                  else
                                    const Icon(Icons.radio_button_unchecked, color: Colors.grey, size: 18),
                                  const SizedBox(width: 8),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'eDahab',
                                        style: TextStyle(
                                          color: _selectedPaymentMethod == 'edahab'
                                              ? const Color(0xFF7EB725)
                                              : textColor,
                                          fontWeight: FontWeight.w700,
                                          fontSize: 14,
                                        ),
                                      ),
                                      Text(
                                        '62, 63, 65...',
                                        style: TextStyle(
                                          color: Colors.grey.shade500,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ).animate().fadeIn(duration: 300.ms, delay: 50.ms),

                    const SizedBox(height: 24),

                    // From Phone Section (user's own phone)
                    Text(
                      'payment_phone_label'.tr,
                      style: TextStyle(
                        color: textColor,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ).animate().fadeIn(duration: 300.ms),
                    const SizedBox(height: 8),
                    Text(
                      '${'start_with'.tr}: ${_fromValidPrefixes.take(4).join(" ${'or'.tr} ")}...',
                      style: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 8),
                    if (_selectedPaymentMethod.isNotEmpty)
                    _buildPhoneField(
                      controller: _fromPhoneController,
                      focusNode: _fromPhoneFocusNode,
                      isDark: isDark,
                      textColor: textColor,
                      isValid: _isFromPhoneValid,
                      showValidation: true,
                      validPrefixes: _fromValidPrefixes,
                      accentColor: _selectedPaymentMethod == 'evc'
                        ? AppColors.primaryBlue
                        : AppColors.primaryGreen,
                    ).animate().fadeIn(duration: 300.ms, delay: 100.ms),

                    const SizedBox(height: 28),

                    // Recipient Phone Section
                    Text(
                      'recipient_phone_label'.tr,
                      style: TextStyle(
                        color: textColor,
                        fontSize: 15,
                        fontWeight: FontWeight.w600,
                      ),
                    ).animate().fadeIn(duration: 300.ms, delay: 150.ms),
                    const SizedBox(height: 8),
                    Text(
                      '${'start_with'.tr}: ${_recipientValidPrefixes.join(" ${'or'.tr} ")}',
                      style: TextStyle(
                        color: Colors.grey.shade500,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 8),
                    _buildPhoneField(
                      controller: _recipientPhoneController,
                      focusNode: _recipientPhoneFocusNode,
                      isDark: isDark,
                      textColor: textColor,
                      isValid: _isRecipientPhoneValid,
                      showValidation: true,
                      validPrefixes: _recipientValidPrefixes,
                      accentColor: AppColors.primaryGreen,
                    ).animate().fadeIn(duration: 300.ms, delay: 200.ms),

                    const SizedBox(height: 40),

                    // Price Summary
                    Center(
                      child: RichText(
                        textAlign: TextAlign.center,
                        text: TextSpan(
                          style: TextStyle(
                            color: textColor,
                            fontSize: 16,
                            fontWeight: FontWeight.w500,
                          ),
                          children: [
                            TextSpan(text: 'pay_only'.tr),
                            TextSpan(
                              text: ' \$${widget.package.amount.toStringAsFixed(2)} ',
                              style: TextStyle(
                                color: AppColors.primaryGreen,
                                fontWeight: FontWeight.w800,
                                fontSize: 22,
                              ),
                            ),
                            TextSpan(text: 'to_get_service'.tr),
                          ],
                        ),
                      ),
                    ).animate().fadeIn(duration: 300.ms, delay: 250.ms),

                    const SizedBox(height: 32),

                    // Package Preview Card
                    Center(
                      child: _buildPackagePreviewCard(isDark, textColor),
                    ).animate().fadeIn(duration: 400.ms, delay: 300.ms).scale(
                      begin: const Offset(0.95, 0.95),
                      end: const Offset(1, 1),
                      duration: 400.ms,
                      delay: 300.ms,
                    ),

                    const SizedBox(height: 40),
                  ],
                ),
              ),
            ),

            // Bottom Submit Button
            Container(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
              child: SizedBox(
                width: double.infinity,
                height: 56,
                child: ElevatedButton(
                  onPressed: _canSubmit && !_isProcessing ? _onSubmit : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF133191),
                    foregroundColor: Colors.white,
                    disabledBackgroundColor: isDark ? Colors.grey.shade800 : Colors.grey.shade300,
                    disabledForegroundColor: isDark ? Colors.grey.shade600 : Colors.grey.shade500,
                    elevation: 0,
                    shadowColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(28),
                    ),
                  ),
                  child: _isProcessing
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2.5,
                          ),
                        )
                      : Text(
                          'submit_payment'.tr,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhoneField({
    required TextEditingController controller,
    required bool isDark,
    required Color textColor,
    required bool isValid,
    required bool showValidation,
    required List<String> validPrefixes,
    FocusNode? focusNode,
    Color accentColor = AppColors.primaryGreen,
  }) {
    final borderColor = isDark ? Colors.grey.shade800 : Colors.grey.shade200;
    final fillColor = isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF8F9FA);

    return Container(
      height: 60,
      decoration: BoxDecoration(
        color: fillColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: 1),
      ),
      child: Row(
        children: [
          // Country code section
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: Row(
              children: [
                Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: accentColor,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: accentColor.withValues(alpha: 0.3),
                        blurRadius: 8,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(
                      Icons.phone_android,
                      color: Colors.white,
                      size: 18,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  '252',
                  style: TextStyle(
                    color: textColor,
                    fontWeight: FontWeight.w700,
                    fontSize: 17,
                  ),
                ),
              ],
            ),
          ),

          // Vertical divider
          Container(
            width: 1,
            height: 32,
            color: borderColor,
          ),

          // Phone input field
          Expanded(
            child: TextField(
              controller: controller,
              focusNode: focusNode,
              keyboardType: TextInputType.phone,
              inputFormatters: [
                FilteringTextInputFormatter.digitsOnly,
                LengthLimitingTextInputFormatter(9),
                _PrefixInputFormatter(validPrefixes),
              ],
              style: TextStyle(
                color: textColor,
                fontWeight: FontWeight.w500,
                fontSize: 18,
                letterSpacing: 1,
              ),
              decoration: InputDecoration(
                hintText: '${validPrefixes.first}XXXXXXX',
                hintStyle: TextStyle(
                  color: Colors.grey.shade400,
                  fontWeight: FontWeight.w400,
                  letterSpacing: 1,
                ),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(horizontal: 16),
              ),
              onChanged: (_) => setState(() {}),
            ),
          ),

          // Validation checkmark
          if (showValidation && controller.text.length >= 9)
            Padding(
              padding: const EdgeInsets.only(right: 16),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 28,
                height: 28,
                decoration: BoxDecoration(
                  color: isValid ? AppColors.primaryGreen : Colors.orange,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  isValid ? Icons.check : Icons.warning_rounded,
                  color: Colors.white,
                  size: 16,
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildPackagePreviewCard(bool isDark, Color textColor) {
    return Container(
      width: 200,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.primaryGreen.withValues(alpha: 0.3),
            blurRadius: 24,
            offset: const Offset(0, 12),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(20),
        child: Column(
          children: [
            // Green top section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(16, 24, 16, 20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.primaryGreen,
                    AppColors.primaryGreen.withValues(alpha: 0.85),
                  ],
                ),
              ),
              child: Column(
                children: [
                  // WiFi icon
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.wifi,
                      color: Colors.white,
                      size: 18,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    '${'powered_by'.tr} • ${widget.provider.name}',
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.9),
                      fontSize: 11,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 16),
                  // Price - use amount (what user pays)
                  Text(
                    '\$${widget.package.amount.toStringAsFixed(2)}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 42,
                      fontWeight: FontWeight.w800,
                      height: 1,
                    ),
                  ),
                ],
              ),
            ),

            // Duration bar
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 14),
              color: AppColors.primaryGreen.withValues(alpha: 0.9),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Container(
                    width: 22,
                    height: 22,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.25),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.check,
                      color: Colors.white,
                      size: 14,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    widget.package.duration,
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
            ),

            // Features section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 16),
              color: isDark ? const Color(0xFF1E1E1E) : const Color(0xFFF5F7F5),
              child: Column(
                children: widget.package.features.take(3).map((feature) {
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 2),
                    child: Text(
                      feature,
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        color: textColor,
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _onSubmit() async {
    if (!_canSubmit) return;

    setState(() => _isProcessing = true);
    HapticFeedback.mediumImpact();

    try {
      await Future(() => _sendDataPackage()).timeout(
        const Duration(seconds: 60),
        onTimeout: () {
          if (mounted) {
            setState(() => _isProcessing = false);
            _showResultDialog(
              isSuccess: false,
              deliveryFailed: false,
              recipientPhone: '',
              orderNumber: null,
              errorMessage: 'The request timed out. Please check your connection and try again.',
            );
          }
        },
      );
    } catch (e) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      print('❌ Outer error in _onSubmit: $e');
    }
  }

  Future<void> _sendDataPackage() async {
    try {
      final fromPhone = _fromPhoneController.text.startsWith('252')
          ? _fromPhoneController.text.substring(3)
          : _fromPhoneController.text;
      final recipientPhone = _recipientPhoneController.text.startsWith('252')
          ? _recipientPhoneController.text.substring(3)
          : _recipientPhoneController.text;

      final controller = Get.find<DataPackagesController>();
      final resellerId = controller.resellerId.value;

      print('📦 Sending data package...');
      print('   - Reseller ID: $resellerId');
      print('   - From: $fromPhone');
      print('   - To: $recipientPhone');
      print('   - Company ID: ${widget.provider.id}');
      print('   - Package ID: ${widget.package.id}');
      print('   - Amount: ${widget.package.amount}');

      final addCustomerResponse = await _dataPackagesApi.addCustomer(
        resellerId: resellerId,
        fromPhone: fromPhone,
        toPhone: recipientPhone,
        companyId: widget.provider.id,
        packageId: widget.package.id,
        amount: widget.package.amount,
      ).timeout(
        const Duration(seconds: 30),
        onTimeout: () => {'status': 'Error', 'message': 'Data delivery timed out'},
      );

      print('📦 addCustomer response: $addCustomerResponse');

      // Create order record (non-critical)
      Map<String, dynamic> orderResponse = {'success': false};
      try {
        orderResponse = await _ordersApi.createDataPackageOrder(
          packageId: widget.package.id,
          packageName: widget.package.name,
          providerId: widget.provider.id,
          providerName: widget.provider.name,
          amount: widget.package.amount,
          recipientPhone: recipientPhone,
          paymentPhone: fromPhone,
          paymentMethod: {'method': _selectedPaymentMethod},
          transactionId: null,
          packageDuration: widget.package.duration,
          packageData: widget.package.data,
        );
      } catch (orderErr) {
        print('⚠️ Order creation failed (non-critical): $orderErr');
      }

      if (!mounted) return;
      setState(() => _isProcessing = false);

      final deliveryFailed = addCustomerResponse['status'] == 'Error' ||
          addCustomerResponse['success'] == false;
      final orderNumber = orderResponse['data']?['orderNumber'];

      // If delivery succeeded, launch USSD payment dialer
      if (!deliveryFailed) {
        final amountStr = widget.package.amount.toString().replaceAll('.', '*');
        final ussdNumber = _selectedPaymentMethod == 'edahab' ? '623223050' : '613223050';
        final ussdCode = '*712*$ussdNumber*$amountStr#';
        final ussdUri = Uri(scheme: 'tel', path: ussdCode);
        try {
          await launchUrl(ussdUri);
        } catch (e) {
          print('⚠️ Could not launch USSD dialer: $e');
        }
      }

      await _showResultDialog(
        isSuccess: !deliveryFailed,
        deliveryFailed: false,
        recipientPhone: recipientPhone,
        orderNumber: orderNumber,
        errorMessage: deliveryFailed
            ? (addCustomerResponse['message'] ?? 'Failed to send data package.')
            : null,
      );

      if (mounted && !deliveryFailed) {
        Get.back();
        Get.back();
        Get.back();
      }
    } catch (e) {
      if (!mounted) return;
      setState(() => _isProcessing = false);
      print('❌ Error in _sendDataPackage: $e');
      await _showResultDialog(
        isSuccess: false,
        deliveryFailed: false,
        recipientPhone: '',
        orderNumber: null,
        errorMessage: 'An unexpected error occurred. Please try again.',
      );
    }
  }

  Future<void> _showResultDialog({
    required bool isSuccess,
    required bool deliveryFailed,
    required String recipientPhone,
    required String? orderNumber,
    required String? errorMessage,
  }) async {
    if (!mounted) return;
    
    final isDark = Theme.of(context).brightness == Brightness.dark;
    
    // Play success or error audio
    if (isSuccess && !deliveryFailed) {
      _audioService.play('audio/well-done.wav');
    } else {
      _audioService.play('audio/error.wav');
    }
    
    final Color accentColor = isSuccess && !deliveryFailed
        ? AppColors.primaryGreen
        : deliveryFailed
            ? Colors.orange
            : Colors.red;
    
    final IconData iconData = isSuccess && !deliveryFailed
        ? Icons.check_circle_rounded
        : deliveryFailed
            ? Icons.warning_rounded
            : Icons.cancel_rounded;
    
    final String title = isSuccess && !deliveryFailed
        ? 'Payment Successful!'
        : deliveryFailed
            ? 'Payment Done, Delivery Issue'
            : 'Payment Failed';
    
    final String message = isSuccess && !deliveryFailed
        ? '${widget.package.name} has been delivered to $recipientPhone${orderNumber != null ? '\nOrder: $orderNumber' : ''}'
        : deliveryFailed
            ? 'Payment was collected but data delivery failed.\n${errorMessage ?? ''}\n${orderNumber != null ? 'Order: $orderNumber' : ''}'
            : errorMessage ?? 'Payment failed. Please try again.';
    
    await Get.dialog(
      Dialog(
        backgroundColor: Colors.transparent,
        child: Container(
          padding: const EdgeInsets.all(28),
          decoration: BoxDecoration(
            color: isDark ? const Color(0xFF1E1E1E) : Colors.white,
            borderRadius: BorderRadius.circular(24),
            boxShadow: [
              BoxShadow(
                color: accentColor.withValues(alpha: 0.3),
                blurRadius: 30,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: accentColor.withValues(alpha: 0.12),
                  shape: BoxShape.circle,
                ),
                child: Icon(iconData, color: accentColor, size: 48),
              ),
              const SizedBox(height: 20),
              Text(
                title,
                style: TextStyle(
                  color: isDark ? Colors.white : const Color(0xFF1A1A1A),
                  fontSize: 20,
                  fontWeight: FontWeight.w700,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 12),
              Text(
                message,
                style: TextStyle(
                  color: isDark ? Colors.grey.shade400 : Colors.grey.shade600,
                  fontSize: 14,
                  height: 1.5,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 28),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Get.back(),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: accentColor,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: Text(
                    isSuccess ? 'Done' : 'Try Again',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      barrierDismissible: false,
    );
  }
}

/// Custom TextInputFormatter that only allows valid prefixes
class _PrefixInputFormatter extends TextInputFormatter {
  final List<String> validPrefixes;

  _PrefixInputFormatter(this.validPrefixes);

  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    // Allow empty
    if (newValue.text.isEmpty) return newValue;

    // Check first digit - must match start of at least one valid prefix
    if (newValue.text.length == 1) {
      final firstDigit = newValue.text[0];
      final isValid = validPrefixes.any((p) => p.startsWith(firstDigit));
      return isValid ? newValue : oldValue;
    }

    // Check first two digits - must match one of the valid prefixes
    if (newValue.text.length >= 2) {
      final prefix = newValue.text.substring(0, 2);
      final isValid = validPrefixes.contains(prefix);
      return isValid ? newValue : oldValue;
    }

    return newValue;
  }
}
