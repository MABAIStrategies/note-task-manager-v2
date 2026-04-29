import SwiftUI

struct HouseView: View {
    @EnvironmentObject private var store: WifeOSMockStore

    var body: some View {
        WifeScreen(title: "House, but make it survivable", subtitle: "Tiny reset plans without becoming a different person.", doodle: "✨") {
            PopupCard(title: "10-minute reset") {
                ForEach(Array(store.houseTasks.prefix(2).enumerated()), id: \.element.id) { index, task in
                    HStack {
                        Text("\(index + 1)")
                            .font(.caption.weight(.black))
                            .foregroundStyle(.white)
                            .frame(width: 28, height: 28)
                            .background(.wifeRose, in: Circle())
                        VStack(alignment: .leading) {
                            Text(task.title).font(.headline)
                            Text("\(task.room) · \(task.minutes) min").font(.caption).foregroundStyle(.wifeMauve)
                        }
                        Spacer()
                        Image(systemName: "checkmark.circle").foregroundStyle(.wifeSage)
                    }
                }
            }
        }
    }
}
