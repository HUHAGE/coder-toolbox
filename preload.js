const preload = {
  devtoolbox: {
    mode: 'window',
    args: {
      enter: (action) => {
        // 设置窗口大小为全屏
        window.utools.setExpendHeight(0)
        window.utools.setWindowSize(window.screen.width, window.screen.height)
      }
    }
  }
}

// 通过window.exports暴露插件
window.exports = {
  // JSON格式化
  'json': {
    mode: 'none',
    args: {
      enter: (action) => {
        window.location.hash = '/tools/json'
      }
    }
  },
  // XML格式化
  'xml': {
    mode: 'none',
    args: {
      enter: (action) => {
        window.location.hash = '/tools/xml'
      }
    }
  },
  // SQL IN语句生成
  'sql-in': {
    mode: 'none',
    args: {
      enter: (action) => {
        window.location.hash = '/tools/sql-in'
      }
    }
  },
  // 正则表达式工具
  'regex': {
    mode: 'none',
    args: {
      enter: (action) => {
        window.location.hash = '/tools/regex'
      }
    }
  },
  // 代码对比工具
  'diff': {
    mode: 'none',
    args: {
      enter: (action) => {
        window.location.hash = '/tools/diff'
      }
    }
  },
  // SQL参数填充工具
  'sql-params': {
    mode: 'none',
    args: {
      enter: (action) => {
        window.location.hash = '/tools/sql-params'
      }
    }
  },
  // 统一社会信用代码生成
  'credit-code': {
    mode: 'none',
    args: {
      enter: (action) => {
        window.location.hash = '/tools/credit-code'
      }
    }
  },
  // Linux命令手册
  'linux-manual': {
    mode: 'none',
    args: {
      enter: (action) => {
        window.location.hash = '/tools/linux-manual'
      }
    }
  },
  // AES加密工具
  'aes': {
    mode: 'none',
    args: {
      enter: (action) => {
        window.location.hash = '/tools/aes'
      }
    }
  },
  // RSA加密工具
  'rsa': {
    mode: 'none',
    args: {
      enter: (action) => {
        window.location.hash = '/tools/rsa'
      }
    }
  },
  // 开发者工具箱主界面
  'devtoolbox': {
    mode: 'none',
    args: {
      enter: (action) => {
        window.location.hash = '/'
      }
    }
  }
}

module.exports = preload