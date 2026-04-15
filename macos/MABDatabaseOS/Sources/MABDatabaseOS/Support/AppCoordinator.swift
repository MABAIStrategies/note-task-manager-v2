import AppKit
import Observation
import Foundation

@MainActor
@Observable
final class AppCoordinator {
    static let shared = AppCoordinator()

    var activeURL: URL?
    var statusMessage: String = "Ready"
    var reloadToken = UUID()

    func syncNow() {
        statusMessage = "\(AppAction.syncNow.rawValue) requested"
        reloadToken = UUID()
    }

    func newRecord() {
        statusMessage = "\(AppAction.newRecord.rawValue) placeholder"
    }

    func openSourceLink() {
        guard let activeURL else {
            statusMessage = "No source link available"
            return
        }

        NSWorkspace.shared.open(activeURL)
        statusMessage = "\(AppAction.openSourceLink.rawValue) opened"
    }

    func exportData() {
        statusMessage = "\(AppAction.export.rawValue) placeholder"
    }
}
