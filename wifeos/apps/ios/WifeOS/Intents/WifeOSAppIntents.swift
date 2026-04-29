@preconcurrency import AppIntents
import Foundation

enum WifeOSShortcutTab: String, AppEnum {
    case today
    case baby
    case house
    case create

    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "WifeOS Tab")
    static let caseDisplayRepresentations: [WifeOSShortcutTab: DisplayRepresentation] = [
        .today: "Today",
        .baby: "Baby",
        .house: "House",
        .create: "Create"
    ]

    var deepLinkHost: String {
        switch self {
        case .today: "today"
        case .baby: "baby"
        case .house: "house-reset"
        case .create: "create"
        }
    }
}

enum BabyEventIntentKind: String, AppEnum {
    case bottle
    case nap
    case diaper
    case food
    case milestone
    case medicine

    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Baby Event Type")
    static let caseDisplayRepresentations: [BabyEventIntentKind: DisplayRepresentation] = [
        .bottle: "Bottle",
        .nap: "Nap",
        .diaper: "Diaper",
        .food: "Food",
        .milestone: "Milestone",
        .medicine: "Medicine"
    ]
}

struct OpenWifeOSTabIntent: AppIntent {
    static let title: LocalizedStringResource = "Open WifeOS"
    static let description = IntentDescription("Opens WifeOS to a useful daily workflow.")
    static let openAppWhenRun = true

    @Parameter(title: "Tab", default: .today)
    var tab: WifeOSShortcutTab

    func perform() async throws -> some IntentResult & OpensIntent {
        .result(opensIntent: OpenURLIntent(URL(string: "wifeos://\(tab.deepLinkHost)")!))
    }
}

struct LogBabyEventIntent: AppIntent {
    static let title: LocalizedStringResource = "Log Baby Event"
    static let description = IntentDescription("Logs a quick mock baby event and opens the Baby timeline.")
    static let openAppWhenRun = true

    @Parameter(title: "Event Type", default: .bottle)
    var eventType: BabyEventIntentKind

    @Parameter(title: "Notes", default: "Logged from Shortcuts")
    var notes: String

    func perform() async throws -> some IntentResult & ProvidesDialog & OpensIntent {
        let encodedNotes = notes.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? notes
        let url = URL(string: "wifeos://baby?event=\(eventType.rawValue)&notes=\(encodedNotes)")!
        return .result(opensIntent: OpenURLIntent(url), dialog: "Logged \(eventType.rawValue) for baby.")
    }
}

struct StartHouseResetIntent: AppIntent {
    static let title: LocalizedStringResource = "Start House Reset"
    static let description = IntentDescription("Opens the 10-minute WifeOS house reset.")
    static let openAppWhenRun = true

    func perform() async throws -> some IntentResult & ProvidesDialog & OpensIntent {
        .result(opensIntent: OpenURLIntent(URL(string: "wifeos://house-reset")!), dialog: "Starting the 10-minute reset.")
    }
}

struct GenerateCreativeMomentIntent: AppIntent {
    static let title: LocalizedStringResource = "Generate Creative Moment"
    static let description = IntentDescription("Opens WifeOS Create with a daily moment ready to turn into content.")
    static let openAppWhenRun = true

    @Parameter(title: "Moment", default: "Baby spit carrots everywhere.")
    var moment: String

    func perform() async throws -> some IntentResult & ProvidesDialog & OpensIntent {
        let encodedMoment = moment.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? moment
        let url = URL(string: "wifeos://create?moment=\(encodedMoment)")!
        return .result(opensIntent: OpenURLIntent(url), dialog: "Creative cards are ready.")
    }
}

struct WifeOSShortcuts: AppShortcutsProvider {
    nonisolated(unsafe) static let appShortcuts: [AppShortcut] =
        [
            AppShortcut(
                intent: OpenWifeOSTabIntent(),
                phrases: [
                    "Open \(.applicationName)",
                    "Open Today in \(.applicationName)"
                ],
                shortTitle: "Open WifeOS",
                systemImageName: "house.fill"
            ),
            AppShortcut(
                intent: LogBabyEventIntent(),
                phrases: [
                    "Log baby event in \(.applicationName)",
                    "Log bottle in \(.applicationName)"
                ],
                shortTitle: "Log Baby",
                systemImageName: "figure.and.child.holdinghands"
            ),
            AppShortcut(
                intent: StartHouseResetIntent(),
                phrases: [
                    "Start house reset in \(.applicationName)",
                    "Start reset in \(.applicationName)"
                ],
                shortTitle: "House Reset",
                systemImageName: "sparkles"
            ),
            AppShortcut(
                intent: GenerateCreativeMomentIntent(),
                phrases: [
                    "Create mom content in \(.applicationName)",
                    "Turn this into content with \(.applicationName)"
                ],
                shortTitle: "Create",
                systemImageName: "wand.and.stars"
            )
        ]
}
