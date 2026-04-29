import SwiftUI

struct BabyView: View {
    @EnvironmentObject private var store: WifeOSMockStore
    @State private var notes = "Took 6 oz and gave the bottle side-eye."
    @State private var eventKind: BabyEventKind = .bottle

    var body: some View {
        WifeScreen(title: "Baby command center", subtitle: "Timeline, prediction, and quick logging for the tiny boss.", doodle: "🍼") {
            PopupCard(title: "Log an event") {
                Picker("Event", selection: $eventKind) {
                    ForEach(BabyEventKind.allCases) { kind in
                        Text(kind.title).tag(kind)
                    }
                }
                .pickerStyle(.segmented)

                TextField("Notes", text: $notes, axis: .vertical)
                    .textFieldStyle(.roundedBorder)

                Button("Add event") {
                    store.logBabyEvent(kind: eventKind, notes: notes)
                }
                .buttonStyle(.borderedProminent)
                .tint(.wifeRose)
            }

            PopupCard(title: "Timeline") {
                ForEach(store.babyEvents) { event in
                    VStack(alignment: .leading, spacing: 4) {
                        Text(event.kind.title)
                            .font(.caption.weight(.black))
                            .foregroundStyle(.wifeRose)
                        Text("\(event.time) · \(event.notes)")
                    }
                    .padding(.vertical, 6)
                }
            }
        }
    }
}
