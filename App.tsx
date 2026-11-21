import React from 'react';
import { StatusBar, StyleSheet, Text, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <SafeAreaView
        style={[
          styles.container,
          isDarkMode ? styles.darkContainer : styles.lightContainer,
        ]}
      >
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              isDarkMode ? styles.darkTitle : styles.lightTitle,
            ]}
          >
            Dakshina Widgets
          </Text>
          <Text
            style={[
              styles.subtitle,
              isDarkMode ? styles.darkSubtitle : styles.lightSubtitle,
            ]}
          >
            Manage and customize your home screen widgets.
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    backgroundColor: '#F8F9FA',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  lightTitle: {
    color: '#1A1A1A',
  },
  darkTitle: {
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  lightSubtitle: {
    color: '#666666',
  },
  darkSubtitle: {
    color: '#A0A0A0',
  },
});

export default App;
