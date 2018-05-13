//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import * as assert from 'assert';
import { workspace, window, Selection, Position, commands } from 'vscode';

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
});
