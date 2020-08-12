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
var symbalTable_1 = __importDefault(require("./symbalTable"));
var vmWriter_1 = __importDefault(require("./vmWriter"));
var constants_1 = require("./constants");
var CompilationEngine = /** @class */ (function () {
    function CompilationEngine(inputFilePath, outputFilePath) {
        this.jackTokenizer = new jackTokenizer_1.default(inputFilePath);
        this.symbolTable = new symbalTable_1.default();
        this.vmWriter = new vmWriter_1.default(outputFilePath);
        this.outputFilePathForVM = outputFilePath;
        this.outputFilePathForXML = outputFilePath.slice(0, -3) + '.xml';
        fs.writeFileSync(this.outputFilePathForXML, '');
        this.className = '';
        this.indentCount = 0;
        this.labelCount = 0;
        this.compileClass();
    }
    CompilationEngine.prototype.writeElement = function (tagName, value) {
        var indent = '  '.repeat(this.indentCount);
        fs.appendFileSync(this.outputFilePathForXML, indent + "<" + tagName + "> " + value + " </" + tagName + ">" + '\n');
    };
    CompilationEngine.prototype.writeIdentifier = function (name, isDefined) {
        var indent = '  '.repeat(this.indentCount);
        var kind = this.symbolTable.kindOf(name);
        var type = this.symbolTable.typeOf(name);
        var index = this.symbolTable.indexOf(name);
        var info = "isDefined: " + isDefined + ", type: " + type + ", kind: " + kind + ", index: " + index;
        fs.appendFileSync(this.outputFilePathForXML, indent + "<identifier> " + name + " </identifier> " + info + '\n');
    };
    CompilationEngine.prototype.writeElementStart = function (tagName) {
        var indent = '  '.repeat(this.indentCount);
        fs.appendFileSync(this.outputFilePathForXML, indent + "<" + tagName + ">" + '\n');
        this.indentCount = this.indentCount + 1;
    };
    CompilationEngine.prototype.writeElementEnd = function (tagName) {
        this.indentCount = this.indentCount - 1;
        var indent = '  '.repeat(this.indentCount);
        fs.appendFileSync(this.outputFilePathForXML, indent + "</" + tagName + ">" + '\n');
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
        this.vmWriter.writePush(constants_1.SEGMENT.CONST, stringVal.length);
        this.vmWriter.writeCall('String.new', 1);
        for (var i = 0; i < stringVal.length; i++) {
            this.vmWriter.writePush(constants_1.SEGMENT.CONST, stringVal.charCodeAt(i));
            this.vmWriter.writeCall('String.appendChar', 2);
        }
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
    CompilationEngine.prototype.compileVarName = function (isDefined, type, kind, shouldWritePush) {
        if (type === void 0) { type = null; }
        if (kind === void 0) { kind = null; }
        if (shouldWritePush === void 0) { shouldWritePush = false; }
        this.checkToken(constants_1.TOKEN_TYPE.IDENTIFIER);
        var name = this.jackTokenizer.identifier();
        if (name === null) {
            throw new Error('is null name');
        }
        if (isDefined) { // classVarDec, parameterList, varDec
            if (type === null)
                throw new Error('invalid type is null');
            if (kind === null)
                throw new Error('invalid kind is null');
            this.symbolTable.define(name, type, kind);
        }
        else if (shouldWritePush) { // term
            kind = this.symbolTable.kindOf(name);
            var index = this.symbolTable.indexOf(name);
            if (shouldWritePush) {
                var segment = '';
                if (kind === constants_1.KIND.STATIC) {
                    segment = constants_1.SEGMENT.STATIC;
                }
                else if (kind === constants_1.KIND.FIELD) {
                    segment = constants_1.SEGMENT.THIS;
                }
                else if (kind === constants_1.KIND.ARGUMENT) {
                    segment = constants_1.SEGMENT.ARGUMENT;
                }
                else if (kind === constants_1.KIND.VAR) {
                    segment = constants_1.SEGMENT.LOCAL;
                }
                this.vmWriter.writePush(segment, index);
            }
        } // else: subroutineCall, compileLet
        this.writeIdentifier(name, isDefined);
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
        this.className = this.jackTokenizer.currentToken;
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
        var kind = this.jackTokenizer.currentToken;
        this.compileKeyword([constants_1.KEYWORDS.STATIC, constants_1.KEYWORDS.FIELD]);
        var type = this.jackTokenizer.currentToken;
        this.compileType();
        this.compileVarName(true, type, kind);
        while (this.jackTokenizer.currentToken !== constants_1.SYMBOLS.SEMI_COLON) {
            this.compileSymbol([constants_1.SYMBOLS.COMMA]);
            this.compileVarName(true, type, kind);
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
        this.symbolTable.startSubroutine();
        this.writeElementStart('subroutineDec');
        var subroutineKeyword = this.jackTokenizer.currentToken;
        if (subroutineKeyword === constants_1.KEYWORDS.METHOD) {
            this.symbolTable.define('this', this.className, constants_1.SEGMENT.ARGUMENT);
        }
        this.compileKeyword([constants_1.KEYWORDS.CONSTRUCTOR, constants_1.KEYWORDS.FUNCTION, constants_1.KEYWORDS.METHOD]);
        if (this.jackTokenizer.currentToken === constants_1.KEYWORDS.VOID) {
            this.compileKeyword([constants_1.KEYWORDS.CONSTRUCTOR, constants_1.KEYWORDS.FUNCTION, constants_1.KEYWORDS.METHOD, constants_1.KEYWORDS.VOID]);
        }
        else {
            this.compileType();
        }
        var functionName = this.className + '.' + this.jackTokenizer.currentToken;
        this.compileIdentifier();
        this.compileSymbol([constants_1.SYMBOLS.LEFT_ROUND_BRACKET]);
        this.compileParameterList();
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_ROUND_BRACKET]);
        this.compileSubroutineBody(functionName, subroutineKeyword);
        this.writeElementEnd('subroutineDec');
    };
    CompilationEngine.prototype.compileParameterList = function () {
        this.writeElementStart('parameterList');
        while ([constants_1.KEYWORDS.INT, constants_1.KEYWORDS.CHAR, constants_1.KEYWORDS.BOOLEAN].includes(this.jackTokenizer.currentToken) || this.jackTokenizer.tokenType() === constants_1.TOKEN_TYPE.IDENTIFIER) {
            var type = this.jackTokenizer.currentToken;
            this.compileType();
            this.compileVarName(true, type, constants_1.KIND.ARGUMENT);
            while (this.jackTokenizer.currentToken === constants_1.SYMBOLS.COMMA) {
                this.compileSymbol([constants_1.SYMBOLS.COMMA]);
                var type_1 = this.jackTokenizer.currentToken;
                this.compileType();
                this.compileVarName(true, type_1, constants_1.KIND.ARGUMENT);
            }
        }
        this.writeElementEnd('parameterList');
    };
    CompilationEngine.prototype.compileSubroutineBody = function (functionName, subroutineKeyword) {
        this.writeElementStart('subroutineBody');
        this.compileSymbol([constants_1.SYMBOLS.LEFT_CURLY_BRACKET]);
        this.vmWriter.writeFunction(functionName, 0);
        if (subroutineKeyword === constants_1.KEYWORDS.CONSTRUCTOR) {
            this.vmWriter.writePush(constants_1.SEGMENT.CONST, this.symbolTable.varCount(constants_1.KIND.FIELD));
            this.vmWriter.writeCall('Memory.alloc', 1);
            this.vmWriter.writePop(constants_1.SEGMENT.POINTER, 0);
        }
        else if (subroutineKeyword === constants_1.KEYWORDS.METHOD) {
            this.vmWriter.writePush(constants_1.SEGMENT.ARGUMENT, 0);
            this.vmWriter.writePop(constants_1.SEGMENT.POINTER, 0);
        }
        var nLocals = 0;
        while (this.jackTokenizer.currentToken === constants_1.KEYWORDS.VAR) {
            var varNum = this.compileVarDec();
            nLocals = nLocals + varNum;
        }
        // update function's nLocals
        if (nLocals !== 0) {
            var fileContent = fs.readFileSync(this.outputFilePathForVM, { encoding: "utf-8" });
            var newContent = fileContent.replace(functionName + " 0", functionName + " " + nLocals);
            fs.writeFileSync(this.outputFilePathForVM, newContent);
        }
        this.compileStatements();
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_CURLY_BRACKET]);
        this.writeElementEnd('subroutineBody');
    };
    CompilationEngine.prototype.compileVarDec = function () {
        this.writeElementStart('varDec');
        this.compileKeyword([constants_1.KEYWORDS.VAR]);
        var type = this.jackTokenizer.currentToken;
        this.compileType();
        this.compileVarName(true, type, constants_1.KIND.VAR);
        var varNum = 1;
        while (this.jackTokenizer.currentToken === constants_1.SYMBOLS.COMMA) {
            varNum = varNum + 1;
            this.compileSymbol([constants_1.SYMBOLS.COMMA]);
            this.compileVarName(true, type, constants_1.KIND.VAR);
        }
        this.compileSymbol([constants_1.SYMBOLS.SEMI_COLON]);
        this.writeElementEnd('varDec');
        return varNum;
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
        this.vmWriter.writePop(constants_1.SEGMENT.TEMP, 0);
        this.writeElementEnd('doStatement');
    };
    CompilationEngine.prototype.compileLet = function () {
        this.writeElementStart('letStatement');
        this.compileKeyword([constants_1.KEYWORDS.LET]);
        var name = this.jackTokenizer.currentToken;
        this.compileVarName(false);
        var kind = this.symbolTable.kindOf(name);
        var index = this.symbolTable.indexOf(name);
        if (this.jackTokenizer.currentToken !== constants_1.SYMBOLS.EQUAL) { // varName[]
            this.compileSymbol([constants_1.SYMBOLS.LEFT_SQUARE_BRACKET]);
            this.compileExpression(); // push i
            this.compileSymbol([constants_1.SYMBOLS.RIGHT_SQUARE_BRACKET]);
            if (kind === constants_1.KIND.STATIC) {
                this.vmWriter.writePush(constants_1.SEGMENT.STATIC, index);
            }
            else if (kind === constants_1.KIND.FIELD) {
                this.vmWriter.writePush(constants_1.SEGMENT.THIS, index);
            }
            else if (kind === constants_1.KIND.ARGUMENT) {
                this.vmWriter.writePush(constants_1.SEGMENT.ARGUMENT, index);
            }
            else if (kind === constants_1.KIND.VAR) {
                this.vmWriter.writePush(constants_1.SEGMENT.LOCAL, index);
            }
            this.vmWriter.writeArithmetic(constants_1.COMMAND.ADD);
            this.compileSymbol([constants_1.SYMBOLS.EQUAL]);
            this.compileExpression();
            this.vmWriter.writePop(constants_1.SEGMENT.TEMP, 0);
            this.vmWriter.writePop(constants_1.SEGMENT.POINTER, 1);
            this.vmWriter.writePush(constants_1.SEGMENT.TEMP, 0);
            this.vmWriter.writePop(constants_1.SEGMENT.THAT, 0);
        }
        else { // varName
            this.compileSymbol([constants_1.SYMBOLS.EQUAL]);
            this.compileExpression();
            if (kind === constants_1.KIND.STATIC) {
                this.vmWriter.writePop(constants_1.SEGMENT.STATIC, index);
            }
            else if (kind === constants_1.KIND.FIELD) {
                this.vmWriter.writePop(constants_1.SEGMENT.THIS, index);
            }
            else if (kind === constants_1.KIND.ARGUMENT) {
                this.vmWriter.writePop(constants_1.SEGMENT.ARGUMENT, index);
            }
            else if (kind === constants_1.KIND.VAR) {
                this.vmWriter.writePop(constants_1.SEGMENT.LOCAL, index);
            }
        }
        this.compileSymbol([constants_1.SYMBOLS.SEMI_COLON]);
        this.writeElementEnd('letStatement');
    };
    CompilationEngine.prototype.compileWhile = function () {
        this.writeElementStart('whileStatement');
        var labelLoop = "WHILE_LOOP_" + this.labelCount;
        var labelEnd = "WHILE_END_" + this.labelCount;
        this.labelCount = this.labelCount + 1;
        this.vmWriter.writeLabel(labelLoop);
        this.compileKeyword([constants_1.KEYWORDS.WHILE]);
        this.compileSymbol([constants_1.SYMBOLS.LEFT_ROUND_BRACKET]);
        this.compileExpression();
        this.vmWriter.writeArithmetic(constants_1.COMMAND.NOT);
        this.vmWriter.writeIf(labelEnd);
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_ROUND_BRACKET]);
        this.compileSymbol([constants_1.SYMBOLS.LEFT_CURLY_BRACKET]);
        this.compileStatements();
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_CURLY_BRACKET]);
        this.vmWriter.writeGoto(labelLoop);
        this.vmWriter.writeLabel(labelEnd);
        this.writeElementEnd('whileStatement');
    };
    CompilationEngine.prototype.compileReturn = function () {
        this.writeElementStart('returnStatement');
        this.compileKeyword([constants_1.KEYWORDS.RETURN]);
        if (this.jackTokenizer.currentToken !== constants_1.SYMBOLS.SEMI_COLON) {
            this.compileExpression();
        }
        else {
            this.vmWriter.writePush(constants_1.SEGMENT.CONST, 0);
        }
        this.compileSymbol([constants_1.SYMBOLS.SEMI_COLON]);
        this.vmWriter.writeReturn();
        this.writeElementEnd('returnStatement');
    };
    CompilationEngine.prototype.compileIf = function () {
        this.writeElementStart('ifStatement');
        var labelElse = "IF_ELSE_" + this.labelCount;
        var labelEnd = "IF_END_" + this.labelCount;
        this.labelCount = this.labelCount + 1;
        this.compileKeyword([constants_1.KEYWORDS.IF]);
        this.compileSymbol([constants_1.SYMBOLS.LEFT_ROUND_BRACKET]);
        this.compileExpression();
        this.vmWriter.writeArithmetic(constants_1.COMMAND.NOT);
        this.vmWriter.writeIf(labelElse);
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_ROUND_BRACKET]);
        this.compileSymbol([constants_1.SYMBOLS.LEFT_CURLY_BRACKET]);
        this.compileStatements();
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_CURLY_BRACKET]);
        this.vmWriter.writeGoto(labelEnd);
        this.vmWriter.writeLabel(labelElse);
        if (this.jackTokenizer.currentToken === constants_1.KEYWORDS.ELSE) {
            this.compileKeyword([constants_1.KEYWORDS.ELSE]);
            this.compileSymbol([constants_1.SYMBOLS.LEFT_CURLY_BRACKET]);
            this.compileStatements();
            this.compileSymbol([constants_1.SYMBOLS.RIGHT_CURLY_BRACKET]);
        }
        this.vmWriter.writeLabel(labelEnd);
        this.writeElementEnd('ifStatement');
    };
    CompilationEngine.prototype.compileSubroutineCall = function () {
        var name = this.jackTokenizer.currentToken;
        var nArgs = 0;
        var kind = this.symbolTable.kindOf(name);
        if (kind !== constants_1.KIND.NONE) { // pattern1: varName.subroutineName
            var type = this.symbolTable.typeOf(name);
            var index = this.symbolTable.indexOf(name);
            nArgs = nArgs + 1;
            if (kind === constants_1.KIND.STATIC) {
                this.vmWriter.writePush(constants_1.SEGMENT.STATIC, index);
            }
            else if (kind === constants_1.KIND.FIELD) {
                this.vmWriter.writePush(constants_1.SEGMENT.THIS, index);
            }
            else if (kind === constants_1.KIND.ARGUMENT) {
                this.vmWriter.writePush(constants_1.SEGMENT.ARGUMENT, index);
            }
            else if (kind === constants_1.KIND.VAR) {
                this.vmWriter.writePush(constants_1.SEGMENT.LOCAL, index);
            }
            this.compileVarName(false);
            this.compileSymbol([constants_1.SYMBOLS.PERIOD]);
            name = type + '.' + this.jackTokenizer.currentToken;
            this.compileIdentifier();
        }
        else {
            this.compileIdentifier();
            if (this.jackTokenizer.currentToken === constants_1.SYMBOLS.PERIOD) { // pattern2: className.subroutineName
                this.compileSymbol([constants_1.SYMBOLS.PERIOD]);
                name = name + '.' + this.jackTokenizer.currentToken;
                this.compileIdentifier();
            }
            else { // pattern3: subroutineName
                this.vmWriter.writePush(constants_1.SEGMENT.POINTER, 0);
                name = this.className + '.' + name;
                nArgs = nArgs + 1;
            }
        }
        this.compileSymbol([constants_1.SYMBOLS.LEFT_ROUND_BRACKET]);
        nArgs = nArgs + this.compileExpressionList();
        this.compileSymbol([constants_1.SYMBOLS.RIGHT_ROUND_BRACKET]);
        this.vmWriter.writeCall(name, nArgs);
    };
    CompilationEngine.prototype.compileExpressionList = function () {
        this.writeElementStart('expressionList');
        var nArgs = 0;
        if (this.jackTokenizer.currentToken !== constants_1.SYMBOLS.RIGHT_ROUND_BRACKET) {
            nArgs = 1;
            this.compileExpression();
            while (this.jackTokenizer.currentToken === constants_1.SYMBOLS.COMMA) {
                this.compileSymbol([constants_1.SYMBOLS.COMMA]);
                this.compileExpression();
                nArgs = nArgs + 1;
            }
        }
        this.writeElementEnd('expressionList');
        return nArgs;
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
            var symbol = this.jackTokenizer.currentToken;
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
            if (symbol === constants_1.SYMBOLS.PLUS_SIGN) {
                this.vmWriter.writeArithmetic(constants_1.COMMAND.ADD);
            }
            else if (symbol === constants_1.SYMBOLS.HYPHEN) {
                this.vmWriter.writeArithmetic(constants_1.COMMAND.SUB);
            }
            else if (symbol === constants_1.SYMBOLS.ASTERISK) {
                this.vmWriter.writeCall('Math.multiply', 2);
            }
            else if (symbol === constants_1.SYMBOLS.SLASH) {
                this.vmWriter.writeCall('Math.divide', 2);
            }
            else if (symbol === constants_1.SYMBOLS.AMPERSAND) {
                this.vmWriter.writeArithmetic(constants_1.COMMAND.AND);
            }
            else if (symbol === constants_1.SYMBOLS.VERTICAL_LINE) {
                this.vmWriter.writeArithmetic(constants_1.COMMAND.OR);
            }
            else if (symbol === constants_1.SYMBOLS.LESS_THAN_SIGN) {
                this.vmWriter.writeArithmetic(constants_1.COMMAND.LT);
            }
            else if (symbol === constants_1.SYMBOLS.GREATER_THAN_SIGN) {
                this.vmWriter.writeArithmetic(constants_1.COMMAND.GT);
            }
            else if (symbol === constants_1.SYMBOLS.EQUAL) {
                this.vmWriter.writeArithmetic(constants_1.COMMAND.EQ);
            }
        }
        this.writeElementEnd('expression');
    };
    CompilationEngine.prototype.compileTerm = function () {
        this.writeElementStart('term');
        if (this.jackTokenizer.tokenType() === constants_1.TOKEN_TYPE.INT_CONST) {
            var index = Number(this.jackTokenizer.currentToken);
            this.vmWriter.writePush(constants_1.SEGMENT.CONST, index);
            this.compileIntegerConstant();
        }
        else if (this.jackTokenizer.tokenType() === constants_1.TOKEN_TYPE.STRING_CONST) {
            this.compileStringConstant();
        }
        else if (this.jackTokenizer.currentToken === constants_1.KEYWORDS.TRUE) {
            this.vmWriter.writePush(constants_1.SEGMENT.CONST, 1);
            this.vmWriter.writeArithmetic(constants_1.COMMAND.NEG);
            this.compileKeyword([constants_1.KEYWORDS.TRUE]);
        }
        else if (this.jackTokenizer.currentToken === constants_1.KEYWORDS.FALSE) {
            this.vmWriter.writePush(constants_1.SEGMENT.CONST, 0);
            this.compileKeyword([constants_1.KEYWORDS.FALSE]);
        }
        else if (this.jackTokenizer.currentToken === constants_1.KEYWORDS.NULL) {
            this.vmWriter.writePush(constants_1.SEGMENT.CONST, 0);
            this.compileKeyword([constants_1.KEYWORDS.NULL]);
        }
        else if (this.jackTokenizer.currentToken === constants_1.KEYWORDS.THIS) {
            this.vmWriter.writePush(constants_1.SEGMENT.POINTER, 0);
            this.compileKeyword([constants_1.KEYWORDS.THIS]);
        }
        else if (this.jackTokenizer.tokenType() === constants_1.TOKEN_TYPE.IDENTIFIER) {
            var name_1 = this.jackTokenizer.currentToken;
            if (this.symbolTable.kindOf(name_1) !== constants_1.KIND.NONE) {
                this.compileVarName(false, null, null, true);
            }
            else {
                this.compileIdentifier();
            }
            if (this.jackTokenizer.currentToken === constants_1.SYMBOLS.LEFT_SQUARE_BRACKET) {
                this.compileSymbol([constants_1.SYMBOLS.LEFT_SQUARE_BRACKET]);
                this.compileExpression();
                this.compileSymbol([constants_1.SYMBOLS.RIGHT_SQUARE_BRACKET]);
                this.vmWriter.writeArithmetic(constants_1.COMMAND.ADD);
                this.vmWriter.writePop(constants_1.SEGMENT.POINTER, 1);
                this.vmWriter.writePush(constants_1.SEGMENT.THAT, 0);
            }
            else if (this.jackTokenizer.currentToken === constants_1.SYMBOLS.LEFT_ROUND_BRACKET) {
                this.compileSymbol([constants_1.SYMBOLS.LEFT_ROUND_BRACKET]);
                var nArgs = this.compileExpressionList();
                this.compileSymbol([constants_1.SYMBOLS.RIGHT_ROUND_BRACKET]);
                this.vmWriter.writeCall(name_1, nArgs);
            }
            else if (this.jackTokenizer.currentToken === constants_1.SYMBOLS.PERIOD) {
                this.compileSymbol([constants_1.SYMBOLS.PERIOD]);
                var nArgs = 0;
                if (this.symbolTable.kindOf(name_1) !== constants_1.KIND.NONE) {
                    name_1 = this.symbolTable.typeOf(name_1);
                    nArgs = 1;
                }
                name_1 = name_1 + '.' + this.jackTokenizer.currentToken;
                this.compileIdentifier();
                this.compileSymbol([constants_1.SYMBOLS.LEFT_ROUND_BRACKET]);
                nArgs = nArgs + this.compileExpressionList();
                this.compileSymbol([constants_1.SYMBOLS.RIGHT_ROUND_BRACKET]);
                this.vmWriter.writeCall(name_1, nArgs);
            }
        }
        else if (this.jackTokenizer.currentToken === constants_1.SYMBOLS.LEFT_ROUND_BRACKET) {
            this.compileSymbol([constants_1.SYMBOLS.LEFT_ROUND_BRACKET]);
            this.compileExpression();
            this.compileSymbol([constants_1.SYMBOLS.RIGHT_ROUND_BRACKET]);
        }
        else if (this.jackTokenizer.currentToken === constants_1.SYMBOLS.HYPHEN) {
            this.compileSymbol([constants_1.SYMBOLS.HYPHEN]);
            this.compileTerm();
            this.vmWriter.writeArithmetic(constants_1.COMMAND.NEG);
        }
        else if (this.jackTokenizer.currentToken === constants_1.SYMBOLS.TILDE) {
            this.compileSymbol([constants_1.SYMBOLS.TILDE]);
            this.compileTerm();
            this.vmWriter.writeArithmetic(constants_1.COMMAND.NOT);
        }
        else {
            throw new Error("invalid term: " + this.jackTokenizer.currentToken);
        }
        this.writeElementEnd('term');
    };
    return CompilationEngine;
}());
exports.default = CompilationEngine;
