import AppKit
import SwiftUI

@main
struct MABDatabaseOSApp: App {
    @NSApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    @State private var coordinator = AppCoordinator.shared

    var body: some Scene {
        WindowGroup("MAB Database OS") {
            RootView()
                .environment(coordinator)
        }

        Settings {
            SettingsView()
                .environment(coordinator)
        }

        .commands {
            MABCommands()
        }
    }
}
