//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

import * as assert from 'assert';
import { EndOfLine, Position, TextLine, Range } from 'vscode';
import { drawBox } from '../extension';

suite("Extension Tests", function () {
    test("Case 1", function () {
        const lines = [
            'a b c d e f g\n',
            'h i j k l\n',
            'm n o p q r s t\n',
            'u v w x y z\n',
        ];
        const edits = [
            'replace [{\"line\":1,\"character\":2},{\"line\":1,\"character\":6}] ┏━━┓',
            'replace [{\"line\":2,\"character\":2},{\"line\":2,\"character\":6}] ┃ o┃',
            'replace [{\"line\":3,\"character\":2},{\"line\":3,\"character\":6}] ┗━━┛',
        ];
        run([...getLines(lines)], new Position(1, 2), new Position(3, 6), edits);
    });

    test("Case 2", function () {
        const lines = [
            '\n',
            'abcdefghijklmnopqrstuvwxyz\n',
            'abcdefghijklmnopqrstuvwxyz\n',
            'abcde\n',
            'abcdefghijklmnopqrstuvwxyz\n',
            'abcde\n',
            'abcdefghijklmnopqrstuvwxyz\n',
            'abcdefghijklmnopqrstuvwxyz\n',
            '\n',
        ];
        const edits = [
            'replace [{\"line\":1,\"character\":2},{\"line\":1,\"character\":21}] ┏━━━━━━━━━━━━━━━━━┓',
            'replace [{\"line\":2,\"character\":2},{\"line\":2,\"character\":21}] ┃defghijklmnopqrst┃',
            'delete [{\"line\":3,\"character\":2},{\"line\":3,\"character\":5}]',
            'insert {\"line\":3,\"character\":5} ┃de               ┃',
            'replace [{\"line\":4,\"character\":2},{\"line\":4,\"character\":21}] ┃defghijklmnopqrst┃',
            'delete [{\"line\":5,\"character\":2},{\"line\":5,\"character\":5}]',
            'insert {\"line\":5,\"character\":5} ┃de               ┃',
            'replace [{\"line\":6,\"character\":2},{\"line\":6,\"character\":21}] ┗━━━━━━━━━━━━━━━━━┛',
        ];
        run([...getLines(lines)], new Position(1, 2), new Position(6, 21), edits);
    });

    test("Case 3", function () {
        const lines = [
            '\n',
            'abcde\n',
            'abcdefghijklmnopqrstuvwxyz\n',
            'abcdefghijklmnopqrstuvwxyz\n',
            'abcdefghijklmnopqrstuvwxyz\n',
            'abcdefghijklmnopqrstuvwxyz\n',
            'abcde\n',
            'end\n',
            '\n',
        ];
        const edits = [
            'delete [{\"line\":1,\"character\":2},{\"line\":1,\"character\":5}]',
            'insert {\"line\":1,\"character\":5} ┏━━━━━━━━━━━━━━━━━┓',
            'replace [{\"line\":2,\"character\":2},{\"line\":2,\"character\":21}] ┃defghijklmnopqrst┃',
            'replace [{\"line\":3,\"character\":2},{\"line\":3,\"character\":21}] ┃defghijklmnopqrst┃',
            'replace [{\"line\":4,\"character\":2},{\"line\":4,\"character\":21}] ┃defghijklmnopqrst┃',
            'replace [{\"line\":5,\"character\":2},{\"line\":5,\"character\":21}] ┃defghijklmnopqrst┃',
            'delete [{\"line\":6,\"character\":2},{\"line\":6,\"character\":5}]',
            'insert {\"line\":6,\"character\":5} ┗━━━━━━━━━━━━━━━━━┛',
        ];
        run([...getLines(lines)], new Position(1, 2), new Position(6, 21), edits);
    });

    test("Case 4", function () {
        const lines = [
            '\n',
            'abcdefghi\n',
            '1\n',
            '2bcdefghi\n',
            '3bcdefghi\n',
            '4\n',
            'abcdefghi\n',
            '\n',
        ];
        const edits = [
            'replace [{\"line\":1,\"character\":1},{\"line\":1,\"character\":6}] ┏━━━┓',
            'delete [{\"line\":2,\"character\":1},{\"line\":2,\"character\":1}]',
            'insert {\"line\":2,\"character\":1} ┃    ┃',
            'replace [{\"line\":3,\"character\":1},{\"line\":3,\"character\":6}] ┃cde┃',
            'replace [{\"line\":4,\"character\":1},{\"line\":4,\"character\":6}] ┃cde┃',
            'delete [{\"line\":5,\"character\":1},{\"line\":5,\"character\":1}]',
            'insert {\"line\":5,\"character\":1} ┃    ┃',
            'replace [{\"line\":6,\"character\":1},{\"line\":6,\"character\":6}] ┗━━━┛',
        ];
        run([...getLines(lines)], new Position(1, 1), new Position(6, 6), edits);
    });
});

function* getLines(lines: string[]): IterableIterator<TextLine> {
    for (let index = 0; index < lines.length; index++) {
        const whitespace = (/\s+/g.exec(lines[index]) || [''])[0];
        const endOfLine = (/[\r\n]+$/g.exec(lines[index]) || [''])[0];
        const text = lines[index].slice(0, -whitespace.length);
        yield {
            lineNumber: index,
            text,
            range: new Range(new Position(index, 0), new Position(index, text.length)),
            rangeIncludingLineBreak: new Range(new Position(index, 0), new Position(index, text.length + endOfLine.length)),
            firstNonWhitespaceCharacterIndex: whitespace.length,
            isEmptyOrWhitespace: text.length === 0 || text.length === whitespace.length,
        };
    }
}

function run(lines: TextLine[], startPosition: Position, endPosition: Position, expectedEdits: string[]) {
    const actualEdits: string[] = [];

    const lineAt = (index: number) => lines[index];
    const edit = {
        replace: (location: Position | Range, value: string) => actualEdits.push(`replace ${JSON.stringify(location)} ${value}`),
        insert: (location: Position, value: string) => actualEdits.push(`insert ${JSON.stringify(location)} ${value}`),
        delete: (location: Range) => actualEdits.push(`delete ${JSON.stringify(location)}`),
        setEndOfLine: (endOfLine: EndOfLine) => actualEdits.push(`setEndOfLine ${endOfLine}`)
    };

    drawBox(startPosition, endPosition, edit, lineAt, 'unicode');
    assert.deepEqual(actualEdits, expectedEdits);
}
