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
  labelNum: number

  /**
   * 出力ファイル/ストリームを開き、書き込む準備を行う
   */
  constructor(filePath: string) {
    const index = filePath.lastIndexOf('.')
    this.outputPath = __dirname + '/' + filePath.slice(0, index) + '.asm'
    fs.writeFileSync(this.outputPath, '')

    const index2 = this.outputPath.lastIndexOf('/')
    this.fileName = this.outputPath.slice(index2 + 1)
    this.labelNum = 0
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
          this.writeCodes([`@${this.fileName}.${index}`, 'D=M'])
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
          this.writeCodes(['D=M', `@${this.fileName}.${index}`, 'M=D'])
          break
        default:
          throw new Error('invalid segment')
      }
    } else {
      throw new Error('invalid command for writePushPop')
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
      `@RETURN_TRUE_${this.labelNum}`,
      `D;${mnemonic}`,
      'D=0',
      `@NEXT_${this.labelNum}`,
      '0;JMP',
      `(RETURN_TRUE_${this.labelNum})`,
      'D=-1',
      `(NEXT_${this.labelNum})`
    ]);
    this.writePushFromD()

    this.labelNum = this.labelNum + 1
  }

  private writeCodes(codes: Array<string>) {
    fs.appendFileSync(this.outputPath, codes.join('\n') + '\n')
  }

  private writePopToA() {
    this.writeCodes(['@SP', 'M=M-1', 'A=M'])
  }

  private writePushFromD() {
    this.writeCodes(['@SP', 'A=M', 'M=D', '@SP', 'M=M+1'])
  }

  private writePushFromReferencedSegment(segment: string, index: number) {
    const label = this.getLabelBySegment(segment)
    this.writeCodes([`@${label}`, 'A=M'])

    const indexNum = Number(index)
    if (indexNum) {
      this.writeCodes(new Array(indexNum).fill('A=A+1'))
    }

    this.writeCodes(['D=M'])
    this.writePushFromD()
  }

  private writePopToReferencedSegment(segment: string, index: number) {
    this.writePopToA()

    const label = this.getLabelBySegment(segment)
    this.writeCodes(['D=M', `@${label}`, 'A=M'])

    const indexNum = Number(index)
    if (indexNum) {
      this.writeCodes(new Array(indexNum).fill('A=A+1'))
    }

    this.writeCodes(['M=D'])
  }

  private writePushFromFixedSegment(segment: string, index: number) {
    const label = this.getLabelBySegment(segment)
    this.writeCodes([`@${label}`])

    const indexNum = Number(index)
    if (indexNum) {
      this.writeCodes(new Array(indexNum).fill('A=A+1'))
    }

    this.writeCodes(['D=M'])
    this.writePushFromD()
  }

  private writePopToFixedSegment(segment: string, index: number) {
    this.writePopToA()

    const label = this.getLabelBySegment(segment)
    this.writeCodes(['D=M', `@${label}`])

    const indexNum = Number(index)
    if (indexNum) {
      this.writeCodes(new Array(indexNum).fill('A=A+1'))
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
