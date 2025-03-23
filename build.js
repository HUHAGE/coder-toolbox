const fs = require('fs-extra')
const path = require('path')

async function buildPlugin() {
  try {
    // 确保 dist 目录存在
    await fs.ensureDir('dist')

    // 复制必要的文件到 dist 目录
    await Promise.all([
      fs.copy('logo.png', 'dist/logo.png'),
      fs.copy('public/tool_logo.png', 'dist/tool_logo.png'),
      fs.copy('plugin.json', 'dist/plugin.json'),
      fs.copy('preload.js', 'dist/preload.js')
    ])

    // 复制其他静态资源
    await fs.copy('public', 'dist', {
      filter: (src) => {
        // 排除开发环境特定文件
        return !src.includes('index.dev.html') && !src.includes('.DS_Store')
      }
    })

    // 修改 index.html 中的资源路径
    const indexPath = path.join('dist', 'index.html')
    let indexContent = await fs.readFile(indexPath, 'utf8')
    
    // 确保所有资源路径都是相对路径
    indexContent = indexContent.replace(/src="\//g, 'src=".')
    indexContent = indexContent.replace(/href="\//g, 'href=".')
    
    await fs.writeFile(indexPath, indexContent)

    console.log('Plugin files built successfully!')
  } catch (error) {
    console.error('Build failed:', error)
    process.exit(1)
  }
}

buildPlugin() 