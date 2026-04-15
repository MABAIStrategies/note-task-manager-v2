import AppKit
import SwiftUI

struct RootView: View {
    @Environment(AppCoordinator.self) private var coordinator
    @AppStorage("mab.backendURLString") private var backendURLString = WebContentResolver.defaultDevelopmentURLString

    private var primaryURL: URL {
        WebContentResolver.resolvePrimaryURL(from: backendURLString)
    }

    private var fallbackURL: URL? {
        WebContentResolver.packagedURL()
    }

    var body: some View {
        VStack(spacing: 0) {
            header

            Divider()

            WebShellView(
                primaryURL: primaryURL,
                fallbackURL: fallbackURL,
                reloadToken: coordinator.reloadToken
            )
        }
        .onAppear {
            coordinator.activeURL = primaryURL
        }
        .onChange(of: primaryURL) { _, newValue in
            coordinator.activeURL = newValue
        }
        .onChange(of: coordinator.reloadToken) { _, _ in
            coordinator.activeURL = primaryURL
        }
    }

    private var header: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading, spacing: 2) {
                Text("MAB Database OS")
                    .font(.headline)
                Text(coordinator.statusMessage)
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }

            Spacer(minLength: 12)

            StatusPill(text: primaryURL.isFileURL ? "Packaged" : "Live Dev")

            Button("Sync Now") {
                coordinator.syncNow()
            }
            .buttonStyle(.bordered)
            .controlSize(.small)

            Button("New Record") {
                coordinator.newRecord()
            }
            .buttonStyle(.bordered)
            .controlSize(.small)

            Button("Open Source Link") {
                coordinator.openSourceLink()
            }
            .buttonStyle(.bordered)
            .controlSize(.small)

            Button("Export") {
                coordinator.exportData()
            }
            .buttonStyle(.bordered)
            .controlSize(.small)

            Button("Settings") {
                NSApp.sendAction(Selector(("showSettingsWindow:")), to: nil, from: nil)
            }
            .buttonStyle(.bordered)
            .controlSize(.small)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(.regularMaterial)
    }
}

private struct StatusPill: View {
    let text: String

    var body: some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .foregroundStyle(.secondary)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(.thinMaterial, in: Capsule())
    }
}
