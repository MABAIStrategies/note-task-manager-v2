import Foundation

enum WebContentResolver {
    static let defaultDevelopmentURLString = "http://127.0.0.1:5173"

    static var defaultDevelopmentURL: URL {
        URL(string: defaultDevelopmentURLString)!
    }

    static func resolvePrimaryURL(from rawValue: String) -> URL {
        let trimmed = rawValue.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty {
            return defaultDevelopmentURL
        }

        if trimmed.lowercased() == "packaged" {
            return packagedURL() ?? defaultDevelopmentURL
        }

        if let url = URL(string: trimmed) {
            return url
        }

        return defaultDevelopmentURL
    }

    static func packagedURL() -> URL? {
        Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Web")
    }
}
