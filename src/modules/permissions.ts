import { Linking, PermissionsAndroid, Platform } from 'react-native';

/**
 * Checks if Camera permission is granted on Android.
 */
export async function checkCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    return await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.CAMERA,
    );
  } catch {
    return false;
  }
}

/**
 * Requests Camera permission with user-facing rationale dialog if needed.
 */
export async function requestCameraPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: 'Camera Permission',
        message:
          'Dakshina Widgets needs Camera permission to access the flashlight hardware.',
        buttonPositive: 'Grant',
        buttonNegative: 'Deny',
      },
    );
    return status === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

/**
 * Opens system App Details Settings page where users can manage permissions and launcher shortcut restrictions.
 */
export async function openAppSettings(): Promise<void> {
  try {
    await Linking.openSettings();
  } catch {
    // Graceful fallback if openSettings fails
  }
}
