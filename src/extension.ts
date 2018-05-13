'use strict';
import { ExtensionContext, commands, window, Position, workspace, TextEditorEdit, Range, TextLine } from 'vscode';

export function activate(context: ExtensionContext) {
    context.subscriptions.push(commands.registerTextEditorCommand('extension.insertCanvas', (textEditor, edit) => {
        if (textEditor.document.languageId !== 'markdown') {
            window.showErrorMessage('Must be a MarkDown editor!');
            return;
        }

        // TODO: https://github.com/Microsoft/vscode/issues/14756
        edit.replace(textEditor.selection, `\n${Array(30).fill(' '.repeat(120)).join('\n')}\n`);
    }));

    context.subscriptions.push(commands.registerTextEditorCommand('extension.drawBox', (textEditor, edit) => {
        if (textEditor.document.languageId !== 'markdown' || textEditor.selections.length !== 1) {
            window.showErrorMessage('Must be a MarkDown editor with a sole selection!');
            return;
        }

        const { start: startPosition, end: endPosition } = textEditor.selection;
        const { style } = workspace.getConfiguration('boxDrawing');
        drawBox(startPosition, endPosition, edit, textEditor.document.lineAt, style);
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

// TODO: Respect the switch for ASCII/Unicode
export function drawBox(startPosition: Position, endPosition: Position, edit: TextEditorEdit, lineAt: (index: number) => TextLine, style: 'ascii' | 'unicode') {
    const { character: startCharacter, line: startLine } = startPosition;
    const { character: endCharacter, line: endLine } = endPosition;

    const nearCharacter = Math.min(startCharacter, endCharacter);
    const farCharacter = Math.max(startCharacter, endCharacter);
    const nearLine = Math.min(startLine, endLine);
    const farLine = Math.max(startLine, endLine);

    for (let index = nearLine; index <= farLine; index++) {
        const line = lineAt(index);

        const nearSymbol = line.lineNumber === nearLine ? '┏' : (line.lineNumber === farLine ? '┗' : '┃');
        const farSymbol = line.lineNumber === nearLine ? '┓' : (line.lineNumber === farLine ? '┛' : '┃');
        if (line.range.end.character < nearCharacter) {
            // Pad the line long enough to reach the box
            edit.insert(line.range.end, ' '.repeat(nearCharacter - line.range.end.character));
            const position = new Position(line.lineNumber, nearCharacter);
            if (line.lineNumber !== nearLine && line.lineNumber !== farLine) {
                edit.insert(position, '┃' + ' '.repeat(farCharacter - nearCharacter - 2) + '┃');
            } else {
                edit.insert(position, nearSymbol + '━'.repeat(farCharacter - nearCharacter - 2) + farSymbol);
            }
        } else if (line.range.end.character < farCharacter) {
            // End line at the box for simple insertion
            const deleteRange = new Range(new Position(line.lineNumber, nearCharacter), line.range.end);
            edit.delete(deleteRange);
            const insertPosition = line.range.end;
            if (line.lineNumber !== nearLine && line.lineNumber !== farLine) {
                const text = line.text.substring(nearCharacter + 1);
                edit.insert(insertPosition, nearSymbol + text + ' '.repeat(farCharacter - nearCharacter - text.length - 2) + farSymbol);
            } else {
                edit.insert(insertPosition, nearSymbol + '━'.repeat(farCharacter - nearCharacter - 2) + farSymbol);
            }
        } else {
            const range = new Range(new Position(line.lineNumber, nearCharacter), new Position(line.lineNumber, farCharacter));
            if (line.lineNumber !== nearLine && line.lineNumber !== farLine) {
                edit.replace(range, nearSymbol + line.text.substring(nearCharacter + 1, farCharacter - 1) + farSymbol);
            } else {
                edit.replace(range, nearSymbol + '━'.repeat(farCharacter - nearCharacter - 2) + farSymbol);
            }
        }
    }
}

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
        edit.replace(new Range(new Position(y0, x0), new Position(y0, x0 + 1)), '·');

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
