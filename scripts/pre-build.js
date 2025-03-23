const fs = require('fs-extra')
const path = require('path')

async function preBuildCheck() {
  const requiredFiles = [
    'logo.png',
    'plugin.json',
    'preload.js',
    'public/tool_logo.png'
  ]

  for (const file of requiredFiles) {
    if (!await fs.pathExists(file)) {
      console.error(`Missing required file: ${file}`)
      process.exit(1)
    }
  }

  console.log('Pre-build check passed!')
}

preBuildCheck() 