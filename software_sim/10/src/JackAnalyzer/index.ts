import * as fs from 'fs'
import * as path from 'path'

import CompilationEngine from './compilationEngine'

const jackAnalyzer = () => {
  const directoryPath = process.argv[2]
  const allFiles = fs.readdirSync(path.resolve(__dirname, directoryPath))
  const files = allFiles.filter((file: any) => {
    return file.endsWith('.jack')
  })

  for (const file of files) {
    const inputFilePath = directoryPath + '/' + file
    const outputFilePath = __dirname + '/' + (directoryPath + '/' + file).slice(0, -5) + '2.xml'
    new CompilationEngine(inputFilePath, outputFilePath)
  }
}

jackAnalyzer()
