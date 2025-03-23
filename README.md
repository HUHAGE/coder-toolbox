# DevToolBox - 程序员的效率工具箱

<p align="center">
  <img src="public/logo.png" width="128" />
</p>

<p align="center">
  <strong>一款优雅、强大的开发者工具集成插件</strong>
</p>

## 🎯 项目目标

DevToolBox 旨在为开发者提供一站式的开发工具集成环境，集成常用的开发工具和功能，提升开发效率。遵循 Apple 设计风格，打造简洁优雅的用户体验。

### 特性更新
- 🪟 独立窗口模式
  - 默认以独立窗口全屏打开
  - 支持窗口大小调整
  - 更好的多任务处理体验

## ✨ 核心特性

- 🔍 智能搜索
  - 站内工具快速检索
  - 集成主流搜索引擎(Google、Bing、Baidu)
  - 搜索历史记录
  
- 🛠 开发工具集
  - JSON 格式化与验证 
  - XML 格式化与验证
  - Base64 编解码
  - URL 编解码
  - MD5/SHA 加密
  - UUID 生成器
  - 时间戳转换
  - 测试数据生成
  - 正则表达式测试
  - 代码压缩/美化
  - 更多工具持续添加...

- 🎨 精美设计
  - 参考 Apple 设计语言
  - 简洁直观的界面布局
  - 流畅的动画过渡
  - 深色模式支持

## 🗺 项目规划

### Phase 1 - 基础框架搭建
- 项目初始化与工程配置
- 核心框架开发
- 基础 UI 组件库构建
- 路由系统实现

### Phase 2 - 核心功能开发  
- 搜索系统实现
- 首批工具开发(JSON、XML、Base64等)
- 数据持久化
- 单元测试

### Phase 3 - 功能完善
- 更多工具扩展
- 性能优化
- Bug修复
- 文档完善

## 🏗 技术架构

- 框架: Vue 3 + TypeScript
- 状态管理: Pinia
- UI组件: Element Plus
- 构建工具: Vite
- 测试框架: Vitest
- 代码规范: ESLint + Prettier

## 📦 项目结构 
```
devtoolbox/
├── public/ # 静态资源
├── src/
│ ├── assets/ # 项目资源文件
│ ├── components/ # 通用组件
│ ├── layouts/ # 布局组件
│ ├── pages/ # 页面组件
│ ├── stores/ # 状态管理
│ ├── styles/ # 样式文件
│ ├── utils/ # 工具函数
│ ├── plugins/ # 插件
│ └── types/ # 类型定义
├── tests/ # 测试文件
└── plugin.json # uTools 插件配置
```

## 🚀 开发指南

1. 克隆项目
```bash
git clone https://github.com/your-username/devtoolbox.git
```

2. 安装依赖
```bash
npm install
```

3. 启动开发服务器
```bash
npm run dev
```

4. 构建插件
```bash
npm run build
```

### 增加一个新工具的步骤
1. 在 src/pages/tools 目录下创建一个新文件，例如 idcard-new.vue
2. 在 src/router/index.ts 文件中添加新工具的路由
  // 导入新的身份证号生成器页面
import IdcardNew from '@/pages/tools/IdcardNew.vue'
3. 在 src/pages/Home.vue 文件中添加新工具的入口
  {
      code: 'idcard-new',
      name: '身份证号生成(新版)',
      description: '生成虚拟身份证号码',
      icon: idcardIcon,
      path: '/tools/idcard-new',
      category: 'generate'
  }
4. 在 src/components/tools 目录下创建新工具的组件文件，例如 IdcardToolNew.vue
5. 在 keepAliveStore.ts 文件中添加新工具的 keepAlive 配置
  export const keepAliveComponents = ref([
  // ... existing components ...
  'IdcardToolNew',
  // ... existing components ...
])



## 🤝 参与贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

## 📄 开源协议

本项目基于 [MIT](LICENSE) 协议开源。

## 代码对比工具

### 功能特性
- 🔄 多种对比模式
  - 双向对比：支持两个文件的对比
  - 三向对比：支持基准文件与两个变更文件的对比
  - 实时对比：输入即时显示差异
  - 文件对比：支持拖拽或选择文件进行对比
  
- 🎯 智能差异展示
  - 行级差异：精确显示修改、新增、删除的行
  - 字符级差异：使用波浪线标记具体修改的字符
  - 差异导航：快速定位到上一个/下一个差异
  - 差异统计：显示修改、新增、删除的行数统计
  
- 🎨 专业编辑功能
  - 语法高亮：支持多种编程语言
  - 代码折叠：支持代码块的展开/折叠
  - 搜索替换：支持正则表达式搜索
  - 自动格式化：支持多种语言的代码格式化
  
- ⚡️ 高级特性
  - 忽略空白：可选择忽略空格、缩进等差异
  - 合并预览：查看合并后的效果
  - 差异导出：支持导出差异报告
  - 历史记录：保存最近的对比记录
  
- 🎭 个性化设置
  - 自定义主题：支持多种编辑器主题
  - 字体设置：可调整字体大小和字体族
  - 快捷键：可自定义常用操作的快捷键
  - 差异样式：可自定义差异标记的显示样式

### 使用指南
1. 基础对比
   - 在左侧编辑器输入或粘贴原始代码
   - 在右侧编辑器输入或粘贴对比代码
   - 差异将自动高亮显示

2. 文件对比
   - 点击"导入文件"按钮选择要对比的文件
   - 或直接将文件拖拽到编辑器中
   - 支持多种格式的文本文件

3. 三向对比
   - 切换到三向对比模式
   - 分别导入基准文件和两个变更文件
   - 查看并分析差异

4. 快捷操作
   - Ctrl+F：搜索
   - Ctrl+H：替换
   - Ctrl+/：注释
   - Ctrl+Z：撤销
   - Ctrl+S：保存

### Base64 工具
- 支持文本、图片、文件的 Base64 编解码
- URL 安全模式（将 + 和 / 替换为 - 和 _）
- 自动换行和自定义换行长度
- 字符统计和字节统计
- 图片预览和即时转换
- 文件拖拽上传
- 示例数据和使用帮助
- 深色模式支持
