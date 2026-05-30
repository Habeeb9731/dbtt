#!/usr/bin/env node
// Run: node public/generate-icons.js
// Requires: npm install -g sharp  (or: npm install sharp in this dir)
//
// Generates icons/icon-192.png, icons/icon-512.png, apple-touch-icon.png
// from the favicon.svg using sharp.
//
// If you don't want to install sharp, use any SVG-to-PNG converter or
// an online tool like https://svgtopng.com and export at 192×192 and 512×512.

import { readFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dir = dirname(fileURLToPath(import.meta.url))

let sharp
try {
  sharp = (await import('sharp')).default
} catch {
  console.error('sharp not installed. Run: npm install sharp')
  process.exit(1)
}

const svg = readFileSync(join(__dir, 'favicon.svg'))
mkdirSync(join(__dir, 'icons'), { recursive: true })

const sizes = [
  { size: 192, file: 'icons/icon-192.png' },
  { size: 512, file: 'icons/icon-512.png' },
  { size: 180, file: 'apple-touch-icon.png' },
]

for (const { size, file } of sizes) {
  await sharp(svg).resize(size, size).png().toFile(join(__dir, file))
  console.log(`✓  ${file} (${size}×${size})`)
}
console.log('Icons generated.')
