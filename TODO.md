# Dakshina Widgets - Project Workflow & TODO

A roadmap and implementation tracking list for home screen widgets in **Dakshina Widgets**.

---

## 🎯 Target Widgets (Initial Scope)

1. **📖 Bhagavad Gita Quotes Widget**
   - Daily / scheduled inspirational verses (Sanskrit + English translation + Chapter/Verse reference).
   - Tap-to-refresh action or open reader view.
2. **🔦 Torch / Flashlight Toggle Widget**
   - Instant one-tap flashlight on/off toggle directly from home screen.
   - Dynamic widget icon state (active/inactive indicator).
3. **📶 Wi-Fi Toggle Widget**
   - Quick toggle or direct shortcut to Wi-Fi settings panel.
   - Live status indicator (Connected / Disconnected / Off).
4. **🔊 Ringer Mode Switcher Widget**
   - 3-state toggle: **Normal (Ring)** ⇄ **Vibrate** ⇄ **Silent**.
   - Current mode badge / icon display.
5. **📡 Bluetooth Toggle Widget**
   - Quick toggle or shortcut to Bluetooth pairing/settings.
   - Live status indicator (On / Off / Connected).

---

## 📋 Workflow & Phased Roadmap

### Phase 1: Architecture & Technical Foundations
- [ ] **Architecture Decision**
  - [ ] Determine widget strategy for Android (Native Kotlin `AppWidgetProvider` / Jetpack Glance vs `react-native-android-widget`).
  - [ ] Set up bridge communication between React Native and Native Widget Providers.
- [ ] **Data & Storage Layer**
  - [ ] Setup `SharedPreferences` / key-value store accessible by both React Native and native widget services.
  - [ ] Implement event bus / broadcast receivers for widget state updates.
- [ ] **Permissions Infrastructure**
  - [ ] Request and manage runtime permissions gracefully in the host app:
    - Camera (Torch)
    - Notification Policy Access (Ringer / DND)
    - Bluetooth & Wi-Fi management permissions

---

### Phase 2: Bhagavad Gita Quotes Widget
- [ ] **Content & Data Model**
  - [ ] Prepare curated Gita quotes dataset (`assets/data/gita_quotes.json` with chapter, verse, Sanskrit text, and English translation).
  - [ ] Create quote selector logic (Daily Verse, Random on Tap, or Favorited Verses).
- [ ] **Widget Layout & UI**
  - [ ] Design compact (2x2) and wide (4x2) widget layouts.
  - [ ] Typography and readable layout with theme support (Light / Dark mode).
- [ ] **Interactivity & Updates**
  - [ ] Implement manual tap-to-refresh button (`PendingIntent`).
  - [ ] Setup periodic background refresh via `WorkManager` (e.g., daily midnight update).
  - [ ] Tap-to-open app directly to the verse detail/contemplation screen.

---

### Phase 3: System Quick Toggle Widgets

#### 1. 🔦 Torch Toggle Widget
- [ ] Register `CameraManager` torch mode callback.
- [ ] Implement native toggle service (`CameraManager.setTorchMode`).
- [ ] Update widget visual state (lit torch icon when active).
- [ ] Handle hardware edge cases (device without flash, camera in use).

#### 2. 🔊 Ringer Mode Switcher (Ring / Vibrate / Silent)
- [ ] Implement `AudioManager` interaction (`RINGER_MODE_NORMAL`, `RINGER_MODE_VIBRATE`, `RINGER_MODE_SILENT`).
- [ ] Handle Android Do-Not-Disturb (`ACCESS_NOTIFICATION_POLICY`) permission check and prompt if required.
- [ ] Visual indicator showing current state (3-segment indicator or dynamic icon).
- [ ] One-tap cycle through modes.

#### 3. 📶 Wi-Fi Toggle Widget
- [ ] Implement state listener via `WifiManager` / `ConnectivityManager`.
- [ ] Handle Android 10+ (API 29+) restrictions:
  - Direct toggle on legacy Android versions.
  - Launch `ACTION_WIFI` or Internet Connectivity panel on modern Android versions without leaving the home screen abruptly.
- [ ] Dynamic icon showing Wi-Fi status and connection SSID if permitted.

#### 4. 📡 Bluetooth Toggle Widget
- [ ] Add Bluetooth permissions (`BLUETOOTH`, `BLUETOOTH_ADMIN`, `BLUETOOTH_CONNECT` for Android 12+).
- [ ] Implement Bluetooth state observer (`ACTION_STATE_CHANGED`).
- [ ] Toggle logic or launch Bluetooth settings panel based on API level.
- [ ] Visual indicator for Bluetooth state (On / Off / Connected).

---

### Phase 4: Main App Dashboard & Widget Customization
- [ ] **Widget Gallery Screen**
  - [ ] Preview available widgets with preview cards.
  - [ ] Instructions on how to add widgets to Android home screen.
- [ ] **Permissions Management Hub**
  - [ ] Status dashboard showing which permissions are granted (DND, Camera, Bluetooth, etc.).
  - [ ] Direct deep-links to grant missing permissions.
- [ ] **Widget Customization Settings**
  - [ ] Theme selector for widgets (Light, Dark, Transparent / Glassmorphism, Material You / Dynamic Colors).
  - [ ] Quote category preference (Focus, Peace, Duty, Devotion).

---

### Phase 5: Testing, Optimization & Release
- [ ] **Device & OS Compatibility Testing**
  - [ ] Test on Android 10, 11, 12, 13, 14, 15+.
  - [ ] Verify battery consumption and ensure background updates don't trigger battery saver kills.
  - [ ] Check widget behavior across launcher sizes and home screen grid variations (4x5, 5x5, tablets).
- [ ] **UI Polish & Assets**
  - [ ] Add crisp vector drawables for toggle states.
  - [ ] Configure `widget_preview` images in XML metadata for smooth launcher picker display.
- [ ] **Documentation & Build**
  - [ ] Document build steps in `README.md`.
  - [ ] Prepare release APK / AAB build pipeline.

---

## 📌 Android Permissions & Technical Notes Reference

| Widget | Key API / Class | Required Permissions / Quirks |
|---|---|---|
| **Torch** | `CameraManager` | `android.permission.CAMERA` |
| **Ringer** | `AudioManager` | `android.permission.ACCESS_NOTIFICATION_POLICY` (for Silent / DND) |
| **Wi-Fi** | `WifiManager` / `ConnectivityManager` | `CHANGE_WIFI_STATE`, `ACCESS_WIFI_STATE`; Android 10+ requires `ACTION_WIFI` Panel |
| **Bluetooth** | `BluetoothAdapter` | `BLUETOOTH_CONNECT`, `BLUETOOTH_ADMIN` (API 31+ requires runtime grant) |
| **Gita Quotes**| `WorkManager` / `AlarmManager` | `RECEIVE_BOOT_COMPLETED` for persistent reschedule after reboot |
