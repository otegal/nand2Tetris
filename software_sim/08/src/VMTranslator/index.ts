import Parser from './parser'
import CodeWriter from './codeWriter'

import {
  C_ARITHMETIC,
  C_PUSH,
  C_POP,
} from './constants'

const vmTranslater = () => {
  const filePath = process.argv[2]
  const parser = new Parser(filePath)
  const codeWriter = new CodeWriter(filePath)

  while (parser.hasMoreCommands()) {
    switch(parser.commandType()) {
      case C_ARITHMETIC:
        const command = parser.arg1()
        if (command) {
          codeWriter.writeArithmetic(command)
        }
        break
      case C_PUSH:
      case C_POP:
        const segment = parser.arg1()
        const index = parser.arg2()

        if (index === null) {
          throw new Error('invalid index')
        }

        if (segment) {
          codeWriter.writePushPop(parser.commandType(), segment, index)
        }
        break
      default:
        throw new Error('invalid commandType')
    }
    parser.advance()
  }
};

vmTranslater();