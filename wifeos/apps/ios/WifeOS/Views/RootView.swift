import SwiftUI

struct RootView: View {
    @EnvironmentObject private var router: WifeOSRouter

    var body: some View {
        TabView(selection: $router.selectedTab) {
            TodayView()
                .tabItem { Label("Today", systemImage: WifeOSTab.today.symbol) }
                .tag(WifeOSTab.today)

            BabyView()
                .tabItem { Label("Baby", systemImage: WifeOSTab.baby.symbol) }
                .tag(WifeOSTab.baby)

            HouseView()
                .tabItem { Label("House", systemImage: WifeOSTab.house.symbol) }
                .tag(WifeOSTab.house)

            CreateView()
                .tabItem { Label("Create", systemImage: WifeOSTab.create.symbol) }
                .tag(WifeOSTab.create)

            WatchView()
                .tabItem { Label("Watch", systemImage: WifeOSTab.watch.symbol) }
                .tag(WifeOSTab.watch)

            RabbitHoleView()
                .tabItem { Label("Holes", systemImage: WifeOSTab.rabbitHoles.symbol) }
                .tag(WifeOSTab.rabbitHoles)

            SettingsView()
                .tabItem { Label("Settings", systemImage: WifeOSTab.settings.symbol) }
                .tag(WifeOSTab.settings)
        }
        .tint(.wifeRose)
    }
}

struct WifeScreen<Content: View>: View {
    let title: String
    let subtitle: String
    let doodle: String
    @ViewBuilder var content: Content

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 18) {
                    HStack(alignment: .top) {
                        VStack(alignment: .leading, spacing: 8) {
                            Text(title)
                                .font(.system(.largeTitle, design: .rounded, weight: .black))
                                .foregroundStyle(.wifeInk)
                            Text(subtitle)
                                .font(.callout)
                                .foregroundStyle(.wifeMauve)
                        }
                        Spacer()
                        Text(doodle)
                            .font(.title2)
                            .padding(12)
                            .background(.wifeBlush, in: Circle())
                            .accessibilityHidden(true)
                    }
                    content
                }
                .padding(20)
            }
            .background(LinearGradient(colors: [.wifeCream, .wifeBlush.opacity(0.72)], startPoint: .top, endPoint: .bottom).ignoresSafeArea())
            .navigationTitle("WifeOS")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

struct PopupCard<Content: View>: View {
    let title: String
    @ViewBuilder var content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(title)
                .font(.headline.weight(.bold))
                .foregroundStyle(.wifeInk)
            content
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.white.opacity(0.72), in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(.white.opacity(0.8), lineWidth: 1)
        )
        .shadow(color: .wifeRose.opacity(0.14), radius: 24, y: 12)
    }
}

extension ShapeStyle where Self == Color {
    static var wifeCream: Color { Color(red: 1.0, green: 0.973, blue: 0.961) }
    static var wifeBlush: Color { Color(red: 1.0, green: 0.91, blue: 0.933) }
    static var wifeRose: Color { Color(red: 0.875, green: 0.435, blue: 0.557) }
    static var wifeMauve: Color { Color(red: 0.647, green: 0.427, blue: 0.525) }
    static var wifeInk: Color { Color(red: 0.2, green: 0.149, blue: 0.176) }
    static var wifeSage: Color { Color(red: 0.557, green: 0.651, blue: 0.561) }
}
