<template>
  <div class="diff-tool">
    <!-- 工具栏 -->
    <div class="toolbar">
      <!-- 主要操作按钮组 -->
      <div class="primary-actions">
        <el-button-group>
          <el-button 
            type="primary" 
            :class="{ active: !is3WayMode }"
            @click="setMode('2-way')"
          >
            <el-icon><Document /></el-icon>双向对比
          </el-button>
          <el-button 
            type="primary"
            :class="{ active: is3WayMode }"
            @click="setMode('3-way')"
          >
            <el-icon><Files /></el-icon>三向对比
          </el-button>
        </el-button-group>

        <el-divider direction="vertical" />

        <!-- 视图选项 -->
        <el-button-group>
          <el-tooltip content="同步滚动" placement="top">
            <el-button 
              :type="syncScroll ? 'success' : 'default'"
              @click="toggleSyncScroll"
            >
              <el-icon><Link /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="忽略空白字符" placement="top">
            <el-button 
              :type="ignoreWhitespace ? 'success' : 'default'"
              @click="toggleIgnoreWhitespace"
            >
              <el-icon><Hide /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="显示行号" placement="top">
            <el-button 
              :type="showLineNumbers ? 'success' : 'default'"
              @click="toggleLineNumbers"
            >
              <el-icon><List /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>

        <el-divider direction="vertical" />

        <!-- 差异导航 -->
        <el-button-group>
          <el-tooltip content="上一个差异 (Alt+Up)" placement="top">
            <el-button @click="gotoPrevDiff">
              <el-icon><ArrowUp /></el-icon>
            </el-button>
          </el-tooltip>
          <el-tooltip content="下一个差异 (Alt+Down)" placement="top">
            <el-button @click="gotoNextDiff">
              <el-icon><ArrowDown /></el-icon>
            </el-button>
          </el-tooltip>
        </el-button-group>
      </div>

      <!-- 次要操作按钮组 -->
      <div class="secondary-actions">
        <el-dropdown trigger="click">
          <el-button>
            <el-icon><Setting /></el-icon>设置
            <el-icon class="el-icon--right"><ArrowDown /></el-icon>
          </el-button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item @click="openThemeSelector">
                <el-icon><Brush /></el-icon>切换主题
              </el-dropdown-item>
              <el-dropdown-item @click="openFontSettings">
                <el-icon><TextSize /></el-icon>字体设置
              </el-dropdown-item>
              <el-dropdown-item @click="openKeyboardShortcuts">
                <el-icon><Operation /></el-icon>快捷键
              </el-dropdown-item>
              <el-dropdown-item divided @click="exportDiff">
                <el-icon><Download /></el-icon>导出差异
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>

        <el-button 
          type="primary" 
          @click="toggleFullscreen"
        >
          <el-icon><FullScreen /></el-icon>
          {{ isFullscreen ? '退出全屏' : '全屏' }}
        </el-button>
      </div>
    </div>

    <!-- 差异统计和提示 -->
    <div class="diff-summary" v-if="hasContent">
      <template v-if="canCompare">
        <template v-if="hasDiff">
          <div class="diff-stats">
            <el-tag type="danger" effect="dark" class="stat-item">
              <el-icon><Minus /></el-icon>
              <span>删除: {{ removedLines }} 行</span>
            </el-tag>
            <el-tag type="success" effect="dark" class="stat-item">
              <el-icon><Plus /></el-icon>
              <span>新增: {{ addedLines }} 行</span>
            </el-tag>
            <el-tag type="warning" effect="dark" class="stat-item">
              <el-icon><Edit /></el-icon>
              <span>修改: {{ modifiedLines }} 行</span>
            </el-tag>
            <el-tag type="info" effect="dark" class="stat-item">
              <el-icon><Document /></el-icon>
              <span>总计: {{ totalDiffLines }} 行</span>
            </el-tag>
          </div>
        </template>
        <template v-else>
          <div class="no-diff-tip">
            <el-icon class="tip-icon"><CircleCheck /></el-icon>
            <span class="tip-text">文件内容完全相同</span>
          </div>
        </template>
      </template>
      <template v-else>
        <div class="waiting-tip">
          <el-icon class="tip-icon"><InfoFilled /></el-icon>
          <span class="tip-text">请导入{{ is3WayMode ? '其他' : '另一个' }}文件进行对比</span>
        </div>
      </template>
    </div>

    <!-- 编辑器容器 -->
    <div class="editor-container" :class="{ 'is-fullscreen': isFullscreen }">
      <el-row :gutter="12">
        <!-- 左侧编辑器 -->
        <el-col :span="is3WayMode ? 8 : 12">
          <div class="editor-panel">
            <div class="editor-header">
              <span class="editor-title">文件一</span>
              <div class="editor-actions">
                <el-upload
                  class="upload-button"
                  action=""
                  :auto-upload="false"
                  :show-file-list="false"
                  @change="handleFileUpload($event, 'left')"
                >
                  <el-button size="small">
                    <el-icon><Upload /></el-icon>导入
                  </el-button>
                </el-upload>
                <el-dropdown trigger="click">
                  <el-button size="small">
                    <el-icon><More /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="formatCode('left')">
                        <el-icon><Magic /></el-icon>格式化
                      </el-dropdown-item>
                      <el-dropdown-item @click="copyContent('left')">
                        <el-icon><CopyDocument /></el-icon>复制
                      </el-dropdown-item>
                      <el-dropdown-item @click="clearContent('left')">
                        <el-icon><Delete /></el-icon>清空
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div ref="leftEditorContainer" class="monaco-editor"></div>
          </div>
        </el-col>

        <!-- 中间编辑器(三向对比模式) -->
        <el-col v-if="is3WayMode" :span="8">
          <div class="editor-panel">
            <div class="editor-header">
              <span class="editor-title">文件二</span>
              <div class="editor-actions">
                <el-upload
                  class="upload-button"
                  action=""
                  :auto-upload="false"
                  :show-file-list="false"
                  @change="handleFileUpload($event, 'middle')"
                >
                  <el-button size="small">
                    <el-icon><Upload /></el-icon>导入
                  </el-button>
                </el-upload>
                <el-dropdown trigger="click">
                  <el-button size="small">
                    <el-icon><More /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="formatCode('middle')">
                        <el-icon><Magic /></el-icon>格式化
                      </el-dropdown-item>
                      <el-dropdown-item @click="copyContent('middle')">
                        <el-icon><CopyDocument /></el-icon>复制
                      </el-dropdown-item>
                      <el-dropdown-item @click="clearContent('middle')">
                        <el-icon><Delete /></el-icon>清空
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div ref="middleEditorContainer" class="monaco-editor"></div>
          </div>
        </el-col>

        <!-- 右侧编辑器 -->
        <el-col :span="is3WayMode ? 8 : 12">
          <div class="editor-panel">
            <div class="editor-header">
              <span class="editor-title">{{ is3WayMode ? '文件三' : '文件二' }}</span>
              <div class="editor-actions">
                <el-upload
                  class="upload-button"
                  action=""
                  :auto-upload="false"
                  :show-file-list="false"
                  @change="handleFileUpload($event, 'right')"
                >
                  <el-button size="small">
                    <el-icon><Upload /></el-icon>导入
                  </el-button>
                </el-upload>
                <el-dropdown trigger="click">
                  <el-button size="small">
                    <el-icon><More /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item @click="formatCode('right')">
                        <el-icon><Magic /></el-icon>格式化
                      </el-dropdown-item>
                      <el-dropdown-item @click="copyContent('right')">
                        <el-icon><CopyDocument /></el-icon>复制
                      </el-dropdown-item>
                      <el-dropdown-item @click="clearContent('right')">
                        <el-icon><Delete /></el-icon>清空
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
            <div ref="rightEditorContainer" class="monaco-editor"></div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 设置对话框 -->
    <el-dialog
      v-model="showSettings"
      title="编辑器设置"
      width="500px"
    >
      <!-- 设置表单 -->
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, computed, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Switch,
  Brush,
  Connection,
  FullScreen,
  Upload,
  Close,
  Document,
  Files,
  Link,
  Hide,
  List,
  ArrowUp,
  ArrowDown,
  Setting,
  TextSize as FontSize,
  Operation as Keyboard,
  Download,
  Minus,
  Plus,
  Edit,
  MagicStick as Magic,
  CopyDocument,
  Delete,
  More,
  InfoFilled,
  CircleCheck
} from '@element-plus/icons-vue'
import * as diff from 'diff'
import ToolLayout from '../ToolLayout.vue'
import * as monaco from 'monaco-editor'
import editorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker'
import jsonWorker from 'monaco-editor/esm/vs/language/json/json.worker?worker'
import cssWorker from 'monaco-editor/esm/vs/language/css/css.worker?worker'
import htmlWorker from 'monaco-editor/esm/vs/language/html/html.worker?worker'
import tsWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker?worker'

// 设置 Monaco 环境
self.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return new jsonWorker()
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return new cssWorker()
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return new htmlWorker()
    }
    if (label === 'typescript' || label === 'javascript') {
      return new tsWorker()
    }
    return new editorWorker()
  }
}

// 编辑器引用
const leftEditorContainer = ref<HTMLElement | null>(null)
const middleEditorContainer = ref<HTMLElement | null>(null)
const rightEditorContainer = ref<HTMLElement | null>(null)

// 编辑器实例
let leftEditor: any = null
let middleEditor: any = null
let rightEditor: any = null

// 状态管理
const is3WayMode = ref(false)
const syncScroll = ref(true)
const ignoreWhitespace = ref(false)
const showLineNumbers = ref(true)
const showSettings = ref(false)
const isFullscreen = ref(false)
const highlightEnabled = ref(true)
const hasContent = ref(false)
const leftContent = ref('')
const middleContent = ref('')
const rightContent = ref('')

// 添加差异统计的响应式变量
const removedLines = ref(0)
const addedLines = ref(0)
const modifiedLines = ref(0)
const hasDiff = ref(false)

// 编辑器设置
const editorSettings = ref({
  theme: 'vs',
  fontSize: 14,
  fontFamily: 'Menlo, Monaco, Consolas, monospace',
  tabSize: 2,
  wordWrap: 'on',
  minimap: false,
})

// 计算总的差异行数
const totalDiffLines = computed(() => {
  return removedLines.value + addedLines.value + modifiedLines.value
})

// 添加装饰器 ID 的引用
let leftDecorationIds: string[] = []
let rightDecorationIds: string[] = []

// 添加是否可以进行对比的计算属性
const canCompare = computed(() => {
  if (is3WayMode.value) {
    // 三向对比模式需要至少两个文件
    return (leftContent.value && middleContent.value) || 
           (leftContent.value && rightContent.value) || 
           (middleContent.value && rightContent.value)
  } else {
    // 双向对比模式需要两个文件都有内容
    return leftContent.value && rightContent.value
  }
})

// 初始化编辑器
const initEditor = async () => {
  // 配置编辑器主题
  monaco.editor.defineTheme('customTheme', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#ffffff',
    }
  })

  monaco.editor.defineTheme('customThemeDark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#1e1e1e',
    }
  })

  // 创建编辑器实例
  const createEditor = (container: HTMLElement) => {
    return monaco.editor.create(container, {
      value: '',
      language: 'plaintext',
      theme: document.documentElement.classList.contains('dark') ? 'customThemeDark' : 'customTheme',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      lineNumbers: 'on',
      glyphMargin: true,
      renderLineHighlight: 'all',
      contextmenu: true,
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false,
        verticalHasArrows: false,
        horizontalHasArrows: false,
      },
      fontSize: 14,
      lineHeight: 21,
      padding: { top: 8, bottom: 8 },
    })
  }

  if (leftEditorContainer.value) {
    leftEditor = createEditor(leftEditorContainer.value)
    leftEditor.onDidChangeModelContent(() => {
      leftContent.value = leftEditor.getValue()
      performDiff()
    })
  }

  if (middleEditorContainer.value) {
    middleEditor = createEditor(middleEditorContainer.value)
    middleEditor.onDidChangeModelContent(() => {
      middleContent.value = middleEditor.getValue()
      performDiff()
    })
  }

  if (rightEditorContainer.value) {
    rightEditor = createEditor(rightEditorContainer.value)
    rightEditor.onDidChangeModelContent(() => {
      rightContent.value = rightEditor.getValue()
      performDiff()
    })
  }
}

// 处理文件上传
const handleFileUpload = async (event: any, target: 'left' | 'middle' | 'right') => {
  const file = event.raw
  if (!file) return

  try {
    const text = await file.text()
    switch (target) {
      case 'left':
        leftEditor?.setValue(text)
        break
      case 'middle':
        middleEditor?.setValue(text)
        break
      case 'right':
        rightEditor?.setValue(text)
        break
    }
    ElMessage.success('文件导入成功')
  } catch (error) {
    ElMessage.error('文件导入失败')
  }
}

// 执行差异对比
const performDiff = () => {
  // 重置统计数据
  removedLines.value = 0
  addedLines.value = 0
  modifiedLines.value = 0
  hasDiff.value = false

  // 清除所有现有的装饰器
  if (leftEditor) {
    leftDecorationIds = leftEditor.deltaDecorations(leftDecorationIds, [])
  }
  if (rightEditor) {
    rightDecorationIds = rightEditor.deltaDecorations(rightDecorationIds, [])
  }

  // 检查是否可以进行对比
  if (!canCompare.value) {
    return
  }

  // 如果内容完全相同，直接返回
  if (leftContent.value === rightContent.value) {
    hasContent.value = true
    hasDiff.value = false
    return
  }

  // 进行行级对比
  const lineChanges = diff.diffLines(leftContent.value, rightContent.value, {
    ignoreWhitespace: ignoreWhitespace.value
  })
  
  const leftDecorations: monaco.editor.IModelDeltaDecoration[] = []
  const rightDecorations: monaco.editor.IModelDeltaDecoration[] = []
  
  let leftLineNumber = 1
  let rightLineNumber = 1

  const applyDecorations = (
    editor: any,
    startLine: number,
    text: string,
    otherText: string,
    isSource: boolean
  ) => {
    const decorations: monaco.editor.IModelDeltaDecoration[] = []
    
    // 添加行级高亮
    decorations.push({
      range: new monaco.Range(startLine, 1, startLine, 1),
      options: {
        isWholeLine: true,
        className: 'diff-line-changed',
        glyphMarginClassName: 'diff-glyph-changed'
      }
    })

    // 进行字符级对比
    const changes = diff.diffChars(text, otherText)
    let sourceColumn = 1
    let targetColumn = 1

    changes.forEach(change => {
      const length = change.value?.length || 0
      
      if (change.added) {
        if (!isSource) {
          // 在目标文件中标记新增的字符
          decorations.push({
            range: new monaco.Range(
              startLine,
              targetColumn,
              startLine,
              targetColumn + length
            ),
            options: {
              inlineClassName: 'diff-char-added',
              hoverMessage: { value: '新增' }
            }
          })
        }
        targetColumn += length
      } else if (change.removed) {
        if (isSource) {
          // 在源文件中标记删除的字符
          decorations.push({
            range: new monaco.Range(
              startLine,
              sourceColumn,
              startLine,
              sourceColumn + length
            ),
            options: {
              inlineClassName: 'diff-char-removed',
              hoverMessage: { value: '删除' }
            }
          })
        }
        sourceColumn += length
      } else {
        // 相同的字符，同时移动两个位置
        sourceColumn += length
        targetColumn += length
      }
    })
    
    return decorations
  }

  lineChanges.forEach(change => {
    if (change.removed) {
      const lineCount = change.count || 1
      removedLines.value += lineCount
      hasDiff.value = true
      
      // 在左侧编辑器中标记差异
      for (let i = 0; i < lineCount; i++) {
        const leftLine = leftEditor.getModel().getLineContent(leftLineNumber + i)
        const rightLine = rightEditor.getModel().getLineContent(rightLineNumber)
        leftDecorations.push(...applyDecorations(
          leftEditor,
          leftLineNumber + i,
          leftLine,
          rightLine,
          true
        ))
      }
      leftLineNumber += lineCount
    } else if (change.added) {
      const lineCount = change.count || 1
      addedLines.value += lineCount
      hasDiff.value = true
      
      // 在右侧编辑器中标记差异
      for (let i = 0; i < lineCount; i++) {
        const leftLine = leftEditor.getModel().getLineContent(leftLineNumber)
        const rightLine = rightEditor.getModel().getLineContent(rightLineNumber + i)
        rightDecorations.push(...applyDecorations(
          rightEditor,
          rightLineNumber + i,
          leftLine,
          rightLine,
          false
        ))
      }
      rightLineNumber += lineCount
    } else {
      // 检查相同行中的字符级差异
      const lineCount = change.count || 1
      const lines = change.value.split('\n')
      
      lines.forEach((line, index) => {
        if (line) {
          const leftLine = leftEditor.getModel().getLineContent(leftLineNumber + index)
          const rightLine = rightEditor.getModel().getLineContent(rightLineNumber + index)
          
          // 对相同行的内容进行字符级对比
          const charDiffs = diff.diffChars(leftLine, rightLine)
          let hasChanges = false
          charDiffs.forEach(charDiff => {
            if (charDiff.added || charDiff.removed) {
              hasChanges = true
            }
          })

          if (hasChanges) {
            modifiedLines.value++
            hasDiff.value = true
            
            // 在两侧编辑器中同时标记修改的行
            leftDecorations.push(...applyDecorations(
              leftEditor,
              leftLineNumber + index,
              leftLine,
              rightLine,
              true
            ))
            
            rightDecorations.push(...applyDecorations(
              rightEditor,
              rightLineNumber + index,
              leftLine,
              rightLine,
              false
            ))
          }
        }
      })

      leftLineNumber += lineCount
      rightLineNumber += lineCount
    }
  })

  // 应用新的装饰器并保存装饰器 ID
  if (leftEditor) {
    leftDecorationIds = leftEditor.deltaDecorations(leftDecorationIds, leftDecorations)
  }
  if (rightEditor) {
    rightDecorationIds = rightEditor.deltaDecorations(rightDecorationIds, rightDecorations)
  }
}

// 监听主题变化
watch(() => document.documentElement.classList.contains('dark'), (isDark) => {
  const theme = isDark ? 'customThemeDark' : 'customTheme'
  leftEditor?.setTheme(theme)
  middleEditor?.setTheme(theme)
  rightEditor?.setTheme(theme)
})

// 切换对比模式
const setMode = (mode: '2-way' | '3-way') => {
  is3WayMode.value = mode === '3-way'
  // 重新布局编辑器
  nextTick(() => {
    // 等待 DOM 更新后重新布局所有编辑器
    setTimeout(() => {
      leftEditor?.layout()
      if (is3WayMode.value) {
        middleEditor?.layout()
      }
      rightEditor?.layout()
      performDiff()
    }, 100)
  })
}

// 同步滚动
const toggleSyncScroll = () => {
  syncScroll.value = !syncScroll.value
  if (syncScroll.value) {
    // 绑定滚动事件
    leftEditor?.onDidScrollChange(() => syncEditorScroll('left'))
    middleEditor?.onDidScrollChange(() => syncEditorScroll('middle'))
    rightEditor?.onDidScrollChange(() => syncEditorScroll('right'))
  }
}

// 同步编辑器滚动
const syncEditorScroll = (source: 'left' | 'middle' | 'right') => {
  if (!syncScroll.value) return
  
  const scrollInfo = {
    left: leftEditor?.getScrollTop(),
    middle: middleEditor?.getScrollTop(),
    right: rightEditor?.getScrollTop()
  }

  switch(source) {
    case 'left':
      middleEditor?.setScrollTop(scrollInfo.left!)
      rightEditor?.setScrollTop(scrollInfo.left!)
      break
    case 'middle':
      leftEditor?.setScrollTop(scrollInfo.middle!)
      rightEditor?.setScrollTop(scrollInfo.middle!)
      break
    case 'right':
      leftEditor?.setScrollTop(scrollInfo.right!)
      middleEditor?.setScrollTop(scrollInfo.right!)
      break
  }
}

// 忽略空白字符
const toggleIgnoreWhitespace = () => {
  ignoreWhitespace.value = !ignoreWhitespace.value
  performDiff()
}

// 显示行号
const toggleLineNumbers = () => {
  showLineNumbers.value = !showLineNumbers.value
  const options = { lineNumbers: showLineNumbers.value ? 'on' : 'off' }
  leftEditor?.updateOptions(options)
  middleEditor?.updateOptions(options)
  rightEditor?.updateOptions(options)
}

// 差异导航
const gotoPrevDiff = () => {
  const decorations = leftEditor?.getModel()?.getAllDecorations() || []
  const currentPosition = leftEditor?.getPosition()
  let prevLine = 1

  for (let i = decorations.length - 1; i >= 0; i--) {
    const decoration = decorations[i]
    if (decoration.range.startLineNumber < currentPosition?.lineNumber!) {
      prevLine = decoration.range.startLineNumber
      break
    }
  }

  leftEditor?.revealLineInCenter(prevLine)
  leftEditor?.setPosition({ lineNumber: prevLine, column: 1 })
}

const gotoNextDiff = () => {
  const decorations = leftEditor?.getModel()?.getAllDecorations() || []
  const currentPosition = leftEditor?.getPosition()
  let nextLine = leftEditor?.getModel()?.getLineCount() || 1

  for (const decoration of decorations) {
    if (decoration.range.startLineNumber > currentPosition?.lineNumber!) {
      nextLine = decoration.range.startLineNumber
      break
    }
  }

  leftEditor?.revealLineInCenter(nextLine)
  leftEditor?.setPosition({ lineNumber: nextLine, column: 1 })
}

// 主题设置
const openThemeSelector = () => {
  showSettings.value = true
}

// 字体设置
const openFontSettings = () => {
  showSettings.value = true
}

// 快捷键设置
const openKeyboardShortcuts = () => {
  showSettings.value = true
}

// 导出差异
const exportDiff = () => {
  const diffResult = diff.createPatch(
    'diff.patch',
    leftEditor?.getValue() || '',
    rightEditor?.getValue() || '',
    'Original',
    'Modified'
  )

  const blob = new Blob([diffResult], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'diff.patch'
  a.click()
  URL.revokeObjectURL(url)
}

// 格式化代码
const formatCode = async (editor: 'left' | 'middle' | 'right') => {
  const targetEditor = editor === 'left' ? leftEditor : 
                      editor === 'middle' ? middleEditor : 
                      rightEditor
  
  if (!targetEditor) return

  try {
    await targetEditor.getAction('editor.action.formatDocument').run()
    ElMessage.success('代码格式化成功')
  } catch (error) {
    ElMessage.error('代码格式化失败')
  }
}

// 复制内容
const copyContent = async (editor: 'left' | 'middle' | 'right') => {
  const targetEditor = editor === 'left' ? leftEditor : 
                      editor === 'middle' ? middleEditor : 
                      rightEditor
  
  if (!targetEditor) return

  try {
    await navigator.clipboard.writeText(targetEditor.getValue())
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 清空内容
const clearContent = (editor: 'left' | 'middle' | 'right') => {
  const targetEditor = editor === 'left' ? leftEditor : 
                      editor === 'middle' ? middleEditor : 
                      rightEditor
  
  if (!targetEditor) return

  // 清空内容
  targetEditor.setValue('')
  
  // 清除装饰器
  if (editor === 'left') {
    leftDecorationIds = targetEditor.deltaDecorations(leftDecorationIds, [])
  } else if (editor === 'right') {
    rightDecorationIds = targetEditor.deltaDecorations(rightDecorationIds, [])
  }

  // 重新执行差异对比
  performDiff()
  
  ElMessage.success('已清空')
}

// 修改从剪贴板粘贴的函数
const pasteFromClipboard = async () => {
  try {
    const text = await navigator.clipboard.readText()
    if (!leftEditor?.getValue()) {
      leftEditor?.setValue(text)
      leftContent.value = text // 更新内容值
    } else if (!rightEditor?.getValue()) {
      rightEditor?.setValue(text)
      rightContent.value = text // 更新内容值
    }
    // 主动触发差异对比
    performDiff()
    ElMessage.success('粘贴成功')
  } catch (error) {
    ElMessage.error('粘贴失败')
  }
}

// 加载示例
const loadExample = () => {
  const originalCode = `function greeting(name) {
  console.log("Hello, " + name + "!");
  return "Hello " + name;
}

// 调用函数
greeting("World");`

  const modifiedCode = `function greeting(name) {
  // 添加类型检查
  if (typeof name !== 'string') {
    throw new Error('Name must be a string');
  }
  
  // 使用模板字符串
  console.log(\`Hello, \${name}!\`);
  return \`Hello \${name}\`;
}

// 调用函数
greeting("World");
greeting(123); // 将抛出错误`

  leftEditor?.setValue(originalCode)
  rightEditor?.setValue(modifiedCode)
}

// 监听编辑器内容变化
watch([leftContent, rightContent], () => {
  hasContent.value = !!(leftContent.value || rightContent.value)
  if (hasContent.value) {
    performDiff()
  }
})

// 组件挂载时初始化
onMounted(() => {
  initEditor()
  window.addEventListener('keydown', handleKeydown)
  
  // 注册快捷键
  window.addEventListener('keydown', (e) => {
    if (e.altKey && e.key === 'ArrowUp') {
      gotoPrevDiff()
    }
    if (e.altKey && e.key === 'ArrowDown') {
      gotoNextDiff()
    }
  })
})

// 组件卸载时清理
onUnmounted(() => {
  leftEditor?.dispose()
  middleEditor?.dispose()
  rightEditor?.dispose()
  window.removeEventListener('keydown', handleKeydown)
  if (leftEditor) {
    leftDecorationIds = leftEditor.deltaDecorations(leftDecorationIds, [])
  }
  if (rightEditor) {
    rightDecorationIds = rightEditor.deltaDecorations(rightDecorationIds, [])
  }
})

// 监听 ESC 键退出全屏
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isFullscreen.value) {
    toggleFullscreen()
  }
}

// 切换高亮
const toggleHighlight = () => {
  highlightEnabled.value = !highlightEnabled.value
}

// 切换全屏
const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value
  if (isFullscreen.value) {
    document.documentElement.style.overflow = 'hidden'
  } else {
    document.documentElement.style.overflow = ''
  }
}
</script>

<style>
/* 修改全局差异高亮样式 */
:root {
  --diff-changed-bg: rgba(255, 193, 7, 0.1);
  --diff-changed-gutter: rgba(255, 193, 7, 0.8);
  --diff-char-added-bg: rgba(46, 160, 67, 0.3);
  --diff-char-removed-bg: rgba(255, 70, 66, 0.3);
}

/* 暗色模式下的差异高亮 */
:root.dark {
  --diff-changed-bg: rgba(255, 193, 7, 0.15);
  --diff-char-added-bg: rgba(46, 160, 67, 0.35);
  --diff-char-removed-bg: rgba(255, 70, 66, 0.35);
}

/* 字符级差异样式 */
.diff-char-added {
  background-color: var(--diff-char-added-bg);
  border-radius: 2px;
}

.diff-char-removed {
  background-color: var(--diff-char-removed-bg);
  border-radius: 2px;
}

/* 行级差异样式 */
.diff-line-changed {
  background-color: var(--diff-changed-bg) !important;
}

.diff-glyph-changed {
  background-color: var(--diff-changed-gutter) !important;
  width: 3px !important;
  margin-left: 5px;
}

/* 添加等待提示样式 */
.waiting-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--info-bg, rgba(144, 147, 153, 0.1));
  border: 1px solid var(--info-border, rgba(144, 147, 153, 0.2));
  border-radius: 8px;
  color: var(--info-text, #909399);
  font-weight: 500;
}

.waiting-tip .tip-icon {
  font-size: 1.5em;
  color: var(--info-text, #909399);
}

/* 暗色模式适配 */
:root.dark .waiting-tip {
  background: rgba(144, 147, 153, 0.15);
  border-color: rgba(144, 147, 153, 0.3);
}
</style>

<style scoped>
.diff-tool {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  min-height: 100vh;
  background: var(--bg-primary);
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--border-color);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.primary-actions,
.secondary-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* 按钮组样式 */
.el-button-group {
  display: inline-flex;
  border-radius: 8px;
  overflow: hidden;
}

.el-button-group .el-button {
  margin: 0;
  border-radius: 0;
}

.el-button-group .el-button:first-child {
  border-top-left-radius: 8px;
  border-bottom-left-radius: 8px;
}

.el-button-group .el-button:last-child {
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}

/* 编辑器容器样式 */
.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 600px; /* 确保有足够的高度 */
}

.editor-container.is-fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  border-radius: 0;
  padding: 2rem;
}

/* 编辑器行样式 */
.el-row {
  height: 100%; /* 让行占满容器高度 */
}

/* 编辑器列样式 */
.el-col {
  height: 100%; /* 让列占满行高度 */
}

/* 编辑器面板样式 */
.editor-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: all 0.3s ease;
}

.editor-panel:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.1);
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
}

.editor-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.editor-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Monaco 编辑器容器样式 */
.monaco-editor {
  flex: 1;
  min-height: 500px;
  width: 100% !important; /* 确保编辑器宽度正确 */
}

/* 确保编辑器内容区域正确显示 */
.monaco-editor .overflow-guard {
  width: 100% !important;
  height: 100% !important;
}

/* 差异统计样式 */
.diff-summary {
  margin-bottom: 1rem;
}

.diff-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-secondary);
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.stat-item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  min-width: 120px;
}

.stat-item .el-icon {
  font-size: 1.1em;
}

.no-diff-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--success-bg, rgba(40, 167, 69, 0.1));
  border: 1px solid var(--success-border, rgba(40, 167, 69, 0.2));
  border-radius: 8px;
  color: var(--success-text, #28a745);
  font-weight: 500;
}

.tip-icon {
  font-size: 1.5em;
  color: var(--success-text, #28a745);
}

.tip-text {
  font-size: 0.95rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .diff-tool {
    padding: 1rem;
  }

  .toolbar {
    flex-direction: column;
    gap: 1rem;
  }

  .primary-actions,
  .secondary-actions {
    width: 100%;
    justify-content: center;
  }

  .editor-container {
    padding: 1rem;
  }

  .diff-stats {
    flex-direction: column;
  }

  .stat-item {
    width: 100%;
    justify-content: center;
  }

  .no-diff-tip {
    flex-direction: column;
    text-align: center;
    padding: 1.5rem;
  }
}

/* 动画效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 暗色模式适配 */
:root.dark .diff-tool {
  background: var(--dark-bg);
}

:root.dark .toolbar,
:root.dark .editor-container,
:root.dark .diff-stats,
:root.dark .help-tips {
  background: var(--dark-bg-secondary);
  border-color: var(--dark-border);
}

:root.dark .editor-panel {
  background: var(--dark-bg);
  border-color: var(--dark-border);
}

:root.dark .editor-panel:hover {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb), 0.2);
}

:root.dark .editor-header {
  background: var(--dark-bg-secondary);
  border-color: var(--dark-border);
}
</style> 