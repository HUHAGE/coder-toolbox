import { createRouter, createWebHashHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Json from '@/pages/tools/Json.vue'
import Xml from '@/pages/tools/Xml.vue'
import Base64 from '@/pages/tools/Base64.vue'
import Url from '@/pages/tools/Url.vue'
import Timestamp from '@/pages/tools/Timestamp.vue'
import Uuid from '@/pages/tools/Uuid.vue'
import Md5 from '@/pages/tools/Md5.vue'
import Unicode from '@/pages/tools/Unicode.vue'
import Qrcode from '@/pages/tools/Qrcode.vue'
import Idcard from '@/pages/tools/Idcard.vue'
import Regex from '@/pages/tools/Regex.vue'
import ConfigEditor from '@/pages/tools/ConfigEditor.vue'
import LinuxManual from '@/components/tools/LinuxManual.vue'
import IdcardNew from '@/pages/tools/IdcardNew.vue'
import SqlTruncate from '@/pages/tools/SqlTruncate.vue'
import WordToHtml from '@/pages/tools/WordToHtml.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/tools/json',
      name: 'JsonFormatter',
      component: () => import('@/pages/tools/Json.vue')
    },
    {
      path: '/tools/xml',
      name: 'XmlFormatter',
      component: Xml
    },
    {
      path: '/tools/base64',
      name: 'Base64Tool',
      component: Base64
    },
    {
      path: '/tools/url',
      name: 'UrlTool',
      component: Url
    },
    {
      path: '/tools/timestamp',
      name: 'TimestampTool',
      component: Timestamp
    },
    {
      path: '/tools/uuid',
      name: 'UuidTool',
      component: Uuid
    },
    {
      path: '/tools/md5',
      name: 'Md5Tool',
      component: Md5
    },
    {
      path: '/tools/unicode',
      name: 'UnicodeTool',
      component: Unicode
    },
    {
      path: '/tools/qrcode',
      name: 'QrcodeTool',
      component: Qrcode
    },
    {
      path: '/tools/idcard',
      name: 'IdcardTool',
      component: Idcard
    },
    {
      path: '/tools/http-status',
      name: 'HttpStatus',
      component: () => import('@/pages/tools/HttpStatus.vue')
    },
    {
      path: '/tools/sql-in',
      name: 'SqlInTool',
      component: () => import('@/pages/tools/SqlIn.vue')
    },
    {
      path: '/tools/cron',
      name: 'CronTool',
      component: () => import('@/pages/tools/Cron.vue')
    },
    {
      path: '/tools/regex',
      name: 'RegexTool',
      component: Regex
    },
    {
      path: '/tools/diff',
      name: 'DiffTool',
      component: () => import('@/pages/tools/DiffTool.vue')
    },
    {
      path: '/tools/sql-params',
      name: 'SqlParamsTool',
      component: () => import('@/pages/tools/SqlParams.vue')
    },
    {
      path: '/tools/credit-code',
      name: 'CreditCodeTool',
      component: () => import('@/pages/tools/CreditCode.vue')
    },
    {
      path: '/tools/sql-format',
      name: 'SqlFormatTool',
      component: () => import('@/pages/tools/SqlFormat.vue'),
      meta: {
        title: 'SQL 格式化'
      }
    },
    {
      path: '/tools/config-editor',
      name: 'ConfigEditor',
      component: ConfigEditor,
      meta: {
        title: '配置文件编辑器'
      }
    },
    {
      path: '/tools/linux-manual',
      name: 'LinuxManual',
      component: LinuxManual
    },
    {
      path: '/tools/aes',
      name: 'AesTool',
      component: () => import('@/pages/tools/Aes.vue')
    },
    {
      path: '/tools/rsa',
      name: 'RsaTool',
      component: () => import('@/pages/tools/Rsa.vue')
    },
    {
      path: '/tools/idcard-new',
      name: 'IdcardToolNew',
      component: IdcardNew
    },
    {
      path: '/tools/sql-convert',
      name: 'SqlConvertTool',
      component: () => import('@/pages/tools/SqlConvert.vue')
    },
    {
      path: '/tools/sql-truncate',
      name: 'SqlTruncateChecker',
      component: SqlTruncate,
      meta: {
        title: 'SQL 截断检测'
      }
    },
    {
      path: '/tools/sql-parser',
      name: 'SqlParserTool',
      component: () => import('@/pages/tools/SqlParser.vue'),
      meta: {
        title: 'SQL 解析器'
      }
    },
    {
      path: '/tools/word-to-html',
      name: 'WordToHtml',
      component: WordToHtml,
      meta: {
        title: 'word转html'
      }
    }
  ],
  scrollBehavior(to, from, savedPosition) {
    // 总是滚动到顶部
    return { 
      top: 0,
      behavior: 'instant'
    }
  }
})

export default router