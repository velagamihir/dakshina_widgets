/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import App from '../App';

jest.mock('../src/modules/permissions', () => ({
  checkCameraPermission: jest.fn().mockResolvedValue(true),
  requestCameraPermission: jest.fn().mockResolvedValue(true),
  openAppSettings: jest.fn().mockResolvedValue(undefined),
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

test('renders correctly', async () => {
  await act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
