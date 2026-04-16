import 'package:audioplayers/audioplayers.dart';

/// Service for managing audio playback in the app
class AudioService {
  static final AudioService _instance = AudioService._internal();
  factory AudioService() => _instance;
  AudioService._internal();

  final AudioPlayer _audioPlayer = AudioPlayer();
  bool _isEnabled = true;

  /// Enable or disable audio playback
  void setEnabled(bool enabled) {
    _isEnabled = enabled;
    if (!enabled) {
      stop();
    }
  }

  /// Check if audio is enabled
  bool get isEnabled => _isEnabled;

  /// Play an audio file from assets
  Future<void> play(String assetPath) async {
    if (!_isEnabled) return;

    try {
      // Stop any currently playing audio
      await _audioPlayer.stop();
      
      // Play the new audio
      await _audioPlayer.play(AssetSource(assetPath));
      print('🔊 Playing audio: $assetPath');
    } catch (e) {
      print('❌ Error playing audio: $e');
    }
  }

  /// Stop the currently playing audio
  Future<void> stop() async {
    try {
      await _audioPlayer.stop();
    } catch (e) {
      print('❌ Error stopping audio: $e');
    }
  }

  /// Pause the currently playing audio
  Future<void> pause() async {
    try {
      await _audioPlayer.pause();
    } catch (e) {
      print('❌ Error pausing audio: $e');
    }
  }

  /// Resume the paused audio
  Future<void> resume() async {
    try {
      await _audioPlayer.resume();
    } catch (e) {
      print('❌ Error resuming audio: $e');
    }
  }

  /// Dispose the audio player
  void dispose() {
    _audioPlayer.dispose();
  }
}
