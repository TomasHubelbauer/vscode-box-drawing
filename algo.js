// node algo.js
const { performance } = require('perf_hooks');

const EndOfLine = {
    LF: 1,
    CRLD: 2
};

const runs = 100;

true && test(EndOfLine.LF,
    `a b c d e f g
h i j k l
m n o p q r s t
u v w x y z`,
    1, 2, 3, 6,
    `a b c d e f g
h ┏━━┓k l
m ┃ o┃p q r s t
u ┗━━┛x y z`);

true && test(EndOfLine.LF,
    `
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcde
abcdefghijklmnopqrstuvwxyz
abcde
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
`,
    1, 2, 6, 21,
    `
ab┏━━━━━━━━━━━━━━━━━┓vwxyz
ab┃defghijklmnopqrst┃vwxyz
ab┃de               ┃
ab┃defghijklmnopqrst┃vwxyz
ab┃de               ┃
ab┗━━━━━━━━━━━━━━━━━┛vwxyz
abcdefghijklmnopqrstuvwxyz
`);

true && test(EndOfLine.LF,
    `
abcde
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcdefghijklmnopqrstuvwxyz
abcde
end
`,
    1, 2, 6, 21,
    `
ab┏━━━━━━━━━━━━━━━━━┓
ab┃defghijklmnopqrst┃vwxyz
ab┃defghijklmnopqrst┃vwxyz
ab┃defghijklmnopqrst┃vwxyz
ab┃defghijklmnopqrst┃vwxyz
ab┗━━━━━━━━━━━━━━━━━┛
end
`);

true && test(EndOfLine.LF,
    `
abcdefghi
1
2bcdefghi
3bcdefghi
4
abcdefghi
`,
    1, 1, 6, 6,
    `
a┏━━━┓ghi
1┃   ┃
2┃cde┃ghi
3┃cde┃ghi
4┃   ┃
a┗━━━┛ghi
`);

function test(eol, sourceText, selectionStartLine, selectionStartCharacter, selectionEndLine, selectionEndCharacter, expectedText) {
    const test = {
        document: {
            eol,
            getText: () => sourceText,
            offsetAt: (position) => {
                let eolText = '';
                switch (eol) {
                    case EndOfLine.LF: eolText = '\n'; break;
                    case EndOfLine.CRLF: eolText = '\r\n'; break;
                    default: throw new Error('Unexpected EOL value.');
                }

                const lines = sourceText.split(new RegExp('\n', 'mg'));
                let offset = 0;
                for (let line = 0; line < position.line; line++) {
                    offset += lines[line].length + eolText.length;
                }

                offset += position.character;
                return offset;
            }
        },
        selection: {
            start: {
                line: selectionStartLine,
                character: selectionStartCharacter
            },
            end: {
                line: selectionEndLine,
                character: selectionEndCharacter
            }
        }
    };

    const times = [];
    for (let run = 0; run < runs; run++) {
        const t = performance.now();
        const { replacementText, boxHeight, boxWidth } = algo(test);
        times.push(performance.now() - t);
    }

    const { replacementText, boxHeight, boxWidth } = algo(test);
    const actualText = sourceText.substring(0, test.document.offsetAt(test.selection.start)) + replacementText + sourceText.substring(test.document.offsetAt(test.selection.end));
    console.log();
    if (expectedText !== actualText) {
        for (let index = 0; index < expectedText.length; index++) {
            if (expectedText[index] !== actualText[index]) {
                console.log('MISMATCH!', `@${index}`, JSON.stringify(expectedText[index]), JSON.stringify(actualText[index]));
                break;
            }
        }

        console.log('---');
        console.log(expectedText);
        console.log('---');
        console.log(actualText);
    } else {
        console.log(`MATCH (${boxWidth}×${boxHeight} box, ${median(times)} ms)`);
    }
}

function median(numbers) {
    // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
    var median = 0, numsLen = numbers.length;
    numbers.sort();
    if (numsLen % 2 === 0) { // is even
        // average of two middle numbers
        median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    } else { // is odd
        // middle number only
        median = numbers[(numsLen - 1) / 2];
    }
    return median;
}

function algo(editor) {
    const { character: startCharacter, line: startLine } = editor.selection.start;
    const { character: endCharacter, line: endLine } = editor.selection.end;

    const minCharacter = Math.min(startCharacter, endCharacter);
    const maxCharacter = Math.max(startCharacter, endCharacter);
    const boxWidth = maxCharacter - minCharacter;

    const minLine = Math.min(startLine, endLine);
    const maxLine = Math.max(startLine, endLine);
    const boxHeight = maxLine - minLine + 1;

    let eolText = '';
    switch (editor.document.eol) {
        case EndOfLine.LF: eolText = '\n'; break;
        case EndOfLine.CRLF: eolText = '\r\n'; break;
        default: throw new Error('Unexpected EOL value.');
    }

    const selectionText = editor.document.getText().substring(
        editor.document.offsetAt(editor.selection.start),
        editor.document.offsetAt(editor.selection.end));

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
