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
var Parser = /** @class */ (function () {
    /**
     * 入力ファイルを展開しパースする準備を行う
     */
    function Parser(filePath) {
        var fileContent = fs.readFileSync(path.resolve(__dirname, filePath), { encoding: 'utf-8' });
        var lines = fileContent.replace(/ /g, '').split(/\n/);
        this.instructions = lines.filter(function (line) {
            return line !== '' && line.indexOf('//') !== 0;
        });
        this.lineCounter = 0;
        this.currentCommand = this.instructions[this.lineCounter];
    }
    /**
     * 入力にまだコマンドが存在するかどうかを判定する
     */
    Parser.prototype.hasMoreCommands = function () {
        return this.instructions.length > this.lineCounter;
    };
    /**
     * 次のコマンドを読み込んで現在のコマンドに変更する
     */
    Parser.prototype.advance = function () {
        if (!this.hasMoreCommands)
            return;
        this.lineCounter = this.lineCounter + 1;
        var command = this.instructions[this.lineCounter];
        if (!command)
            return;
        this.currentCommand = command.split('//')[0];
        return;
    };
    /**
     * 現コマンドの種類を返す
     */
    Parser.prototype.commandType = function () {
        if (this.currentCommand.indexOf('@') === 0) {
            return constants_1.A_COMMAND;
        }
        else if (this.currentCommand.indexOf('(') === 0) {
            return constants_1.L_COMMAND;
        }
        else {
            return constants_1.C_COMMAND;
        }
    };
    /**
     * 現コマンドのシンボルを返す
     */
    Parser.prototype.symbol = function () {
        if (this.commandType() === constants_1.C_COMMAND)
            throw new Error('commandType should be C_COMMAND when call symbol');
        var returnValue = '';
        if (this.commandType() === constants_1.A_COMMAND) {
            returnValue = this.currentCommand.slice(1);
        }
        if (this.commandType() === constants_1.L_COMMAND) {
            returnValue = this.currentCommand.slice(1, -1);
        }
        return returnValue;
    };
    /**
     * destニーモニックを返却する
     */
    Parser.prototype.dest = function () {
        if (this.commandType() !== constants_1.C_COMMAND) {
            throw new Error('commandType should be C_COMMAND when call dest');
        }
        if (this.currentCommand.indexOf(';') !== -1) {
            return null;
        }
        return this.currentCommand.split('=')[0];
    };
    /**
     * compニーモニックを返却する
     */
    Parser.prototype.comp = function () {
        if (this.commandType() !== constants_1.C_COMMAND) {
            throw new Error('commandType should be C_COMMAND when call comp');
        }
        if (this.currentCommand.indexOf(';') !== -1) {
            return this.currentCommand.split(';')[0];
        }
        return this.currentCommand.split('=')[1];
    };
    /**
     * jumpニーモニックを返却する
     */
    Parser.prototype.jump = function () {
        if (this.commandType() !== constants_1.C_COMMAND) {
            throw new Error('commandType should be C_COMMAND when call jump');
        }
        return this.currentCommand.split(';')[1];
    };
    return Parser;
}());
exports.default = Parser;
