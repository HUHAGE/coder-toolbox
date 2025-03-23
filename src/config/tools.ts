import { wordToHtmlIcon } from '@/components/icons'

export const tools = [
  {
    code: 'word-to-html',
    name: 'Word转HTML',
    description: '将Word文档转换为HTML格式，保持原文档样式',
    icon: wordToHtmlIcon,
    path: '/tools/word-to-html',
    category: 'format'
  },
  {
    code: 'sql',
    name: 'SQL 格式化',
    description: '智能格式化SQL语句，支持多种格式化选项',
    icon: sqlIcon,
    path: '/tools/sql',
    category: 'format'
  },
  {
    code: 'sql-truncate',
    name: 'SQL截断检测',
    description: '检测SQL语句中可能存在的字段截断风险',
    icon: sqlIcon,
    path: '/tools/sql-truncate',
    category: 'sql'
  }
]