import 'package:google_sign_in/google_sign_in.dart';
import '../constants/app_constants.dart';

class GoogleSignInService {
  GoogleSignInService._();

  static final GoogleSignInService instance = GoogleSignInService._();

  GoogleSignIn? _googleSignIn;

  GoogleSignIn get _client {
    _googleSignIn ??= GoogleSignIn(
      scopes: const ['email', 'profile'],
      serverClientId: AppConstants.googleWebClientId.isNotEmpty
          ? AppConstants.googleWebClientId
          : null,
    );
    return _googleSignIn!;
  }

  bool get isConfigured => AppConstants.googleWebClientId.isNotEmpty;

  Future<String?> signInAndGetIdToken() async {
    if (!isConfigured) {
      throw Exception(
        'Google Sign-In is not configured. Set AppConstants.googleWebClientId.',
      );
    }

    final account = await _client.signIn();
    if (account == null) return null;

    final auth = await account.authentication;
    final idToken = auth.idToken;

    if (idToken == null || idToken.isEmpty) {
      throw Exception(
        'Could not get Google ID token. Check Firebase OAuth client setup.',
      );
    }

    return idToken;
  }

  Future<void> signOut() async {
    try {
      await _client.signOut();
    } catch (_) {}
  }
}
