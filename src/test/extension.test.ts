//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import * as assert from 'assert';
import { workspace, window, Selection, Position, commands } from 'vscode';
import Generator from 'vscode-extension-test-screenshot-markdown-generator';

suite("Extension Tests", async function () {
        const generator = new Generator();
        generator.appendHeading('Features');
        generator.appendParagraph('The commands are shown only in MarkDown files. You can configure the extension to either use ASCII or Unicode drawing characters.');

        test("Box 1", async function () {
                const content = `
a b c d e f g
h i j k l
m n o p q r s t
u v w x y z
`;
                const expected = `
a b c d e f g
h ┏━━┓k l
m ┃ o┃p q r s t
u ┗━━┛x y z
`;
                const textDocument = await workspace.openTextDocument({ language: 'markdown', content });
                const textEditor = await window.showTextDocument(textDocument);
                textEditor.selection = new Selection(new Position(2, 2), new Position(4, 6));
                await commands.executeCommand('extension.drawBox');
                await new Promise(resolve => setTimeout(resolve, 2)); // Prevent flaky test.
                const actual = textDocument.getText();
                assert.equal(actual, expected);
        });

        test("Box 2", async function () {
                const content = `
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcde
abcdefghijklmnopqrstuvwxyz
abcde
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
`;
                const expected = `
ab┏━━━━━━━━━━━━━━━━━┓vwxyz
ab┃defghijklmnopqrst┃vwxyz
ab┃de               ┃
ab┃defghijklmnopqrst┃vwxyz
ab┃de               ┃
ab┗━━━━━━━━━━━━━━━━━┛vwxyz
abcdefghijklmnopqrstuvwxyz
`;
                const textDocument = await workspace.openTextDocument({ language: 'markdown', content });
                const textEditor = await window.showTextDocument(textDocument);
                textEditor.selection = new Selection(new Position(1, 2), new Position(6, 21));
                await commands.executeCommand('extension.drawBox');
                await new Promise(resolve => setTimeout(resolve, 2)); // Prevent flaky test.
                const actual = textDocument.getText();
                assert.equal(actual, expected);
        });

        test("Box 3", async function () {
                const content = `
abcde
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcde
end
`;
                const expected = `
ab┏━━━━━━━━━━━━━━━━━┓
ab┃defghijklmnopqrst┃vwxyz
ab┃defghijklmnopqrst┃vwxyz
ab┃defghijklmnopqrst┃vwxyz
ab┃defghijklmnopqrst┃vwxyz
ab┗━━━━━━━━━━━━━━━━━┛
end
`;
                const textDocument = await workspace.openTextDocument({ language: 'markdown', content });
                const textEditor = await window.showTextDocument(textDocument);
                textEditor.selection = new Selection(new Position(1, 2), new Position(6, 21));
                await commands.executeCommand('extension.drawBox');
                await new Promise(resolve => setTimeout(resolve, 2)); // Prevent flaky test.
                const actual = textDocument.getText();
                assert.equal(actual, expected);
        });

        test("Box 4", async function () {
                const content = `
abcdefghi
1
2bcdefghi
3bcdefghi
4
abcdefghi
`;
                const expected = `
a┏━━━┓ghi
1┃   ┃
2┃cde┃ghi
3┃cde┃ghi
4┃   ┃
a┗━━━┛ghi
`;
                const textDocument = await workspace.openTextDocument({ language: 'markdown', content });
                const textEditor = await window.showTextDocument(textDocument);
                textEditor.selection = new Selection(new Position(1, 1), new Position(6, 6));
                await commands.executeCommand('extension.drawBox');
                await new Promise(resolve => setTimeout(resolve, 2)); // Prevent flaky test.
                const actual = textDocument.getText();
                assert.equal(actual, expected);
        });

        test('Arrow 1', async function () {
                const content = `
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
`;
                const expected = `
a··defghijklmnopqrstuvwxyz
abc····hijklmnopqrstuvwxyz
abcdefg····lmnopqrstuvwxyz
abcdefghijk····pqrstuvwxyz
abcdefghijklmno····tuvwxyz
abcdefghijklmnopqrs··vwxyz
`;
                const textDocument = await workspace.openTextDocument({ language: 'markdown', content });
                const textEditor = await window.showTextDocument(textDocument);
                textEditor.selection = new Selection(new Position(1, 1), new Position(6, 20));
                await commands.executeCommand('extension.drawArrow');
                await new Promise(resolve => setTimeout(resolve, 2)); // Prevent flaky test.
                const actual = textDocument.getText();
                assert.equal(actual, expected);
        });

        test('Demo clearing the canvas', async function () {
                generator.appendSubheading('Clearing the canvas');
                generator.appendParagraph('TODO');
        });

        test("Demo drawing a box", async function () {
                generator.appendSubheading('Drawing a box');
                const content = `
a b c d e f g
h i j k l
m n o p q r s t
u v w x y z
`;
                const expected = `
a b c d e f g
h ┏━━┓k l
m ┃ o┃p q r s t
u ┗━━┛x y z
`;
                const textDocument = await workspace.openTextDocument({ language: 'markdown', content });
                const textEditor = await window.showTextDocument(textDocument);
                generator.appendParagraph('Start with a document formatted so that you can make a rectangular selection about the desired area. You can use the *Insert a drawing canvas* for this.');
                await generator.appendScreenshot('box-canvas', 'Preformatted canvas');
                generator.appendParagraph('Make your selection enclosing the area you want to draw the box around…');
                textEditor.selection = new Selection(new Position(2, 2), new Position(4, 6));
                await generator.appendScreenshot('box-selection', 'A selection whose start and end points make up a rectangle');
                generator.appendParagraph('Execute the *Draw a box enclosing the selection* command. Here\'s your box!');
                await commands.executeCommand('extension.drawBox');
                await new Promise(resolve => setTimeout(resolve, 2)); // Prevent flaky test.
                const actual = textDocument.getText();
                assert.equal(actual, expected);
                await generator.appendScreenshot('box-box', 'A box drawn around the enclosed area');
        });

        test('Demo clearing an arrow', async function () {
                generator.appendSubheading('Drawing an arrow');
                generator.appendParagraph('TODO');
        });

        await generator.generate('## Features\n\n<!-- Generated from src/test/extension.test.ts -->', 2);
});
