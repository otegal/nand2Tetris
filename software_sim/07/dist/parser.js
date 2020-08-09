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
     * 入力ファイル/ストリームを開き、パースする準備を行う
     */
    function Parser(filePath) {
        var fileContent = fs.readFileSync(path.resolve(__dirname, filePath), { encoding: 'utf-8' });
        var lines = fileContent.split(/\r\n/);
        this.instructions = lines.filter(function (line) {
            return line !== '' && line.indexOf("//") !== 0;
        });
        this.lineCounter = 0;
        this.currentCommand = this.instructions[this.lineCounter];
    }
    /**
     * 入力に置いて、さらにコマンドが存在するか？
     */
    Parser.prototype.hasMoreCommands = function () {
        return this.instructions.length > this.lineCounter;
    };
    /**
     * 入力から次のコマンドを読み込んで現コマンドにする
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
     * 現VMコマンドの種類を返す。算術コマンドの場合はC_ARITHMETICが返される
     */
    Parser.prototype.commandType = function () {
        var cmd = this.currentCommand;
        var returnString = '';
        if (cmd.indexOf('push') === 0) {
            returnString = constants_1.C_PUSH;
        }
        else if (cmd.indexOf('pop') === 0) {
            returnString = constants_1.C_POP;
        }
        else if (cmd.indexOf('label') === 0) {
            returnString = constants_1.C_LABEL;
        }
        else if (cmd.indexOf('goto') === 0) {
            returnString = constants_1.C_GOTO;
        }
        else if (cmd.indexOf('if-goto') === 0) {
            returnString = constants_1.C_IF;
        }
        else if (cmd.indexOf('function') === 0) {
            returnString = constants_1.C_FUNCTION;
        }
        else if (cmd.indexOf('return') === 0) {
            returnString = constants_1.C_RETURN;
        }
        else if (cmd.indexOf('call') === 0) {
            returnString = constants_1.C_CALL;
        }
        else {
            returnString = constants_1.C_ARITHMETIC;
        }
        return returnString;
    };
    /**
     * 現コマンドの最初の引数が返される
     * C_ARITHMETICの場合、コマンド自体(add, subなど)が返される
     * 現コマンドがC_RETURNの場合、本ルーチンは呼ばないようにする
     */
    Parser.prototype.arg1 = function () {
        if (this.commandType() === constants_1.C_RETURN)
            return;
        if (this.commandType() === constants_1.C_ARITHMETIC) {
            return this.currentCommand;
        }
        return this.currentCommand.split(' ')[1];
    };
    /**
     * 現コマンドの第二引数が返される
     * 現コマンドが以下の場合だけ呼ぶ事可能
     * C_PUSH, C_POP, C_FUNCTION, C_CALL
     */
    Parser.prototype.arg2 = function () {
        if (![constants_1.C_PUSH, constants_1.C_POP, constants_1.C_FUNCTION, constants_1.C_CALL].includes(this.commandType()))
            return;
        return parseInt(this.currentCommand.split(' ')[2]);
    };
    return Parser;
}());
exports.default = Parser;
