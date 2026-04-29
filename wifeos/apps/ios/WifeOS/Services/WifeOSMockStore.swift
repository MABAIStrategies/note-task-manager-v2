import Foundation

@MainActor
final class WifeOSMockStore: ObservableObject {
    @Published var babyEvents: [BabyEvent] = [
        BabyEvent(id: UUID(), kind: .bottle, time: "11:42 AM", notes: "6 oz, calm finish."),
        BabyEvent(id: UUID(), kind: .food, time: "12:32 PM", notes: "Carrots rejected with courtroom energy."),
        BabyEvent(id: UUID(), kind: .nap, time: "11:20 AM", notes: "42 minute crib nap.")
    ]

    let houseTasks: [HouseTask] = [
        HouseTask(id: UUID(), title: "Bottles", room: "Kitchen", minutes: 4, priority: "High"),
        HouseTask(id: UUID(), title: "Restock diapers", room: "Nursery", minutes: 5, priority: "High"),
        HouseTask(id: UUID(), title: "Kitchen counters", room: "Kitchen", minutes: 3, priority: "Medium")
    ]

    let creativeOutput = CreativeOutput(
        hook: "Nobody warned me babies are tiny food critics with no respect for the chef.",
        caption: "Dinner service was rejected by management.",
        memory: "Today she discovered carrots and chose violence."
    )

    func logBabyEvent(kind: BabyEventKind, notes: String) {
        babyEvents.insert(BabyEvent(id: UUID(), kind: kind, time: "Now", notes: notes), at: 0)
    }
}
