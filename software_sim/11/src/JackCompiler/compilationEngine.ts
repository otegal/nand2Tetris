import * as fs from 'fs'
import JackTokenizer from './jackTokenizer'
import SymbolTable from './symbalTable'
import VMWriter from './vmWriter'

import {
  TOKEN_TYPE,
  KEYWORDS,
  SYMBOLS,
  SEGMENT,
  KIND,
  COMMAND
} from './constants'

class CompilationEngine {

  jackTokenizer: JackTokenizer
  symbolTable: SymbolTable
  vmWriter: VMWriter

  outputFilePathForVM: string
  outputFilePathForXML: string
  className: string
  indentCount: number
  labelCount: number

  constructor(inputFilePath: string, outputFilePath: string) {
    this.jackTokenizer = new JackTokenizer(inputFilePath)
    this.symbolTable = new SymbolTable()
    this.vmWriter = new VMWriter(outputFilePath)

    this.outputFilePathForVM = outputFilePath
    this.outputFilePathForXML = outputFilePath.slice(0, -3) + '.xml'
    fs.writeFileSync(this.outputFilePathForXML, '')
    this.className = ''

    this.indentCount = 0
    this.labelCount = 0
    this.compileClass()
  }

  writeElement(tagName: string, value: string): void {
    const indent = '  '.repeat(this.indentCount)
    fs.appendFileSync(this.outputFilePathForXML, `${indent}<${tagName}> ${value} </${tagName}>` + '\n')
  }

  writeIdentifier(name: string, isDefined: boolean) {
    const indent = '  '.repeat(this.indentCount)

    const kind = this.symbolTable.kindOf(name)
    const type = this.symbolTable.typeOf(name)
    const index = this.symbolTable.indexOf(name)
    const info = `isDefined: ${isDefined}, type: ${type}, kind: ${kind}, index: ${index}`

    fs.appendFileSync(this.outputFilePathForXML, `${indent}<identifier> ${name} </identifier> ${info}` + '\n')
  }

  writeElementStart(tagName: string): void {
    const indent = '  '.repeat(this.indentCount)
    fs.appendFileSync(this.outputFilePathForXML, `${indent}<${tagName}>` + '\n')
    this.indentCount = this.indentCount + 1
  }

  writeElementEnd(tagName: string): void {
    this.indentCount = this.indentCount - 1
    const indent = '  '.repeat(this.indentCount)
    fs.appendFileSync(this.outputFilePathForXML, `${indent}</${tagName}>` + '\n')
  }

  compileKeyword(keywords: Array<string>): void {
    const keyword = this.jackTokenizer.keyWord()
    if (keyword === null) {
      throw new Error('is null keyword')
    }

    if (!keywords.includes(keyword)) {
      throw new Error(`invalid keyword, keyword: ${keyword}, expected keywords: ${keywords}`)
    }
    this.checkToken(TOKEN_TYPE.KEYWORD)
    this.writeElement('keyword', keyword)
    this.jackTokenizer.advance()
  }

  compileSymbol(symbols: Array<string>): void {
    let symbol = this.jackTokenizer.symbol()
    if (symbol === null) {
      throw new Error('is null symbol')
    }

    if (!symbols.includes(symbol)) {
      throw new Error(`invalid symbol, symbol: ${symbol}, expected symbols: ${symbols}, currentToken: ${this.jackTokenizer.currentToken}`)
    }
    this.checkToken(TOKEN_TYPE.SYMBOL)

    if (this.jackTokenizer.currentToken === '<') {
      symbol = '&lt;'
    } else if (this.jackTokenizer.currentToken === '>') {
      symbol = '&gt;'
    } else if (this.jackTokenizer.currentToken === '&') {
      symbol = '&amp;'
    }

    this.writeElement('symbol', symbol)
    this.jackTokenizer.advance()
  }

  compileIntegerConstant(): void {
    this.checkToken(TOKEN_TYPE.INT_CONST)

    const intVal = this.jackTokenizer.intVal()
    if (intVal === null) {
      throw new Error('is null intVal')
    }

    this.writeElement('integerConstant', intVal)
    this.jackTokenizer.advance()
  }

  compileStringConstant(): void {
    this.checkToken(TOKEN_TYPE.STRING_CONST)

    const stringVal = this.jackTokenizer.stringVal()
    if (stringVal === null) {
      throw new Error('is null stringVal')
    }

    this.writeElement('stringConstant', stringVal)
    this.vmWriter.writePush(SEGMENT.CONST, stringVal.length)
    this.vmWriter.writeCall('String.new', 1)
    for (let i = 0; i < stringVal.length; i++) {
      this.vmWriter.writePush(SEGMENT.CONST, stringVal.charCodeAt(i))
      this.vmWriter.writeCall('String.appendChar', 2)
    }

    this.jackTokenizer.advance()
  }

  compileIdentifier(): void {
    this.checkToken(TOKEN_TYPE.IDENTIFIER)

    const identifierVal = this.jackTokenizer.identifier()
    if (identifierVal === null) {
      throw new Error('is null identifierVal')
    }

    this.writeElement('identifier', identifierVal)
    this.jackTokenizer.advance()
  }

  compileVarName(
    isDefined: boolean,
    type: string|null = null,
    kind: string|null = null,
    shouldWritePush: boolean = false
  ) {
    this.checkToken(TOKEN_TYPE.IDENTIFIER)
    const name = this.jackTokenizer.identifier()
    if (name === null) {
      throw new Error('is null name')
    }

    if (isDefined) { // classVarDec, parameterList, varDec
      if (type === null) throw new Error('invalid type is null')
      if (kind === null) throw new Error('invalid kind is null')
      this.symbolTable.define(name, type, kind)
    } else if (shouldWritePush) { // term
      kind = this.symbolTable.kindOf(name)
      const index = this.symbolTable.indexOf(name)

      if (shouldWritePush) {
        let segment = ''
        if (kind === KIND.STATIC) {
          segment = SEGMENT.STATIC
        } else if (kind === KIND.FIELD) {
          segment = SEGMENT.THIS
        } else if (kind === KIND.ARGUMENT) {
          segment = SEGMENT.ARGUMENT
        } else if (kind === KIND.VAR) {
          segment = SEGMENT.LOCAL
        }
        this.vmWriter.writePush(segment, index)
      }
    } // else: subroutineCall, compileLet

    this.writeIdentifier(name, isDefined)
    this.jackTokenizer.advance()
  }

  checkToken(type: string): void {
    const token = this.jackTokenizer.currentToken
    const tokenType = this.jackTokenizer.tokenType()
    if (type !== tokenType) {
      throw new Error(`invalid token, token: ${token}, tokenType: ${tokenType}, expected type: ${type}`)
    }
  }

  compileClass(): void {
    this.writeElementStart('class')

    this.compileKeyword([KEYWORDS.CLASS])
    this.className = this.jackTokenizer.currentToken
    this.compileIdentifier()
    this.compileSymbol([SYMBOLS.LEFT_CURLY_BRACKET])
    while ([KEYWORDS.STATIC, KEYWORDS.FIELD].includes(this.jackTokenizer.currentToken)) {
      this.compileClassVarDec()
    }
    while ([KEYWORDS.CONSTRUCTOR, KEYWORDS.FUNCTION, KEYWORDS.METHOD].includes(this.jackTokenizer.currentToken)) {
      this.compileSubroutine()
    }
    this.compileSymbol([SYMBOLS.RIGHT_CURLY_BRACKET])

    this.writeElementEnd('class')
  }

  compileClassVarDec(): void {
    this.writeElementStart('classVarDec')

    const kind = this.jackTokenizer.currentToken
    this.compileKeyword([KEYWORDS.STATIC, KEYWORDS.FIELD])
    const type = this.jackTokenizer.currentToken
    this.compileType()
    this.compileVarName(true, type, kind)

    while (this.jackTokenizer.currentToken !== SYMBOLS.SEMI_COLON) {
      this.compileSymbol([SYMBOLS.COMMA])
      this.compileVarName(true, type, kind)
    }
    this.compileSymbol([SYMBOLS.SEMI_COLON])

    this.writeElementEnd('classVarDec')
  }

  compileType(): void {
    if ([KEYWORDS.INT, KEYWORDS.CHAR, KEYWORDS.BOOLEAN].includes(this.jackTokenizer.currentToken)) {
      this.compileKeyword([KEYWORDS.INT, KEYWORDS.CHAR, KEYWORDS.BOOLEAN])
    } else {
      this.compileIdentifier()
    }
  }

  compileSubroutine(): void {
    this.symbolTable.startSubroutine()
    this.writeElementStart('subroutineDec')

    const subroutineKeyword = this.jackTokenizer.currentToken
    if (subroutineKeyword === KEYWORDS.METHOD) {
      this.symbolTable.define('this', this.className, SEGMENT.ARGUMENT)
    }

    this.compileKeyword([KEYWORDS.CONSTRUCTOR, KEYWORDS.FUNCTION, KEYWORDS.METHOD])
    if (this.jackTokenizer.currentToken === KEYWORDS.VOID) {
      this.compileKeyword([KEYWORDS.CONSTRUCTOR, KEYWORDS.FUNCTION, KEYWORDS.METHOD, KEYWORDS.VOID])
    } else {
      this.compileType()
    }

    const functionName = this.className + '.' + this.jackTokenizer.currentToken;
    this.compileIdentifier()
    this.compileSymbol([SYMBOLS.LEFT_ROUND_BRACKET])
    this.compileParameterList()
    this.compileSymbol([SYMBOLS.RIGHT_ROUND_BRACKET])
    this.compileSubroutineBody(functionName, subroutineKeyword)

    this.writeElementEnd('subroutineDec')
  }

  compileParameterList(): void {
    this.writeElementStart('parameterList')

    while ([KEYWORDS.INT, KEYWORDS.CHAR, KEYWORDS.BOOLEAN].includes(this.jackTokenizer.currentToken) || this.jackTokenizer.tokenType() === TOKEN_TYPE.IDENTIFIER) {
      const type = this.jackTokenizer.currentToken
      this.compileType()
      this.compileVarName(true, type, KIND.ARGUMENT)

      while (this.jackTokenizer.currentToken === SYMBOLS.COMMA) {
        this.compileSymbol([SYMBOLS.COMMA])
        const type = this.jackTokenizer.currentToken
        this.compileType()
        this.compileVarName(true, type, KIND.ARGUMENT)
      }
    }

    this.writeElementEnd('parameterList')
  }

  compileSubroutineBody(functionName: string, subroutineKeyword: string): void {
    this.writeElementStart('subroutineBody')
    this.compileSymbol([SYMBOLS.LEFT_CURLY_BRACKET])

    this.vmWriter.writeFunction(functionName, 0)
    if (subroutineKeyword === KEYWORDS.CONSTRUCTOR) {
      this.vmWriter.writePush(SEGMENT.CONST, this.symbolTable.varCount(KIND.FIELD))
      this.vmWriter.writeCall('Memory.alloc', 1)
      this.vmWriter.writePop(SEGMENT.POINTER, 0)
    } else if (subroutineKeyword === KEYWORDS.METHOD) {
      this.vmWriter.writePush(SEGMENT.ARGUMENT, 0)
      this.vmWriter.writePop(SEGMENT.POINTER, 0)
    }

    let nLocals = 0
    while (this.jackTokenizer.currentToken === KEYWORDS.VAR) {
      const varNum = this.compileVarDec()
      nLocals = nLocals + varNum
    }

     // update function's nLocals
     if (nLocals !== 0) {
      const fileContent = fs.readFileSync(this.outputFilePathForVM, { encoding: "utf-8" })
      const newContent = fileContent.replace(`${functionName} 0`, `${functionName} ${nLocals}`)
      fs.writeFileSync(this.outputFilePathForVM, newContent)
    }

    this.compileStatements()
    this.compileSymbol([SYMBOLS.RIGHT_CURLY_BRACKET])

    this.writeElementEnd('subroutineBody')
  }

  compileVarDec(): number {
    this.writeElementStart('varDec')

    this.compileKeyword([KEYWORDS.VAR])
    const type = this.jackTokenizer.currentToken
    this.compileType()
    this.compileVarName(true, type, KIND.VAR)

    let varNum = 1
    while (this.jackTokenizer.currentToken === SYMBOLS.COMMA) {
      varNum = varNum + 1
      this.compileSymbol([SYMBOLS.COMMA])
      this.compileVarName(true, type, KIND.VAR)
    }
    this.compileSymbol([SYMBOLS.SEMI_COLON])

    this.writeElementEnd('varDec')
    return varNum
  }

  compileStatements(): void {
    this.writeElementStart('statements')

    while ([KEYWORDS.LET, KEYWORDS.IF, KEYWORDS.WHILE, KEYWORDS.DO, KEYWORDS.RETURN].includes(this.jackTokenizer.currentToken)) {
      if (this.jackTokenizer.currentToken === KEYWORDS.LET) {
        this.compileLet()
      } else if (this.jackTokenizer.currentToken === KEYWORDS.IF) {
        this.compileIf()
      } else if (this.jackTokenizer.currentToken === KEYWORDS.WHILE) {
        this.compileWhile()
      } else if (this.jackTokenizer.currentToken === KEYWORDS.DO) {
        this.compileDo()
      } else if (this.jackTokenizer.currentToken === KEYWORDS.RETURN) {
        this.compileReturn()
      } else {
        throw new Error(`invalid statement, currentToken: ${this.jackTokenizer.currentToken}`)
      }
    }

    this.writeElementEnd('statements')
  }

  compileDo(): void {
    this.writeElementStart('doStatement')

    this.compileKeyword([KEYWORDS.DO])
    this.compileSubroutineCall()
    this.compileSymbol([SYMBOLS.SEMI_COLON])

    this.vmWriter.writePop(SEGMENT.TEMP, 0)
    this.writeElementEnd('doStatement')
  }

  compileLet(): void {
    this.writeElementStart('letStatement')

    this.compileKeyword([KEYWORDS.LET])
    const name = this.jackTokenizer.currentToken
    this.compileVarName(false)
    const kind = this.symbolTable.kindOf(name)
    const index = this.symbolTable.indexOf(name)

    if (this.jackTokenizer.currentToken !== SYMBOLS.EQUAL) { // varName[]
      this.compileSymbol([SYMBOLS.LEFT_SQUARE_BRACKET])
      this.compileExpression() // push i
      this.compileSymbol([SYMBOLS.RIGHT_SQUARE_BRACKET])

      if (kind === KIND.STATIC) {
        this.vmWriter.writePush(SEGMENT.STATIC, index)
      } else if (kind === KIND.FIELD) {
        this.vmWriter.writePush(SEGMENT.THIS, index)
      } else if (kind === KIND.ARGUMENT) {
        this.vmWriter.writePush(SEGMENT.ARGUMENT, index)
      } else if (kind === KIND.VAR) {
        this.vmWriter.writePush(SEGMENT.LOCAL, index)
      }
      this.vmWriter.writeArithmetic(COMMAND.ADD)

      this.compileSymbol([SYMBOLS.EQUAL])
      this.compileExpression()
      this.vmWriter.writePop(SEGMENT.TEMP, 0)
      this.vmWriter.writePop(SEGMENT.POINTER, 1)
      this.vmWriter.writePush(SEGMENT.TEMP, 0)
      this.vmWriter.writePop(SEGMENT.THAT, 0)
    } else { // varName
      this.compileSymbol([SYMBOLS.EQUAL])
      this.compileExpression()
      if (kind === KIND.STATIC) {
        this.vmWriter.writePop(SEGMENT.STATIC, index)
      } else if (kind === KIND.FIELD) {
        this.vmWriter.writePop(SEGMENT.THIS, index)
      } else if (kind === KIND.ARGUMENT) {
        this.vmWriter.writePop(SEGMENT.ARGUMENT, index)
      } else if (kind === KIND.VAR) {
        this.vmWriter.writePop(SEGMENT.LOCAL, index)
      }
    }

    this.compileSymbol([SYMBOLS.SEMI_COLON])

    this.writeElementEnd('letStatement')
  }

  compileWhile(): void {
    this.writeElementStart('whileStatement')

    const labelLoop = `WHILE_LOOP_${this.labelCount}`
    const labelEnd = `WHILE_END_${this.labelCount}`
    this.labelCount = this.labelCount + 1

    this.vmWriter.writeLabel(labelLoop)
    this.compileKeyword([KEYWORDS.WHILE])
    this.compileSymbol([SYMBOLS.LEFT_ROUND_BRACKET])
    this.compileExpression()
    this.vmWriter.writeArithmetic(COMMAND.NOT)
    this.vmWriter.writeIf(labelEnd)
    this.compileSymbol([SYMBOLS.RIGHT_ROUND_BRACKET])
    this.compileSymbol([SYMBOLS.LEFT_CURLY_BRACKET])
    this.compileStatements()
    this.compileSymbol([SYMBOLS.RIGHT_CURLY_BRACKET])
    this.vmWriter.writeGoto(labelLoop)
    this.vmWriter.writeLabel(labelEnd)

    this.writeElementEnd('whileStatement')
  }

  compileReturn(): void {
    this.writeElementStart('returnStatement')

    this.compileKeyword([KEYWORDS.RETURN])
    if (this.jackTokenizer.currentToken !== SYMBOLS.SEMI_COLON) {
      this.compileExpression()
    } else {
      this.vmWriter.writePush(SEGMENT.CONST, 0)
    }
    this.compileSymbol([SYMBOLS.SEMI_COLON])

    this.vmWriter.writeReturn()
    this.writeElementEnd('returnStatement')
  }

  compileIf(): void {
    this.writeElementStart('ifStatement')

    const labelElse = `IF_ELSE_${this.labelCount}`
    const labelEnd = `IF_END_${this.labelCount}`
    this.labelCount = this.labelCount + 1

    this.compileKeyword([KEYWORDS.IF])
    this.compileSymbol([SYMBOLS.LEFT_ROUND_BRACKET])
    this.compileExpression()
    this.vmWriter.writeArithmetic(COMMAND.NOT)
    this.vmWriter.writeIf(labelElse)
    this.compileSymbol([SYMBOLS.RIGHT_ROUND_BRACKET])
    this.compileSymbol([SYMBOLS.LEFT_CURLY_BRACKET])
    this.compileStatements()
    this.compileSymbol([SYMBOLS.RIGHT_CURLY_BRACKET])
    this.vmWriter.writeGoto(labelEnd)

    this.vmWriter.writeLabel(labelElse)
    if (this.jackTokenizer.currentToken === KEYWORDS.ELSE) {
      this.compileKeyword([KEYWORDS.ELSE])
      this.compileSymbol([SYMBOLS.LEFT_CURLY_BRACKET])
      this.compileStatements()
      this.compileSymbol([SYMBOLS.RIGHT_CURLY_BRACKET])
    }
    this.vmWriter.writeLabel(labelEnd)

    this.writeElementEnd('ifStatement')
  }

  compileSubroutineCall(): void {
    let name = this.jackTokenizer.currentToken
    let nArgs = 0

    const kind = this.symbolTable.kindOf(name)
    if (kind !== KIND.NONE) { // pattern1: varName.subroutineName
      const type = this.symbolTable.typeOf(name)
      const index = this.symbolTable.indexOf(name)
      nArgs = nArgs + 1

      if (kind === KIND.STATIC) {
        this.vmWriter.writePush(SEGMENT.STATIC, index)
      } else if (kind === KIND.FIELD) {
        this.vmWriter.writePush(SEGMENT.THIS, index)
      } else if (kind === KIND.ARGUMENT) {
        this.vmWriter.writePush(SEGMENT.ARGUMENT, index)
      } else if (kind === KIND.VAR) {
        this.vmWriter.writePush(SEGMENT.LOCAL, index)
      }

      this.compileVarName(false)
      this.compileSymbol([SYMBOLS.PERIOD])
      name = type + '.' + this.jackTokenizer.currentToken
      this.compileIdentifier()
    } else {
      this.compileIdentifier()
      if (this.jackTokenizer.currentToken === SYMBOLS.PERIOD) { // pattern2: className.subroutineName
        this.compileSymbol([SYMBOLS.PERIOD])
        name = name + '.' + this.jackTokenizer.currentToken
        this.compileIdentifier()
      } else { // pattern3: subroutineName
        this.vmWriter.writePush(SEGMENT.POINTER, 0)
        name = this.className + '.' + name
        nArgs = nArgs + 1
      }
    }

    this.compileSymbol([SYMBOLS.LEFT_ROUND_BRACKET])
    nArgs = nArgs + this.compileExpressionList()
    this.compileSymbol([SYMBOLS.RIGHT_ROUND_BRACKET])

    this.vmWriter.writeCall(name, nArgs)
  }

  compileExpressionList(): number {
    this.writeElementStart('expressionList')

    let nArgs = 0
    if (this.jackTokenizer.currentToken !== SYMBOLS.RIGHT_ROUND_BRACKET) {
      nArgs = 1
      this.compileExpression()

      while (this.jackTokenizer.currentToken === SYMBOLS.COMMA) {
        this.compileSymbol([SYMBOLS.COMMA])
        this.compileExpression()
        nArgs = nArgs + 1
      }
    }

    this.writeElementEnd('expressionList')
    return nArgs
  }

  compileExpression(): void {
    this.writeElementStart('expression')
    this.compileTerm()

    while ([
      SYMBOLS.PLUS_SIGN,
      SYMBOLS.HYPHEN,
      SYMBOLS.ASTERISK,
      SYMBOLS.SLASH,
      SYMBOLS.AMPERSAND,
      SYMBOLS.VERTICAL_LINE,
      SYMBOLS.LESS_THAN_SIGN,
      SYMBOLS.GREATER_THAN_SIGN,
      SYMBOLS.EQUAL
    ].includes(this.jackTokenizer.currentToken)) {
      const symbol = this.jackTokenizer.currentToken
      this.compileSymbol([
        SYMBOLS.PLUS_SIGN,
        SYMBOLS.HYPHEN,
        SYMBOLS.ASTERISK,
        SYMBOLS.SLASH,
        SYMBOLS.AMPERSAND,
        SYMBOLS.VERTICAL_LINE,
        SYMBOLS.LESS_THAN_SIGN,
        SYMBOLS.GREATER_THAN_SIGN,
        SYMBOLS.EQUAL
      ])
      this.compileTerm()

      if (symbol === SYMBOLS.PLUS_SIGN) {
        this.vmWriter.writeArithmetic(COMMAND.ADD)
      } else if (symbol === SYMBOLS.HYPHEN) {
        this.vmWriter.writeArithmetic(COMMAND.SUB)
      } else if (symbol === SYMBOLS.ASTERISK) {
        this.vmWriter.writeCall('Math.multiply', 2)
      } else if (symbol === SYMBOLS.SLASH) {
        this.vmWriter.writeCall('Math.divide', 2)
      } else if (symbol === SYMBOLS.AMPERSAND) {
        this.vmWriter.writeArithmetic(COMMAND.AND)
      } else if (symbol === SYMBOLS.VERTICAL_LINE) {
        this.vmWriter.writeArithmetic(COMMAND.OR)
      } else if (symbol === SYMBOLS.LESS_THAN_SIGN) {
        this.vmWriter.writeArithmetic(COMMAND.LT)
      } else if (symbol === SYMBOLS.GREATER_THAN_SIGN) {
        this.vmWriter.writeArithmetic(COMMAND.GT)
      } else if (symbol === SYMBOLS.EQUAL) {
        this.vmWriter.writeArithmetic(COMMAND.EQ)
      }
    }

    this.writeElementEnd('expression')
  }

  compileTerm(): void {
    this.writeElementStart('term')

    if (this.jackTokenizer.tokenType() === TOKEN_TYPE.INT_CONST) {
      const index = Number(this.jackTokenizer.currentToken)
      this.vmWriter.writePush(SEGMENT.CONST, index)
      this.compileIntegerConstant()
    } else if (this.jackTokenizer.tokenType() === TOKEN_TYPE.STRING_CONST) {
      this.compileStringConstant()
    } else if (this.jackTokenizer.currentToken === KEYWORDS.TRUE) {
      this.vmWriter.writePush(SEGMENT.CONST, 1)
      this.vmWriter.writeArithmetic(COMMAND.NEG)
      this.compileKeyword([KEYWORDS.TRUE])
    } else if (this.jackTokenizer.currentToken === KEYWORDS.FALSE) {
      this.vmWriter.writePush(SEGMENT.CONST, 0)
      this.compileKeyword([KEYWORDS.FALSE])
    } else if (this.jackTokenizer.currentToken === KEYWORDS.NULL) {
      this.vmWriter.writePush(SEGMENT.CONST, 0)
      this.compileKeyword([KEYWORDS.NULL])
    } else if (this.jackTokenizer.currentToken === KEYWORDS.THIS) {
      this.vmWriter.writePush(SEGMENT.POINTER, 0)
      this.compileKeyword([KEYWORDS.THIS])
    } else if (this.jackTokenizer.tokenType() === TOKEN_TYPE.IDENTIFIER) {
      let name = this.jackTokenizer.currentToken
      if (this.symbolTable.kindOf(name) !== KIND.NONE) {
        this.compileVarName(false, null, null, true)
      } else {
        this.compileIdentifier()
      }

      if (this.jackTokenizer.currentToken === SYMBOLS.LEFT_SQUARE_BRACKET) {
        this.compileSymbol([SYMBOLS.LEFT_SQUARE_BRACKET])
        this.compileExpression()
        this.compileSymbol([SYMBOLS.RIGHT_SQUARE_BRACKET])
        this.vmWriter.writeArithmetic(COMMAND.ADD)
        this.vmWriter.writePop(SEGMENT.POINTER, 1)
        this.vmWriter.writePush(SEGMENT.THAT, 0)
      } else if (this.jackTokenizer.currentToken === SYMBOLS.LEFT_ROUND_BRACKET) {
        this.compileSymbol([SYMBOLS.LEFT_ROUND_BRACKET])
        const nArgs = this.compileExpressionList()
        this.compileSymbol([SYMBOLS.RIGHT_ROUND_BRACKET])
        this.vmWriter.writeCall(name, nArgs)
      } else if (this.jackTokenizer.currentToken === SYMBOLS.PERIOD) {
        this.compileSymbol([SYMBOLS.PERIOD])
        let nArgs = 0
        if (this.symbolTable.kindOf(name) !== KIND.NONE) {
          name = this.symbolTable.typeOf(name)
          nArgs = 1
        }

        name = name + '.' + this.jackTokenizer.currentToken
        this.compileIdentifier()
        this.compileSymbol([SYMBOLS.LEFT_ROUND_BRACKET])
        nArgs = nArgs + this.compileExpressionList()
        this.compileSymbol([SYMBOLS.RIGHT_ROUND_BRACKET])
        this.vmWriter.writeCall(name, nArgs)
      }
    } else if (this.jackTokenizer.currentToken === SYMBOLS.LEFT_ROUND_BRACKET) {
      this.compileSymbol([SYMBOLS.LEFT_ROUND_BRACKET])
      this.compileExpression()
      this.compileSymbol([SYMBOLS.RIGHT_ROUND_BRACKET])
    } else if (this.jackTokenizer.currentToken === SYMBOLS.HYPHEN) {
      this.compileSymbol([SYMBOLS.HYPHEN])
      this.compileTerm()
      this.vmWriter.writeArithmetic(COMMAND.NEG)
    } else if (this.jackTokenizer.currentToken === SYMBOLS.TILDE) {
      this.compileSymbol([SYMBOLS.TILDE])
      this.compileTerm()
      this.vmWriter.writeArithmetic(COMMAND.NOT)
    } else {
      throw new Error(`invalid term: ${this.jackTokenizer.currentToken}`)
    }

    this.writeElementEnd('term')
  }
}

export default CompilationEngine