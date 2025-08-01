<template>
  <div class="http-status-tool">
    <div class="tool-header">
      <div class="search-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜索状态码或描述..."
          clearable
          class="search-input"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>

      <div class="category-nav">
        <div
          v-for="group in statusGroups"
          :key="group.name"
          class="nav-item"
          :class="{ active: activeCategory === group.name }"
          @click="scrollToCategory(group.name)"
        >
          <div class="nav-item-content">
            <div class="nav-indicator" :class="getCategoryClass(group.name)"></div>
            <span class="nav-text">{{ group.name }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="status-groups" ref="groupsContainer">
      <div 
        v-for="group in filteredStatusGroups" 
        :key="group.name" 
        class="status-group"
        :ref="el => setRef(el, group.name)"
      >
        <h2 class="group-title">{{ group.name }}</h2>
        <div class="status-list">
          <div
            v-for="status in group.codes"
            :key="status.code"
            class="status-card"
            :class="getStatusClass(status.code)"
          >
            <div class="status-card-inner">
              <div class="status-header">
                <div class="status-code-wrapper">
                  <span class="status-code">{{ status.code }}</span>
                  <span class="status-short-title">{{ status.shortTitle }}</span>
                </div>
                <span class="status-name">{{ status.name }}</span>
              </div>
              <p class="status-description">{{ status.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { Search } from '@element-plus/icons-vue'

interface StatusCode {
  code: number
  name: string
  shortTitle: string // 添加简短中文标题
  description: string
}

interface StatusGroup {
  name: string
  codes: StatusCode[]
}

const searchQuery = ref('')
const activeCategory = ref('')
const categoryRefs = ref<{ [key: string]: HTMLElement | null }>({})
const groupsContainer = ref<HTMLElement | null>(null)

const setRef = (el: ComponentPublicInstance | Element | null, groupName: string) => {
  if (el) {
    const element = el instanceof Element ? el as HTMLElement : (el.$el as HTMLElement)
    categoryRefs.value[groupName] = element
  } else {
    categoryRefs.value[groupName] = null
  }
}

const statusGroups: StatusGroup[] = [
  {
    name: '信息响应 (1xx)',
    codes: [
      {
        code: 100,
        name: 'Continue',
        shortTitle: '继续',
        description: '这个临时响应表明，目前为止的请求都很正常，客户端应该继续请求。用于在发送post请求时，当服务器收到请求头后，告诉客户端可以继续发送请求体。'
      },
      {
        code: 101,
        name: 'Switching Protocols',
        shortTitle: '切换协议',
        description: '服务器已理解客户端的请求，并将通过Upgrade消息头通知客户端采用不同的协议来完成这个请求。比如客户端请求升级到WebSocket或者HTTP 2.0。'
      },
      {
        code: 102,
        name: 'Processing',
        shortTitle: '处理中',
        description: '服务器已收到并正在处理请求，但当前没有响应可用。这可以防止客户端超时，并假设请求丢失。常用于需要较长时间处理的请求，比如涉及大量计算或数据处理的场景。'
      },
      {
        code: 103,
        name: 'Early Hints',
        shortTitle: '预加载提示',
        description: '此状态码主要用于与Link链接头一起使用，允许服务器在最终的HTTP消息之前发送一些响应头。这可以让浏览器提前开始准备某些操作，比如预加载资源，从而优化页面加载性能。'
      }
    ]
  },
  {
    name: '成功响应 (2xx)',
    codes: [
      {
        code: 200,
        name: 'OK',
        shortTitle: '成功',
        description: '请求成功。这是最常见的HTTP响应，表示服务器成功处理了客户端的请求。GET请求返回请求的数据，POST请求返回新创建资源的描述。'
      },
      {
        code: 201,
        name: 'Created',
        shortTitle: '已创建',
        description: '请求已成功，并因此创建了一个新的资源。这通常是POST请求的响应，比如创建新用户、发布新文章后的响应。响应头应该包含指向新资源的URI。'
      },
      {
        code: 202,
        name: 'Accepted',
        shortTitle: '已接受',
        description: '服务器已接受请求，但尚未处理。这是一个异步操作的响应，比如批量处理、长时间运算等场景。客户端可以通过轮询或其他方式获取最终处理结果。'
      },
      {
        code: 203,
        name: 'Non-Authoritative Information',
        shortTitle: '非权威信息',
        description: '服务器已成功处理请求，但返回的信息可能来自另一来源。比如经过代理服务器修改的响应内容，或者来自缓存的旧数据。客户端应该考虑数据可能不是最新的。'
      },
      {
        code: 204,
        name: 'No Content',
        shortTitle: '无内容',
        description: '服务器成功处理了请求，但不需要返回任何实体内容。常用于只需要客户端更新自身状态的场景，比如保存数据后不需要返回保存的内容，或者DELETE请求删除资源成功后的响应。'
      },
      {
        code: 205,
        name: 'Reset Content',
        shortTitle: '重置内容',
        description: '服务器成功处理了请求，且要求客户端重置文档视图。常用于表单提交后清空表单内容，这样用户就可以轻松地开始另一个输入操作。'
      },
      {
        code: 206,
        name: 'Partial Content',
        shortTitle: '部分内容',
        description: '服务器成功处理了部分GET请求。这用于大文件下载的断点续传，或者视频流媒体的分段请求。响应中必须包含Content-Range头，指明返回内容的范围。'
      },
      {
        code: 207,
        name: 'Multi-Status',
        shortTitle: '多状态',
        description: '用于WebDAV协议，响应消息体是XML格式，包含多个独立操作的状态。比如在一次请求中操作多个文件，每个文件都有自己的状态码。'
      },
      {
        code: 208,
        name: 'Already Reported',
        shortTitle: '已报告',
        description: '用于WebDAV绑定的成员已经在前面的响应中列出，为了避免重复不再次列出。这通常用于避免在多状态响应中重复列举相同的资源。'
      },
      {
        code: 226,
        name: 'IM Used',
        shortTitle: '使用IM',
        description: '服务器已经完成了对资源的GET请求，并且响应是对当前实例应用的一个或多个实例操作的结果。主要用于增量更新，告诉客户端响应内容是根据之前的版本计算出的差异。'
      }
    ]
  },
  {
    name: '重定向消息 (3xx)',
    codes: [
      {
        code: 300,
        name: 'Multiple Choices',
        shortTitle: '多种选择',
        description: '请求的资源有多个可选的响应。服务器会在响应中提供一个选项列表，用户（或浏览器）可以自行选择一个首选的地址进行重定向。比如一个文件有多个不同格式的版本可供下载。'
      },
      {
        code: 301,
        name: 'Moved Permanently',
        shortTitle: '永久移动',
        description: '请求的资源已永久移动到新位置。后续的所有请求都应该使用新的URL。常用于网站改版，域名更换等场景。搜索引擎会更新资源的链接。浏览器通常会缓存这个重定向。'
      },
      {
        code: 302,
        name: 'Found',
        shortTitle: '临时移动',
        description: '请求的资源临时从不同的URL响应请求。临时重定向，但建议客户端继续使用原有URL，因为将来资源可能会恢复。常用于临时维护页面、A/B测试等场景。'
      },
      {
        code: 303,
        name: 'See Other',
        shortTitle: '查看其他',
        description: '服务器要求客户端通过GET方法获取请求的资源。通常用于POST、PUT或DELETE请求完成后，重定向到显示结果的页面。这确保了刷新页面时不会重复提交表单。'
      },
      {
        code: 304,
        name: 'Not Modified',
        shortTitle: '未修改',
        description: '资源未修改，服务器返回此状态码时，不会返回任何资源。客户端通常会缓存访问过的资源，通过提供一个头信息指出客户端希望只返回在指定日期之后修改的资源。'
      },
      {
        code: 305,
        name: 'Use Proxy',
        shortTitle: '使用代理',
        description: '请求的资源必须通过代理访问。出于安全考虑，这个状态码已经不再推荐使用，因为它可能会被恶意网站用来进行中间人攻击。'
      },
      {
        code: 307,
        name: 'Temporary Redirect',
        shortTitle: '临时重定向',
        description: '与302类似，但明确要求客户端必须保持请求方法和消息主体不变。这意味着如果原始请求是POST，则重定向请求也必须是POST，这保证了重定向的语义完整性。'
      },
      {
        code: 308,
        name: 'Permanent Redirect',
        shortTitle: '永久重定向',
        description: '与301类似，但明确要求客户端保持请求方法和消息主体不变。这意味着如果原始请求是POST，则重定向请求也必须是POST。用于需要保持请求方法的永久重定向场景。'
      }
    ]
  },
  {
    name: '客户端错误 (4xx)',
    codes: [
      {
        code: 400,
        name: 'Bad Request',
        shortTitle: '请求错误',
        description: '由于语法无效，服务器无法理解请求。常见原因包括：请求参数格式错误、JSON格式错误、必需字段缺失等。开发者应检查请求数据的格式和完整性。'
      },
      {
        code: 401,
        name: 'Unauthorized',
        shortTitle: '未授权',
        description: '请求需要用户认证。客户端请求的资源需要身份验证，但未提供凭据或凭据无效。服务器会在响应头中包含WWW-Authenticate字段，说明认证方案。'
      },
      {
        code: 402,
        name: 'Payment Required',
        shortTitle: '需要付费',
        description: '此状态码最初是为数字支付系统设计的，表示请求需要付费才能访问。虽然保留以供将来使用，但目前很少见到实际应用。可用于订阅服务、付费API等场景。'
      },
      {
        code: 403,
        name: 'Forbidden',
        shortTitle: '禁止访问',
        description: '服务器已经理解请求，但拒绝执行。与401不同，身份验证不会改变结果。这通常因为客户端没有访问资源的权限，比如普通用户试图访问管理员功能。'
      },
      {
        code: 404,
        name: 'Not Found',
        shortTitle: '未找到',
        description: '服务器找不到请求的资源。可能的原因包括：URL错误、资源已被删除、资源确实不存在等。这是最常见的错误之一，开发者应该为用户提供友好的错误提示。'
      },
      {
        code: 405,
        name: 'Method Not Allowed',
        shortTitle: '方法不允许',
        description: '服务器不支持请求行中的方法。例如，API只允许GET和POST，但收到了PUT请求。服务器必须返回Allow头，列出支持的方法。'
      },
      {
        code: 406,
        name: 'Not Acceptable',
        shortTitle: '不接受',
        description: '服务器无法根据客户端请求的内容特性完成请求。比如，客户端要求返回JSON格式，但服务器只能返回XML格式；或客户端指定语言版本不可用。'
      },
      {
        code: 407,
        name: 'Proxy Authentication Required',
        shortTitle: '需要代理认证',
        description: '类似401，但表示客户端必须先通过代理服务器的身份验证。代理服务器会返回Proxy-Authenticate响应头，指明身份验证方案。'
      },
      {
        code: 408,
        name: 'Request Timeout',
        shortTitle: '请求超时',
        description: '服务器等待客户端发送请求时超时。客户端没有在服务器预备等待的时间内完成请求。这可能是网络问题或客户端程序问题导致的。'
      },
      {
        code: 409,
        name: 'Conflict',
        shortTitle: '冲突',
        description: '请求与服务器当前状态冲突。常见于并发操作导致的冲突，比如多个用户同时编辑同一资源，或者试图创建已存在的唯一键值。'
      },
      {
        code: 410,
        name: 'Gone',
        shortTitle: '已删除',
        description: '请求的资源永久不再可用。与404不同，410表示资源曾经存在，但已被永久删除，且不会恢复。搜索引擎会将此资源从索引中移除。'
      },
      {
        code: 411,
        name: 'Length Required',
        shortTitle: '需要长度',
        description: '服务器拒绝在没有Content-Length头的情况下接受请求。在上传文件或大量数据时，服务器需要预先知道请求体的大小以便正确处理。'
      },
      {
        code: 412,
        name: 'Precondition Failed',
        shortTitle: '先决条件失败',
        description: '先决条件失败。客户端的条件请求（如If-Match、If-None-Match等）无法被满足。用于防止资源的并发修改，实现乐观锁。'
      },
      {
        code: 413,
        name: 'Payload Too Large',
        shortTitle: '请求体过大',
        description: '请求体超过服务器愿意或能够处理的大小限制。常见于文件上传超过大小限制，或POST数据过大。服务器可能会关闭连接以防止客户端继续发送数据。'
      },
      {
        code: 414,
        name: 'URI Too Long',
        shortTitle: 'URI过长',
        description: 'URL超过服务器能接受的最大长度。这通常发生在GET请求中包含了过多的查询参数，或者在进行某些形式的攻击时。应考虑使用POST方法代替。'
      },
      {
        code: 415,
        name: 'Unsupported Media Type',
        shortTitle: '不支持的媒体类型',
        description: '服务器不支持请求中提交的数据的格式。比如API只接受JSON格式，但客户端发送了XML格式的数据；或上传了不支持的文件类型。'
      },
      {
        code: 416,
        name: 'Range Not Satisfiable',
        shortTitle: '范围错误',
        description: '请求的范围无法满足。客户端请求文件的某个范围，但该范围超出了文件的大小。常见于断点续传或视频流媒体播放场景。'
      },
      {
        code: 417,
        name: 'Expectation Failed',
        shortTitle: '期望失败',
        description: '服务器无法满足Expect请求头中的期望。最常见的是客户端发送了"Expect: 100-continue"，但服务器无法满足这个要求。'
      },
      {
        code: 418,
        name: 'I\'m a teapot',
        shortTitle: '我是茶壶',
        description: '这是一个彩蛋状态码，源于1998年的愚人节玩笑。表示服务器是一个茶壶，无法煮咖啡。虽然是玩笑，但已被正式收录在HTTP标准中。'
      },
      {
        code: 421,
        name: 'Misdirected Request',
        shortTitle: '误导请求',
        description: '请求被定向到无法生成响应的服务器。这可能发生在使用了错误的服务器名称指示（SNI）的HTTPS请求中。'
      },
      {
        code: 422,
        name: 'Unprocessable Entity',
        shortTitle: '无法处理',
        description: '请求格式正确，但由于含有语义错误而无法响应。常见于表单验证失败，比如必填字段的值虽然存在但不符合业务规则。'
      },
      {
        code: 423,
        name: 'Locked',
        shortTitle: '已锁定',
        description: '正在访问的资源被锁定。常见于文件系统或版本控制系统中，表示资源正被其他用户或进程占用，需要等待解锁后才能访问。'
      },
      {
        code: 424,
        name: 'Failed Dependency',
        shortTitle: '依赖失败',
        description: '由于之前的请求失败，导致当前请求也失败。常见于批处理操作中，当一个操作依赖于另一个操作的成功完成。'
      },
      {
        code: 425,
        name: 'Too Early',
        shortTitle: '太早',
        description: '服务器不愿意冒险处理可能被重放的请求。用于防止重放攻击，特别是在涉及金融交易等敏感操作时。'
      },
      {
        code: 426,
        name: 'Upgrade Required',
        shortTitle: '需要升级',
        description: '客户端应当切换到更安全的协议，如TLS/1.0。服务器会通过Upgrade头字段告知客户端需要切换到的协议。'
      },
      {
        code: 428,
        name: 'Precondition Required',
        shortTitle: '需要先决条件',
        description: '服务器要求请求必须是条件式的。用于防止"丢失更新"问题，要求客户端先确认资源的当前状态，再进行更改。'
      },
      {
        code: 429,
        name: 'Too Many Requests',
        shortTitle: '请求过多',
        description: '用户在给定的时间内发送了太多请求。这是实现速率限制的常用状态码，防止API被滥用。响应中通常包含Retry-After头，告知客户端何时可以重试。'
      },
      {
        code: 431,
        name: 'Request Header Fields Too Large',
        shortTitle: '请求头过大',
        description: '请求头字段太大，服务器不愿意处理请求。这可能是因为单个头字段太长，或总的头部大小超出限制。'
      },
      {
        code: 451,
        name: 'Unavailable For Legal Reasons',
        shortTitle: '法律原因不可用',
        description: '因法律原因无法提供资源。这个状态码的数字451致敬了雷·布雷德伯里的小说《华氏451度》。常用于内容审查、版权保护等场景。'
      }
    ]
  },
  {
    name: '服务器错误 (5xx)',
    codes: [
      {
        code: 500,
        name: 'Internal Server Error',
        shortTitle: '服务器错误',
        description: '服务器遇到了意外情况，无法完成请求。这是最常见的服务器错误，可能的原因包括：程序错误、数据库异常、服务器配置错误等。开发者应该记录错误详情并及时修复。'
      },
      {
        code: 501,
        name: 'Not Implemented',
        shortTitle: '未实现',
        description: '服务器不支持实现请求所需的功能。这表明服务器不理解请求的方法，或者服务器没有能力完成请求。比如服务器不支持PUT或DELETE方法。'
      },
      {
        code: 502,
        name: 'Bad Gateway',
        shortTitle: '网关错误',
        description: '作为网关或代理的服务器从上游服务器收到了无效的响应。常见于负载均衡器或反向代理服务器无法正常连接到后端服务器，或后端服务器返回了无效的响应。'
      },
      {
        code: 503,
        name: 'Service Unavailable',
        shortTitle: '服务不可用',
        description: '服务器暂时无法处理请求。常见原因包括：服务器维护、过载、资源不足等。建议返回Retry-After头，告知客户端何时可以重试。这个状态码适合用于限流。'
      },
      {
        code: 504,
        name: 'Gateway Timeout',
        shortTitle: '网关超时',
        description: '作为网关或代理的服务器无法及时从上游服务器获得响应。可能是因为后端服务器处理太慢或网络连接问题。常见于微服务架构中服务间调用超时。'
      },
      {
        code: 505,
        name: 'HTTP Version Not Supported',
        shortTitle: 'HTTP版本不支持',
        description: '服务器不支持请求中使用的HTTP版本。这可能发生在客户端使用了过新的HTTP协议版本，而服务器仅支持旧版本。'
      },
      {
        code: 506,
        name: 'Variant Also Negotiates',
        shortTitle: '变体协商',
        description: '服务器存在内部配置错误：所选的变体资源被配置为参与内容协商，导致循环引用。这是一个比较罕见的错误，通常由服务器配置不当导致。'
      },
      {
        code: 507,
        name: 'Insufficient Storage',
        shortTitle: '存储不足',
        description: '服务器无法存储完成请求所需的内容。这通常不是磁盘空间不足，而是分配给请求的存储空间不够。常见于WebDAV服务器或需要大量临时存储的操作。'
      },
      {
        code: 508,
        name: 'Loop Detected',
        shortTitle: '检测到循环',
        description: '服务器在处理请求时检测到无限循环。常见于WebDAV协议中，当服务器处理PROPFIND等请求时发现循环依赖的情况。'
      },
      {
        code: 510,
        name: 'Not Extended',
        shortTitle: '未扩展',
        description: '服务器需要对请求进行进一步扩展才能完成请求。这个状态码是为了未来HTTP协议的扩展预留的，目前较少使用。'
      },
      {
        code: 511,
        name: 'Network Authentication Required',
        shortTitle: '需要网络认证',
        description: '客户端需要进行网络认证才能获得网络访问权限。常见于需要登录才能使用的WiFi网络。服务器应该返回一个可以让用户输入凭据的页面。'
      }
    ]
  }
]

const filteredStatusGroups = computed(() => {
  if (!searchQuery.value) {
    return statusGroups
  }

  const query = searchQuery.value.toLowerCase()
  return statusGroups.map(group => ({
    ...group,
    codes: group.codes.filter(status => 
      status.code.toString().includes(query) ||
      status.name.toLowerCase().includes(query) ||
      status.description.toLowerCase().includes(query)
    )
  })).filter(group => group.codes.length > 0)
})

const getStatusClass = (code: number) => {
  const firstDigit = Math.floor(code / 100)
  return {
    'status-1xx': firstDigit === 1,
    'status-2xx': firstDigit === 2,
    'status-3xx': firstDigit === 3,
    'status-4xx': firstDigit === 4,
    'status-5xx': firstDigit === 5
  }
}

const scrollToCategory = (categoryName: string) => {
  const element = categoryRefs.value[categoryName]
  if (element) {
    const offset = 100 // 考虑顶部固定导航的高度
    const top = element.offsetTop - offset
    window.scrollTo({
      top,
      behavior: 'smooth'
    })
  }
}

const updateActiveCategory = () => {
  if (!groupsContainer.value) return

  const scrollPosition = window.scrollY + 150 // 添加一些偏移以提前激活
  let currentCategory = ''

  Object.entries(categoryRefs.value).forEach(([name, element]) => {
    if (element && element.offsetTop <= scrollPosition) {
      currentCategory = name
    }
  })

  activeCategory.value = currentCategory
}

const getCategoryClass = (categoryName: string) => {
  if (categoryName.includes('1xx')) return 'info-category'
  if (categoryName.includes('2xx')) return 'success-category'
  if (categoryName.includes('3xx')) return 'warning-category'
  if (categoryName.includes('4xx')) return 'error-category'
  if (categoryName.includes('5xx')) return 'fatal-category'
  return ''
}

onMounted(() => {
  window.addEventListener('scroll', updateActiveCategory)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveCategory)
})
</script>

<style scoped>
.http-status-tool {
  background: var(--bg-secondary);
  border-radius: 16px;
  padding: 2rem;
  padding-top: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.tool-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg-secondary);
  padding: 1rem 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 2rem;
}

.search-bar {
  margin-bottom: 1.5rem;
}

.category-nav {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.category-nav::-webkit-scrollbar {
  display: none;
}

.nav-item {
  flex: none;
  cursor: pointer;
  position: relative;
  padding: 0.5rem 0;
}

.nav-item-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.nav-item:hover .nav-item-content {
  background: var(--bg-tertiary);
  transform: translateY(-1px);
}

.nav-item.active .nav-item-content {
  background: var(--bg-tertiary);
  border-color: var(--el-color-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.nav-indicator {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: var(--el-color-info);
}

.nav-text {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
  color: var(--text-secondary);
}

.active .nav-text {
  color: var(--text-primary);
}

/* 导航指示器颜色 */
.info-category {
  background: var(--el-color-info);
}

.success-category {
  background: var(--el-color-success);
}

.warning-category {
  background: var(--el-color-warning);
}

.error-category {
  background: var(--el-color-danger);
}

.fatal-category {
  background: #ff4d4f;
}

.status-groups {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

.group-title {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  position: relative;
  padding-left: 1rem;
}

.group-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  border-radius: 2px;
  background: var(--el-color-primary);
}

.status-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

.status-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-card-inner {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  height: 100%;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.status-card:hover .status-card-inner {
  transform: translateY(-2px);
  border-color: transparent;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.status-header {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.status-code-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.status-code {
  font-size: 1.75rem;
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  letter-spacing: -0.5px;
}

.status-name {
  font-size: 1rem;
  font-weight: 500;
  color: var(--text-secondary);
  opacity: 0.9;
}

.status-short-title {
  font-size: 1rem;
  color: var(--text-secondary);
  opacity: 0.8;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
  background: var(--bg-tertiary);
  border-radius: 6px;
}

.status-description {
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0;
  opacity: 0.85;
}

/* 状态码颜色样式 */
.status-1xx .status-code {
  color: var(--el-color-info);
}

.status-2xx .status-code {
  color: var(--el-color-success);
}

.status-3xx .status-code {
  color: var(--el-color-warning);
}

.status-4xx .status-code {
  color: var(--el-color-danger);
}

.status-5xx .status-code {
  color: #ff4d4f;
}

/* 状态码卡片左边框样式 */
.status-1xx .status-card-inner {
  border-left: 4px solid var(--el-color-info);
}

.status-2xx .status-card-inner {
  border-left: 4px solid var(--el-color-success);
}

.status-3xx .status-card-inner {
  border-left: 4px solid var(--el-color-warning);
}

.status-4xx .status-card-inner {
  border-left: 4px solid var(--el-color-danger);
}

.status-5xx .status-card-inner {
  border-left: 4px solid #ff4d4f;
}

/* 暗色模式适配 */
:root.dark .status-card-inner {
  background: var(--bg-tertiary);
  border-color: rgba(255, 255, 255, 0.1);
}

:root.dark .status-card:hover .status-card-inner {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  border-color: transparent;
}

:root.dark .status-short-title {
  background: rgba(255, 255, 255, 0.08);
}

:root.dark .search-input :deep(.el-input__wrapper) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

:root.dark .search-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

:root.dark .search-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}
</style> 