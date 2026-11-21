import React from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { openAppSettings } from './src/modules/permissions';
import { useTorch } from './src/modules/torch';
import { ManualSetupCard } from './src/components/ManualSetupCard';
import { TorchWidgetColors } from './src/constants/colors';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const { hasFlash, pinWidget } = useTorch();

  const handlePinWidget = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert(
        'Notice',
        'Home screen widgets are currently only available on Android.',
      );
      return;
    }

    try {
      const success = await pinWidget();
      if (!success) {
        Alert.alert(
          'Could Not Add Widget Automatically',
          'Your launcher did not accept the request to pin the widget. This commonly happens if home screen shortcut permissions are restricted (e.g. in MIUI/HyperOS settings) or if your launcher does not support direct pinning.\n\nYou can still add it manually by following the instructions below.',
          [
            { text: 'View Instructions', style: 'cancel' },
            { text: 'Open App Settings', onPress: openAppSettings },
          ],
        );
      }
    } catch {
      Alert.alert(
        'Unable to Pin Widget',
        'An error occurred while requesting widget placement. You can still add the widget manually from your home screen.',
      );
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView
        style={[
          styles.container,
          isDarkMode ? styles.darkBackground : styles.lightBackground,
        ]}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <Text
              style={[
                styles.appName,
                isDarkMode ? styles.darkText : styles.lightText,
              ]}
            >
              Dakshina Widgets
            </Text>
            <Text
              style={[
                styles.appSubtitle,
                isDarkMode ? styles.darkMutedText : styles.lightMutedText,
              ]}
            >
              System quick toggles and home screen widgets
            </Text>
          </View>

          {/* Torch Widget Card */}
          <View
            style={[
              styles.card,
              isDarkMode ? styles.darkCard : styles.lightCard,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text
                style={[
                  styles.cardTitle,
                  isDarkMode ? styles.darkText : styles.lightText,
                ]}
              >
                Flashlight Widget
              </Text>
            </View>

            <Text
              style={[
                styles.cardDescription,
                isDarkMode ? styles.darkMutedText : styles.lightMutedText,
              ]}
            >
              {hasFlash
                ? 'Tap the button below or pin the 1x1 widget directly to your Home Screen for instant toggle.'
                : 'Flash hardware not detected on this device.'}
            </Text>
            {/* Pin to Home Screen Action Button */}
            <Pressable
              onPress={handlePinWidget}
              accessibilityRole="button"
              accessibilityLabel="Add Flashlight Widget to Home Screen"
              style={({ pressed }) => [
                styles.pinButton,
                pressed && styles.pinButtonPressed,
              ]}
            >
              <Text style={styles.pinButtonText}>
                Add Widget to Home Screen
              </Text>
            </Pressable>
          </View>

          {/* Global Manual Home Screen Setup Guide */}
          <ManualSetupCard isDarkMode={isDarkMode} />
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightBackground: {
    backgroundColor: '#F8F9FA',
  },
  darkBackground: {
    backgroundColor: '#121212',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 15,
    marginTop: 4,
  },
  lightText: {
    color: '#1A1A1A',
  },
  darkText: {
    color: '#FFFFFF',
  },
  lightMutedText: {
    color: '#666666',
  },
  darkMutedText: {
    color: '#9E9E9E',
  },
  card: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  lightCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EAEAEA',
  },
  darkCard: {
    backgroundColor: '#1E1E1E',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeActive: {
    backgroundColor: TorchWidgetColors.on.bg,
  },
  badgeInactive: {
    backgroundColor: TorchWidgetColors.off.stroke,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  badgeTextActive: {
    color: TorchWidgetColors.on.icon,
  },
  badgeTextInactive: {
    color: TorchWidgetColors.off.icon,
  },
  widgetPreviewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  widgetButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  widgetButtonOff: {
    backgroundColor: TorchWidgetColors.off.bg,
    borderWidth: 1.5,
    borderColor: TorchWidgetColors.off.stroke,
  },
  widgetButtonOn: {
    backgroundColor: TorchWidgetColors.on.bg,
    borderWidth: 2,
    borderColor: TorchWidgetColors.on.stroke,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  torchIconText: {
    fontSize: 30,
  },
  torchIconOff: {
    color: TorchWidgetColors.off.icon,
  },
  torchIconOn: {
    color: TorchWidgetColors.on.icon,
  },
  previewHint: {
    fontSize: 13,
    marginTop: 12,
  },
  pinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  pinButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  pinButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});

export default App;
