"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var jackTokenizer_1 = __importDefault(require("./jackTokenizer"));
var constants_1 = require("./constants");
var CompilationEngine = /** @class */ (function () {
    function CompilationEngine(inputFilePath, outputFilePath) {
        this.outputFilePath = outputFilePath;
        fs.writeFileSync(this.outputFilePath, '');
        this.jackTokenizer = new jackTokenizer_1.default(inputFilePath);
        this.indentCount = 0;
        this.compileClass();
    }
    CompilationEngine.prototype.writeElement = function (tagName, value) {
        var indent = '  '.repeat(this.indentCount);
        fs.appendFileSync(this.outputFilePath, indent + "<" + tagName + "> " + value + " </" + tagName + ">" + '\n');
    };
    CompilationEngine.prototype.writeElementStart = function (tagName) {
        var indent = '  '.repeat(this.indentCount);
        fs.appendFileSync(this.outputFilePath, indent + "<" + tagName + ">" + '\n');
        this.indentCount = this.indentCount + 1;
    };
    CompilationEngine.prototype.writeElementEnd = function (tagName) {
        this.indentCount = this.indentCount - 1;
        var indent = '  '.repeat(this.indentCount);
        fs.appendFileSync(this.outputFilePath, indent + "</" + tagName + ">" + '\n');
    };
    CompilationEngine.prototype.compileKeyword = function (keywords) {
        var keyword = this.jackTokenizer.keyWord();
        if (keyword === null) {
            throw new Error('is null keyword');
        }
        if (!keywords.includes(keyword)) {
            throw new Error("invalid keyword, keyword: " + keyword + ", expected keywords: " + keywords);
        }
        this.checkToken(constants_1.TOKEN_TYPE.KEYWORD);
        this.writeElement('keyword', keyword);
        this.jackTokenizer.advance();
    };
    CompilationEngine.prototype.compileSymbol = function (symbols) {
        var symbol = this.jackTokenizer.symbol();
        if (symbol === null) {
            throw new Error('is null symbol');
        }
        if (!symbols.includes(symbol)) {
            throw new Error("invalid symbol, symbol: " + symbol + ", expected symbols: " + symbols + ", currentToken: " + this.jackTokenizer.currentToken);
        }
        this.checkToken(constants_1.TOKEN_TYPE.SYMBOL);
        if (this.jackTokenizer.currentToken === '<') {
            symbol = '&lt;';
        }
        else if (this.jackTokenizer.currentToken === '>') {
            symbol = '&gt;';
        }
        else if (this.jackTokenizer.currentToken === '&') {
            symbol = '&amp;';
        }
        this.writeElement('symbol', symbol);
        this.jackTokenizer.advance();
    };
    CompilationEngine.prototype.compileIntegerConstant = function () {
        this.checkToken(constants_1.TOKEN_TYPE.INT_CONST);
        var intVal = this.jackTokenizer.intVal();
        if (intVal === null) {
            throw new Error('is null intVal');
        }
        this.writeElement('integerConstant', intVal);
        this.jackTokenizer.advance();
    };
    CompilationEngine.prototype.compileStringConstant = function () {
        this.checkToken(constants_1.TOKEN_TYPE.STRING_CONST);
        var stringVal = this.jackTokenizer.stringVal();
        if (stringVal === null) {
            throw new Error('is null stringVal');
        }
        this.writeElement('stringConstant', stringVal);
        this.jackTokenizer.advance();
    };
    CompilationEngine.prototype.compileIdentifier = function () {
        this.checkToken(constants_1.TOKEN_TYPE.IDENTIFIER);
        var identifierVal = this.jackTokenizer.identifier();
        if (identifierVal === null) {
            throw new Error('is null identifierVal');
        }
        this.writeElement('identifier', identifierVal);
        this.jackTokenizer.advance();
    };
    CompilationEngine.prototype.checkToken = function (type) {
        var token = this.jackTokenizer.currentToken;
        var tokenType = this.jackTokenizer.tokenType();
        if (type !== tokenType) {
            throw new Error("invalid token, token: " + token + ", tokenType: " + tokenType + ", expected type: " + type);
        }
    };
    CompilationEngine.prototype.compileClass = function () {
        this.writeElementStart('class');
        this.compileKeyword([constants_1.KEYWORDS.CLASS]);
        this.compileIdentifier();
        this.compileSymbol([constants_1.SYMBOLS.LEFT_CURLY_BRACKET]);
        while ([constants_1.KEYWORDS.STATIC, constants_1.KEYWORDS.FIELD].includes(this.jackTokenizer.currentToken)) {
            this.compileClassVarDec();
        }
        while ([constants_1.KEYWORDS.CONSTRUCTOR, constants_1.KEYWORDS.FUNCTION, constants_1.KEYWORDS.METHOD].includes(this.jackTokenizer.currentToken)) {
            this.compileSubroutine();
        }
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_CURLY_BRACKET]);
        this.writeElementEnd('class');
    };
    CompilationEngine.prototype.compileClassVarDec = function () {
        this.writeElementStart('classVarDec');
        this.compileKeyword([constants_1.KEYWORDS.STATIC, constants_1.KEYWORDS.FIELD]);
        this.compileType();
        this.compileIdentifier();
        while (this.jackTokenizer.currentToken !== constants_1.SYMBOLS.SEMI_COLON) {
            this.compileSymbol([constants_1.SYMBOLS.COMMA]);
            this.compileIdentifier();
        }
        this.compileSymbol([constants_1.SYMBOLS.SEMI_COLON]);
        this.writeElementEnd('classVarDec');
    };
    CompilationEngine.prototype.compileType = function () {
        if ([constants_1.KEYWORDS.INT, constants_1.KEYWORDS.CHAR, constants_1.KEYWORDS.BOOLEAN].includes(this.jackTokenizer.currentToken)) {
            this.compileKeyword([constants_1.KEYWORDS.INT, constants_1.KEYWORDS.CHAR, constants_1.KEYWORDS.BOOLEAN]);
        }
        else {
            this.compileIdentifier();
        }
    };
    CompilationEngine.prototype.compileSubroutine = function () {
        this.writeElementStart('subroutineDec');
        this.compileKeyword([constants_1.KEYWORDS.CONSTRUCTOR, constants_1.KEYWORDS.FUNCTION, constants_1.KEYWORDS.METHOD]);
        if (this.jackTokenizer.currentToken === constants_1.KEYWORDS.VOID) {
            this.compileKeyword([constants_1.KEYWORDS.CONSTRUCTOR, constants_1.KEYWORDS.FUNCTION, constants_1.KEYWORDS.METHOD, constants_1.KEYWORDS.VOID]);
        }
        else {
            this.compileType();
        }
        this.compileIdentifier();
        this.compileSymbol([constants_1.SYMBOLS.LEFT_ROUND_BRACKET]);
        this.compileParameterList();
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_ROUND_BRACKET]);
        this.compileSubroutineBody();
        this.writeElementEnd('subroutineDec');
    };
    CompilationEngine.prototype.compileParameterList = function () {
        this.writeElementStart('parameterList');
        while ([constants_1.KEYWORDS.INT, constants_1.KEYWORDS.CHAR, constants_1.KEYWORDS.BOOLEAN].includes(this.jackTokenizer.currentToken) || this.jackTokenizer.tokenType() === constants_1.TOKEN_TYPE.IDENTIFIER) {
            this.compileType();
            this.compileIdentifier();
            while (this.jackTokenizer.currentToken === constants_1.SYMBOLS.COMMA) {
                this.compileSymbol([constants_1.SYMBOLS.COMMA]);
                this.compileType();
                this.compileIdentifier();
            }
        }
        this.writeElementEnd('parameterList');
    };
    CompilationEngine.prototype.compileSubroutineBody = function () {
        this.writeElementStart('subroutineBody');
        this.compileSymbol([constants_1.SYMBOLS.LEFT_CURLY_BRACKET]);
        while (this.jackTokenizer.currentToken === constants_1.KEYWORDS.VAR) {
            this.compileVarDec();
        }
        this.compileStatements();
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_CURLY_BRACKET]);
        this.writeElementEnd('subroutineBody');
    };
    CompilationEngine.prototype.compileVarDec = function () {
        this.writeElementStart('varDec');
        this.compileKeyword([constants_1.KEYWORDS.VAR]);
        this.compileType();
        this.compileIdentifier();
        while (this.jackTokenizer.currentToken === constants_1.SYMBOLS.COMMA) {
            this.compileSymbol([constants_1.SYMBOLS.COMMA]);
            this.compileIdentifier();
        }
        this.compileSymbol([constants_1.SYMBOLS.SEMI_COLON]);
        this.writeElementEnd('varDec');
    };
    CompilationEngine.prototype.compileStatements = function () {
        this.writeElementStart('statements');
        while ([constants_1.KEYWORDS.LET, constants_1.KEYWORDS.IF, constants_1.KEYWORDS.WHILE, constants_1.KEYWORDS.DO, constants_1.KEYWORDS.RETURN].includes(this.jackTokenizer.currentToken)) {
            if (this.jackTokenizer.currentToken === constants_1.KEYWORDS.LET) {
                this.compileLet();
            }
            else if (this.jackTokenizer.currentToken === constants_1.KEYWORDS.IF) {
                this.compileIf();
            }
            else if (this.jackTokenizer.currentToken === constants_1.KEYWORDS.WHILE) {
                this.compileWhile();
            }
            else if (this.jackTokenizer.currentToken === constants_1.KEYWORDS.DO) {
                this.compileDo();
            }
            else if (this.jackTokenizer.currentToken === constants_1.KEYWORDS.RETURN) {
                this.compileReturn();
            }
            else {
                throw new Error("invalid statement, currentToken: " + this.jackTokenizer.currentToken);
            }
        }
        this.writeElementEnd('statements');
    };
    CompilationEngine.prototype.compileDo = function () {
        this.writeElementStart('doStatement');
        this.compileKeyword([constants_1.KEYWORDS.DO]);
        this.compileSubroutineCall();
        this.compileSymbol([constants_1.SYMBOLS.SEMI_COLON]);
        this.writeElementEnd('doStatement');
    };
    CompilationEngine.prototype.compileLet = function () {
        this.writeElementStart('letStatement');
        this.compileKeyword([constants_1.KEYWORDS.LET]);
        this.compileIdentifier();
        while (this.jackTokenizer.currentToken !== constants_1.SYMBOLS.EQUAL) {
            this.compileSymbol([constants_1.SYMBOLS.LEFT_SQUARE_BRACKET]);
            this.compileExpression();
            this.compileSymbol([constants_1.SYMBOLS.RIGHT_SQUARE_BRACKET]);
        }
        this.compileSymbol([constants_1.SYMBOLS.EQUAL]);
        this.compileExpression();
        this.compileSymbol([constants_1.SYMBOLS.SEMI_COLON]);
        this.writeElementEnd('letStatement');
    };
    CompilationEngine.prototype.compileWhile = function () {
        this.writeElementStart('whileStatement');
        this.compileKeyword([constants_1.KEYWORDS.WHILE]);
        this.compileSymbol([constants_1.SYMBOLS.LEFT_ROUND_BRACKET]);
        this.compileExpression();
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_ROUND_BRACKET]);
        this.compileSymbol([constants_1.SYMBOLS.LEFT_CURLY_BRACKET]);
        this.compileStatements();
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_CURLY_BRACKET]);
        this.writeElementEnd('whileStatement');
    };
    CompilationEngine.prototype.compileReturn = function () {
        this.writeElementStart('returnStatement');
        this.compileKeyword([constants_1.KEYWORDS.RETURN]);
        while (this.jackTokenizer.currentToken !== constants_1.SYMBOLS.SEMI_COLON) {
            this.compileExpression();
        }
        this.compileSymbol([constants_1.SYMBOLS.SEMI_COLON]);
        this.writeElementEnd('returnStatement');
    };
    CompilationEngine.prototype.compileIf = function () {
        this.writeElementStart('ifStatement');
        this.compileKeyword([constants_1.KEYWORDS.IF]);
        this.compileSymbol([constants_1.SYMBOLS.LEFT_ROUND_BRACKET]);
        this.compileExpression();
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_ROUND_BRACKET]);
        this.compileSymbol([constants_1.SYMBOLS.LEFT_CURLY_BRACKET]);
        this.compileStatements();
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_CURLY_BRACKET]);
        if (this.jackTokenizer.currentToken === constants_1.KEYWORDS.ELSE) {
            this.compileKeyword([constants_1.KEYWORDS.ELSE]);
            this.compileSymbol([constants_1.SYMBOLS.LEFT_CURLY_BRACKET]);
            this.compileStatements();
            this.compileSymbol([constants_1.SYMBOLS.RIGHT_CURLY_BRACKET]);
        }
        this.writeElementEnd('ifStatement');
    };
    CompilationEngine.prototype.compileSubroutineCall = function () {
        this.compileIdentifier();
        if (this.jackTokenizer.currentToken === constants_1.SYMBOLS.PERIOD) {
            this.compileSymbol([constants_1.SYMBOLS.PERIOD]);
            this.compileIdentifier();
        }
        this.compileSymbol([constants_1.SYMBOLS.LEFT_ROUND_BRACKET]);
        this.compileExpressionList();
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_ROUND_BRACKET]);
    };
    CompilationEngine.prototype.compileExpressionList = function () {
        this.writeElementStart('expressionList');
        while (this.jackTokenizer.currentToken !== constants_1.SYMBOLS.RIGHT_ROUND_BRACKET) {
            this.compileExpression();
            while (this.jackTokenizer.currentToken === constants_1.SYMBOLS.COMMA) {
                this.compileSymbol([constants_1.SYMBOLS.COMMA]);
                this.compileExpression();
            }
        }
        this.writeElementEnd('expressionList');
    };
    CompilationEngine.prototype.compileExpression = function () {
        this.writeElementStart('expression');
        this.compileTerm();
        while ([
            constants_1.SYMBOLS.PLUS_SIGN,
            constants_1.SYMBOLS.HYPHEN,
            constants_1.SYMBOLS.ASTERISK,
            constants_1.SYMBOLS.SLASH,
            constants_1.SYMBOLS.AMPERSAND,
            constants_1.SYMBOLS.VERTICAL_LINE,
            constants_1.SYMBOLS.LESS_THAN_SIGN,
            constants_1.SYMBOLS.GREATER_THAN_SIGN,
            constants_1.SYMBOLS.EQUAL
        ].includes(this.jackTokenizer.currentToken)) {
            this.compileSymbol([
                constants_1.SYMBOLS.PLUS_SIGN,
                constants_1.SYMBOLS.HYPHEN,
                constants_1.SYMBOLS.ASTERISK,
                constants_1.SYMBOLS.SLASH,
                constants_1.SYMBOLS.AMPERSAND,
                constants_1.SYMBOLS.VERTICAL_LINE,
                constants_1.SYMBOLS.LESS_THAN_SIGN,
                constants_1.SYMBOLS.GREATER_THAN_SIGN,
                constants_1.SYMBOLS.EQUAL
            ]);
            this.compileTerm();
        }
        this.writeElementEnd('expression');
    };
    CompilationEngine.prototype.compileTerm = function () {
        this.writeElementStart('term');
        if (this.jackTokenizer.tokenType() === constants_1.TOKEN_TYPE.INT_CONST) {
            this.compileIntegerConstant();
        }
        else if (this.jackTokenizer.tokenType() === constants_1.TOKEN_TYPE.STRING_CONST) {
            this.compileStringConstant();
        }
        else if ([constants_1.KEYWORDS.TRUE, constants_1.KEYWORDS.FALSE, constants_1.KEYWORDS.NULL, constants_1.KEYWORDS.THIS].includes(this.jackTokenizer.currentToken)) {
            this.compileKeyword([constants_1.KEYWORDS.TRUE, constants_1.KEYWORDS.FALSE, constants_1.KEYWORDS.NULL, constants_1.KEYWORDS.THIS]);
        }
        else if (this.jackTokenizer.tokenType() === constants_1.TOKEN_TYPE.IDENTIFIER) {
            this.compileIdentifier();
            if (this.jackTokenizer.currentToken === constants_1.SYMBOLS.LEFT_SQUARE_BRACKET) {
                this.compileSymbol([constants_1.SYMBOLS.LEFT_SQUARE_BRACKET]);
                this.compileExpression();
                this.compileSymbol([constants_1.SYMBOLS.RIGHT_SQUARE_BRACKET]);
            }
            else if (this.jackTokenizer.currentToken === constants_1.SYMBOLS.LEFT_ROUND_BRACKET) {
                this.compileSymbol([constants_1.SYMBOLS.LEFT_ROUND_BRACKET]);
                this.compileExpressionList();
                this.compileSymbol([constants_1.SYMBOLS.RIGHT_ROUND_BRACKET]);
            }
            else if (this.jackTokenizer.currentToken === constants_1.SYMBOLS.PERIOD) {
                this.compileSymbol([constants_1.SYMBOLS.PERIOD]);
                this.compileIdentifier();
                this.compileSymbol([constants_1.SYMBOLS.LEFT_ROUND_BRACKET]);
                this.compileExpressionList();
                this.compileSymbol([constants_1.SYMBOLS.RIGHT_ROUND_BRACKET]);
            }
        }
        else if (this.jackTokenizer.currentToken === constants_1.SYMBOLS.LEFT_ROUND_BRACKET) {
            this.compileSymbol([constants_1.SYMBOLS.LEFT_ROUND_BRACKET]);
            this.compileExpression();
            this.compileSymbol([constants_1.SYMBOLS.RIGHT_ROUND_BRACKET]);
        }
        else if ([constants_1.SYMBOLS.HYPHEN, constants_1.SYMBOLS.TILDE].includes(this.jackTokenizer.currentToken)) {
            this.compileSymbol([constants_1.SYMBOLS.HYPHEN, constants_1.SYMBOLS.TILDE]);
            this.compileTerm();
        }
        else {
            throw new Error("invalid term: " + this.jackTokenizer.currentToken);
        }
        this.writeElementEnd('term');
    };
    return CompilationEngine;
}());
exports.default = CompilationEngine;
