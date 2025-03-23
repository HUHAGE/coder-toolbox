interface ConfigItem {
  key: string
  value: string
  type: string
  isCommented: boolean
  description?: string
  options?: string[]
  multiline?: boolean
}

export const parseProperties = (content: string, encoding = 'utf-8') => {
  const lines = content.split(/\r?\n/)
  const configs: any[] = []
  
  lines.forEach(line => {
    // 跳过空行
    if (!line.trim()) return
    
    // 检查是否是注释行
    const isCommented = /^\s*[#!]/.test(line)
    // 移除注释符号获取实际内容
    const actualLine = isCommented ? line.replace(/^\s*[#!]/, '').trim() : line.trim()
    
    // 解析键值对
    const match = actualLine.match(/^([^=]+?)\s*=\s*(.*)$/)
    if (match) {
      const [, key, value] = match
      
      // 检测值的类型
      let type = 'text'
      let parsedValue = value
      
      if (/^(true|false)$/i.test(value)) {
        type = 'boolean'
        parsedValue = value.toLowerCase() === 'true'
      } else if (/^\d+(\.\d+)?$/.test(value)) {
        type = 'number'
        parsedValue = Number(value)
      } else if (/password|secret|key/i.test(key)) {
        type = 'password'
      } else if (value.includes('\n')) {
        type = 'text-multiline'
      }
      
      configs.push({
        key: key.trim(),
        value: parsedValue,
        type,
        isCommented,
        description: '', // 可以从相邻的注释中提取描述
      })
    }
  })
  
  return configs
}

export const stringifyProperties = (configs: any[]) => {
  return configs.map(config => {
    const line = `${config.key}=${config.value}`
    return config.isCommented ? `# ${line}` : line
  }).join('\n')
}

function detectValueType(value: string): string {
  if (/^(true|false)$/i.test(value)) return 'boolean'
  if (/^\d+(\.\d+)?$/.test(value)) return 'number'
  if (/^(yes|no|on|off)$/i.test(value)) return 'enum'
  if (/password|secret|key/i.test(value)) return 'password'
  return 'text'
}

function detectEnumOptions(value: string): string[] | undefined {
  const commonEnums = {
    'yes,no': ['yes', 'no'],
    'on,off': ['on', 'off'],
    'true,false': ['true', 'false']
  }
  
  for (const [pattern, options] of Object.entries(commonEnums)) {
    if (pattern.includes(value.toLowerCase())) {
      return options
    }
  }
  
  return undefined
} 