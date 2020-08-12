import * as fs from 'fs'
import JackTokenizer from './jackTokenizer'

import {
  TOKEN_TYPE,
  KEYWORDS,
  SYMBOLS
} from './constants'

class CompilationEngine {

  outputFilePath: string
  jackTokenizer: JackTokenizer
  indentCount: number

  constructor(inputFilePath: string, outputFilePath: string) {
    this.outputFilePath = outputFilePath
    fs.writeFileSync(this.outputFilePath, '')

    this.jackTokenizer = new JackTokenizer(inputFilePath)
    this.indentCount = 0
    this.compileClass()
  }

  writeElement(tagName: string, value: string): void {
    const indent = '  '.repeat(this.indentCount)
    fs.appendFileSync(this.outputFilePath, `${indent}<${tagName}> ${value} </${tagName}>` + '\n')
  }

  writeElementStart(tagName: string): void {
    const indent = '  '.repeat(this.indentCount)
    fs.appendFileSync(this.outputFilePath, `${indent}<${tagName}>` + '\n')
    this.indentCount = this.indentCount + 1
  }

  writeElementEnd(tagName: string): void {
    this.indentCount = this.indentCount - 1
    const indent = '  '.repeat(this.indentCount)
    fs.appendFileSync(this.outputFilePath, `${indent}</${tagName}>` + '\n')
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

    this.compileKeyword([KEYWORDS.STATIC, KEYWORDS.FIELD])
    this.compileType()
    this.compileIdentifier()
    while (this.jackTokenizer.currentToken !== SYMBOLS.SEMI_COLON) {
      this.compileSymbol([SYMBOLS.COMMA])
      this.compileIdentifier()
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
    this.writeElementStart('subroutineDec')

    this.compileKeyword([KEYWORDS.CONSTRUCTOR, KEYWORDS.FUNCTION, KEYWORDS.METHOD])
    if (this.jackTokenizer.currentToken === KEYWORDS.VOID) {
      this.compileKeyword([KEYWORDS.CONSTRUCTOR, KEYWORDS.FUNCTION, KEYWORDS.METHOD, KEYWORDS.VOID])
    } else {
      this.compileType()
    }
    this.compileIdentifier()
    this.compileSymbol([SYMBOLS.LEFT_ROUND_BRACKET])
    this.compileParameterList()
    this.compileSymbol([SYMBOLS.RIGHT_ROUND_BRACKET])
    this.compileSubroutineBody()

    this.writeElementEnd('subroutineDec')
  }

  compileParameterList(): void {
    this.writeElementStart('parameterList')

    while ([KEYWORDS.INT, KEYWORDS.CHAR, KEYWORDS.BOOLEAN].includes(this.jackTokenizer.currentToken) || this.jackTokenizer.tokenType() === TOKEN_TYPE.IDENTIFIER) {
      this.compileType()
      this.compileIdentifier()

      while (this.jackTokenizer.currentToken === SYMBOLS.COMMA) {
        this.compileSymbol([SYMBOLS.COMMA])
        this.compileType()
        this.compileIdentifier()
      }
    }

    this.writeElementEnd('parameterList')
  }

  compileSubroutineBody(): void {
    this.writeElementStart('subroutineBody')

    this.compileSymbol([SYMBOLS.LEFT_CURLY_BRACKET])
    while (this.jackTokenizer.currentToken === KEYWORDS.VAR) {
      this.compileVarDec()
    }
    this.compileStatements()
    this.compileSymbol([SYMBOLS.RIGHT_CURLY_BRACKET])

    this.writeElementEnd('subroutineBody')
  }

  compileVarDec(): void {
    this.writeElementStart('varDec')

    this.compileKeyword([KEYWORDS.VAR])
    this.compileType()
    this.compileIdentifier()
    while (this.jackTokenizer.currentToken === SYMBOLS.COMMA) {
      this.compileSymbol([SYMBOLS.COMMA])
      this.compileIdentifier()
    }
    this.compileSymbol([SYMBOLS.SEMI_COLON])

    this.writeElementEnd('varDec')
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

    this.writeElementEnd('doStatement')
  }

  compileLet(): void {
    this.writeElementStart('letStatement')

    this.compileKeyword([KEYWORDS.LET])
    this.compileIdentifier()
    while (this.jackTokenizer.currentToken !== SYMBOLS.EQUAL) {
      this.compileSymbol([SYMBOLS.LEFT_SQUARE_BRACKET])
      this.compileExpression()
      this.compileSymbol([SYMBOLS.RIGHT_SQUARE_BRACKET])
    }
    this.compileSymbol([SYMBOLS.EQUAL])
    this.compileExpression()
    this.compileSymbol([SYMBOLS.SEMI_COLON])

    this.writeElementEnd('letStatement')
  }

  compileWhile(): void {
    this.writeElementStart('whileStatement')

    this.compileKeyword([KEYWORDS.WHILE])
    this.compileSymbol([SYMBOLS.LEFT_ROUND_BRACKET])
    this.compileExpression()
    this.compileSymbol([SYMBOLS.RIGHT_ROUND_BRACKET])
    this.compileSymbol([SYMBOLS.LEFT_CURLY_BRACKET])
    this.compileStatements()
    this.compileSymbol([SYMBOLS.RIGHT_CURLY_BRACKET])

    this.writeElementEnd('whileStatement')
  }

  compileReturn(): void {
    this.writeElementStart('returnStatement')

    this.compileKeyword([KEYWORDS.RETURN])
    while (this.jackTokenizer.currentToken !== SYMBOLS.SEMI_COLON) {
      this.compileExpression()
    }
    this.compileSymbol([SYMBOLS.SEMI_COLON])

    this.writeElementEnd('returnStatement')
  }

  compileIf(): void {
    this.writeElementStart('ifStatement')

    this.compileKeyword([KEYWORDS.IF])
    this.compileSymbol([SYMBOLS.LEFT_ROUND_BRACKET])
    this.compileExpression()
    this.compileSymbol([SYMBOLS.RIGHT_ROUND_BRACKET])
    this.compileSymbol([SYMBOLS.LEFT_CURLY_BRACKET])
    this.compileStatements()
    this.compileSymbol([SYMBOLS.RIGHT_CURLY_BRACKET])

    if (this.jackTokenizer.currentToken === KEYWORDS.ELSE) {
      this.compileKeyword([KEYWORDS.ELSE])
      this.compileSymbol([SYMBOLS.LEFT_CURLY_BRACKET])
      this.compileStatements()
      this.compileSymbol([SYMBOLS.RIGHT_CURLY_BRACKET])
    }

    this.writeElementEnd('ifStatement')
  }

  compileSubroutineCall(): void {
    this.compileIdentifier()
    if (this.jackTokenizer.currentToken === SYMBOLS.PERIOD) {
      this.compileSymbol([SYMBOLS.PERIOD])
      this.compileIdentifier()
    }

    this.compileSymbol([SYMBOLS.LEFT_ROUND_BRACKET])
    this.compileExpressionList()
    this.compileSymbol([SYMBOLS.RIGHT_ROUND_BRACKET])
  }

  compileExpressionList(): void {
    this.writeElementStart('expressionList')

    while (this.jackTokenizer.currentToken !== SYMBOLS.RIGHT_ROUND_BRACKET) {
      this.compileExpression()

      while (this.jackTokenizer.currentToken === SYMBOLS.COMMA) {
        this.compileSymbol([SYMBOLS.COMMA])
        this.compileExpression()
      }
    }

    this.writeElementEnd('expressionList')
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
    }

    this.writeElementEnd('expression')
  }

  compileTerm(): void {
    this.writeElementStart('term')

    if (this.jackTokenizer.tokenType() === TOKEN_TYPE.INT_CONST) {
      this.compileIntegerConstant()
    } else if (this.jackTokenizer.tokenType() === TOKEN_TYPE.STRING_CONST) {
      this.compileStringConstant()
    } else if ([KEYWORDS.TRUE, KEYWORDS.FALSE, KEYWORDS.NULL, KEYWORDS.THIS].includes(this.jackTokenizer.currentToken)) {
      this.compileKeyword([KEYWORDS.TRUE, KEYWORDS.FALSE, KEYWORDS.NULL, KEYWORDS.THIS])
    } else if (this.jackTokenizer.tokenType() === TOKEN_TYPE.IDENTIFIER) {
      this.compileIdentifier()
      if (this.jackTokenizer.currentToken === SYMBOLS.LEFT_SQUARE_BRACKET) {
        this.compileSymbol([SYMBOLS.LEFT_SQUARE_BRACKET])
        this.compileExpression()
        this.compileSymbol([SYMBOLS.RIGHT_SQUARE_BRACKET])
      } else if (this.jackTokenizer.currentToken === SYMBOLS.LEFT_ROUND_BRACKET) {
        this.compileSymbol([SYMBOLS.LEFT_ROUND_BRACKET])
        this.compileExpressionList()
        this.compileSymbol([SYMBOLS.RIGHT_ROUND_BRACKET])
      } else if (this.jackTokenizer.currentToken === SYMBOLS.PERIOD) {
        this.compileSymbol([SYMBOLS.PERIOD])
        this.compileIdentifier()
        this.compileSymbol([SYMBOLS.LEFT_ROUND_BRACKET])
        this.compileExpressionList()
        this.compileSymbol([SYMBOLS.RIGHT_ROUND_BRACKET])
      }
    } else if (this.jackTokenizer.currentToken === SYMBOLS.LEFT_ROUND_BRACKET) {
      this.compileSymbol([SYMBOLS.LEFT_ROUND_BRACKET])
      this.compileExpression()
      this.compileSymbol([SYMBOLS.RIGHT_ROUND_BRACKET])
    } else if ([SYMBOLS.HYPHEN, SYMBOLS.TILDE].includes(this.jackTokenizer.currentToken)) {
      this.compileSymbol([SYMBOLS.HYPHEN, SYMBOLS.TILDE])
      this.compileTerm()
    } else {
      throw new Error(`invalid term: ${this.jackTokenizer.currentToken}`)
    }

    this.writeElementEnd('term')
  }
}

export default CompilationEngine