import * as vscode from 'vscode';
import { BombPanel } from './BombPanel';
import {activateDecorator} from './decorator';

export const bombs = {
	'Código bomba': 'https://naoedejesus.files.wordpress.com/2014/04/azpvolx_460sa.gif',
};

export const bombinhaMatch = 'bombinha';

let opened = false;

export function activate({ subscriptions }: vscode.ExtensionContext) {
	
	subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem));
	activateDecorator();
}

function updateStatusBarItem(): void {

	let editor = vscode.window.activeTextEditor;
	if (!editor) {
		return; // No open text editor
	}

	var selection = editor.selection;
	var text = editor.document.getText(selection);
	
	if (!opened && text === bombinhaMatch){
		BombPanel.createOrShow();
		opened = true;
	}else{
		opened = false;
	}
}


export function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
