import SwiftUI

struct WatchView: View {
    var body: some View {
        WifeScreen(title: "What are we watching?", subtitle: "Comfort TV and caseboard drama with couch-court confidence.", doodle: "🌙") {
            PopupCard(title: "TV mood picker") {
                Text("SVU comfort episode with Scandal-level pacing.")
                Text("Prediction: the quiet intern knows too much.")
            }
        }
    }
}
