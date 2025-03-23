export interface LinuxCommand {
  name: string
  shortDesc: string
  description: string
  category: string
  type: 'file' | 'process' | 'system' | 'network'
  isCommon: boolean
  syntax: string
  options: Array<{
    option: string
    description: string
  }>
  examples: Array<{
    desc: string
    code: string
  }>
  notes?: string[]
}

export const linuxCommands: LinuxCommand[] = [
  {
    name: 'ls',
    shortDesc: '列出目录内容',
    description: '列出目录内容。常用场景：查看文件列表、检查文件权限、查看文件大小和修改时间。',
    category: '文件操作',
    type: 'file',
    isCommon: true,
    syntax: 'ls [选项] [文件或目录...]',
    options: [
      { option: '-l', description: '使用长格式列出文件详细信息' },
      { option: '-a', description: '显示所有文件，包括隐藏文件' },
      { option: '-h', description: '以人类可读的格式显示文件大小' },
      { option: '-R', description: '递归显示子目录内容' }
    ],
    examples: [
      {
        desc: '列出当前目录的详细内容',
        code: 'ls -l'
      },
      {
        desc: '显示所有文件（包括隐藏文件）的详细信息',
        code: 'ls -la'
      },
      {
        desc: '以人类可读的方式显示文件大小',
        code: 'ls -lh'
      }
    ],
    notes: [
      '使用 -a 选项可以显示以点开头的隐藏文件',
      '使用 -R 选项时要注意目录层级较深时可能输出内容较多'
    ]
  },
  {
    name: 'cd',
    shortDesc: '切换目录',
    description: '切换工作目录。常用场景：进入项目目录、切换到配置文件目录、返回上级目录。',
    category: '文件操作',
    type: 'file',
    isCommon: true,
    syntax: 'cd [目录]',
    options: [
      { option: '~', description: '切换到当前用户的主目录' },
      { option: '-', description: '切换到上一个工作目录' },
      { option: '..', description: '切换到上级目录' },
      { option: '.', description: '保持在当前目录' }
    ],
    examples: [
      {
        desc: '切换到用户主目录',
        code: 'cd ~'
      },
      {
        desc: '切换到上级目录',
        code: 'cd ..'
      },
      {
        desc: '切换到指定目录',
        code: 'cd /usr/local/bin'
      }
    ],
    notes: [
      '使用 tab 键可以自动补全目录名',
      '使用 cd - 可以在最近两个目录间快速切换'
    ]
  },
  {
    name: 'cp',
    shortDesc: '复制文件或目录',
    description: '将文件或目录复制到指定位置。支持递归复制整个目录树。',
    category: '文件操作',
    type: 'file',
    isCommon: true,
    syntax: 'cp [选项] 源文件 目标文件',
    options: [
      { option: '-r', description: '递归复制目录及其内容' },
      { option: '-i', description: '覆盖前提示' },
      { option: '-p', description: '保留源文件的属性' },
      { option: '-v', description: '显示复制过程' }
    ],
    examples: [
      {
        desc: '复制文件',
        code: 'cp file1.txt file2.txt'
      },
      {
        desc: '递归复制目录',
        code: 'cp -r dir1 dir2'
      },
      {
        desc: '保留文件属性复制',
        code: 'cp -p source.txt dest.txt'
      }
    ],
    notes: [
      '复制目录时必须使用 -r 选项',
      '使用 -i 可以防止意外覆盖文件'
    ]
  },
  {
    name: 'mkdir',
    shortDesc: '创建目录',
    description: '创建新的目录。可以同时创建多个目录，支持创建多级目录。',
    category: '文件操作',
    type: 'file',
    isCommon: true,
    syntax: 'mkdir [选项] 目录名',
    options: [
      { option: '-p', description: '创建多级目录' },
      { option: '-m', description: '设置目录权限' },
      { option: '-v', description: '显示创建过程' }
    ],
    examples: [
      {
        desc: '创建单个目录',
        code: 'mkdir mydir'
      },
      {
        desc: '创建多级目录',
        code: 'mkdir -p parent/child/grandchild'
      },
      {
        desc: '创建带权限的目录',
        code: 'mkdir -m 755 mydir'
      }
    ]
  },
  {
    name: 'ps',
    shortDesc: '查看进程状态',
    description: '显示进程信息。常用场景：查看系统运行的程序、检查程序是否在运行、查找占用资源的进程。',
    category: '进程管理',
    type: 'process',
    isCommon: true,
    syntax: 'ps [选项]',
    options: [
      { option: '-ef', description: '显示所有进程信息' },
      { option: 'aux', description: 'BSD风格显示所有进程' },
      { option: '-u', description: '显示指定用户的进程' },
      { option: '-p', description: '显示指定进程ID的信息' }
    ],
    examples: [
      {
        desc: '显示所有进程',
        code: 'ps -ef'
      },
      {
        desc: 'BSD风格显示进程',
        code: 'ps aux'
      },
      {
        desc: '显示指定用户的进程',
        code: 'ps -u username'
      }
    ],
    notes: [
      'aux 和 -ef 是最常用的两种显示方式',
      '可以使用 grep 过滤需要的进程信息'
    ]
  },
  {
    name: 'kill',
    shortDesc: '终止进程',
    description: '向进程发送信号，默认为SIGTERM(15)，可终止指定进程。',
    category: '进程管理',
    type: 'process',
    isCommon: true,
    syntax: 'kill [选项] 进程ID',
    options: [
      { option: '-9', description: '发送SIGKILL信号，强制终止进程' },
      { option: '-l', description: '列出所有信号名称' },
      { option: '-s', description: '指定发送的信号' }
    ],
    examples: [
      {
        desc: '终止指定进程',
        code: 'kill 1234'
      },
      {
        desc: '强制终止进程',
        code: 'kill -9 1234'
      },
      {
        desc: '列出所有信号',
        code: 'kill -l'
      }
    ],
    notes: [
      '优先使用不带 -9 的普通终止',
      '使用 -9 可能会导致数据丢失'
    ]
  },
  {
    name: 'top',
    shortDesc: '系统监控',
    description: '实时监控系统状态。常用场景：监控系统资源使用情况、查找占用CPU较高的进程、观察系统负载。',
    category: '系统管理',
    type: 'system',
    isCommon: true,
    syntax: 'top [选项]',
    options: [
      { option: '-d', description: '指定刷新时间间隔' },
      { option: '-p', description: '监视指定进程' },
      { option: '-u', description: '显示指定用户的进程' },
      { option: '-H', description: '显示线程信息' }
    ],
    examples: [
      {
        desc: '动态显示系统进程',
        code: 'top'
      },
      {
        desc: '显示指定进程',
        code: 'top -p 1234'
      },
      {
        desc: '设置刷新间隔为3秒',
        code: 'top -d 3'
      }
    ],
    notes: [
      '按 q 退出',
      '按 h 显示帮助',
      '按 k 可以终止进程'
    ]
  },
  {
    name: 'ping',
    shortDesc: '测试网络连接',
    description: '向网络主机发送ICMP回显请求，用于测试网络连接是否正常。',
    category: '网络工具',
    type: 'network',
    isCommon: true,
    syntax: 'ping [选项] 主机名或IP地址',
    options: [
      { option: '-c', description: '指定发送次数' },
      { option: '-i', description: '指定发送间隔' },
      { option: '-s', description: '指定发送数据包大小' },
      { option: '-t', description: '持续ping直到中断' }
    ],
    examples: [
      {
        desc: 'Ping指定次数',
        code: 'ping -c 4 google.com'
      },
      {
        desc: '指定间隔和包大小',
        code: 'ping -i 2 -s 100 192.168.1.1'
      }
    ],
    notes: [
      '使用 Ctrl+C 终止ping',
      '某些网络可能会屏蔽ICMP包'
    ]
  },
  {
    name: 'netstat',
    shortDesc: '显示网络状态',
    description: '显示网络连接、路由表、接口统计等网络信息。',
    category: '网络工具',
    type: 'network',
    isCommon: true,
    syntax: 'netstat [选项]',
    options: [
      { option: '-a', description: '显示所有连接和监听端口' },
      { option: '-n', description: '不解析名字' },
      { option: '-t', description: '显示TCP连接' },
      { option: '-u', description: '显示UDP连接' },
      { option: '-p', description: '显示进程信息' }
    ],
    examples: [
      {
        desc: '显示所有TCP连接',
        code: 'netstat -at'
      },
      {
        desc: '显示监听的端口',
        code: 'netstat -lntp'
      },
      {
        desc: '显示路由信息',
        code: 'netstat -r'
      }
    ],
    notes: [
      '需要root权限查看其他用户的进程',
      '常用组合: -antp 或 -lntp'
    ]
  },
  {
    name: 'grep',
    shortDesc: '文本搜索',
    description: '搜索文本内容。常用场景：查找日志中的错误信息、搜索配置文件中的特定设置、在代码中查找特定函数。',
    category: '文本处理',
    type: 'file',
    isCommon: true,
    syntax: 'grep [选项] 模式 [文件...]',
    options: [
      { option: '-i', description: '忽略大小写' },
      { option: '-r', description: '递归搜索目录' },
      { option: '-n', description: '显示行号' },
      { option: '-v', description: '显示不匹配的行' }
    ],
    examples: [
      {
        desc: '在文件中搜索文本',
        code: 'grep "search text" file.txt'
      },
      {
        desc: '递归搜索目录',
        code: 'grep -r "pattern" /path/to/dir'
      },
      {
        desc: '显示匹配行号',
        code: 'grep -n "text" file.txt'
      }
    ],
    notes: [
      '支持基本的正则表达式',
      '使用 -E 支持扩展正则表达式'
    ]
  },
  {
    name: 'rm',
    shortDesc: '删除文件或目录',
    description: '删除文件或目录。使用 -r 选项可以递归删除目录及其内容。',
    category: '文件操作',
    type: 'file',
    isCommon: true,
    syntax: 'rm [选项] 文件...',
    options: [
      { option: '-r', description: '递归删除目录及其内容' },
      { option: '-f', description: '强制删除，不提示' },
      { option: '-i', description: '删除前提示确认' },
      { option: '-v', description: '显示删除过程' }
    ],
    examples: [
      {
        desc: '删除单个文件',
        code: 'rm file.txt'
      },
      {
        desc: '递归删除目录',
        code: 'rm -r directory'
      },
      {
        desc: '强制删除目录及其内容',
        code: 'rm -rf directory'
      }
    ],
    notes: [
      '使用 rm -rf 要特别小心，该命令非常危险',
      '建议使用 -i 选项来确认删除',
      '删除的文件无法恢复'
    ]
  },
  {
    name: 'mv',
    shortDesc: '移动/重命名文件',
    description: '移动文件或目录到新位置，也可用于重命名。',
    category: '文件操作',
    type: 'file',
    isCommon: true,
    syntax: 'mv [选项] 源文件 目标文件',
    options: [
      { option: '-i', description: '覆盖前提示' },
      { option: '-f', description: '强制覆盖，不提示' },
      { option: '-n', description: '不覆盖已存在的文件' },
      { option: '-v', description: '显示移动过程' }
    ],
    examples: [
      {
        desc: '重命名文件',
        code: 'mv old.txt new.txt'
      },
      {
        desc: '移动文件到目录',
        code: 'mv file.txt /path/to/directory/'
      },
      {
        desc: '移动多个文件',
        code: 'mv file1.txt file2.txt directory/'
      }
    ],
    notes: [
      '移动文件到已存在的文件名会覆盖目标文件',
      '建议使用 -i 选项防止意外覆盖'
    ]
  },
  {
    name: 'chmod',
    shortDesc: '修改文件权限',
    description: '修改文件或目录的访问权限。可以使用数字或符号模式。',
    category: '文件操作',
    type: 'file',
    isCommon: true,
    syntax: 'chmod [选项] 模式 文件...',
    options: [
      { option: '-R', description: '递归修改目录及其内容' },
      { option: '-v', description: '显示修改过程' },
      { option: '-c', description: '只显示已更改的文件' }
    ],
    examples: [
      {
        desc: '使用数字模式设置权限',
        code: 'chmod 755 file.txt'
      },
      {
        desc: '使用符号模式添加权限',
        code: 'chmod u+x script.sh'
      },
      {
        desc: '递归修改目录权限',
        code: 'chmod -R 644 directory/'
      }
    ],
    notes: [
      '数字模式: 4(读) + 2(写) + 1(执行)',
      '符号模式: u(用户) g(组) o(其他) a(所有)',
      '常用权限组合: 755(目录) 644(文件)'
    ]
  },
  {
    name: 'find',
    shortDesc: '查找文件',
    description: '搜索文件和目录。常用场景：查找特定类型的文件、搜索大文件、查找最近修改的文件。',
    category: '文件操作',
    type: 'file',
    isCommon: true,
    syntax: 'find [路径] [选项] [表达式]',
    options: [
      { option: '-name', description: '按名称搜索' },
      { option: '-type', description: '按类型搜索(f:文件,d:目录)' },
      { option: '-size', description: '按大小搜索' },
      { option: '-mtime', description: '按修改时间搜索' }
    ],
    examples: [
      {
        desc: '按名称查找文件',
        code: 'find . -name "*.txt"'
      },
      {
        desc: '查找指定大小的文件',
        code: 'find /home -size +100M'
      },
      {
        desc: '查找最近修改的文件',
        code: 'find . -mtime -7'
      }
    ],
    notes: [
      '使用通配符时需要加引号',
      '大小单位: c(字节) k(KB) M(MB) G(GB)',
      '时间单位: -n(n天内) +n(n天前) n(正好n天)'
    ]
  },
  {
    name: 'tar',
    shortDesc: '文件打包/压缩',
    description: '将多个文件打包成一个文件，可选择是否压缩。',
    category: '文件操作',
    type: 'file',
    isCommon: true,
    syntax: 'tar [选项] [文件]',
    options: [
      { option: '-c', description: '创建新的归档文件' },
      { option: '-x', description: '从归档文件中提取文件' },
      { option: '-z', description: '使用gzip压缩' },
      { option: '-v', description: '显示处理过程' },
      { option: '-f', description: '指定归档文件名' }
    ],
    examples: [
      {
        desc: '创建tar归档',
        code: 'tar -cvf archive.tar files/'
      },
      {
        desc: '创建压缩归档',
        code: 'tar -czvf archive.tar.gz files/'
      },
      {
        desc: '解压缩文件',
        code: 'tar -xzvf archive.tar.gz'
      }
    ],
    notes: [
      '常用组合: -cvf(创建) -xvf(解压) -czvf(压缩)',
      'f选项必须在最后且后面为文件名',
      '解压时会自动检测压缩格式'
    ]
  },
  {
    name: 'df',
    shortDesc: '查看磁盘空间',
    description: '查看磁盘使用情况。常用场景：检查磁盘剩余空间、查看分区使用率、监控存储容量。',
    category: '系统管理',
    type: 'system',
    isCommon: true,
    syntax: 'df [选项] [文件系统]',
    options: [
      { option: '-h', description: '以人类可读的格式显示' },
      { option: '-T', description: '显示文件系统类型' },
      { option: '-i', description: '显示inode信息' }
    ],
    examples: [
      {
        desc: '显示所有文件系统',
        code: 'df -h'
      },
      {
        desc: '显示指定目录所在文件系统',
        code: 'df -h /home'
      },
      {
        desc: '显示文件系统类型',
        code: 'df -hT'
      }
    ],
    notes: [
      '使用 -h 选项更容易阅读',
      '可以指定具体的挂载点或目录'
    ]
  },
  {
    name: 'du',
    shortDesc: '统计目录大小',
    description: '查看目录占用空间。常用场景：查找占用空间较大的目录、统计项目大小、清理磁盘空间。',
    category: '系统管理',
    type: 'system',
    isCommon: true,
    syntax: 'du [选项] [文件...]',
    options: [
      { option: '-h', description: '以人类可读的格式显示' },
      { option: '-s', description: '只显示总计' },
      { option: '-a', description: '显示所有文件而不仅是目录' },
      { option: '--max-depth', description: '指定最大递归深度' }
    ],
    examples: [
      {
        desc: '查看目录总大小',
        code: 'du -sh directory'
      },
      {
        desc: '查看多个目录大小',
        code: 'du -sh */.'
      },
      {
        desc: '限制递归深度',
        code: 'du -h --max-depth=1'
      }
    ],
    notes: [
      '常用 -sh 组合查看总大小',
      '大文件搜索常和sort命令配合使用'
    ]
  },
  {
    name: 'wget',
    shortDesc: '下载文件工具',
    description: '从网络上下载文件的命令行工具，支持HTTP、HTTPS和FTP协议。',
    category: '网络工具',
    type: 'network',
    isCommon: true,
    syntax: 'wget [选项] URL',
    options: [
      { option: '-O', description: '指定下载文件的保存名称' },
      { option: '-c', description: '断点续传' },
      { option: '-b', description: '后台下载' },
      { option: '-P', description: '指定下载目录' },
      { option: '--limit-rate', description: '限制下载速度' }
    ],
    examples: [
      {
        desc: '下载文件',
        code: 'wget https://example.com/file.zip'
      },
      {
        desc: '指定保存文件名',
        code: 'wget -O custom-name.zip https://example.com/file.zip'
      },
      {
        desc: '限制下载速度',
        code: 'wget --limit-rate=200k https://example.com/file.zip'
      }
    ],
    notes: [
      '支持断点续传，下载中断后可以继续',
      '可以在后台运行，适合大文件下载'
    ]
  },
  {
    name: 'curl',
    shortDesc: '数据传输工具',
    description: '用于发送HTTP、HTTPS等协议的请求，常用于API测试和文件下载。',
    category: '网络工具',
    type: 'network',
    isCommon: true,
    syntax: 'curl [选项] URL',
    options: [
      { option: '-X', description: '指定请求方法(GET/POST等)' },
      { option: '-H', description: '添加请求头' },
      { option: '-d', description: '发送POST数据' },
      { option: '-o', description: '保存输出到文件' },
      { option: '-i', description: '显示响应头信息' }
    ],
    examples: [
      {
        desc: '发送GET请求',
        code: 'curl https://api.example.com/data'
      },
      {
        desc: '发送POST请求',
        code: 'curl -X POST -d "name=test" https://api.example.com/create'
      },
      {
        desc: '带认证的请求',
        code: 'curl -u username:password https://api.example.com'
      }
    ],
    notes: [
      '常用于API调试和测试',
      '支持多种协议和认证方式'
    ]
  },
  {
    name: 'ssh',
    shortDesc: '安全远程登录',
    description: '安全地登录到远程系统，提供加密的网络通信。',
    category: '网络工具',
    type: 'network',
    isCommon: true,
    syntax: 'ssh [选项] [用户名@]主机',
    options: [
      { option: '-p', description: '指定端口号' },
      { option: '-i', description: '指定私钥文件' },
      { option: '-X', description: '启用X11转发' },
      { option: '-v', description: '显示详细连接信息' }
    ],
    examples: [
      {
        desc: '基本登录',
        code: 'ssh user@hostname'
      },
      {
        desc: '指定端口登录',
        code: 'ssh -p 2222 user@hostname'
      },
      {
        desc: '使用密钥登录',
        code: 'ssh -i ~/.ssh/id_rsa user@hostname'
      }
    ],
    notes: [
      '首次连接会提示保存主机密钥指纹',
      '可配置SSH密钥实现免密登录'
    ]
  },
  {
    name: 'sed',
    shortDesc: '流编辑器',
    description: '强大的文本处理工具，可以实现文本替换、删除、插入等操作。',
    category: '文本处理',
    type: 'file',
    isCommon: true,
    syntax: 'sed [选项] "命令" 文件',
    options: [
      { option: '-i', description: '直接修改文件内容' },
      { option: '-n', description: '仅显示处理后的行' },
      { option: '-e', description: '执行多个命令' },
      { option: '-f', description: '从文件读取命令' }
    ],
    examples: [
      {
        desc: '替换文本',
        code: 'sed "s/old/new/g" file.txt'
      },
      {
        desc: '删除特定行',
        code: 'sed "3d" file.txt'
      },
      {
        desc: '直接修改文件',
        code: 'sed -i "s/old/new/g" file.txt'
      }
    ],
    notes: [
      '使用 -i 选项时建议先备份文件',
      '支持正则表达式'
    ]
  },
  {
    name: 'awk',
    shortDesc: '文本分析工具',
    description: '强大的文本处理语言，特别适合处理格式化文本数据。',
    category: '文本处理',
    type: 'file',
    isCommon: true,
    syntax: 'awk [选项] "程序" 文件',
    options: [
      { option: '-F', description: '指定字段分隔符' },
      { option: '-v', description: '设置变量' },
      { option: '-f', description: '从文件读取程序' }
    ],
    examples: [
      {
        desc: '打印特定列',
        code: 'awk "{print $1}" file.txt'
      },
      {
        desc: '使用自定义分隔符',
        code: 'awk -F ":" "{print $1}" /etc/passwd'
      },
      {
        desc: '条件处理',
        code: 'awk "$3 > 100" file.txt'
      }
    ],
    notes: [
      '默认以空格为分隔符',
      '支持复杂的数据处理逻辑'
    ]
  },
  {
    name: 'systemctl',
    shortDesc: '服务管理',
    description: '管理系统服务。常用场景：启动/停止网络服务、查看服务运行状态、设置服务开机自启。',
    category: '系统管理',
    type: 'system',
    isCommon: true,
    syntax: 'systemctl [选项] 命令 服务名',
    options: [
      { option: 'start', description: '启动服务' },
      { option: 'stop', description: '停止服务' },
      { option: 'restart', description: '重启服务' },
      { option: 'status', description: '查看服务状态' },
      { option: 'enable', description: '设置开机自启' }
    ],
    examples: [
      {
        desc: '启动服务',
        code: 'systemctl start nginx'
      },
      {
        desc: '查看服务状态',
        code: 'systemctl status nginx'
      },
      {
        desc: '设置开机自启',
        code: 'systemctl enable nginx'
      }
    ],
    notes: [
      '需要root权限执行大多数操作',
      '可以管理系统级别的服务'
    ]
  },
  {
    name: 'journalctl',
    shortDesc: '查看系统日志',
    description: '查询systemd日志，用于系统故障排查和监控。',
    category: '系统管理',
    type: 'system',
    isCommon: true,
    syntax: 'journalctl [选项]',
    options: [
      { option: '-u', description: '查看特定服务的日志' },
      { option: '-f', description: '实时追踪日志' },
      { option: '--since', description: '显示特定时间之后的日志' },
      { option: '-n', description: '显示最后n行' }
    ],
    examples: [
      {
        desc: '查看特定服务日志',
        code: 'journalctl -u nginx'
      },
      {
        desc: '实时追踪日志',
        code: 'journalctl -f'
      },
      {
        desc: '查看今天的日志',
        code: 'journalctl --since today'
      }
    ],
    notes: [
      '支持多种过滤和查询选项',
      '日志按时间排序存储'
    ]
  },
  {
    name: 'tail',
    shortDesc: '查看文件末尾',
    description: '实时查看文件更新。常用场景：监控日志文件、查看最新日志、跟踪文件变化。',
    category: '文件操作',
    type: 'file',
    isCommon: true,
    syntax: 'tail [选项] 文件',
    options: [
      { option: '-f', description: '实时追踪文件更新' },
      { option: '-n', description: '显示最后n行' },
      { option: '-100', description: '显示最后100行' }
    ],
    examples: [
      {
        desc: '实时查看日志',
        code: 'tail -f /var/log/nginx/access.log'
      },
      {
        desc: '查看最后100行',
        code: 'tail -n 100 file.log'
      }
    ],
    notes: [
      '使用 Ctrl+C 退出实时追踪',
      '-f 选项常用于监控日志文件'
    ]
  }
] 