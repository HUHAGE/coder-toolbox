# DevToolBox - 程序员的效率工具箱

<p align="center">
  <img src="public/logo.png" width="128" />
</p>

<p align="center">
  <strong>一款优雅、强大的开发者工具集成插件</strong>
</p>

## 🎯 项目目标

DevToolBox 呼哈程序员工具箱旨在为开发者提供一站式的开发工具集成环境，集成常用的开发工具和功能，提升开发效率。遵循扁平化设计风格，打造简洁优雅的用户体验。


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
  - 简洁直观的界面布局
  - 扁平化的设计风格
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

### 功能说明

#### 篮球分组
- 篮球分组：篮球分组是一个简单的分组工具，它可以帮助用户将篮球运动员进行随机分组。
- 功能：
  - 队员管理：支持手动添加或导入队员。
  - 随机头像：支持随机生成头像，采用DiceBear API (https://www.dicebear.com/) 生成随机头像。
  - 分组按钮：点击该按钮后，篮球运动员会被随机分组。
  - 分组结果：分组结果会显示在页面上，每个分组的运动员姓名会被列出。

#### 年会抽奖工具
- 年会抽奖工具：年会抽奖工具是一个炫酷的抽奖工具，它可以帮助用户进行年会抽奖。灵感来自：https://github.com/vitozyf/lucky-draw.git，感谢作者的开源分享。
- 功能：
  - 抽奖人数：支持手动输入或导入抽奖人数。
  - 抽奖结果：点击抽奖按钮后，会随机选出中奖者。
  - 重置按钮：点击该按钮后，抽奖结果会被重置。


#### 身份证号生成
- 身份证号生成：身份证号生成是一个用于生成虚拟身份证号码的工具。
- 功能：
  - 生成按钮：点击该按钮后，会生成一个虚拟的身份证号码。
  - 复制按钮：点击该按钮后，身份证号码会被复制到剪贴板。

### 旅游攻略
- 地址：https://www.huhage.fun/#/travel/yunnan2025


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

