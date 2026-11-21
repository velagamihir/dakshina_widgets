/**
 * @format
 */

import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import App from '../App';

jest.mock('../src/modules/torch', () => {
  return {
    useTorch: () => ({
      isTorchOn: false,
      hasFlash: true,
      toggle: jest.fn(),
    }),
  };
});

test('renders correctly', async () => {
  await act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
