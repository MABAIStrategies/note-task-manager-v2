import SwiftUI

struct SettingsView: View {
    var body: some View {
        WifeScreen(title: "Settings", subtitle: "Privacy first, integrations later, chaos filtered always.", doodle: "🛡️") {
            PopupCard(title: "Privacy controls") {
                Label("Private mode on", systemImage: "shield.checkered")
                Text("Gmail, Google Calendar, Ring, Alexa, and image workflows stay mock-first in Phase 2.")
            }
        }
    }
}
