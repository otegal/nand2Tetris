import * as fs from 'fs'

import Parser from './parser'
import Code from './code'
import SymbolTable from './symbolTable'
import { A_COMMAND, C_COMMAND, L_COMMAND } from './constants' 

const INPUT_PATH = '../src/max/MaxL.asm'
const OUTPUT_PATH = __dirname + '/MaxL.hack'

const assembler = () => {
  const parser = new Parser(INPUT_PATH)
  const code = new Code()
  const symbolTable = new SymbolTable()
  let romAddress = 0
  let ramAddress = 16

  // シンボル追加
  while (parser.hasMoreCommands()) {
    const commandType = parser.commandType()
    if (commandType === A_COMMAND || commandType === C_COMMAND) {
      romAddress = romAddress + 1
    } else if (commandType === L_COMMAND) {
      const symbol = parser.symbol()
      if (!symbolTable.contains(symbol)) {
        let address = '0x' + ('0000' + romAddress.toString(16)).slice(-4)
        symbolTable.addEntry(symbol, address)
      }
    } else {
      throw new Error('invalid commandType')
    }
    parser.advance()
  }

  // シンボル判定で回した分を戻す
  parser.lineCounter = 0
  parser.currentCommand = parser.instructions[0]

  let machineCode
  const machineCodes = []

  // 機械語に変換
  while (parser.hasMoreCommands()) {
    const commandType = parser.commandType()
    if (commandType === C_COMMAND) {
      const destMnemonic = parser.dest()
      const compMnemonic = parser.comp()
      const jumpMnemonic = parser.jump()
      
      const dest = code.dest(destMnemonic)
      const comp = code.comp(compMnemonic)
      const jump = code.jump(jumpMnemonic)
      machineCodes.push('111' + comp + dest + jump)
    }

    if (commandType === A_COMMAND) {
      const symbol = parser.symbol()
      if (isNaN(parseInt(symbol))) {
        let address
        if (symbolTable.contains(symbol)) {
          address = symbolTable.getAddress(symbol)
        } else {
          address = '0x' + ('0000' + ramAddress.toString(16).slice(-4))
          symbolTable.addEntry(symbol, address)
          ramAddress = ramAddress + 1
        }
        machineCode = ('0000000000000000' + parseInt(address, 16).toString(2)).slice(-16)
      } else {
        machineCode = ('0000000000000000' + parseInt(symbol).toString(2)).slice(-16)
      }

      machineCodes.push(machineCode)
    }

    parser.advance()
  }
  fs.writeFileSync(OUTPUT_PATH, machineCodes.join('\n'))
}

assembler()