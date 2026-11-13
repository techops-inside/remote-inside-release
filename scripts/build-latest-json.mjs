#!/usr/bin/env node
// Monta o latest.json do tauri-plugin-updater a partir do que o workflow de release já
// tem na mão: versão, URL pública do instalador e o arquivo .sig gerado pelo `tauri
// build` (assinatura da chave privada do updater, não tem a ver com Authenticode).
//
// Uso: node build-latest-json.mjs <version> <downloadUrl> <sigFilePath> [outFile]
import { readFileSync, writeFileSync } from 'node:fs'

const [version, downloadUrl, sigFilePath, outFile = 'latest.json'] = process.argv.slice(2)

if (!version || !downloadUrl || !sigFilePath) {
  console.error('uso: build-latest-json.mjs <version> <downloadUrl> <sigFilePath> [outFile]')
  process.exit(1)
}

const signature = readFileSync(sigFilePath, 'utf8').trim()

const manifest = {
  version,
  notes: `Remote Inside ${version}`,
  pub_date: new Date().toISOString(),
  platforms: {
    'windows-x86_64': { signature, url: downloadUrl },
  },
}

writeFileSync(outFile, JSON.stringify(manifest, null, 2))
console.log(`latest.json escrito em ${outFile}`)
