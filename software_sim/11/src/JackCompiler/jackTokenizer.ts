import * as fs from 'fs'
import * as path from 'path'

import {
  TOKEN_TYPE,
  KEYWORDS,
  SYMBOLS
} from './constants'

class JackTokenizer {

  tokens: Array<string>
  tokenCounter: number
  currentToken: string

  constructor(filePath: string) {
    let fileContent = fs.readFileSync(path.resolve(__dirname, filePath), { encoding: 'utf-8' })

    // delete comments and empty lines
    while(fileContent.indexOf('/*') !== -1) { // type of /* */ comment
      const commentStartIndex = fileContent.indexOf('/*');
      const commentEndIndex = fileContent.indexOf('*/');
      fileContent = fileContent.slice(0, commentStartIndex) + fileContent.slice(commentEndIndex + 2)
    }
    const lines = fileContent.split(/\n/).filter((line) => { // type of top sentence by // comment
      return line.trim() !== '' && !line.trim().startsWith('//')
    })

    // delete comments for each lines
    const linesWithoutComments = lines.map((line) => {
      return line.split('//')[0].trim()
    })

    // parse each lines
    this.tokens = [];
    const reg = /[\{\}\(\)\[\]\.,;\+\-\*\/&\|<>=~]/;
    const parserUnit = (unit: string) => {
      while (unit) {
        if (unit.match(reg)) {
          const checkedUnit = unit.match(reg)
          if (!checkedUnit) {
            throw new Error(`invalid unit is ${unit}`)
          }

          const index = Number(checkedUnit.index)
          if (index !== 0) {
            this.tokens.push(unit.slice(0, index))
          }
          this.tokens.push(unit.slice(index, index + 1))
          unit = unit.slice(index + 1)
        } else {
          this.tokens.push(unit)
          unit = ''
        }
      }
    }

    linesWithoutComments.forEach((line) => {
      while (line) {
        const doubleQuoteIndex = line.indexOf('"')
        const spaceIndex = line.indexOf(' ')
        if (line.startsWith('"')) {
          const index = line.indexOf('"', 1)
          this.tokens.push(line.slice(0, index + 1))
          line = line.slice(index + 1).trim()
        } else if (doubleQuoteIndex !== -1 && spaceIndex !== -1 && doubleQuoteIndex < spaceIndex) {
          let unit = line.slice(0, doubleQuoteIndex)
          parserUnit(unit)
          line = line.slice(doubleQuoteIndex).trim()
        } else if (spaceIndex !== -1) {
          let unit = line.slice(0, spaceIndex)
          parserUnit(unit)
          line = line.slice(spaceIndex + 1).trim()
        } else {
          parserUnit(line)
          line = ''
        }
      }
    });

    this.tokenCounter = 0
    this.currentToken = this.tokens[this.tokenCounter]
  }

  hasMoreTokens(): boolean {
    return this.tokens.length > this.tokenCounter
  }

  advance(): void {
    if (!this.hasMoreTokens()) return
    this.tokenCounter++
    this.currentToken = this.tokens[this.tokenCounter]
    return
  }

  tokenType(): string {
    let rtnValue = ''
    if (Object.values(KEYWORDS).includes(this.currentToken)) {
      rtnValue = TOKEN_TYPE.KEYWORD
    } else if (Object.values(SYMBOLS).includes(this.currentToken)) {
      rtnValue = TOKEN_TYPE.SYMBOL
    } else if (this.currentToken.match(/^[0-9]+$/) && Number(this.currentToken) <= 32767) {
      rtnValue = TOKEN_TYPE.INT_CONST
    } else if (this.currentToken.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
      rtnValue = TOKEN_TYPE.IDENTIFIER
    } else if (this.currentToken.match(/^"[^"\n]*"$/)) {
      rtnValue = TOKEN_TYPE.STRING_CONST
    } else {
      throw new Error(`invalid tokenType. currentToken: ${this.currentToken}`)
    }
    return rtnValue
  }

  keyWord(): string|null {
    if (this.tokenType() !== TOKEN_TYPE.KEYWORD) return null
    return this.currentToken
  }

  symbol(): string|null {
    if (this.tokenType() !== TOKEN_TYPE.SYMBOL) return null
    return this.currentToken
  }

  identifier(): string|null {
    if (this.tokenType() !== TOKEN_TYPE.IDENTIFIER) return null
    return this.currentToken
  }

  intVal(): string|null {
    if (this.tokenType() !== TOKEN_TYPE.INT_CONST) return null
    return this.currentToken
  }

  stringVal(): string|null {
    if (this.tokenType() !== TOKEN_TYPE.STRING_CONST) return null
    return this.currentToken.slice(1, -1)
  }
}

export default JackTokenizer
