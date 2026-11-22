/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import App from '../App';
import { ManualSetupCard } from '../src/components/ManualSetupCard';
import { MoodBatteryCard } from '../src/components/MoodBatteryCard';

jest.mock('../src/modules/permissions', () => ({
  checkCameraPermission: jest.fn().mockResolvedValue(true),
  requestCameraPermission: jest.fn().mockResolvedValue(true),
  openAppSettings: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/modules/battery', () => ({
  useBattery: () => ({
    percentage: 85,
    isCharging: false,
    isPinningSupported: true,
    pinWidget: jest.fn().mockResolvedValue(true),
    getSmileyBase64: jest.fn().mockResolvedValue('data:image/png;base64,mockedImageData'),
  }),
}));

jest.mock('../src/modules/torch', () => {
  return {
    useTorch: () => ({
      isTorchOn: false,
      hasFlash: true,
      isPinningSupported: true,
      toggle: jest.fn(),
      pinWidget: jest.fn().mockResolvedValue(true),
    }),
  };
});

describe('App', () => {
  test('renders correctly', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await act(async () => {
      renderer = ReactTestRenderer.create(<App />);
    });
    expect(renderer).toBeDefined();
  });
});

describe('ManualSetupCard', () => {
  test('renders instructions correctly in dark mode', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <ManualSetupCard isDarkMode={true} />,
      );
    });

    const json = JSON.stringify(renderer?.toJSON());
    expect(json).toContain('Manual Home Screen Setup');
    expect(json).toContain('Long-press an empty space on your Android home screen');
    expect(json).toContain('Dakshina Widgets');
    expect(json).toContain('Touch and hold your desired widget to place it on your home screen');
  });

  test('renders instructions correctly in light mode', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await act(async () => {
      renderer = ReactTestRenderer.create(
        <ManualSetupCard isDarkMode={false} />,
      );
    });

    const json = JSON.stringify(renderer?.toJSON());
    expect(json).toContain('Manual Home Screen Setup');
  });
});

describe('MoodBatteryCard', () => {
  test('renders correctly with battery details', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer | undefined;
    await act(async () => {
      renderer = ReactTestRenderer.create(<MoodBatteryCard isDarkMode={true} />);
    });

    const json = JSON.stringify(renderer?.toJSON());
    expect(json).toContain('Mood Battery Widget');
    expect(json).toContain('Super Happy 😄');
    expect(json).toContain('85%');
    expect(json).toContain('Add Widget to Home Screen');
  });
});
