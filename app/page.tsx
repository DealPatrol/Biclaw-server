import { BookOpen, Code, Download, Settings, Terminal } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-16">
        {/* Header */}
        <header className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Biclaw-server
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Business Central AL extension for the Biclaw server.
          </p>
        </header>

        {/* Prerequisites Section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">
              Prerequisites
            </h2>
          </div>
          <ul className="space-y-3 pl-1">
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span className="text-foreground">
                <a
                  href="https://code.visualstudio.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                >
                  Visual Studio Code
                </a>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span className="text-foreground">
                <a
                  href="https://marketplace.visualstudio.com/items?itemName=ms-dynamics-smb.al"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                >
                  AL Language extension
                </a>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
              <span className="text-foreground">
                Access to the <strong className="font-semibold">Claud</strong>{" "}
                Business Central server
              </span>
            </li>
          </ul>
        </section>

        {/* Setup Section */}
        <section className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">Setup</h2>
          </div>
          <ol className="space-y-4 pl-1">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                1
              </span>
              <span className="text-foreground">Clone this repository.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                2
              </span>
              <div className="flex-1">
                <span className="text-foreground">
                  Copy <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">launch.json.sample</code> to{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">.vscode/launch.json</code>:
                </span>
                <div className="mt-2 rounded-lg border border-border bg-muted/50 p-3">
                  <code className="text-sm font-mono text-foreground">
                    mkdir -p .vscode && cp launch.json.sample .vscode/launch.json
                  </code>
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                3
              </span>
              <span className="text-foreground">
                Edit <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">.vscode/launch.json</code> and
                update the <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">server</code>,{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">serverInstance</code>, and{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">tenant</code> values to match your{" "}
                <strong className="font-semibold">Claud</strong> environment.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                4
              </span>
              <span className="text-foreground">Open the project in VS Code.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                5
              </span>
              <span className="text-foreground">
                Download symbols from Claud: press{" "}
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold">
                  Ctrl+Shift+P
                </kbd>{" "}
                and run <strong className="font-semibold">AL: Download Symbols</strong>.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
                6
              </span>
              <span className="text-foreground">
                Build the extension: press{" "}
                <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 text-xs font-semibold">
                  Ctrl+Shift+B
                </kbd>
                .
              </span>
            </li>
          </ol>
        </section>

        {/* Development Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Code className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground">
              Development
            </h2>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-foreground">
              Object IDs are allocated in the range{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono font-semibold">
                50000–50099
              </code>
              .
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 border-t border-border pt-8">
          <p className="text-sm text-muted-foreground text-center">
            Biclaw Server Documentation
          </p>
        </footer>
      </div>
    </main>
  )
}
