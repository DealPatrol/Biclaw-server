# Biclaw-server

Business Central AL extension for the Biclaw server.

## Prerequisites

- [Visual Studio Code](https://code.visualstudio.com/)
- [AL Language extension](https://marketplace.visualstudio.com/items?itemName=ms-dynamics-smb.al)
- Access to the **Claud** Business Central server

## Setup

1. Clone this repository.
2. Copy `launch.json.sample` to `.vscode/launch.json`:
   ```bash
   mkdir -p .vscode && cp launch.json.sample .vscode/launch.json
   ```
3. Edit `.vscode/launch.json` and update the `server`, `serverInstance`, and `tenant` values to match your **Claud** environment.
4. Open the project in VS Code.
5. Download symbols from Claud: press **Ctrl+Shift+P** and run **AL: Download Symbols**.
6. Build the extension: press **Ctrl+Shift+B**.

## Development

Object IDs are allocated in the range **50000–50099**.
