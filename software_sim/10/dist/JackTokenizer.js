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
Object.defineProperty(exports, "__esModule", { value: true });
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var constants_1 = require("./constants");
var JackTokenizer = /** @class */ (function () {
    function JackTokenizer(filePath) {
        var _this = this;
        var fileContent = fs.readFileSync(path.resolve(__dirname, filePath), { encoding: 'utf-8' });
        // delete comments and empty lines
        while (fileContent.indexOf('/*') !== -1) { // type of /* */ comment
            var commentStartIndex = fileContent.indexOf('/*');
            var commentEndIndex = fileContent.indexOf('*/');
            fileContent = fileContent.slice(0, commentStartIndex) + fileContent.slice(commentEndIndex + 2);
        }
        var lines = fileContent.split(/\n/).filter(function (line) {
            return line.trim() !== '' && !line.trim().startsWith('//');
        });
        // delete comments for each lines
        var linesWithoutComments = lines.map(function (line) {
            return line.split('//')[0].trim();
        });
        // parse each lines
        this.tokens = [];
        var reg = /[\{\}\(\)\[\]\.,;\+\-\*\/&\|<>=~]/;
        var parserUnit = function (unit) {
            while (unit) {
                if (unit.match(reg)) {
                    var checkedUnit = unit.match(reg);
                    if (!checkedUnit) {
                        throw new Error("invalid unit is " + unit);
                    }
                    var index = Number(checkedUnit.index);
                    if (index !== 0) {
                        _this.tokens.push(unit.slice(0, index));
                    }
                    _this.tokens.push(unit.slice(index, index + 1));
                    unit = unit.slice(index + 1);
                }
                else {
                    _this.tokens.push(unit);
                    unit = '';
                }
            }
        };
        linesWithoutComments.forEach(function (line) {
            while (line) {
                var doubleQuoteIndex = line.indexOf('"');
                var spaceIndex = line.indexOf(' ');
                if (line.startsWith('"')) {
                    var index = line.indexOf('"', 1);
                    _this.tokens.push(line.slice(0, index + 1));
                    line = line.slice(index + 1).trim();
                }
                else if (doubleQuoteIndex !== -1 && spaceIndex !== -1 && doubleQuoteIndex < spaceIndex) {
                    var unit = line.slice(0, doubleQuoteIndex);
                    parserUnit(unit);
                    line = line.slice(doubleQuoteIndex).trim();
                }
                else if (spaceIndex !== -1) {
                    var unit = line.slice(0, spaceIndex);
                    parserUnit(unit);
                    line = line.slice(spaceIndex + 1).trim();
                }
                else {
                    parserUnit(line);
                    line = '';
                }
            }
        });
        this.tokenCounter = 0;
        this.currentToken = this.tokens[this.tokenCounter];
    }
    JackTokenizer.prototype.hasMoreTokens = function () {
        return this.tokens.length > this.tokenCounter;
    };
    JackTokenizer.prototype.advance = function () {
        if (!this.hasMoreTokens())
            return;
        this.tokenCounter++;
        this.currentToken = this.tokens[this.tokenCounter];
        return;
    };
    JackTokenizer.prototype.tokenType = function () {
        var rtnValue = '';
        if (Object.values(constants_1.KEYWORDS).includes(this.currentToken)) {
            rtnValue = constants_1.TOKEN_TYPE.KEYWORD;
        }
        else if (Object.values(constants_1.SYMBOLS).includes(this.currentToken)) {
            rtnValue = constants_1.TOKEN_TYPE.SYMBOL;
        }
        else if (this.currentToken.match(/^[0-9]+$/) && Number(this.currentToken) <= 32767) {
            rtnValue = constants_1.TOKEN_TYPE.INT_CONST;
        }
        else if (this.currentToken.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
            rtnValue = constants_1.TOKEN_TYPE.IDENTIFIER;
        }
        else if (this.currentToken.match(/^"[^"\n]*"$/)) {
            rtnValue = constants_1.TOKEN_TYPE.STRING_CONST;
        }
        else {
            throw new Error("invalid tokenType. currentToken: " + this.currentToken);
        }
        return rtnValue;
    };
    JackTokenizer.prototype.keyWord = function () {
        if (this.tokenType() !== constants_1.TOKEN_TYPE.KEYWORD)
            return null;
        return this.currentToken;
    };
    JackTokenizer.prototype.symbol = function () {
        if (this.tokenType() !== constants_1.TOKEN_TYPE.SYMBOL)
            return null;
        return this.currentToken;
    };
    JackTokenizer.prototype.identifier = function () {
        if (this.tokenType() !== constants_1.TOKEN_TYPE.IDENTIFIER)
            return null;
        return this.currentToken;
    };
    JackTokenizer.prototype.intVal = function () {
        if (this.tokenType() !== constants_1.TOKEN_TYPE.INT_CONST)
            return null;
        return this.currentToken;
    };
    JackTokenizer.prototype.stringVal = function () {
        if (this.tokenType() !== constants_1.TOKEN_TYPE.STRING_CONST)
            return null;
        return this.currentToken.slice(1, -1);
    };
    return JackTokenizer;
}());
exports.default = JackTokenizer;
