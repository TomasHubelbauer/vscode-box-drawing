//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import * as assert from 'assert';
import { EndOfLine, Position } from 'vscode';
import { drawBox } from '../extension';

suite("Extension Tests", function () {
    test("Case 1", function () {
        runTest(EndOfLine.LF,
            `a b c d e f g
h i j k l
m n o p q r s t
u v w x y z`,
            new Position(1, 2), new Position(3, 6),
            `a b c d e f g
h ┏━━┓k l
m ┃ o┃p q r s t
u ┗━━┛x y z`);
    });

    test("Case 2", function () {
        runTest(EndOfLine.LF,
            `
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcde
abcdefghijklmnopqrstuvwxyz
abcde
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
`,
            new Position(1, 2), new Position(6, 21),
            `
ab┏━━━━━━━━━━━━━━━━━┓vwxyz
ab┃defghijklmnopqrst┃vwxyz
ab┃de               ┃
ab┃defghijklmnopqrst┃vwxyz
ab┃de               ┃
ab┗━━━━━━━━━━━━━━━━━┛vwxyz
abcdefghijklmnopqrstuvwxyz
`);
    });

    test("Case 3", function () {
        runTest(EndOfLine.LF,
            `
abcde
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcde
end
`,
            new Position(1, 2), new Position(6, 21),
            `
ab┏━━━━━━━━━━━━━━━━━┓
ab┃defghijklmnopqrst┃vwxyz
ab┃defghijklmnopqrst┃vwxyz
ab┃defghijklmnopqrst┃vwxyz
ab┃defghijklmnopqrst┃vwxyz
ab┗━━━━━━━━━━━━━━━━━┛
end
`);
    });

    test("Case 4", function () {
        runTest(EndOfLine.LF,
            `
abcdefghi
1
2bcdefghi
3bcdefghi
4
abcdefghi
`,
            new Position(1, 1), new Position(6, 6),
            `
a┏━━━┓ghi
1┃   ┃
2┃cde┃ghi
3┃cde┃ghi
4┃   ┃
a┗━━━┛ghi
`);
    });
});

function offsetAt(eol: EndOfLine, text: string, position: Position) {
    let eolText = '';
    switch (eol) {
        case EndOfLine.LF: eolText = '\n'; break;
        case EndOfLine.CRLF: eolText = '\r\n'; break;
        default: throw new Error('Unexpected EOL value.');
    }

    const lines = text.split(new RegExp('\n', 'mg'));
    let offset = 0;
    for (let line = 0; line < position.line; line++) {
        offset += lines[line].length + eolText.length;
    }

    offset += position.character;
    return offset;
}

function runTest(eol: EndOfLine, text: string, startPosition: Position, endPosition: Position, expectedText: string) {
    const startOffset = offsetAt(eol, text, startPosition);
    const endOffset = offsetAt(eol, text, endPosition);
    const { replacementText } = drawBox(startPosition, endPosition, eol, text, startOffset, endOffset, 'unicode');
    const actualText = text.substring(0, startOffset) + replacementText + text.substring(endOffset);
    assert.equal(actualText, expectedText);
}
