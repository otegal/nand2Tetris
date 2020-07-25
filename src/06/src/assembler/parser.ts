import * as fs from 'fs'
import * as path from 'path'

import { A_COMMAND, C_COMMAND, L_COMMAND } from './constants'

class Parser {

  instructions: string[]
  lineCounter: number
  currentCommand: string

  /**
   * 入力ファイルを展開しパースする準備を行う
   */
  constructor(filePath: string) {
    const fileContent = fs.readFileSync(path.resolve(__dirname, filePath), { encoding: 'utf-8' })
    const lines = fileContent.replace(/ /g, '').split(/\n/)
    this.instructions = lines.filter((line) => {
      return line !== '' && line.indexOf('//') !== 0
    });
    this.lineCounter = 0
    this.currentCommand = this.instructions[this.lineCounter]
  }

  /**
   * 入力にまだコマンドが存在するかどうかを判定する
   */
  hasMoreCommands(): boolean {
    return this.instructions.length > this.lineCounter
  }

  /**
   * 次のコマンドを読み込んで現在のコマンドに変更する
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
   * 現コマンドの種類を返す
   */
  commandType(): string {
    if (this.currentCommand.indexOf('@') === 0) {
      return A_COMMAND
    } else if (this.currentCommand.indexOf('(') === 0) {
      return L_COMMAND
    } else {
      return C_COMMAND
    }
  }
  
  /**
   * 現コマンドのシンボルを返す
   */
  symbol(): string {
    if (this.commandType() === C_COMMAND) throw new Error('commandType should be C_COMMAND when call symbol')

    let returnValue = ''
    if (this.commandType() === A_COMMAND) {
      returnValue = this.currentCommand.slice(1)
    }
    if (this.commandType() === L_COMMAND) {
      returnValue = this.currentCommand.slice(1, -1)
    }
    return returnValue
  }

  /**
   * destニーモニックを返却する
   */
  dest(): string|null {
    if (this.commandType() !== C_COMMAND) {
      throw new Error('commandType should be C_COMMAND when call dest');
    }
    if (this.currentCommand.indexOf(';') !== -1) {
      return null;
    }
    return this.currentCommand.split('=')[0];
  }

  /**
   * compニーモニックを返却する
   */
  comp(): string {
    if (this.commandType() !== C_COMMAND) {
      throw new Error('commandType should be C_COMMAND when call comp');
    }
    if (this.currentCommand.indexOf(';') !== -1) {
      return this.currentCommand.split(';')[0];
    }
    return this.currentCommand.split('=')[1];
  }

  /**
   * jumpニーモニックを返却する
   */
  jump(): string {
    if (this.commandType() !== C_COMMAND) {
      throw new Error('commandType should be C_COMMAND when call jump');
    }
    return this.currentCommand.split(';')[1];
  }
}

export default Parser
