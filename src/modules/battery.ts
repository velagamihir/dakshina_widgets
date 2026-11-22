import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const { BatteryModule } = NativeModules;

export interface BatteryState {
  percentage: number;
  isCharging: boolean;
}

export interface BatteryInterface {
  getBatteryState: () => Promise<BatteryState>;
  getSmileyBase64: (percentage: number, isCharging: boolean) => Promise<string>;
  isPinningSupported: () => Promise<boolean>;
  pinWidget: () => Promise<boolean>;
}

export const Battery: BatteryInterface = {
  getBatteryState: async () => {
    if (Platform.OS !== 'android' || !BatteryModule) {
      return { percentage: 100, isCharging: false };
    }
    return BatteryModule.getBatteryState();
  },
  getSmileyBase64: async (percentage: number, isCharging: boolean) => {
    if (Platform.OS !== 'android' || !BatteryModule) {
      return '';
    }
    return BatteryModule.getSmileyBase64(percentage, isCharging);
  },
  isPinningSupported: async () => {
    if (Platform.OS !== 'android' || !BatteryModule) {
      return false;
    }
    return BatteryModule.isPinningSupported();
  },
  pinWidget: async () => {
    if (Platform.OS !== 'android' || !BatteryModule) {
      return false;
    }
    return BatteryModule.pinBatteryWidget();
  },
};

export function useBattery() {
  const [batteryState, setBatteryState] = useState<BatteryState>({
    percentage: 100,
    isCharging: false,
  });
  const [isPinningSupported, setIsPinningSupported] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Battery.getBatteryState().then((state) => {
      if (isMounted) {
        setBatteryState(state);
      }
    });

    Battery.isPinningSupported().then((supported) => {
      if (isMounted) {
        setIsPinningSupported(supported);
      }
    });

    if (Platform.OS === 'android' && BatteryModule) {
      const emitter = new NativeEventEmitter(BatteryModule);
      const subscription = emitter.addListener(
        'onBatteryStateChanged',
        (state: unknown) => {
          if (isMounted && typeof state === 'object' && state !== null) {
            setBatteryState(state as BatteryState);
          }
        },
      );

      return () => {
        isMounted = false;
        subscription.remove();
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    ...batteryState,
    isPinningSupported,
    pinWidget: Battery.pinWidget,
    getSmileyBase64: Battery.getSmileyBase64,
  };
}
