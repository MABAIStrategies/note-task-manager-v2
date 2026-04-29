import SwiftUI

struct TodayView: View {
    @EnvironmentObject private var router: WifeOSRouter
    @EnvironmentObject private var store: WifeOSMockStore

    var body: some View {
        WifeScreen(title: "Good morning. Tiny chaos, handled.", subtitle: "One calm focus card, then the rest can wait its turn.", doodle: "☕") {
            if let message = router.latestIntentMessage {
                Text(message)
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(.wifeRose)
                    .padding(.horizontal, 14)
                    .padding(.vertical, 10)
                    .background(.wifeBlush, in: Capsule())
            }

            PopupCard(title: "Baby") {
                Label("Next likely nap: 2:30 PM - 3:00 PM", systemImage: "moon.zzz")
                Label("Last bottle: 11:42 AM", systemImage: "waterbottle")
                Label("Diapers running low by Friday", systemImage: "drop")
            }

            PopupCard(title: "This week, with receipts") {
                Label("Calendar: pediatric forms before Thursday", systemImage: "calendar")
                Label("Gmail: diaper receipt may cover Friday runout", systemImage: "envelope")
                Label("Private mode on: summaries only", systemImage: "shield.checkered")
                    .foregroundStyle(.wifeSage)
            }

            PopupCard(title: "Tonight") {
                Text("Dinner: easiest available meal, no heroics.")
                Text("Show: SVU comfort episode.")
            }
        }
    }
}
