import * as fs from 'fs'

class VMWriter {

  filePath: string

  constructor(filePath: string) {
    this.filePath = filePath
    fs.writeFileSync(this.filePath, '')
  }

  writePush(segment: string, index: number): void {
    fs.appendFileSync(this.filePath, `push ${segment} ${index}` + '\n')
  }

  writePop(segment: string, index: number): void {
    fs.appendFileSync(this.filePath, `pop ${segment} ${index}` + '\n')
  }

  writeArithmetic(command: string): void {
    fs.appendFileSync(this.filePath, command + '\n')
  }

  writeLabel(label: string): void {
    fs.appendFileSync(this.filePath, `label ${label}` + '\n')
  }

  writeGoto(label: string): void {
    fs.appendFileSync(this.filePath, `goto ${label}` + '\n')
  }

  writeIf(label: string): void {
    fs.appendFileSync(this.filePath, `if-goto ${label}` + '\n')
  }

  writeCall(name: string, nArgs: number): void {
    fs.appendFileSync(this.filePath, `call ${name} ${nArgs}` + '\n')
  }

  writeFunction(name: string, nLocals: number): void {
    fs.appendFileSync(this.filePath, `function ${name} ${nLocals}` + '\n')
  }

  writeReturn(): void {
    fs.appendFileSync(this.filePath, 'return' + '\n')
  }
}

export default VMWriter
