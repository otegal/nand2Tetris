import * as fs from 'fs'

import {
  C_ARITHMETIC,
  C_PUSH,
  C_POP,
  C_LABEL,
  C_GOTO,
  C_IF,
  C_FUNCTION,
  C_RETURN,
  C_CALL
} from './constants'

class CodeWriter {

  outputPath: string
  fileName: string
  labelNumForCompare: number
  labelNumForReturnAddress: number

  /**
   * 出力ファイル/ストリームを開き、書き込む準備を行う
   */
  constructor(filePath: string) {
    this.outputPath = __dirname + '/' + filePath
    fs.writeFileSync(this.outputPath, '')

    this.fileName = ''
    this.labelNumForCompare = 0
    this.labelNumForReturnAddress = 0

    // this.writeInit()
  }

  /**
   * VMの初期化
   */
  writeInit() {
    this.writeCodes([
      '@256',
      'D=A',
      '@SP',
      'M=D'
    ])
    this.writeCall('Sys.init', 0)
  }

  /**
   * ファイル名をセットする
   */
  setFileName(fileName: string) {
    this.fileName = fileName
  }

  /**
   * 与えられた算術コマンドをアセンブリコードに変換し、それを書き込む
   */
  writeArithmetic(command: string) {
    switch(command) {
      case 'neg':
      case 'not':
        this.writeCalc1Value(command)
        break
      case 'add':
      case 'sub':
      case 'and':
      case 'or':
        this.writeCalc2Value(command)
        break
      case 'eq':
      case 'gt':
      case 'lt':
        this.writeCompare(command)
        break
      default:
        throw new Error('invalid command for writeArithmetic')
    }
  }

  /**
   * C_PUSHまたはC_POPコマンドをアセンブリコードに変換し、それを書き込む
   */
  writePushPop(command: string, segment: string, index: number|null) {
    if (index === null) return
    if (command === C_PUSH) {
      switch(segment) {
        case 'constant':
          this.writeCodes([`@${index}`, 'D=A'])
          this.writePushFromD()
          break
        case 'local':
        case 'argument':
        case 'this':
        case 'that':
          this.writePushFromReferencedSegment(segment, index)
          break
        case 'pointer':
        case 'temp':
          this.writePushFromFixedSegment(segment, index)
          break
        case 'static':
          this.writeCodes([
            `@${this.fileName}.${index}`,
            'D=M'
          ])
          this.writePushFromD()
          break
        default:
          throw new Error('invalid segment')
      }
    } else if (command === C_POP) {
      switch(segment) {
        case 'local':
        case 'argument':
        case 'this':
        case 'that':
          this.writePopToReferencedSegment(segment, index)
          break
        case 'pointer':
        case 'temp':
          this.writePopToFixedSegment(segment, index)
          break
        case 'static':
          this.writePopToA()
          this.writeCodes([
            'D=M',
            `@${this.fileName}.${index}`,
            'M=D'
          ])
          break
        default:
          throw new Error('invalid segment')
      }
    } else {
      throw new Error('invalid command for writePushPop')
    }
  }

  /**
   * labelコマンドを行うアセンブリコードを書く
   */
  writeLabel(label: string) {
    this.writeCodes([`(${label})`])
  }

  /**
   * gotoコマンドを行うアセンブリコードを書く
   */
  writeGoto(label: string) {
    this.writeCodes([
      `@${label}`,
      '0;JMP'
    ])
  }

  /**
   * if-gotoコマンドを行うアセンブリコードを書く
   */
  writeIf(label: string) {
    this.writePopToA()
    this.writeCodes([
      'D=M',
      `@${label}`,
      'D;JNE'
    ])
  }

  /**
   * callコマンドを行うアセンブリコードを書く
   */
  writeCall(functionName: string, numArgs: number = 0) {
    this.writeCodes([
      `@RETURN_ADDRESS_${this.labelNumForReturnAddress}`,
      'D=A',
    ])
    this.writePushFromD()

    this.writeCodes([
      '@LCL',
      'D=M',
    ])
    this.writePushFromD()

    this.writeCodes([
      '@ARG',
      'D=M',
    ])
    this.writePushFromD()

    this.writeCodes([
      '@THIS',
      'D=M',
    ])
    this.writePushFromD()

    this.writeCodes([
      '@THAT',
      'D=M',
    ])
    this.writePushFromD()

    this.writeCodes([
      '@SP',
      'D=M',
      `@${numArgs}`,
      'D=D-A',
      `@5`,
      'D=D-A',
      '@ARG',
      'M=D', // ARG = SP - numArgs - 5
      '@SP',
      'D=M',
      '@LCL',
      'M=D', // LCL = SP
      `@${functionName}`,
      '0;JMP',
      `(RETURN_ADDRESS_${this.labelNumForReturnAddress})`,
    ])

    this.labelNumForReturnAddress = this.labelNumForReturnAddress + 1
  }

  /**
   * returnコマンドを行うアセンブリコードを書く
   */
  writeReturn() {
    this.writeCodes([
      '@LCL',
      'D=M',
      '@R13', // R13にFRAMEを保存
      'M=D',
      '@5',
      'D=A',
      '@R13',
      'A=M-D', // FRAME - 5
      'D=M',
      '@R14', // R14にRETを保存
      'M=D'
    ])

    this.writePopToA()
    this.writeCodes([
      'D=M',
      '@ARG',
      'A=M',
      'M=D', // *ARG = pop()

      '@ARG',
      'D=M+1',
      '@SP',
      'M=D', // SP = ARG + 1

      '@R13',
      'AM=M-1',
      'D=M',
      '@THAT',
      'M=D', // THAT = *(FRAME - 1)

      '@R13',
      'AM=M-1',
      'D=M',
      '@THIS',
      'M=D', // THIS = *(FRAME - 2)

      '@R13',
      'AM=M-1',
      'D=M',
      '@ARG',
      'M=D', // ARG = *(FRAME - 3)

      '@R13',
      'AM=M-1',
      'D=M',
      '@LCL',
      'M=D', // LCL = *(FRAME - 4)

      '@R14',
      'A=M',
      '0;JMP'
    ])
  }

  /**
   * functionコマンドを行うアセンブリコードを書く
   */
  writeFunction(functionName: string, numLocals: number = 0) {
    this.writeCodes([
      `(${functionName})`,
      'D=0'
    ])
    for (let i = 0; i < numLocals; i++) {
      this.writePushFromD()
    }
  }

  /**
   * private
   */

  private writeCalc1Value(command: string) {
    let formula: string = ''
    switch(command) {
      case 'neg':
        formula = 'D=-M'
        break
      case 'not':
        formula = 'D=!M'
        break
      default:
        throw new Error('invalid command for writeCalc1Value')
    }

    this.writePopToA()
    this.writeCodes([formula])
    this.writePushFromD()
  }

  private writeCalc2Value(command: string) {
    let formula: string = ''
    switch(command) {
      case 'add':
        formula = 'D=D+M'
        break
      case 'sub':
        formula = 'D=M-D'
        break
      case 'and':
        formula = 'D=D&M'
        break
      case 'or':
        formula = 'D=D|M'
        break
      default:
        throw new Error('invalid command for writeCalc2Value')
    }

    this.writePopToA()
    this.writeCodes(['D=M'])
    this.writePopToA()
    this.writeCodes([formula])
    this.writePushFromD()
  }

  private writeCompare(command: string) {
    let mnemonic;
    switch(command) {
      case 'eq':
        mnemonic = 'JEQ'
        break
      case 'gt':
        mnemonic = 'JGT'
        break
      case 'lt':
        mnemonic = 'JLT'
        break
      default:
        throw new Error('invalid command for writeCompare')
    }

    this.writePopToA()
    this.writeCodes(['D=M'])
    this.writePopToA()
    this.writeCodes([
      'D=M-D',
      `@RETURN_TRUE_${this.labelNumForCompare}`,
      `D;${mnemonic}`,
      'D=0',
      `@NEXT_${this.labelNumForCompare}`,
      '0;JMP',
      `(RETURN_TRUE_${this.labelNumForCompare})`,
      'D=-1',
      `(NEXT_${this.labelNumForCompare})`
    ]);
    this.writePushFromD()

    this.labelNumForCompare = this.labelNumForCompare + 1
  }

  private writeCodes(codes: Array<string>) {
    fs.appendFileSync(this.outputPath, codes.join('\n') + '\n')
  }

  private writePopToA() {
    this.writeCodes([
      '@SP',
      'M=M-1',
      'A=M'
    ])
  }

  private writePushFromD() {
    this.writeCodes([
      '@SP',
      'A=M',
      'M=D',
      '@SP',
      'M=M+1'
    ])
  }

  private writePushFromReferencedSegment(segment: string, index: number) {
    const label = this.getLabelBySegment(segment)
    this.writeCodes([
      `@${label}`,
      'A=M'
    ])

    if (index) {
      this.writeCodes(new Array(index).fill('A=A+1'))
    }

    this.writeCodes(['D=M'])
    this.writePushFromD()
  }

  private writePopToReferencedSegment(segment: string, index: number) {
    this.writePopToA()

    const label = this.getLabelBySegment(segment)
    this.writeCodes([
      'D=M',
      `@${label}`,
      'A=M'
    ])

    if (index) {
      this.writeCodes(new Array(index).fill('A=A+1'))
    }

    this.writeCodes(['M=D'])
  }

  private writePushFromFixedSegment(segment: string, index: number) {
    const label = this.getLabelBySegment(segment)
    this.writeCodes([`@${label}`])

    if (index) {
      this.writeCodes(new Array(index).fill('A=A+1'))
    }

    this.writeCodes(['D=M'])
    this.writePushFromD()
  }

  private writePopToFixedSegment(segment: string, index: number) {
    this.writePopToA()

    const label = this.getLabelBySegment(segment)
    this.writeCodes([
      'D=M',
      `@${label}`
    ])

    if (index) {
      this.writeCodes(new Array(index).fill('A=A+1'))
    }

    this.writeCodes(['M=D'])
  }

  private getLabelBySegment(segment: string) {
    let label: string = ''
    switch(segment) {
      case 'local':
        label = 'LCL'
        break
      case 'argument':
        label = 'ARG'
        break
      case 'this':
        label = 'THIS'
        break
      case 'that':
        label = 'THAT'
        break
      case 'pointer':
        label = '3'
        break
      case 'temp':
        label = '5'
        break
      default:
        throw new Error('invalid segment')    
    }

    return label
  }

}

export default CodeWriter
