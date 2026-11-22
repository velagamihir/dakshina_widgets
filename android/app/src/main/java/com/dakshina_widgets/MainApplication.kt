package com.dakshina_widgets

import android.app.Application
import com.dakshina_widgets.battery.BatteryManager
import com.dakshina_widgets.battery.BatteryPackage
import com.dakshina_widgets.torch.TorchManager
import com.dakshina_widgets.torch.TorchPackage
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost

class MainApplication : Application(), ReactApplication {

  override val reactHost: ReactHost by lazy {
    getDefaultReactHost(
      context = applicationContext,
      packageList =
        PackageList(this).packages.apply {
          // Packages that cannot be autolinked yet can be added manually here, for example:
          add(TorchPackage())
          add(BatteryPackage())
        },
    )
  }

  override fun onCreate() {
    super.onCreate()
    loadReactNative(this)
    TorchManager.init(this)
    BatteryManager.init(this)
  }
}
