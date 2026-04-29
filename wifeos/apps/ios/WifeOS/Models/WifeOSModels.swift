import Foundation
import AppIntents

enum WifeOSTab: String, CaseIterable, Identifiable {
    case today
    case baby
    case house
    case create
    case watch
    case rabbitHoles
    case settings

    var id: String { rawValue }

    var title: String {
        switch self {
        case .today: "Today"
        case .baby: "Baby"
        case .house: "House"
        case .create: "Create"
        case .watch: "Watch"
        case .rabbitHoles: "Holes"
        case .settings: "Settings"
        }
    }

    var symbol: String {
        switch self {
        case .today: "house.fill"
        case .baby: "figure.and.child.holdinghands"
        case .house: "sparkles"
        case .create: "wand.and.stars"
        case .watch: "tv"
        case .rabbitHoles: "questionmark.bubble"
        case .settings: "gearshape"
        }
    }
}

enum BabyEventKind: String, CaseIterable, Identifiable {
    case bottle
    case nap
    case diaper
    case food
    case milestone
    case medicine

    var id: String { rawValue }
    var title: String { rawValue.capitalized }
}

struct BabyEvent: Identifiable, Hashable {
    let id: UUID
    let kind: BabyEventKind
    let time: String
    let notes: String
}

struct HouseTask: Identifiable, Hashable {
    let id: UUID
    let title: String
    let room: String
    let minutes: Int
    let priority: String
}

struct CreativeOutput: Hashable {
    let hook: String
    let caption: String
    let memory: String
}

struct BabyEventEntity: AppEntity {
    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Baby Event")
    static let defaultQuery = BabyEventQuery()

    let id: String
    let title: String
    let notes: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(title)", subtitle: "\(notes)")
    }
}

struct BabyEventQuery: EntityQuery {
    func entities(for identifiers: [BabyEventEntity.ID]) async throws -> [BabyEventEntity] {
        let all = Self.suggestedEvents
        return all.filter { identifiers.contains($0.id) }
    }

    func suggestedEntities() async throws -> [BabyEventEntity] {
        Self.suggestedEvents
    }

    private static let suggestedEvents = [
        BabyEventEntity(id: "bottle", title: "Bottle", notes: "Log a bottle feeding"),
        BabyEventEntity(id: "nap", title: "Nap", notes: "Log a nap"),
        BabyEventEntity(id: "diaper", title: "Diaper", notes: "Log a diaper"),
        BabyEventEntity(id: "milestone", title: "Milestone", notes: "Save a tiny win")
    ]
}
