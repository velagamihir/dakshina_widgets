import React, { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BatteryWidgetColors } from '../constants/colors';
import { openAppSettings } from '../modules/permissions';
import { useBattery } from '../modules/battery';

interface MoodBatteryCardProps {
  isDarkMode: boolean;
}

export const MoodBatteryCard: React.FC<MoodBatteryCardProps> = ({ isDarkMode }) => {
  const {
    percentage: livePercentage,
    isCharging: liveIsCharging,
    pinWidget,
    getSmileyBase64,
  } = useBattery();

  const [previewPercentage, setPreviewPercentage] = useState<number>(livePercentage);
  const [previewCharging, setPreviewCharging] = useState<boolean>(liveIsCharging);
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);
  const [previewImageUri, setPreviewImageUri] = useState<string>('');

  // Keep preview synced with live battery when not in interactive demo mode
  useEffect(() => {
    if (!isInteractiveMode) {
      setPreviewPercentage(livePercentage);
      setPreviewCharging(liveIsCharging);
    }
  }, [livePercentage, liveIsCharging, isInteractiveMode]);

  // Generate or update preview bitmap
  useEffect(() => {
    let isCurrent = true;
    getSmileyBase64(previewPercentage, previewCharging)
      .then((uri) => {
        if (isCurrent && uri) {
          setPreviewImageUri(uri);
        }
      })
      .catch(() => {
        // Fallback handled gracefully
      });

    return () => {
      isCurrent = false;
    };
  }, [previewPercentage, previewCharging, getSmileyBase64]);

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

  const currentStatusColor = previewCharging
    ? BatteryWidgetColors.happy
    : previewPercentage >= 60
    ? BatteryWidgetColors.happy
    : previewPercentage >= 20
    ? BatteryWidgetColors.neutral
    : BatteryWidgetColors.sad;

  const currentMoodText = previewCharging
    ? 'Charging 😄⚡'
    : previewPercentage >= 80
    ? 'Super Happy 😄'
    : previewPercentage >= 60
    ? 'Content 🙂'
    : previewPercentage >= 40
    ? 'Neutral 😐'
    : previewPercentage >= 20
    ? 'Low Energy 🙁'
    : 'Exhausted Frown 😵';

  const testLevels = [
    { label: '100% 😄', pct: 100, charging: false },
    { label: '70% 🙂', pct: 70, charging: false },
    { label: '50% 😐', pct: 50, charging: false },
    { label: '25% 🙁', pct: 25, charging: false },
    { label: '10% 😵', pct: 10, charging: false },
    { label: '⚡ Charge', pct: previewPercentage, charging: true },
  ];

  return (
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
          Mood Battery Widget
        </Text>
        <View
          style={[
            styles.badge,
            { backgroundColor: currentStatusColor },
          ]}
        >
          <Text style={styles.badgeText}>
            {previewCharging ? `${previewPercentage}% ⚡` : `${previewPercentage}%`}
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.cardDescription,
          isDarkMode ? styles.darkMutedText : styles.lightMutedText,
        ]}
      >
        A dynamic home screen widget that smiles when your battery is full and
        morphs into a frown as your battery drains.
      </Text>

      {/* Widget Live / Interactive Preview */}
      <View style={styles.previewContainer}>
        <View style={styles.faceWrapper}>
          {previewImageUri ? (
            <Image
              source={{ uri: previewImageUri }}
              style={styles.previewImage}
              resizeMode="contain"
            />
          ) : (
            <View style={[styles.fallbackFace, { borderColor: currentStatusColor }]}>
              <View style={styles.fallbackEyesRow}>
                <View style={[styles.fallbackEye, { backgroundColor: currentStatusColor }]} />
                <View style={[styles.fallbackEye, { backgroundColor: currentStatusColor }]} />
              </View>
              <Text style={[styles.fallbackText, { color: currentStatusColor }]}>
                {previewPercentage}%
              </Text>
            </View>
          )}
        </View>

        <Text
          style={[
            styles.moodLabel,
            isDarkMode ? styles.darkText : styles.lightText,
          ]}
        >
          {currentMoodText}
        </Text>
      </View>

      {/* Interactive Expression Tester */}
      <View style={styles.interactiveSection}>
        <Text
          style={[
            styles.sectionTitle,
            isDarkMode ? styles.darkMutedText : styles.lightMutedText,
          ]}
        >
          Try Different Battery Moods:
        </Text>
        <View style={styles.chipRow}>
          {testLevels.map((lvl) => {
            const isSelected =
              isInteractiveMode &&
              previewPercentage === lvl.pct &&
              previewCharging === lvl.charging;

            return (
              <Pressable
                key={lvl.label}
                onPress={() => {
                  setIsInteractiveMode(true);
                  setPreviewPercentage(lvl.pct);
                  setPreviewCharging(lvl.charging);
                }}
                style={[
                  styles.chip,
                  isSelected && styles.chipSelected,
                  isDarkMode ? styles.darkChip : styles.lightChip,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    isSelected && styles.chipTextSelected,
                    isDarkMode ? styles.darkText : styles.lightText,
                  ]}
                >
                  {lvl.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {isInteractiveMode && (
          <Pressable
            onPress={() => {
              setIsInteractiveMode(false);
              setPreviewPercentage(livePercentage);
              setPreviewCharging(liveIsCharging);
            }}
            style={styles.resetLiveButton}
          >
            <Text style={styles.resetLiveButtonText}>
              🔄 Reset to Live Phone Battery ({livePercentage}%)
            </Text>
          </Pressable>
        )}
      </View>

      {/* Pin to Home Screen Action Button */}
      <Pressable
        onPress={handlePinWidget}
        accessibilityRole="button"
        accessibilityLabel="Add Mood Battery Widget to Home Screen"
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
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  previewContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  faceWrapper: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImage: {
    width: 130,
    height: 130,
  },
  fallbackFace: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#141416',
  },
  fallbackEyesRow: {
    flexDirection: 'row',
    columnGap: 24,
    marginBottom: 8,
  },
  fallbackEye: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: '700',
  },
  moodLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  interactiveSection: {
    marginTop: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  lightChip: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  darkChip: {
    backgroundColor: '#26262B',
    borderColor: '#37373F',
  },
  chipSelected: {
    borderColor: '#00E676',
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextSelected: {
    fontWeight: '700',
  },
  resetLiveButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  resetLiveButtonText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  pinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
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
});
