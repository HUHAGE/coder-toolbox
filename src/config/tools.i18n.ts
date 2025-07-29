interface ToolTranslation {
  name: string
  description: string
}

interface ToolsTranslations {
  zh: Record<string, ToolTranslation>
  en: Record<string, ToolTranslation>
}

export const toolsTranslations: ToolsTranslations = {
  zh: {
    'message-wall': {
      name: '留言墙',
      description: '在线留言墙，分享你的想法'
    },
    invoice: {
      name: '发票打印助手',
      description: '专业的发票打印工具'
    },
    json: {
      name: 'JSON 格式化',
      description: 'JSON 数据格式化、验证、压缩'
    },
    xml: {
      name: 'XML 格式化',
      description: 'XML 数据格式化、验证、压缩'
    },
    timestamp: {
      name: '时间戳转换',
      description: '时间戳与日期格式互转'
    },
    base64: {
      name: 'Base64',
      description: 'Base64 编码解码转换'
    },
    url: {
      name: 'URL编码',
      description: 'URL 编码解码转换'
    },
    uuid: {
      name: 'UUID生成',
      description: '生成UUID/GUID'
    },
    qrcode: {
      name: '二维码生成',
      description: '生成二维码'
    },
    md5: {
      name: 'MD5 加密',
      description: 'MD5 加密与校验'
    },
    unicode: {
      name: 'Unicode编码',
      description: 'Unicode 中文编码解码转换'
    },
    'http-status': {
      name: 'HTTP状态码',
      description: 'HTTP状态码速查手册'
    },
    idcard: {
      name: '身份证号生成',
      description: '生成虚拟身份证号码'
    },
    'idcard-new': {
      name: '身份证号生成(新版)',
      description: '生成虚拟身份证号码'
    },
    'sql-in': {
      name: 'SQL IN生成',
      description: '生成 SQL IN 语句'
    },
    cron: {
      name: 'Cron 表达式',
      description: 'Cron 表达式生成与解析工具'
    },
    regex: {
      name: '正则表达式',
      description: '正则表达式生成器与测试工具'
    },
    diff: {
      name: '代码对比器',
      description: '优雅的代码差异对比工具'
    },
    'sql-params': {
      name: 'SQL参数填充',
      description: '智能填充SQL语句中的参数占位符'
    },
    'credit-code': {
      name: '统一社会信用代码',
      description: '生成统一社会信用代码'
    },
    'sql-format': {
      name: 'SQL 格式化',
      description: '智能格式化SQL语句，支持多种格式化选项'
    },
    'config-editor': {
      name: '配置文件编辑器',
      description: '智能可视化的配置文件编辑工具'
    },
    'linux-manual': {
      name: 'Linux命令手册',
      description: '优雅且全面的Linux命令查询工具'
    },
    aes: {
      name: 'AES 加解密',
      description: '支持多种模式的 AES 加密解密工具'
    },
    rsa: {
      name: 'RSA 加解密',
      description: 'RSA 非对称加密解密工具'
    },
    'sql-convert': {
      name: 'SQL 语法转换',
      description: 'SQL 语法转换工具'
    },
    'sql-truncate': {
      name: 'SQL 截断检测',
      description: '智能检测 SQL 语句中的字段截断风险'
    },
    'sql-parser': {
      name: 'SQL 插入语句解析器',
      description: '智能解析SQL INSERT语句的字段与值'
    },
    'word-to-html': {
      name: 'word转html',
      description: 'word转html'
    },
    fun: {
      name: '今天吃什么',
      description: '帮你决定今天吃什么'
    },
    'basketball-group': {
      name: '篮球分组',
      description: '智能篮球队员分组工具'
    },
    lottery: {
      name: '年会抽奖工具',
      description: '公平公正的随机抽奖工具'
    },
    'pixel-breakout': {
      name: '像素弹球大师',
      description: '红白机风格的经典弹球游戏'
    },
    tanchishe: {
      name: '超级贪吃蛇',
      description: '不一样的贪吃蛇游戏'
    },
    fanyinli: {
      name: '反应力测试',
      description: '测试你的反应力'
    },
    '2048': {
      name: '2048',
      description: '2048游戏'
    },
    paopao: {
      name: '泡泡的魔法世界',
      description: '泡泡的魔法世界'
    },
    mdtoimg: {
      name: 'markdown转图片',
      description: 'markdown转精美的图片'
    },
    pushbox: {
      name: '推箱子',
      description: '推箱子游戏'
    }
  },
  en: {
    'message-wall': {
      name: 'Message Wall',
      description: 'Online message wall, share your thoughts'
    },
    invoice: {
      name: 'Invoice Printer Assistant',
      description: 'Professional invoice printing tool'
    },
    json: {
      name: 'JSON Formatter',
      description: 'Format, validate and compress JSON data'
    },
    xml: {
      name: 'XML Formatter',
      description: 'Format, validate and compress XML data'
    },
    timestamp: {
      name: 'Timestamp Converter',
      description: 'Convert between timestamp and date format'
    },
    base64: {
      name: 'Base64',
      description: 'Base64 encode and decode'
    },
    url: {
      name: 'URL Encoder',
      description: 'URL encode and decode'
    },
    uuid: {
      name: 'UUID Generator',
      description: 'Generate UUID/GUID'
    },
    qrcode: {
      name: 'QR Code Generator',
      description: 'Generate QR code'
    },
    md5: {
      name: 'MD5 Encryption',
      description: 'MD5 encryption and verification'
    },
    unicode: {
      name: 'Unicode Encoder',
      description: 'Unicode Chinese encode and decode'
    },
    'http-status': {
      name: 'HTTP Status Code',
      description: 'HTTP status code quick reference'
    },
    idcard: {
      name: 'ID Card Generator',
      description: 'Generate virtual ID card number'
    },
    'idcard-new': {
      name: 'ID Card Generator (New)',
      description: 'Generate virtual ID card number'
    },
    'sql-in': {
      name: 'SQL IN Generator',
      description: 'Generate SQL IN statement'
    },
    cron: {
      name: 'Cron Expression',
      description: 'Cron expression generator and parser'
    },
    regex: {
      name: 'Regular Expression',
      description: 'Regular expression generator and tester'
    },
    diff: {
      name: 'Code Diff',
      description: 'Elegant code difference comparison tool'
    },
    'sql-params': {
      name: 'SQL Parameter Filler',
      description: 'Smart fill SQL statement parameter placeholders'
    },
    'credit-code': {
      name: 'Credit Code',
      description: 'Generate unified social credit code'
    },
    'sql-format': {
      name: 'SQL Formatter',
      description: 'Smart SQL statement formatter with multiple options'
    },
    'config-editor': {
      name: 'Config Editor',
      description: 'Smart visual configuration file editor'
    },
    'linux-manual': {
      name: 'Linux Manual',
      description: 'Elegant and comprehensive Linux command reference'
    },
    aes: {
      name: 'AES Encryption',
      description: 'AES encryption and decryption with multiple modes'
    },
    rsa: {
      name: 'RSA Encryption',
      description: 'RSA asymmetric encryption and decryption'
    },
    'sql-convert': {
      name: 'SQL Syntax Converter',
      description: 'SQL syntax converter'
    },
    'sql-truncate': {
      name: 'SQL Truncation Detector',
      description: 'Smart detection of field truncation risk in SQL statements'
    },
    'sql-parser': {
      name: 'SQL Insert Parser',
      description: 'Smart parse fields and values from SQL INSERT statements'
    },
    'word-to-html': {
      name: 'Word to HTML',
      description: 'Convert Word to HTML'
    },
    fun: {
      name: 'What to Eat',
      description: 'Help you decide what to eat today'
    },
    'basketball-group': {
      name: 'Basketball Group',
      description: 'Smart basketball player grouping tool'
    },
    lottery: {
      name: 'Lucky Draw',
      description: 'Fair and just random lucky draw tool'
    },
    'pixel-breakout': {
      name: 'Pixel Breakout',
      description: 'Classic breakout game in retro style'
    },
    tanchishe: {
      name: 'Super Snake',
      description: 'A different snake game'
    },
    fanyinli: {
      name: 'Reaction Test',
      description: 'Test your reaction speed'
    },
    '2048': {
      name: '2048',
      description: '2048 game'
    },
    paopao: {
      name: 'Bubble World',
      description: 'Magic world of bubbles'
    },
    mdtoimg: {
      name: 'Markdown to Image',
      description: 'Convert markdown to beautiful image'
    },
    pushbox: {
      name: 'Push Box',
      description: 'Push box game'
    }
  }
} 