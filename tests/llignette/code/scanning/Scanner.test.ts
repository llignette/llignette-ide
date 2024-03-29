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

        expectToken(result.tokens[0], '#TokenType_Eof', 0, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans an unrecognized character", () => {
        const result = scan("‽")

        expectToken(result.tokens[0], '#TokenType_UnrecognizedChar', 0, 1)
        expectToken(result.tokens[1], '#TokenType_Eof', 1, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans a few punctuation tokens", () => {
        const result = scan(
            "& &&\n *: , ",
        )

        expectToken(result.tokens[0], '#TokenType_Ampersand', 0, 1)
        expectToken(result.tokens[1], '#TokenType_AmpersandAmpersand', 2, 2)
        expectToken(result.tokens[2], '#TokenType_Asterisk', 6, 1)
        expectToken(result.tokens[3], '#TokenType_Colon', 7, 1)
        expectToken(result.tokens[4], '#TokenType_Comma', 9, 1)
        expectToken(result.tokens[5], '#TokenType_Eof', 11, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a few identifier tokens", () => {
        const result = scan(
            "a bb c23_f q-code _dfg",
        )

        expectToken(result.tokens[0], '#TokenType_Identifier', 0, 1)
        expectToken(result.tokens[1], '#TokenType_Identifier', 2, 2)
        expectToken(result.tokens[2], '#TokenType_Identifier', 5, 5)
        expectToken(result.tokens[3], '#TokenType_Identifier', 11, 6)
        expectToken(result.tokens[4], '#TokenType_Identifier', 18, 4)
        expectToken(result.tokens[5], '#TokenType_Eof', 22, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans a few integers", () => {
        const result = scan(
            "123 4\n(99000) 5",
        )

        expectToken(result.tokens[0], '#TokenType_IntegerLiteral', 0, 3)
        expectToken(result.tokens[1], '#TokenType_IntegerLiteral', 4, 1)
        expectToken(result.tokens[2], '#TokenType_LeftParenthesis', 6, 1)
        expectToken(result.tokens[3], '#TokenType_IntegerLiteral', 7, 5)
        expectToken(result.tokens[4], '#TokenType_RightParenthesis', 12, 1)
        expectToken(result.tokens[5], '#TokenType_IntegerLiteral', 14, 1)
        expectToken(result.tokens[6], '#TokenType_Eof', 15, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a few numbers", () => {
        const result = scan(
            "12.3 4\n(990.00) 5.1",
        )

        expectToken(result.tokens[0], '#TokenType_FloatingPointLiteral', 0, 4)
        expectToken(result.tokens[1], '#TokenType_IntegerLiteral', 5, 1)
        expectToken(result.tokens[2], '#TokenType_LeftParenthesis', 7, 1)
        expectToken(result.tokens[3], '#TokenType_FloatingPointLiteral', 8, 6)
        expectToken(result.tokens[4], '#TokenType_RightParenthesis', 14, 1)
        expectToken(result.tokens[5], '#TokenType_FloatingPointLiteral', 16, 3)
        expectToken(result.tokens[6], '#TokenType_Eof', 19, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a few double quoted strings", () => {
        const result = scan(
            `"abc" "xyz" "bad
 "start over"`,
        )

        expectToken(result.tokens[0], '#TokenType_DoubleQuotedString', 0, 5)
        expectToken(result.tokens[1], '#TokenType_DoubleQuotedString', 6, 5)
        expectToken(result.tokens[2], '#TokenType_UnclosedString', 12, 4)
        expectToken(result.tokens[3], '#TokenType_DoubleQuotedString', 18, 12)
        expectToken(result.tokens[4], '#TokenType_Eof', 30, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a triple double quoted strings", () => {
        const result = scan(
            `"""aaa"""`,
        )

        expectToken(result.tokens[0], '#TokenType_TripleDoubleQuotedString', 0, 9)
        expectToken(result.tokens[1], '#TokenType_Eof', 9, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans a triple double quoted strings", () => {
        const result = scan(
            `"""
     aaa
"""`,
        )

        expectToken(result.tokens[0], '#TokenType_TripleDoubleQuotedString', 0, 16)
        expectToken(result.tokens[1], '#TokenType_Eof', 16, 0)
        expect(result.newLineOffsets.length).toBe(2)
    })

    it("scans a few single quoted strings", () => {
        const result = scan(
            `'abc' 'xyz' 'bad
 'start over'`,
        )

        expectToken(result.tokens[0], '#TokenType_SingleQuotedString', 0, 5)
        expectToken(result.tokens[1], '#TokenType_SingleQuotedString', 6, 5)
        expectToken(result.tokens[2], '#TokenType_UnclosedString', 12, 4)
        expectToken(result.tokens[3], '#TokenType_SingleQuotedString', 18, 12)
        expectToken(result.tokens[4], '#TokenType_Eof', 30, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans a few back ticked strings", () => {
        const result = scan(
            "`abc` `xyz` `bad\n `start over`",
        )

        expectToken(result.tokens[0], '#TokenType_BackTickedString', 0, 5)
        expectToken(result.tokens[1], '#TokenType_BackTickedString', 6, 5)
        expectToken(result.tokens[2], '#TokenType_UnclosedString', 12, 4)
        expectToken(result.tokens[3], '#TokenType_BackTickedString', 18, 12)
        expectToken(result.tokens[4], '#TokenType_Eof', 30, 0)
        expect(result.newLineOffsets.length).toBe(1)
    })

    it("scans boolean literals", () => {
        const result = scan(
            "true false",
        )

        expectToken(result.tokens[0], '#TokenType_True', 0, 4)
        expectToken(result.tokens[1], '#TokenType_False', 5, 5)
        expectToken(result.tokens[2], '#TokenType_Eof', 10, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })

    it("scans built in types", () => {
        const result = scan(
            "Boolean Float64 Int64 String",
        )

        expectToken(result.tokens[0], '#TokenType_Boolean', 0, 7)
        expectToken(result.tokens[1], '#TokenType_Float64', 8, 7)
        expectToken(result.tokens[2], '#TokenType_Int64', 16, 5)
        expectToken(result.tokens[3], '#TokenType_String', 22, 6)
        expectToken(result.tokens[4], '#TokenType_Eof', 28, 0)
        expect(result.newLineOffsets.length).toBe(0)
    })


});
