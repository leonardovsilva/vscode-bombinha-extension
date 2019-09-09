import { bombs, getNonce } from './extension';
import * as path from 'path';
import * as vscode from 'vscode';

export class BombPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
	public static currentPanel: BombPanel | undefined;
	public static readonly viewType = 'bombaBanheiro';
	private readonly _panel: vscode.WebviewPanel;
	private _disposables: vscode.Disposable[] = [];
	public static createOrShow() {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;
		// If we already have a panel, show it.
		if (BombPanel.currentPanel) {
			BombPanel.currentPanel._panel.reveal(column);
			return;
		}
		// Otherwise, create a new panel.
		const panel = vscode.window.createWebviewPanel(BombPanel.viewType, 'Bomba Banheiro', column || vscode.ViewColumn.One, {
			// Enable javascript in the webview
			enableScripts: true,
			// And restrict the webview to only loading content from our extension's `media` directory.
			//localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))]
		});
		BombPanel.currentPanel = new BombPanel(panel);
	}
	public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
		BombPanel.currentPanel = new BombPanel(panel);
	}
	private constructor(panel: vscode.WebviewPanel) {
		this._panel = panel;
		// Set the webview's initial html content
		this._update();
		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
		// Update the content based on view changes
		this._panel.onDidChangeViewState(e => {
			if (this._panel.visible) {
				this._update();
			}
		}, null, this._disposables);
		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(message => {
			switch (message.command) {
				case 'alert':
					vscode.window.showErrorMessage(message.text);
					return;
			}
		}, null, this._disposables);
	}
	public doRefactor() {
		// Send a message to the webview webview.
		// You can send any JSON serializable data.
		this._panel.webview.postMessage({ command: 'refactor' });
	}
	public dispose() {
		BombPanel.currentPanel = undefined;
		// Clean up our resources
		this._panel.dispose();
		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}
	private _update() {
		// Vary the webview's content based on where it is located in the editor.
		switch (this._panel.viewColumn) {
			case vscode.ViewColumn.One:
			default:
				this._updateForBomb('Código bomba');
				return;
		}
	}
	private _updateForBomb(bombName: keyof typeof bombs) {
		this._panel.title = bombName;
		this._panel.webview.html = this._getHtmlForWebview(bombs[bombName]);
	}
	private _getHtmlForWebview(bombGif: string) {
		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.file(path.join('', 'media', 'main.js'));
		// And the uri we use to load this script in the webview
		const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
		// Use a nonce to whitelist which scripts can be run
		const nonce = getNonce();
		return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                -->
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'nonce-${nonce}';">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bombinha!</title>
            </head>
            <body>
                <img src="${bombGif}" width="300" />
                <script nonce="${nonce}" src="${scriptUri}"></script>
            </body>
            </html>`;
	}
}
