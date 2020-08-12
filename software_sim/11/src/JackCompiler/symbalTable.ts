import { KIND } from './constants'

interface ISymbolTableAssociativeArray {
  [key: string]: ISymbolTableObject
}

interface ISymbolTableObject {
  type: string,
  kind: string,
  index: number
}

class SymbolTable {

  staticTable: ISymbolTableAssociativeArray
  fieldTable: ISymbolTableAssociativeArray
  argTable: ISymbolTableAssociativeArray
  varTable: ISymbolTableAssociativeArray

  constructor() {
    this.staticTable = {}
    this.fieldTable = {}
    this.argTable = {}
    this.varTable = {}
  }

  startSubroutine(): void {
    this.argTable = {}
    this.varTable = {}
  }

  define(name: string, type: string, kind: string): void {
    switch(kind) {
      case KIND.STATIC:
        this.staticTable[name] = {
          type: type,
          kind: kind,
          index: this.varCount(KIND.STATIC)
        }
        break
      case KIND.FIELD:
        this.fieldTable[name] = {
          type: type,
          kind: kind,
          index: this.varCount(KIND.FIELD)
        }
        break
      case KIND.ARGUMENT:
        this.argTable[name] = {
          type: type,
          kind: kind,
          index: this.varCount(KIND.ARGUMENT)
        }
        break
      case KIND.VAR:
        this.varTable[name] = {
          type: type,
          kind: kind,
          index: this.varCount(KIND.VAR)
        }
        break
      default:
        throw new Error('invalid kind in define method')
    }
  }

  varCount(kind: string): number {
    let result = 0
    switch(kind) {
      case KIND.STATIC:
        result = Object.keys(this.staticTable).length
        break
      case KIND.FIELD:
        result = Object.keys(this.fieldTable).length
        break
      case KIND.ARGUMENT:
        result = Object.keys(this.argTable).length
        break
      case KIND.VAR:
        result = Object.keys(this.varTable).length
        break
      default:
        throw new Error('invalid kind in varCount method')
    }

    return result
  }

  kindOf(name: string): string {
    let result = ''
    if (name in this.argTable) {
      result = this.argTable[name].kind
    } else if (name in this.varTable) {
      result = this.varTable[name].kind
    } else if (name in this.staticTable) {
      result = this.staticTable[name].kind
    } else if (name in this.fieldTable) {
      result = this.fieldTable[name].kind
    } else {
      result =KIND.NONE
    }

    return result
  }

  typeOf(name: string): string {
    let result = ''
    if (name in this.argTable) {
      result = this.argTable[name].type
    } else if (name in this.varTable) {
      result = this.varTable[name].type
    } else if (name in this.staticTable) {
      result = this.staticTable[name].type
    } else if (name in this.fieldTable) {
      result = this.fieldTable[name].type
    } else {
      throw new Error(`invalid name for typeOf, name: ${name}`)
    }

    return result
  }

  indexOf(name: string): number {
    let result = 0
    if (name in this.argTable) {
      result = this.argTable[name].index
    } else if (name in this.varTable) {
      result = this.varTable[name].index
    } else if (name in this.staticTable) {
      result = this.staticTable[name].index
    } else if (name in this.fieldTable) {
      result = this.fieldTable[name].index
    } else {
      throw new Error(`invalid name for indexOf, name: ${name}`)
    }

    return result
  }
}

export default SymbolTable
