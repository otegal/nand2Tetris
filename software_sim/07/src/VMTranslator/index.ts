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
      case C_PUSH:
      case C_POP:
        const segment = parser.arg1()
        const index = parser.arg2()
        if (segment && index) {
          codeWriter.writePushPop(C_PUSH, segment, index)
        }
    }
    parser.advance()
  }
};

vmTranslater();