import {describe, it, expect} from 'vitest';
import type {TokenType} from "../../../../src/lib/llignette/code/scanning/TokenType";
import {scan} from "../../../../src/lib/llignette/code/scanning/Scanner";
import type {Token} from "../../../../src/lib/llignette/code/scanning/Token";


describe('Scanner test', () => {

    const expectToken = function(token: Token, expectedTokenType: TokenType, expectedSourceOffset: number, expectedLength: number) {
        expect(token.tokenType).toBe(expectedTokenType);
        expect(token.sourceOffset).toBe(expectedSourceOffset);
        expect(token.sourceLength).toBe(expectedLength);
    }

    it("scans an empty string", () => {
        const result = scan("")

        expectToken(result.tokens[0], '#TokenTypeEof', 0, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans an unrecognized character", () => {
        const result = scan("‽")

        expectToken(result.tokens[0], '#TokenTypeUnrecognizedChar', 0, 1)
        expectToken(result.tokens[1], '#TokenTypeEof', 1, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans a few punctuation tokens", () => {
        const result = scan(
            "& &&\n *: , ",
        )

        expectToken(result.tokens[0], '#TokenTypeAmpersand', 0, 1)
        expectToken(result.tokens[1], '#TokenTypeAmpersandAmpersand', 2, 2)
        expectToken(result.tokens[2], '#TokenTypeAsterisk', 6, 1)
        expectToken(result.tokens[3], '#TokenTypeColon', 7, 1)
        expectToken(result.tokens[4], '#TokenTypeComma', 9, 1)
        expectToken(result.tokens[5], '#TokenTypeEof', 11, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a few identifier tokens", () => {
        const result = scan(
            "a bb c23_f q-code _dfg",
        )

        expectToken(result.tokens[0], '#TokenTypeIdentifier', 0, 1)
        expectToken(result.tokens[1], '#TokenTypeIdentifier', 2, 2)
        expectToken(result.tokens[2], '#TokenTypeIdentifier', 5, 5)
        expectToken(result.tokens[3], '#TokenTypeIdentifier', 11, 6)
        expectToken(result.tokens[4], '#TokenTypeIdentifier', 18, 4)
        expectToken(result.tokens[5], '#TokenTypeEof', 22, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans a few integers", () => {
        const result = scan(
            "123 4\n(99000) 5",
        )

        expectToken(result.tokens[0], '#TokenTypeIntegerLiteral', 0, 3)
        expectToken(result.tokens[1], '#TokenTypeIntegerLiteral', 4, 1)
        expectToken(result.tokens[2], '#TokenTypeLeftParenthesis', 6, 1)
        expectToken(result.tokens[3], '#TokenTypeIntegerLiteral', 7, 5)
        expectToken(result.tokens[4], '#TokenTypeRightParenthesis', 12, 1)
        expectToken(result.tokens[5], '#TokenTypeIntegerLiteral', 14, 1)
        expectToken(result.tokens[6], '#TokenTypeEof', 15, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a few numbers", () => {
        const result = scan(
            "12.3 4\n(990.00) 5.1",
        )

        expectToken(result.tokens[0], '#TokenTypeFloatingPointLiteral', 0, 4)
        expectToken(result.tokens[1], '#TokenTypeIntegerLiteral', 5, 1)
        expectToken(result.tokens[2], '#TokenTypeLeftParenthesis', 7, 1)
        expectToken(result.tokens[3], '#TokenTypeFloatingPointLiteral', 8, 6)
        expectToken(result.tokens[4], '#TokenTypeRightParenthesis', 14, 1)
        expectToken(result.tokens[5], '#TokenTypeFloatingPointLiteral', 16, 3)
        expectToken(result.tokens[6], '#TokenTypeEof', 19, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a few double quoted strings", () => {
        const result = scan(
            `"abc" "xyz" "bad
 "start over"`,
        )

        expectToken(result.tokens[0], '#TokenTypeDoubleQuotedString', 0, 5)
        expectToken(result.tokens[1], '#TokenTypeDoubleQuotedString', 6, 5)
        expectToken(result.tokens[2], '#TokenTypeUnclosedDoubleQuotedString', 12, 4)
        expectToken(result.tokens[3], '#TokenTypeDoubleQuotedString', 18, 12)
        expectToken(result.tokens[4], '#TokenTypeEof', 30, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a few single quoted strings", () => {
        const result = scan(
            `'abc' 'xyz' 'bad
 'start over'`,
        )

        expectToken(result.tokens[0], '#TokenTypeSingleQuotedString', 0, 5)
        expectToken(result.tokens[1], '#TokenTypeSingleQuotedString', 6, 5)
        expectToken(result.tokens[2], '#TokenTypeUnclosedSingleQuotedString', 12, 4)
        expectToken(result.tokens[3], '#TokenTypeSingleQuotedString', 18, 12)
        expectToken(result.tokens[4], '#TokenTypeEof', 30, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a few back-ticked string lines", () => {
        const result = scan(
            "`abc 123\n`  - one\n  `  - two\n\n  `another\n\n  `one more\n `and the end",
        )

        expectToken(result.tokens[0], '#TokenTypeBackTickedString', 0, 29)
        expectToken(result.tokens[1], '#TokenTypeBackTickedString', 32, 9)
        expectToken(result.tokens[2], '#TokenTypeBackTickedString', 44, 23)
        expectToken(result.tokens[3], '#TokenTypeEof', 67, 0)
        expect(result.newLineOffsets.length).toBe(7)
    })

    it("scans a few documentation lines", () => {
        const result = scan(
            "// abc 123\n//  - one\n//two\n\n//\n//",
        )

        expectToken(result.tokens[0], '#TokenTypeDocumentation', 0, 27)
        expectToken(result.tokens[1], '#TokenTypeDocumentation', 28, 5)
        expectToken(result.tokens[2], '#TokenTypeEof', 33, 0)
        expect(result.newLineOffsets.length).toBe(5)
    })

    it("scans boolean literals", () => {
        const result = scan(
            "true false",
        )

        expectToken(result.tokens[0], '#TokenTypeTrue', 0, 4)
        expectToken(result.tokens[1], '#TokenTypeFalse', 5, 5)
        expectToken(result.tokens[2], '#TokenTypeEof', 10, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans built in types", () => {
        const result = scan(
            "Boolean Float64 Int64 String",
        )

        expectToken(result.tokens[0], '#TokenTypeBoolean', 0, 7)
        expectToken(result.tokens[1], '#TokenTypeFloat64', 8, 7)
        expectToken(result.tokens[2], '#TokenTypeInt64', 16, 5)
        expectToken(result.tokens[3], '#TokenTypeString', 22, 6)
        expectToken(result.tokens[4], '#TokenTypeEof', 28, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })


});
