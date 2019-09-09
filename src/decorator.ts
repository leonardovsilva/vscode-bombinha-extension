import * as vscode from 'vscode';

export function activateDecorator() {

    let timeout: NodeJS.Timer | undefined = undefined;
    // create a decorator type that we use to decorate small numbers
    const bombrDecorationType = vscode.window.createTextEditorDecorationType({

        overviewRulerLane: vscode.OverviewRulerLane.Right,
        light: {
            // this color will be used in light color themes
            color: 'white',
            backgroundColor: 'red'
        },
        dark: {
            // this color will be used in dark color themes
            color: 'white',
            backgroundColor: 'red'
        }
    });

    let activeEditor = vscode.window.activeTextEditor;

    function updateDecorations() {
        if (!activeEditor) {
            return;
        }
        const regEx = /\b(\w*bombinha\w*)\b/g;
        const text = activeEditor.document.getText();
        const bombMatchDecorator: vscode.DecorationOptions[] = [];
        let match;
        while (match = regEx.exec(text)) {
            const startPos = activeEditor.document.positionAt(match.index);
            const endPos = activeEditor.document.positionAt(match.index + match[0].length);
            const decoration = { range: new vscode.Range(startPos, endPos), hoverMessage: 'Number **' + match[0] + '**' };
            bombMatchDecorator.push(decoration);
  
        }
        activeEditor.setDecorations(bombrDecorationType, bombMatchDecorator);
    }

    function triggerUpdateDecorations() {
        if (timeout) {
            clearTimeout(timeout);
            timeout = undefined;
        }
        timeout = setTimeout(updateDecorations, 500);
    }

    if (activeEditor) {
        triggerUpdateDecorations();
    }

    vscode.window.onDidChangeActiveTextEditor(editor => {
        activeEditor = editor;
        if (editor) {
            triggerUpdateDecorations();
        }
    }, null, undefined);

    vscode.workspace.onDidChangeTextDocument(event => {
        if (activeEditor && event.document === activeEditor.document) {
            triggerUpdateDecorations();
        }
    }, null, undefined);

}