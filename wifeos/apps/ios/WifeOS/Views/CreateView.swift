import SwiftUI

struct CreateView: View {
    @EnvironmentObject private var router: WifeOSRouter
    @EnvironmentObject private var store: WifeOSMockStore

    var body: some View {
        WifeScreen(title: "Turn today into something creative.", subtitle: "One moment in, swipeable content cards out.", doodle: "💫") {
            PopupCard(title: "Daily moment") {
                TextField("Moment", text: $router.creativeDraft, axis: .vertical)
                    .textFieldStyle(.roundedBorder)
            }

            PopupCard(title: "Generated") {
                Text("TikTok Hook").font(.caption.weight(.black)).foregroundStyle(.wifeRose)
                Text(store.creativeOutput.hook)
                Divider()
                Text(store.creativeOutput.caption)
                Text(store.creativeOutput.memory)
            }
        }
    }
}
