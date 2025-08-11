import jsonIcon from '@/assets/icons/json.svg'
import xmlIcon from '@/assets/icons/xml.svg'
import timestampIcon from '@/assets/icons/timestamp.svg'
import base64Icon from '@/assets/icons/base64.svg'
import urlIcon from '@/assets/icons/url.svg'
import uuidIcon from '@/assets/icons/uuid.svg'
import qrcodeIcon from '@/assets/icons/qrcode.svg'
import md5Icon from '@/assets/icons/md5.svg'
import unicodeIcon from '@/assets/icons/unicode.svg'
import httpIcon from '@/assets/icons/http.svg'
import idcardIcon from '@/assets/icons/idcard.svg'
import sqlIcon from '@/assets/icons/sql.svg'
import cronIcon from '@/assets/icons/cron.svg'
import regexIcon from '@/assets/icons/regex.svg'
import diffIcon from '@/assets/icons/diff.svg'
import sqlParamsIcon from '@/assets/icons/sql-params.svg'
import creditIcon from '@/assets/icons/credit.svg'
import sqlFormatIcon from '@/assets/icons/sql-format.svg'
import configEditorIcon from '@/assets/icons/config.svg'
import linuxIcon from '@/assets/icons/linux.svg'
import aesIcon from '@/assets/icons/aes.svg'
import rsaIcon from '@/assets/icons/rsa.svg'
import sqlZHIcon from '@/assets/icons/sql-zh.svg'
import sqlTruncateIcon from '@/assets/icons/sql-truncate.svg'
import sqlAddIcon from '@/assets/icons/sql-add.svg'
import wordToHtmlIcon from '@/assets/icons/word-to-html.svg'
import htmlIcon from '@/assets/icons/html.svg'
import hanBao from '@/assets/icons/汉堡.svg'
import lanQiu from '@/assets/icons/篮球.svg'
import lotteryIcon from '@/assets/icons/抽奖.svg'
import pixelBreakoutIcon from '@/assets/icons/pixel-breakout.svg'
import tanchisheIcon from '@/assets/icons/贪吃蛇.svg'
import fanyinliIcon from '@/assets/icons/反应力.svg'
import twoIcon from '@/assets/icons/2048.svg'
import paopaoIcon from '@/assets/icons/paopao.svg'
import mdIcon from '@/assets/icons/markdown.svg'
import pushboxIcon from '@/assets/icons/box.svg'
import invoiceIcon from '@/assets/icons/invoice.svg'
import messageWallIcon from '@/assets/icons/message-wall.svg'

export const tools = [
  {
    code: 'message-wall',
    name: '留言墙',
    description: '在线留言墙，分享你的想法',
    icon: messageWallIcon,
    path: 'https://mswall.huhage.fun/',
    category: 'fun'
  },
  {
    code: 'html-share',
    name: 'HTML分享',
    description: '安全、便捷地分享您的HTML内容',
    icon: htmlIcon,
    path: 'https://html.huhage.fun/',
    category: 'other'
  },
  {
    code: 'invoice',
    name: '发票打印助手',
    description: '专业的发票打印工具',
    icon: invoiceIcon,
    path: 'https://invoice.huhage.fun/',
    category: 'other'
  },
  {
    code: 'json',
    name: 'JSON 格式化',
    description: 'JSON 数据格式化、验证、压缩',
    icon: jsonIcon,
    path: '/tools/json',
    category: 'format'
  },
  {
    code: 'xml',
    name: 'XML 格式化',
    description: 'XML 数据格式化、验证、压缩',
    icon: xmlIcon,
    path: '/tools/xml',
    category: 'format'
  },
  {
    code: 'timestamp',
    name: '时间戳转换',
    description: '时间戳与日期格式互转',
    icon: timestampIcon,
    path: '/tools/timestamp',
    category: 'convert'
  },
  {
    code: 'base64',
    name: 'Base64',
    description: 'Base64 编码解码转换',
    icon: base64Icon,
    path: '/tools/base64',
    category: 'encode'
  },
  {
    code: 'url',
    name: 'URL编码',
    description: 'URL 编码解码转换',
    icon: urlIcon,
    path: '/tools/url',
    category: 'encode'
  },
  {
    code: 'uuid',
    name: 'UUID生成',
    description: '生成UUID/GUID',
    icon: uuidIcon,
    path: '/tools/uuid',
    category: 'generate'
  },
  {
    code: 'qrcode',
    name: '二维码生成',
    description: '生成二维码',
    icon: qrcodeIcon,
    path: '/tools/qrcode',
    category: 'generate'
  },
  {
    code: 'md5',
    name: 'MD5 加密',
    description: 'MD5 加密与校验',
    icon: md5Icon,
    path: '/tools/md5',
    category: 'encode'
  },
  {
    code: 'unicode',
    name: 'Unicode编码',
    description: 'Unicode 中文编码解码转换',
    icon: unicodeIcon,
    path: '/tools/unicode',
    category: 'encode'
  },
  {
    code: 'http-status',
    name: 'HTTP状态码',
    description: 'HTTP状态码速查手册',
    icon: httpIcon,
    path: '/tools/http-status',
    category: 'other'
  },
  {
    code: 'idcard',
    name: '身份证号生成',
    description: '生成虚拟身份证号码',
    icon: idcardIcon,
    path: '/tools/idcard',
    category: 'generate'
  },
  {
    code: 'idcard-new',
    name: '身份证号生成(新版)',
    description: '生成虚拟身份证号码',
    icon: idcardIcon,
    path: '/tools/idcard-new',
    category: 'generate'
  },
  {
    code: 'sql-in',
    name: 'SQL IN生成',
    description: '生成 SQL IN 语句',
    icon: sqlIcon,
    path: '/tools/sql-in',
    category: ['sql', 'generate'] // 支持多分类
  },
  {
    code: 'cron',
    name: 'Cron 表达式',
    description: 'Cron 表达式生成与解析工具',
    icon: cronIcon,
    path: '/tools/cron',
    category: 'other'
  },
  {
    code: 'regex',
    name: '正则表达式',
    description: '正则表达式生成器与测试工具',
    icon: regexIcon,
    path: '/tools/regex',
    category: 'format'
  },
  {
    code: 'diff',
    name: '代码对比器',
    description: '优雅的代码差异对比工具',
    icon: diffIcon,
    path: '/tools/diff',
    category: 'format'
  },
  {
    code: 'sql-params',
    name: 'SQL参数填充',
    description: '智能填充SQL语句中的参数占位符',
    icon: sqlParamsIcon,
    path: '/tools/sql-params',
    category: ['sql', 'generate']
  },
  {
    code: 'credit-code',
    name: '统一社会信用代码',
    description: '生成统一社会信用代码',
    icon: creditIcon,
    path: '/tools/credit-code',
    category: 'generate'
  },
  {
    code: 'sql-format',
    name: 'SQL 格式化',
    description: '智能格式化SQL语句，支持多种格式化选项',
    icon: sqlFormatIcon,
    path: '/tools/sql-format',
    category: ['sql', 'format']
  },
  {
    code: 'config-editor',
    name: '配置文件编辑器',
    description: '智能可视化的配置文件编辑工具',
    icon: configEditorIcon,
    path: '/tools/config-editor',
    category: 'other'
  },
  {
    code: 'linux-manual',
    name: 'Linux命令手册',
    description: '优雅且全面的Linux命令查询工具',
    icon: linuxIcon,
    path: '/tools/linux-manual',
    category: 'other'
  },
  {
    code: 'aes',
    name: 'AES 加解密',
    description: '支持多种模式的 AES 加密解密工具',
    icon: aesIcon,
    path: '/tools/aes',
    category: 'encode'
  },
  {
    code: 'rsa',
    name: 'RSA 加解密',
    description: 'RSA 非对称加密解密工具',
    icon: rsaIcon,
    path: '/tools/rsa',
    category: 'encode'
  },
  {
    code: 'sql-convert',
    name: 'SQL 语法转换',
    description: 'SQL 语法转换工具',
    icon: sqlZHIcon,
    path: '/tools/sql-convert',
    category: ['sql', 'convert']
  },
  {
    code: 'sql-truncate',
    name: 'SQL 截断检测',
    description: '智能检测 SQL 语句中的字段截断风险',
    icon: sqlTruncateIcon,
    path: '/tools/sql-truncate',
    category: ['sql', 'other']
  },
  {
    code: 'sql-parser',
    name: 'SQL 插入语句解析器',
    description: '智能解析SQL INSERT语句的字段与值',
    icon: sqlAddIcon,
    path: '/tools/sql-parser',
    category: ['sql', 'format']
  },
  {
    code: 'word-to-html',
    name: 'word转html',
    description: 'word转html',
    icon: wordToHtmlIcon,
    path: '/tools/word-to-html',
    category: ['convert', 'format']
  },
  {
    code: 'html',
    name: 'HTML 格式化',
    description: 'HTML 格式化、压缩、净化、折叠、预览',
    icon: wordToHtmlIcon,
    path: '/tools/html',
    category: 'format'
  },
  {
    code: 'fun',
    name: '今天吃什么',
    description: '帮你决定今天吃什么',
    icon: hanBao,
    path: 'https://www.soutzz.top/', // 直接使用部署好的网站链接
    category: 'fun'
  },
  {
    code: 'basketball-group',
    name: '篮球分组',
    description: '智能篮球队员分组工具',
    icon: lanQiu,
    path: '/tools/basketball-group',
    category: 'fun'
  },
  {
    code: 'lottery',
    name: '年会抽奖工具',
    description: '公平公正的随机抽奖工具',
    icon: lotteryIcon,
    path: 'https://lucky.huhage.fun/', // 直接使用部署好的网站链接
    category: 'fun'
  },
  {
    code: 'pixel-breakout',
    name: '像素弹球大师',
    description: '红白机风格的经典弹球游戏',
    icon: pixelBreakoutIcon,
    path: '/games/pixel-breakout-master',
    category: 'fun'
  },
  {
    code: 'tanchishe',
    name: '超级贪吃蛇',
    description: '不一样的贪吃蛇游戏',
    icon: tanchisheIcon,
    path: '/games/tanchishe',
    category: 'fun'
  },
  {
    code: 'fanyinli',
    name: '反应力测试',
    description: '测试你的反应力',
    icon: fanyinliIcon,
    path: '/games/fanyingli',
    category: 'fun'
  },
  {
    code: '2048',
    name: '2048',
    description: '2048游戏',
    icon: twoIcon,
    path: '/games/2048',
    category: 'fun'
  },
  {
    code: 'paopao',
    name: '泡泡的魔法世界',
    description: '泡泡的魔法世界',
    icon: paopaoIcon,
    path: '/games/paopao',
    category: 'fun'
  },
  {
    code: 'mdtoimg',
    name: 'markdown转图片',
    description: 'markdown转精美的图片',
    icon: mdIcon,
    path: 'https://markly-style-craft.netlify.app/',
    category: ['convert', 'format']
  },
  {
    code: 'pushbox',
    name: '推箱子',
    description: '推箱子游戏',
    icon: pushboxIcon,
    path: '/games/pushbox',
    category: 'fun'
  }
]