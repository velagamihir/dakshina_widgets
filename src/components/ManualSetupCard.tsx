import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ManualSetupCardProps {
  isDarkMode: boolean;
}

export const ManualSetupCard: React.FC<ManualSetupCardProps> = ({ isDarkMode }) => {
  return (
    <View
      style={[
        styles.card,
        isDarkMode ? styles.darkCard : styles.lightCard,
      ]}
    >
      <Text
        style={[
          styles.title,
          isDarkMode ? styles.darkText : styles.lightText,
        ]}
      >
        📲 Manual Home Screen Setup
      </Text>
      <Text
        style={[
          styles.stepText,
          isDarkMode ? styles.darkMutedText : styles.lightMutedText,
        ]}
      >
        1. Long-press an empty space on your Android home screen.
      </Text>
      <Text
        style={[
          styles.stepText,
          isDarkMode ? styles.darkMutedText : styles.lightMutedText,
        ]}
      >
        2. Tap <Text style={styles.boldText}>Widgets</Text> and scroll to{' '}
        <Text style={styles.boldText}>Dakshina Widgets</Text>.
      </Text>
      <Text
        style={[
          styles.stepText,
          isDarkMode ? styles.darkMutedText : styles.lightMutedText,
        ]}
      >
        3. Touch and hold your desired widget to place it on your home screen.
      </Text>
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
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  lightText: {
    color: '#1A1A1A',
  },
  darkText: {
    color: '#FFFFFF',
  },
  stepText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 6,
  },
  lightMutedText: {
    color: '#666666',
  },
  darkMutedText: {
    color: '#9E9E9E',
  },
  boldText: {
    fontWeight: '600',
  },
});
