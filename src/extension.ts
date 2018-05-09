'use strict';
import { ExtensionContext, commands, window, EndOfLine, Position } from 'vscode';

export function activate(context: ExtensionContext) {
    context.subscriptions.push(commands.registerTextEditorCommand('extension.drawBox', (textEditor, edit) => {
        if (textEditor.document.languageId !== 'markdown' || textEditor.selections.length !== 1) {
            window.showErrorMessage('Must be a MarkDown editor with a sole selection!');
            return;
        }

        const { start: startPosition, end: endPosition } = textEditor.selection;
        const { eol, getText, offsetAt } = textEditor.document;
        const startOffset = offsetAt(startPosition);
        const endOffset = offsetAt(endPosition);
        const { replacementText } = algo(startPosition, endPosition, eol, getText(), startOffset, endOffset);
        edit.replace(textEditor.selection, replacementText);
    }));
}

export function deactivate() {

}

export function algo(startPosition: Position, endPosition: Position, eol: EndOfLine, text: string, startOffset: number, endOffset: number) {
    const { character: startCharacter, line: startLine } = startPosition;
    const { character: endCharacter, line: endLine } = endPosition;

    const minCharacter = Math.min(startCharacter, endCharacter);
    const maxCharacter = Math.max(startCharacter, endCharacter);
    const boxWidth = maxCharacter - minCharacter;

    const minLine = Math.min(startLine, endLine);
    const maxLine = Math.max(startLine, endLine);
    const boxHeight = maxLine - minLine + 1;

    let eolText = '';
    switch (eol) {
        case EndOfLine.LF: eolText = '\n'; break;
        case EndOfLine.CRLF: eolText = '\r\n'; break;
        default: throw new Error('Unexpected EOL value.');
    }

    const selectionText = text.substring(startOffset, endOffset);

    let replacementText = '';

    let cursor = selectionText.indexOf(eolText) + eolText.length;

    replacementText += '┏';
    replacementText += '━'.repeat(boxWidth - 2); // Box top side
    replacementText += '┓';
    if (boxWidth > cursor) {
        replacementText += selectionText.substring(cursor - eolText.length, cursor); // Rest of line
    } else {
        replacementText += selectionText.substring(boxWidth, cursor); // Rest of line
    }

    for (let line = 1; line < boxHeight; line++) {
        let leftOffset = cursor + minCharacter;
        let rightOffset = leftOffset + boxWidth;
        replacementText += selectionText.substring(cursor, leftOffset); // Before box line part
        cursor = selectionText.indexOf(eolText, cursor) + eolText.length;

        const isLast = line === boxHeight - 1;
        if (!isLast) {
            replacementText += '┃'; // Box left side
            // Box line part
            if (rightOffset > cursor) {
                const boxLine = selectionText.substring(leftOffset + 1, cursor - 1);
                // TODO: Fix this, it's weird, this code must be better generalizeable
                if (boxLine !== eolText) {
                    replacementText += boxLine.padEnd(boxWidth - 2, ' ');
                } else {
                    replacementText += ' '.repeat(boxWidth - 2);
                }

                replacementText += '┃'; // Box right side
                replacementText += selectionText.substring(cursor - eolText.length, cursor); // After box line part
            } else {
                replacementText += selectionText.substring(leftOffset + 1, rightOffset - 1);
                replacementText += '┃'; // Box right side
                replacementText += selectionText.substring(rightOffset, cursor); // After box line part
            }
        } else {
            replacementText += '┗'; // Box left side
            replacementText += '━'.repeat(boxWidth - 2); // Box line part
            replacementText += '┛'; // Box right side
            if (cursor - eolText.length !== -1) {
                replacementText += selectionText.substring(cursor - eolText.length);
            }
        }
    }

    return { replacementText, boxHeight, boxWidth };
}
