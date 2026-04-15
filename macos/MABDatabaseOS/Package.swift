// swift-tools-version: 6.0

import PackageDescription

let package = Package(
    name: "MABDatabaseOS",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(
            name: "MABDatabaseOS",
            targets: ["MABDatabaseOS"]
        )
    ],
    targets: [
        .executableTarget(
            name: "MABDatabaseOS",
            path: "Sources/MABDatabaseOS"
        )
    ]
)
