'use strict';
import { ExtensionContext, commands, window, EndOfLine, Position, workspace, TextEditorEdit, Range } from 'vscode';

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
        const { style } = workspace.getConfiguration('boxDrawing');
        const { replacementText } = drawBox(startPosition, endPosition, eol, getText(), startOffset, endOffset, style);
        edit.replace(textEditor.selection, replacementText);
    }));

    context.subscriptions.push(commands.registerTextEditorCommand('extension.insertCanvas', (textEditor, edit) => {
        if (textEditor.document.languageId !== 'markdown') {
            window.showErrorMessage('Must be a MarkDown editor!');
            return;
        }

        // TODO: https://github.com/Microsoft/vscode/issues/14756
        edit.replace(textEditor.selection, `\n${Array(30).fill(' '.repeat(120)).join('\n')}\n`);
    }));

    context.subscriptions.push(commands.registerTextEditorCommand('extension.drawArrow', (textEditor, edit) => {
        if (textEditor.document.languageId !== 'markdown' || textEditor.selections.length !== 1) {
            window.showErrorMessage('Must be a MarkDown editor with a sole selection!');
            return;
        }

        const { start: startPosition, end: endPosition } = textEditor.selection;
        drawArrow(startPosition, endPosition, edit);
    }));
}

export function drawBox(startPosition: Position, endPosition: Position, eol: EndOfLine, text: string, startOffset: number, endOffset: number, style: 'ascii' | 'unicode') {
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

// TODO: Rewrite this to work on text instead of incuring an edit for each pixel
export function drawArrow(startPosition: Position, endPosition: Position, edit: TextEditorEdit) {
    let { line: y0, character: x0 } = startPosition;
    let { line: y1, character: x1 } = endPosition;

    // https://stackoverflow.com/a/4672319/2715716
    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;
    while (true) {
        // TODO: Test edge cases where x0 + 1 might come bite our ass.
        edit.replace(new Range(new Position(y0, x0), new Position(y0, x0 + 1)), '-');

        if ((x0 === x1) && (y0 === y1)) {
            break;
        }

        const e2 = 2 * err;

        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }

        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
}
