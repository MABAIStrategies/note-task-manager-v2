import SwiftUI

@main
struct WifeOSApp: App {
    @StateObject private var router = WifeOSRouter()
    @StateObject private var store = WifeOSMockStore()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(router)
                .environmentObject(store)
                .onOpenURL { url in
                    router.handle(url: url)
                }
        }
    }
}

@MainActor
final class WifeOSRouter: ObservableObject {
    @Published var selectedTab: WifeOSTab = .today
    @Published var creativeDraft = "Baby spit carrots everywhere."
    @Published var latestIntentMessage: String?

    func open(_ tab: WifeOSTab, message: String? = nil) {
        selectedTab = tab
        latestIntentMessage = message
    }

    func handle(url: URL) {
        guard url.scheme == "wifeos" else { return }
        switch url.host {
        case "today":
            open(.today, message: "Opened from App Intent.")
        case "house-reset":
            open(.house, message: "10-minute reset is ready.")
        case "create":
            creativeDraft = url.queryValue(named: "moment") ?? creativeDraft
            open(.create, message: "Creative moment loaded.")
        case "baby":
            open(.baby, message: "Baby log ready.")
        default:
            open(.today)
        }
    }
}

private extension URL {
    func queryValue(named name: String) -> String? {
        URLComponents(url: self, resolvingAgainstBaseURL: false)?
            .queryItems?
            .first(where: { $0.name == name })?
            .value
    }
}
