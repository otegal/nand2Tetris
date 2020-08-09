import * as fs from 'fs'
import * as path from 'path'

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

class Parser {

  instructions: string[]
  lineCounter: number
  currentCommand: string

  /**
   * 入力ファイル/ストリームを開き、パースする準備を行う
   */
  constructor(filePath: string) {
    const fileContent = fs.readFileSync(path.resolve(__dirname, filePath), {encoding: 'utf-8'})
    const lines = fileContent.split(/\r\n/)
    this.instructions = lines.filter((line) => {
      return line !== '' && line.indexOf("//") !==0;
    })
    this.lineCounter = 0;
    this.currentCommand = this.instructions[this.lineCounter]
  }

  /**
   * 入力に置いて、さらにコマンドが存在するか？
   */
  hasMoreCommands(): boolean {
    return this.instructions.length > this.lineCounter
  }

  /**
   * 入力から次のコマンドを読み込んで現コマンドにする
   */
  advance(): void {
    if (!this.hasMoreCommands) return
    this.lineCounter = this.lineCounter + 1
    const command = this.instructions[this.lineCounter]
    if (!command) return
    this.currentCommand = command.split('//')[0]
    return
  }

  /**
   * 現VMコマンドの種類を返す。算術コマンドの場合はC_ARITHMETICが返される
   */
  commandType(): string {
    const cmd = this.currentCommand
    let returnString: string = ''

    if      (cmd.indexOf('push')     === 0) { returnString = C_PUSH }
    else if (cmd.indexOf('pop')      === 0) { returnString = C_POP }
    else if (cmd.indexOf('label')    === 0) { returnString = C_LABEL }
    else if (cmd.indexOf('goto')     === 0) { returnString = C_GOTO }
    else if (cmd.indexOf('if-goto')  === 0) { returnString = C_IF }
    else if (cmd.indexOf('function') === 0) { returnString = C_FUNCTION }
    else if (cmd.indexOf('return')   === 0) { returnString = C_RETURN }
    else if (cmd.indexOf('call')     === 0) { returnString = C_CALL }
    else { returnString = C_ARITHMETIC }

    return returnString
  }

  /**
   * 現コマンドの最初の引数が返される
   * C_ARITHMETICの場合、コマンド自体(add, subなど)が返される
   * 現コマンドがC_RETURNの場合、本ルーチンは呼ばないようにする
   */
  arg1(): string|void {
    if (this.commandType() === C_RETURN) return
    if (this.commandType() === C_ARITHMETIC) {
      return this.currentCommand
    }
    return this.currentCommand.split(' ')[1]
  }

  /**
   * 現コマンドの第二引数が返される
   * 現コマンドが以下の場合だけ呼ぶ事可能
   * C_PUSH, C_POP, C_FUNCTION, C_CALL
   */
  arg2(): number|void {
    if (![C_PUSH, C_POP, C_FUNCTION, C_CALL].includes(this.commandType())) return
    return parseInt(this.currentCommand.split(' ')[2])
  }
}

export default Parser
