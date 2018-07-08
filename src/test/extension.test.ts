//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import * as assert from 'assert';
import { workspace, window, Selection, Position, commands } from 'vscode';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as windowScreenshot from 'window-screenshot';

// The contents of demo/README.md which gets copied to README.md underneath the Features section
const readmeFilePath = path.join(__dirname /* out/test */, '../../demo/README.md');
fs.writeFile(readmeFilePath, `
## Features

The commands are shown only in MarkDown files. You can configure the extension to either use ASCII or Unicode drawing characters.

`);

async function heading(title: string) {
        await fs.appendFile(readmeFilePath, `### ${title}\n\n`);
}

async function paragraph(text: string) {
        await fs.appendFile(readmeFilePath, text + '\n\n');
}

async function screenshot(title: string) {
        return new Promise((resolve, reject) => {
                windowScreenshot(
                        0, // 0 is for active window
                        async (error: Error, res: Buffer) => {
                                if (error) {
                                        reject(error);
                                }

                                try {
                                        const screenshotFileName = title + '.png';
                                        const screenshotFilePath = path.join(__dirname /* out/test */, '../../demo/', screenshotFileName);
                                        const stream = fs.createWriteStream(screenshotFilePath);
                                        stream.write(res);
                                        stream.close();
                                        await fs.appendFile(readmeFilePath, `![${title}](${screenshotFileName})\n\n`);
                                        resolve();
                                } catch (error) {
                                        reject(error);
                                }
                        });
        });
}

suite("Extension Tests", function () {
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
                await heading('Clearing the canvas');
                await paragraph('TODO');
        });

        test("Demo drawing a box", async function () {
                await heading('Drawing a box');
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
                await paragraph('Start with a document formatted so that you can make a rectangular selection about the desired area. You can use the *Insert a drawing canvas* for this.');
                await screenshot('box-canvas');
                textEditor.selection = new Selection(new Position(2, 2), new Position(4, 6));
                await paragraph('Make your selection enclosing the area you want to draw the box around…');
                await screenshot('box-selection');
                await commands.executeCommand('extension.drawBox');
                await new Promise(resolve => setTimeout(resolve, 2)); // Prevent flaky test.
                await paragraph('Execute the *Draw a box enclosing the selection* command. Here\'s your box!');
                await screenshot('box-box');
                const actual = textDocument.getText();
                assert.equal(actual, expected);
        });

        test('Demo clearing an arrow', async function () {
                await heading('Drawing an arrow');
                await paragraph('TODO');
        });
});
