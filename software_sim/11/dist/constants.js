"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMMAND = exports.KIND = exports.SEGMENT = exports.SYMBOLS = exports.KEYWORDS = exports.TOKEN_TYPE = void 0;
var TOKEN_TYPE = {
    KEYWORD: 'KEYWORD',
    SYMBOL: 'SYMBOL',
    INT_CONST: 'INT_CONST',
    STRING_CONST: 'STRING_CONST',
    IDENTIFIER: 'IDENTIFIER',
};
exports.TOKEN_TYPE = TOKEN_TYPE;
var KEYWORDS = {
    CLASS: 'class',
    CONSTRUCTOR: 'constructor',
    FUNCTION: 'function',
    METHOD: 'method',
    FIELD: 'field',
    STATIC: 'static',
    VAR: 'var',
    INT: 'int',
    CHAR: 'char',
    BOOLEAN: 'boolean',
    VOID: 'void',
    TRUE: 'true',
    FALSE: 'false',
    NULL: 'null',
    THIS: 'this',
    LET: 'let',
    DO: 'do',
    IF: 'if',
    ELSE: 'else',
    WHILE: 'while',
    RETURN: 'return'
};
exports.KEYWORDS = KEYWORDS;
var SYMBOLS = {
    LEFT_CURLY_BRACKET: '{',
    RIGHT_CURLY_BRACKET: '}',
    LEFT_ROUND_BRACKET: '(',
    RIGHT_ROUND_BRACKET: ')',
    LEFT_SQUARE_BRACKET: '[',
    RIGHT_SQUARE_BRACKET: ']',
    PERIOD: '.',
    COMMA: ',',
    SEMI_COLON: ';',
    PLUS_SIGN: '+',
    HYPHEN: '-',
    ASTERISK: '*',
    SLASH: '/',
    AMPERSAND: '&',
    VERTICAL_LINE: '|',
    LESS_THAN_SIGN: '<',
    GREATER_THAN_SIGN: '>',
    EQUAL: '=',
    TILDE: '~'
};
exports.SYMBOLS = SYMBOLS;
var SEGMENT = {
    CONST: 'constant',
    ARGUMENT: 'argument',
    LOCAL: 'local',
    STATIC: 'static',
    THIS: 'this',
    THAT: 'that',
    POINTER: 'pointer',
    TEMP: 'temp'
};
exports.SEGMENT = SEGMENT;
var KIND = {
    STATIC: 'static',
    FIELD: 'field',
    ARGUMENT: 'argument',
    VAR: 'var',
    NONE: 'none'
};
exports.KIND = KIND;
var COMMAND = {
    ADD: 'add',
    SUB: 'sub',
    NEG: 'neg',
    AND: 'and',
    OR: 'or',
    NOT: 'not',
    LT: 'lt',
    GT: 'gt',
    EQ: 'eq'
};
exports.COMMAND = COMMAND;
