import { Platform, Vibration } from 'react-native';

export class BillSoundPlayer {
  private static enabled: boolean = true;
  private static soundId: string = 'sound_gpay';

  public static setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  public static isEnabled(): boolean {
    return this.enabled;
  }

  public static setSoundId(soundId: string) {
    this.soundId = soundId;
  }

  public static getSoundId(): string {
    return this.soundId;
  }

  /**
   * Play GPay-style success chime on bill generation
   */
  public static async playBillSuccess() {
    if (!this.enabled) return;

    try {
      // Haptic confirmation pattern: double short chime vibration
      if (Platform.OS === 'android') {
        Vibration.vibrate([0, 80, 100, 150]);
      } else {
        Vibration.vibrate();
      }
    } catch {
      // Graceful fallback
    }
  }
}

export default BillSoundPlayer;
