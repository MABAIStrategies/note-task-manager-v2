import SwiftUI

struct RabbitHoleView: View {
    var body: some View {
        WifeScreen(title: "Rabbit Hole Board", subtitle: "Claims on one side, vibes on the other.", doodle: "🗓️") {
            PopupCard(title: "Kardashian media cycles") {
                Text("PR timing: evidence medium, vibes high.")
                Text("Media control: evidence low, vibes high.")
                Text("Verdict: fun theory, partly plausible, mostly entertainment.")
            }
        }
    }
}
