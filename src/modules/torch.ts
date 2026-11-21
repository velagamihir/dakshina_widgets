import { useEffect, useState } from 'react';
import { NativeEventEmitter, NativeModules, Platform } from 'react-native';

const { TorchModule } = NativeModules;

export interface TorchInterface {
  isTorchOn: () => Promise<boolean>;
  hasFlash: () => Promise<boolean>;
  toggleTorch: () => Promise<boolean>;
  setTorch: (enabled: boolean) => Promise<boolean>;
}

export const Torch: TorchInterface = {
  isTorchOn: async () => {
    if (Platform.OS !== 'android' || !TorchModule) {
      return false;
    }
    return TorchModule.isTorchOn();
  },
  hasFlash: async () => {
    if (Platform.OS !== 'android' || !TorchModule) {
      return false;
    }
    return TorchModule.hasFlash();
  },
  toggleTorch: async () => {
    if (Platform.OS !== 'android' || !TorchModule) {
      return false;
    }
    return TorchModule.toggleTorch();
  },
  setTorch: async (enabled: boolean) => {
    if (Platform.OS !== 'android' || !TorchModule) {
      return false;
    }
    return TorchModule.setTorch(enabled);
  },
};

export function useTorch() {
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasFlash, setHasFlash] = useState(true);

  useEffect(() => {
    let isMounted = true;

    Torch.hasFlash().then((supported) => {
      if (isMounted) {
        setHasFlash(supported);
      }
    });

    Torch.isTorchOn().then((active) => {
      if (isMounted) {
        setIsTorchOn(active);
      }
    });

    if (Platform.OS === 'android' && TorchModule) {
      const emitter = new NativeEventEmitter(TorchModule);
      const subscription = emitter.addListener(
        'onTorchStateChanged',
        (active: unknown) => {
          if (isMounted) {
            setIsTorchOn(Boolean(active));
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

  const toggle = async () => {
    await Torch.toggleTorch();
  };

  return { isTorchOn, hasFlash, toggle };
}
