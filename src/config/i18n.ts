interface Translation {
  title: string
  searchPlaceholder: string
  allTools: string
  categories: Record<string, string>
  tooltips: Record<string, string>
  stats: Record<string, string>
  links: Record<string, string>
}

interface Translations {
  zh: Translation
  en: Translation
}

export const translations: Translations = {
  zh: {
    title: '呼哈开发者工具箱',
    searchPlaceholder: '搜索工具...',
    allTools: '全部工具',
    categories: {
      format: '格式化',
      encode: '编解码',
      convert: '转换',
      generate: '生成',
      sql: 'SQL工具',
      other: '其他',
      fun: '趣味'
    },
    tooltips: {
      toggleTheme: '切换主题',
      aboutProject: '关于项目',
      aboutAuthor: '关于作者',
      github: '查看源码',
      enableAnimation: '开启背景动画',
      disableAnimation: '关闭背景动画'
    },
    stats: {
      tools: '工具',
      categories: '分类',
      version: '版本'
    },
    links: {
      sourceCode: '源代码',
      aboutAuthor: '关于作者',
      aboutProject: '关于项目',
      feedback: '问题反馈'
    }
  },
  en: {
    title: 'HUHA Developer Toolbox',
    searchPlaceholder: 'Search tools...',
    allTools: 'All Tools',
    categories: {
      format: 'Format',
      encode: 'Encode/Decode',
      convert: 'Convert',
      generate: 'Generate',
      sql: 'SQL Tools',
      other: 'Others',
      fun: 'Fun'
    },
    tooltips: {
      toggleTheme: 'Toggle Theme',
      aboutProject: 'About Project',
      aboutAuthor: 'About Author',
      github: 'View Source',
      enableAnimation: 'Enable Animation',
      disableAnimation: 'Disable Animation'
    },
    stats: {
      tools: 'Tools',
      categories: 'Categories',
      version: 'Version'
    },
    links: {
      sourceCode: 'Source Code',
      aboutAuthor: 'About Author',
      aboutProject: 'About Project',
      feedback: 'Feedback'
    }
  }
} 