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
        this.outputPath = __dirname + '/' + filePath;
        fs.writeFileSync(this.outputPath, '');
        this.fileName = '';
        this.labelNumForCompare = 0;
        this.labelNumForReturnAddress = 0;
        // this.writeInit()
    }
    /**
     * VMの初期化
     */
    CodeWriter.prototype.writeInit = function () {
        this.writeCodes([
            '@256',
            'D=A',
            '@SP',
            'M=D'
        ]);
        this.writeCall('Sys.init', 0);
    };
    /**
     * ファイル名をセットする
     */
    CodeWriter.prototype.setFileName = function (fileName) {
        this.fileName = fileName;
    };
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
        if (index === null)
            return;
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
                    break;
                case 'static':
                    this.writeCodes([
                        "@" + this.fileName + "." + index,
                        'D=M'
                    ]);
                    this.writePushFromD();
                    break;
                default:
                    throw new Error('invalid segment');
            }
        }
        else if (command === constants_1.C_POP) {
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
                    this.writeCodes([
                        'D=M',
                        "@" + this.fileName + "." + index,
                        'M=D'
                    ]);
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
     * labelコマンドを行うアセンブリコードを書く
     */
    CodeWriter.prototype.writeLabel = function (label) {
        this.writeCodes(["(" + label + ")"]);
    };
    /**
     * gotoコマンドを行うアセンブリコードを書く
     */
    CodeWriter.prototype.writeGoto = function (label) {
        this.writeCodes([
            "@" + label,
            '0;JMP'
        ]);
    };
    /**
     * if-gotoコマンドを行うアセンブリコードを書く
     */
    CodeWriter.prototype.writeIf = function (label) {
        this.writePopToA();
        this.writeCodes([
            'D=M',
            "@" + label,
            'D;JNE'
        ]);
    };
    /**
     * callコマンドを行うアセンブリコードを書く
     */
    CodeWriter.prototype.writeCall = function (functionName, numArgs) {
        if (numArgs === void 0) { numArgs = 0; }
        this.writeCodes([
            "@RETURN_ADDRESS_" + this.labelNumForReturnAddress,
            'D=A',
        ]);
        this.writePushFromD();
        this.writeCodes([
            '@LCL',
            'D=M',
        ]);
        this.writePushFromD();
        this.writeCodes([
            '@ARG',
            'D=M',
        ]);
        this.writePushFromD();
        this.writeCodes([
            '@THIS',
            'D=M',
        ]);
        this.writePushFromD();
        this.writeCodes([
            '@THAT',
            'D=M',
        ]);
        this.writePushFromD();
        this.writeCodes([
            '@SP',
            'D=M',
            "@" + numArgs,
            'D=D-A',
            "@5",
            'D=D-A',
            '@ARG',
            'M=D',
            '@SP',
            'D=M',
            '@LCL',
            'M=D',
            "@" + functionName,
            '0;JMP',
            "(RETURN_ADDRESS_" + this.labelNumForReturnAddress + ")",
        ]);
        this.labelNumForReturnAddress = this.labelNumForReturnAddress + 1;
    };
    /**
     * returnコマンドを行うアセンブリコードを書く
     */
    CodeWriter.prototype.writeReturn = function () {
        this.writeCodes([
            '@LCL',
            'D=M',
            '@R13',
            'M=D',
            '@5',
            'D=A',
            '@R13',
            'A=M-D',
            'D=M',
            '@R14',
            'M=D'
        ]);
        this.writePopToA();
        this.writeCodes([
            'D=M',
            '@ARG',
            'A=M',
            'M=D',
            '@ARG',
            'D=M+1',
            '@SP',
            'M=D',
            '@R13',
            'AM=M-1',
            'D=M',
            '@THAT',
            'M=D',
            '@R13',
            'AM=M-1',
            'D=M',
            '@THIS',
            'M=D',
            '@R13',
            'AM=M-1',
            'D=M',
            '@ARG',
            'M=D',
            '@R13',
            'AM=M-1',
            'D=M',
            '@LCL',
            'M=D',
            '@R14',
            'A=M',
            '0;JMP'
        ]);
    };
    /**
     * functionコマンドを行うアセンブリコードを書く
     */
    CodeWriter.prototype.writeFunction = function (functionName, numLocals) {
        if (numLocals === void 0) { numLocals = 0; }
        this.writeCodes([
            "(" + functionName + ")",
            'D=0'
        ]);
        for (var i = 0; i < numLocals; i++) {
            this.writePushFromD();
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
                formula = 'D=M-D';
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
            "@RETURN_TRUE_" + this.labelNumForCompare,
            "D;" + mnemonic,
            'D=0',
            "@NEXT_" + this.labelNumForCompare,
            '0;JMP',
            "(RETURN_TRUE_" + this.labelNumForCompare + ")",
            'D=-1',
            "(NEXT_" + this.labelNumForCompare + ")"
        ]);
        this.writePushFromD();
        this.labelNumForCompare = this.labelNumForCompare + 1;
    };
    CodeWriter.prototype.writeCodes = function (codes) {
        fs.appendFileSync(this.outputPath, codes.join('\n') + '\n');
    };
    CodeWriter.prototype.writePopToA = function () {
        this.writeCodes([
            '@SP',
            'M=M-1',
            'A=M'
        ]);
    };
    CodeWriter.prototype.writePushFromD = function () {
        this.writeCodes([
            '@SP',
            'A=M',
            'M=D',
            '@SP',
            'M=M+1'
        ]);
    };
    CodeWriter.prototype.writePushFromReferencedSegment = function (segment, index) {
        var label = this.getLabelBySegment(segment);
        this.writeCodes([
            "@" + label,
            'A=M'
        ]);
        if (index) {
            this.writeCodes(new Array(index).fill('A=A+1'));
        }
        this.writeCodes(['D=M']);
        this.writePushFromD();
    };
    CodeWriter.prototype.writePopToReferencedSegment = function (segment, index) {
        this.writePopToA();
        var label = this.getLabelBySegment(segment);
        this.writeCodes([
            'D=M',
            "@" + label,
            'A=M'
        ]);
        if (index) {
            this.writeCodes(new Array(index).fill('A=A+1'));
        }
        this.writeCodes(['M=D']);
    };
    CodeWriter.prototype.writePushFromFixedSegment = function (segment, index) {
        var label = this.getLabelBySegment(segment);
        this.writeCodes(["@" + label]);
        if (index) {
            this.writeCodes(new Array(index).fill('A=A+1'));
        }
        this.writeCodes(['D=M']);
        this.writePushFromD();
    };
    CodeWriter.prototype.writePopToFixedSegment = function (segment, index) {
        this.writePopToA();
        var label = this.getLabelBySegment(segment);
        this.writeCodes([
            'D=M',
            "@" + label
        ]);
        if (index) {
            this.writeCodes(new Array(index).fill('A=A+1'));
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
