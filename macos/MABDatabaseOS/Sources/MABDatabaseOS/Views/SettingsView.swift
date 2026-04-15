import SwiftUI

struct SettingsView: View {
    @AppStorage("mab.backendURLString") private var backendURLString = WebContentResolver.defaultDevelopmentURLString

    var body: some View {
        Form {
            Section("Backend URL") {
                TextField("http://127.0.0.1:5173", text: $backendURLString)
                    .textFieldStyle(.roundedBorder)

                Text("Use the local Vite dev server while developing, or set a packaged file URL when the app is staged.")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                HStack {
                    Button("Reset to Dev URL") {
                        backendURLString = WebContentResolver.defaultDevelopmentURLString
                    }

                    Spacer()
                }
            }

            Section("Packaged Fallback") {
                Text(WebContentResolver.packagedURL()?.absoluteString ?? "Loaded from the staged app bundle when available.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .textSelection(.enabled)
            }
        }
        .formStyle(.grouped)
        .padding()
        .frame(minWidth: 520, minHeight: 260)
    }
}
