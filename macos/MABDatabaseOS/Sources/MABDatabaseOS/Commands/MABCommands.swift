import AppKit
import SwiftUI

struct MABCommands: Commands {
    var body: some Commands {
        CommandMenu("MAB Database OS") {
            Button("Sync Now") {
                AppCoordinator.shared.syncNow()
            }
            .keyboardShortcut("s", modifiers: [.command, .shift])

            Button("New Record") {
                AppCoordinator.shared.newRecord()
            }
            .keyboardShortcut("n", modifiers: [.command])

            Button("Open Source Link") {
                AppCoordinator.shared.openSourceLink()
            }
            .keyboardShortcut("o", modifiers: [.command, .shift])

            Button("Export") {
                AppCoordinator.shared.exportData()
            }
            .keyboardShortcut("e", modifiers: [.command, .shift])

            Divider()

            Button("Settings…") {
                NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
            }
            .keyboardShortcut(",", modifiers: [.command])
        }
    }
}
