import AppKit
import SwiftUI
import WebKit

struct WebShellView: NSViewRepresentable {
    let primaryURL: URL
    let fallbackURL: URL?
    let reloadToken: UUID

    func makeCoordinator() -> Coordinator {
        Coordinator()
    }

    func makeNSView(context: Context) -> WKWebView {
        let webView = WKWebView(frame: .zero)
        webView.navigationDelegate = context.coordinator
        webView.allowsBackForwardNavigationGestures = true
        context.coordinator.load(primaryURL: primaryURL, fallbackURL: fallbackURL, reloadToken: reloadToken, in: webView, force: true)
        return webView
    }

    func updateNSView(_ nsView: WKWebView, context: Context) {
        context.coordinator.load(primaryURL: primaryURL, fallbackURL: fallbackURL, reloadToken: reloadToken, in: nsView, force: false)
    }

    @MainActor
    final class Coordinator: NSObject, WKNavigationDelegate {
        private var currentURL: URL?
        private var currentReloadToken: UUID?
        private var fallbackURL: URL?
        private var primaryHost: String?
        private var didAttemptFallback = false

        func load(primaryURL: URL, fallbackURL: URL?, reloadToken: UUID, in webView: WKWebView, force: Bool) {
            self.fallbackURL = fallbackURL
            primaryHost = primaryURL.host

            let urlChanged = currentURL != primaryURL
            let reloadChanged = currentReloadToken != reloadToken

            guard force || urlChanged || reloadChanged else {
                return
            }

            currentURL = primaryURL
            currentReloadToken = reloadToken
            didAttemptFallback = false
            webView.load(URLRequest(url: primaryURL))
        }

        func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
            attemptFallback(in: webView)
        }

        func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
            attemptFallback(in: webView)
        }

        @MainActor
        func webView(
            _ webView: WKWebView,
            decidePolicyFor navigationAction: WKNavigationAction,
            decisionHandler: @escaping @MainActor @Sendable (WKNavigationActionPolicy) -> Void
        ) {
            guard
                navigationAction.navigationType == .linkActivated,
                let url = navigationAction.request.url,
                let scheme = url.scheme?.lowercased()
            else {
                decisionHandler(.allow)
                return
            }

            if scheme == "http" || scheme == "https" {
                if url.host != primaryHost {
                    NSWorkspace.shared.open(url)
                    decisionHandler(.cancel)
                    return
                }
            }

            decisionHandler(.allow)
        }

        private func attemptFallback(in webView: WKWebView) {
            guard !didAttemptFallback, let fallbackURL, fallbackURL != currentURL else {
                return
            }

            didAttemptFallback = true
            currentURL = fallbackURL
            webView.load(URLRequest(url: fallbackURL))
        }
    }
}
