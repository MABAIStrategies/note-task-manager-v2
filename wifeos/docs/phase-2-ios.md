# Phase 2 iOS Companion

The iOS companion lives in `apps/ios` as a native SwiftUI app with a checked-in Xcode project.

## Included

- SwiftUI shell matching the WifeOS blush/popup-card direction.
- Mock domain store for baby events, house reset tasks, and creative output.
- App Intents for:
  - opening WifeOS to a selected tab
  - logging a baby event
  - starting the 10-minute house reset
  - opening Create with a daily moment
- App Shortcuts phrases for Siri, Shortcuts, Spotlight, and other App Intents surfaces.
- URL handoff path using the `wifeos://` scheme.

## Build

This local Xcode install has an `iphoneos26.4` SDK and an `iOS 26.5` simulator runtime. Because of that mismatch, scheme destination lookup may fail even though the target builds. Use the target build command:

```bash
cd wifeos/apps/ios
xcodebuild -project WifeOS.xcodeproj -target WifeOS -sdk iphonesimulator -configuration Debug CODE_SIGNING_ALLOWED=NO build
```

## Runtime Check

Install and launch the built app on the available iPhone 17 simulator:

```bash
xcrun simctl boot FF4BBD6D-671D-4EFE-A889-9387A47D8692
xcrun simctl install FF4BBD6D-671D-4EFE-A889-9387A47D8692 build/Debug-iphonesimulator/WifeOS.app
xcrun simctl launch FF4BBD6D-671D-4EFE-A889-9387A47D8692 ai.mab.WifeOS
```
