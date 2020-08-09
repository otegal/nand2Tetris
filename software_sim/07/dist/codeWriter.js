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
var constants_1 = require("./constants");
var CodeWriter = /** @class */ (function () {
    /**
     * 出力ファイル/ストリームを開き、書き込む準備を行う
     */
    function CodeWriter(filePath) {
        var index = filePath.lastIndexOf('.');
        this.outputPath = __dirname + '/' + filePath.slice(0, index) + '.asm';
        fs.writeFileSync(this.outputPath, '');
        var index2 = this.outputPath.lastIndexOf('/');
        this.fileName = this.outputPath.slice(index2 + 1);
        this.labelNum = 0;
    }
    /**
     * 与えられた算術コマンドをアセンブリコードに変換し、それを書き込む
     */
    CodeWriter.prototype.writeArithmetic = function (command) {
        switch (command) {
            case 'neg':
            case 'not':
                this.writeCalc1Value(command);
                break;
            case 'add':
            case 'sub':
            case 'and':
            case 'or':
                this.writeCalc2Value(command);
                break;
            case 'eq':
            case 'gt':
            case 'lt':
                this.writeCompare(command);
                break;
            default:
                throw new Error('invalid command for writeArithmetic');
        }
    };
    /**
     * C_PUSHまたはC_POPコマンドをアセンブリコードに変換し、それを書き込む
     */
    CodeWriter.prototype.writePushPop = function (command, segment, index) {
        if (command === constants_1.C_PUSH) {
            switch (segment) {
                case 'constant':
                    this.writeCodes(["@" + index, 'D=A']);
                    this.writePushFromD();
                    break;
                case 'local':
                case 'argument':
                case 'this':
                case 'that':
                    this.writePushFromReferencedSegment(segment, index);
                    break;
                case 'pointer':
                case 'temp':
                    this.writePushFromFixedSegment(segment, index);
                case 'static':
                    this.writeCodes(["@" + this.fileName + "." + index, 'D=M']);
                    this.writePushFromD();
                    break;
                default:
                    throw new Error('invalid segment');
            }
        }
        else if (command == constants_1.C_POP) {
            switch (segment) {
                case 'local':
                case 'argument':
                case 'this':
                case 'that':
                    this.writePopToReferencedSegment(segment, index);
                    break;
                case 'pointer':
                case 'temp':
                    this.writePopToFixedSegment(segment, index);
                    break;
                case 'static':
                    this.writePopToA();
                    this.writeCodes(['D=M', "@" + this.fileName + "." + index, 'M=D']);
                    break;
                default:
                    throw new Error('invalid segment');
            }
        }
        else {
            throw new Error('invalid command for writePushPop');
        }
    };
    /**
     * private
     */
    CodeWriter.prototype.writeCalc1Value = function (command) {
        var formula = '';
        switch (command) {
            case 'neg':
                formula = 'D=-M';
                break;
            case 'not':
                formula = 'D=!M';
                break;
            default:
                throw new Error('invalid command for writeCalc1Value');
        }
        this.writePopToA();
        this.writeCodes([formula]);
        this.writePushFromD();
    };
    CodeWriter.prototype.writeCalc2Value = function (command) {
        var formula = '';
        switch (command) {
            case 'add':
                formula = 'D=D+M';
                break;
            case 'sub':
                formula = 'D=D-M';
                break;
            case 'and':
                formula = 'D=D&M';
                break;
            case 'or':
                formula = 'D=D|M';
                break;
            default:
                throw new Error('invalid command for writeCalc2Value');
        }
        this.writePopToA();
        this.writeCodes(['D=M']);
        this.writePopToA();
        this.writeCodes([formula]);
        this.writePushFromD();
    };
    CodeWriter.prototype.writeCompare = function (command) {
        var mnemonic;
        switch (command) {
            case 'eq':
                mnemonic = 'JEQ';
                break;
            case 'gt':
                mnemonic = 'JGT';
                break;
            case 'lt':
                mnemonic = 'JLT';
                break;
            default:
                throw new Error('invalid command for writeCompare');
        }
        this.writePopToA();
        this.writeCodes(['D=M']);
        this.writePopToA();
        this.writeCodes([
            'D=M-D',
            "@RETURN_TRUE_" + this.labelNum,
            "D;" + mnemonic,
            'D=0',
            "@NEXT_" + this.labelNum,
            '0;JMP',
            "(RETURN_TRUE_" + this.labelNum + ")",
            'D=-1',
            "(NEXT_" + this.labelNum + ")"
        ]);
        this.writePushFromD();
        this.labelNum = this.labelNum + 1;
    };
    CodeWriter.prototype.writeCodes = function (codes) {
        fs.appendFileSync(this.outputPath, codes.join('\n') + '\n');
    };
    CodeWriter.prototype.writePopToA = function () {
        this.writeCodes(['@SP', 'M=M-1', 'A=M']);
    };
    CodeWriter.prototype.writePushFromD = function () {
        this.writeCodes(['@SP', 'A=M', 'M=D', '@SP', 'M=M+1']);
    };
    CodeWriter.prototype.writePushFromReferencedSegment = function (segment, index) {
        var label = this.getLabelBySegment(segment);
        this.writeCodes(["@" + label, 'A=M']);
        var indexNum = Number(index);
        if (indexNum) {
            this.writeCodes(new Array(indexNum).fill('A=A+1'));
        }
        this.writeCodes(['D=M']);
        this.writePushFromD();
    };
    CodeWriter.prototype.writePopToReferencedSegment = function (segment, index) {
        this.writePopToA();
        var label = this.getLabelBySegment(segment);
        this.writeCodes(['D=M', "@" + label, 'A=M']);
        var indexNum = Number(index);
        if (indexNum) {
            this.writeCodes(new Array(indexNum).fill('A=A+1'));
        }
        this.writeCodes(['M=D']);
    };
    CodeWriter.prototype.writePushFromFixedSegment = function (segment, index) {
        var label = this.getLabelBySegment(segment);
        this.writeCodes(["@" + label]);
        var indexNum = Number(index);
        if (indexNum) {
            this.writeCodes(new Array(indexNum).fill('A=A+1'));
        }
        this.writeCodes(['D=M']);
        this.writePushFromD();
    };
    CodeWriter.prototype.writePopToFixedSegment = function (segment, index) {
        this.writePopToA();
        var label = this.getLabelBySegment(segment);
        this.writeCodes(['D=M', "@" + label]);
        var indexNum = Number(index);
        if (indexNum) {
            this.writeCodes(new Array(indexNum).fill('A=A+1'));
        }
        this.writeCodes(['M=D']);
    };
    CodeWriter.prototype.getLabelBySegment = function (segment) {
        var label = '';
        switch (segment) {
            case 'local':
                label = 'LCL';
                break;
            case 'argument':
                label = 'ARG';
                break;
            case 'this':
                label = 'THIS';
                break;
            case 'that':
                label = 'THAT';
                break;
            case 'pointer':
                label = '3';
                break;
            case 'temp':
                label = '5';
                break;
            default:
                throw new Error('invalid segment');
        }
        return label;
    };
    return CodeWriter;
}());
exports.default = CodeWriter;
