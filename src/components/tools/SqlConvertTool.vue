<template>
  <div class="sql-convert-tool">
    <!-- 编辑器容器 -->
    <div class="editor-container">
      <el-row :gutter="20">
        <!-- 左侧编辑器 -->
        <el-col :span="12">
          <div class="editor-wrapper">
            <div class="editor-header">
              <div class="left-section">
                <span class="editor-label">源 SQL</span>
                <el-select v-model="sourceType" size="small" style="width: 120px">
                  <el-option v-for="db in databases" :key="db.value" :label="db.label" :value="db.value" />
                </el-select>
              </div>
              <div class="header-actions">
                <el-upload
                  class="upload-button"
                  action=""
                  :auto-upload="false"
                  :show-file-list="false"
                  @change="handleFileUpload"
                >
                  <el-button size="small">
                    <el-icon><Upload /></el-icon>导入
                  </el-button>
                </el-upload>
                <el-button size="small" @click="loadSample" class="sample-button">
                  <el-icon><DocumentAdd /></el-icon>示例
                </el-button>
              </div>
            </div>
            <div class="textarea-wrapper">
              <div ref="inputEditorContainer" class="monaco-editor"></div>
              <!-- 添加浮动按钮 -->
              <div class="floating-actions" v-show="inputEditor?.getValue()?.trim()">
                <el-button
                  class="float-btn copy-btn"
                  circle
                  @click="copyInput"
                  title="复制内容"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
                <el-button
                  class="float-btn clear-btn"
                  circle
                  @click="clearContent"
                  title="清空内容"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-col>

        <!-- 右侧结果展示 -->
        <el-col :span="12">
          <div class="editor-wrapper">
            <div class="editor-header">
              <span class="editor-label">转换结果</span>
              <el-select v-model="targetType" size="small" style="width: 120px">
                <el-option v-for="db in databases" :key="db.value" :label="db.label" :value="db.value" />
              </el-select>
              <!-- 将选项移到这里 -->
              <div class="options">
                <el-checkbox v-model="options.autoFormat">自动格式化</el-checkbox>
                <el-checkbox v-model="options.validateSyntax">语法检查</el-checkbox>
              </div>
            </div>
            <div class="textarea-wrapper">
              <div ref="outputEditorContainer" class="monaco-editor"></div>
              <!-- 添加浮动按钮 -->
              <div class="floating-actions" v-show="outputEditor?.getValue()?.trim()">
                <el-button
                  class="float-btn copy-btn"
                  circle
                  @click="copyResult"
                  title="复制结果"
                >
                  <el-icon><CopyDocument /></el-icon>
                </el-button>
                <el-button
                  class="float-btn clear-btn"
                  circle
                  @click="clearOutput"
                  title="清空结果"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 转换按钮区域 -->
    <div class="convert-button-container">
      <el-button type="primary" @click="convertSql" class="convert-button" size="large">
        开始转换
      </el-button>
    </div>

    <!-- SQL 分析信息 -->
    <div class="sql-analysis" v-if="analysis.valid">
      <el-descriptions :column="4" border size="small">
        <el-descriptions-item label="语句类型">
          {{ analysis.statementType }}
        </el-descriptions-item>
        <el-descriptions-item label="表数量">
          {{ analysis.tableCount }}
        </el-descriptions-item>
        <el-descriptions-item label="函数数量">
          {{ analysis.functionCount }}
        </el-descriptions-item>
        <el-descriptions-item label="语法兼容性">
          {{ analysis.compatibility }}
        </el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 将转换日志和免责声明包装在卡片容器中 -->
    <div class="cards-container">
       <!-- 免责声明卡片 -->
       <div class="card disclaimer-card">
         <div class="card-header">
           <h3 class="card-title">免责声明</h3>
         </div>
         <div class="disclaimer-content">
           <p>1. 本工具仅提供SQL语法转换参考，不保证100%准确性</p>
           <p>2. 转换后的SQL请务必经过充分测试后再应用到生产环境</p>
           <p>3. 建议在使用前备份数据，并在测试环境验证转换结果</p>
         </div>
       </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Connection,
  DocumentAdd,
  Document as CopyDocument,
  Delete,
  Upload,
  Warning,
  InfoFilled,
  CircleCheckFilled
} from '@element-plus/icons-vue'
import * as monaco from 'monaco-editor'
import { format as sqlFormatter } from 'sql-formatter'

// 编辑器实例
let inputEditor: monaco.editor.IStandaloneCodeEditor | null = null
let outputEditor: monaco.editor.IStandaloneCodeEditor | null = null

// 响应式状态
const inputEditorContainer = ref<HTMLElement>()
const outputEditorContainer = ref<HTMLElement>()

// 数据库类型配置
const databases = [
  { label: '请选择', value: '' },
  { label: 'MySQL', value: 'mysql' },
  { label: 'SQL Server', value: 'sqlserver' },
  { label: 'Oracle', value: 'oracle' },
  { label: '达梦', value: 'dameng' }
]

const sourceType = ref('')
const targetType = ref('')
const options = ref({
  autoFormat: true,
  validateSyntax: true
})

// SQL分析信息
const analysis = ref({
  valid: false,
  statementType: '',
  tableCount: 0,
  functionCount: 0,
  compatibility: ''
})

// 转换日志
const logs = ref<Array<{type: string, message: string}>>([])

// 更新示例 SQL 配置
const sampleSqls = {
  mysql: `-- MySQL示例查询
SELECT 
    DATE_FORMAT(create_time, '%Y-%m-%d') as create_date,
    IFNULL(user_name, 'Unknown') as user,
    COUNT(*) as total,
    GROUP_CONCAT(DISTINCT category) as categories
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE o.status = 1 
    AND o.create_time >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE_FORMAT(create_time, '%Y-%m-%d'), user_name
HAVING total > 10
LIMIT 100;`,

  sqlserver: `-- SQL Server示例查询
SELECT TOP 100
    FORMAT(create_time, 'yyyy-MM-dd') as create_date,
    ISNULL(user_name, 'Unknown') as user,
    COUNT(*) as total,
    STRING_AGG(DISTINCT category, ',') as categories
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
WHERE o.status = 1 
    AND o.create_time >= DATEADD(DAY, -7, GETDATE())
GROUP BY FORMAT(create_time, 'yyyy-MM-dd'), user_name
HAVING COUNT(*) > 10;`,

  oracle: `-- Oracle示例查询
SELECT * FROM (
    SELECT 
        TO_CHAR(create_time, 'YYYY-MM-DD') as create_date,
        NVL(user_name, 'Unknown') as user,
        COUNT(*) as total,
        LISTAGG(DISTINCT category, ',') WITHIN GROUP (ORDER BY category) as categories
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.status = 1 
        AND o.create_time >= SYSDATE - 7
    GROUP BY TO_CHAR(create_time, 'YYYY-MM-DD'), user_name
    HAVING COUNT(*) > 10
) WHERE ROWNUM <= 100;`,

  dameng: `-- 达梦示例查询
SELECT * FROM (
    SELECT 
        TO_CHAR(create_time, 'YYYY-MM-DD') as create_date,
        IFNULL(user_name, 'Unknown') as user,
        COUNT(*) as total,
        LISTAGG(DISTINCT category, ',') WITHIN GROUP (ORDER BY category) as categories
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE o.status = 1 
        AND o.create_time >= SYSDATE - 7
    GROUP BY TO_CHAR(create_time, 'YYYY-MM-DD'), user_name
    HAVING COUNT(*) > 10
) WHERE ROWNUM <= 100;`
}

// 初始化编辑器
onMounted(() => {
  if (inputEditorContainer.value && outputEditorContainer.value) {
    // 创建输入编辑器
    inputEditor = monaco.editor.create(inputEditorContainer.value, {
      value: '',
      language: 'sql',
      theme: 'vs',
      minimap: { enabled: false },
      lineNumbers: 'on',
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: 4,
      wordWrap: 'on',
      automaticLayout: true,
      folding: true
    })

    // 创建输出编辑器
    outputEditor = monaco.editor.create(outputEditorContainer.value, {
      value: '',
      language: 'sql',
      theme: 'vs',
      minimap: { enabled: false },
      lineNumbers: 'on',
      readOnly: true,
      scrollBeyondLastLine: false,
      fontSize: 14,
      tabSize: 4,
      wordWrap: 'on',
      automaticLayout: true,
      folding: true
    })

    // 监听输入变化
    inputEditor.onDidChangeModelContent(() => {
      analyzeSql()
    })
  }
})

// SQL转换函数
const convertSql = () => {
  const sql = inputEditor?.getValue() || ''
  if (!sql.trim()) {
    ElMessage.warning('请输入要转换的SQL')
    return
  }

  // 添加数据库类型验证
  if (!sourceType.value) {
    ElMessage.warning('请选择源数据库类型')
    return
  }
  if (!targetType.value) {
    ElMessage.warning('请选择目标数据库类型')
    return
  }

  try {
    // 清空之前的日志
    logs.value = []
    
    // 添加转换开始日志
    addLog('info', `开始将SQL从 ${sourceType.value} 转换为 ${targetType.value}`)

    // 预处理SQL，移除注释和多余的分号
    const cleanedSql = sql.trim()
      // 移除单行注释 --
      .replace(/--.*$/gm, '')
      // 移除多行注释 /* */
      .replace(/\/\*[\s\S]*?\*\//g, '')
      // 移除多余的分号
      .replace(/;+$/, '')
      // 移除多余的空行
      .replace(/^\s*[\r\n]/gm, '')
      .trim()

    // 解析SQL
    const convertedSql = convertSqlBetweenDialects(cleanedSql, sourceType.value, targetType.value)
    
    try {
      // 格式化结果
      const formattedSql = options.value.autoFormat 
        ? sqlFormatter(convertedSql, {
            language: 'sql',
            uppercase: true,
            indentStyle: 'standard',
            keywordCase: 'upper',
            stripComments: true  // 确保格式化时也移除注释
          })
        : convertedSql

      // 设置输出
      if (outputEditor) {
        outputEditor.setValue(formattedSql)
      }

      // 添加成功日志
      addLog('success', '转换完成')
      ElMessage.success('转换成功')
    } catch (formatError) {
      // 如果格式化失败，仍然显示转换后的SQL
      if (outputEditor) {
        outputEditor.setValue(convertedSql)
      }
      addLog('warning', '格式化失败，显示未格式化的SQL')
      ElMessage.warning('SQL已转换，但格式化失败')
    }
  } catch (error) {
    // 优化错误提示
    let errorMessage = '转换失败'
    
    if (error instanceof Error) {
      if (error.message.includes('Parse error')) {
        errorMessage = 'SQL语法错误，请检查SQL语句是否正确'
      } else if (error.message.includes('Unexpected token')) {
        errorMessage = 'SQL包含不支持的语法，请简化SQL语句'
      } else if (error.message.includes('DELIMITER')) {
        errorMessage = '请移除SQL末尾的分号(;)后重试'
      } else {
        errorMessage = `转换失败: ${error.message}`
      }
    }

    addLog('warning', errorMessage)
    ElMessage.error({
      message: errorMessage,
      duration: 5000,
      showClose: true
    })

    // 添加详细错误信息到日志
    if (error instanceof Error) {
      addLog('info', `详细错误信息: ${error.message}`)
    }
  }
}

// SQL方言转换函数
const convertSqlBetweenDialects = (sql: string, from: string, to: string): string => {
  let convertedSql = sql.trim()
  
  if (from === to) {
    return convertedSql
  }

  try {
    // MySQL 到 Oracle 的转换
    if (from === 'mysql' && to === 'oracle') {
      // 1. 处理函数转换
      const functionMappings: [RegExp, string][] = [
        // 日期函数转换
        [/DATE_FORMAT\s*\(\s*([^,]+?)\s*,\s*['"]%Y-%m-%d['"]\s*\)/g, "TO_CHAR($1, 'YYYY-MM-DD')"],
        [/DATE_FORMAT\s*\(\s*([^,]+?)\s*,\s*['"]%Y-%m-%d %H:%i:%s['"]\s*\)/g, "TO_CHAR($1, 'YYYY-MM-DD HH24:MI:SS')"],
        [/NOW\s*\(\s*\)/g, 'SYSDATE'],
        [/CURDATE\s*\(\s*\)/g, 'TRUNC(SYSDATE)'],
        [/UNIX_TIMESTAMP\s*\(\s*\)/g, '((CAST(SYSTIMESTAMP AT TIME ZONE \'UTC\' AS DATE) - DATE \'1970-01-01\') * 86400)'],
        
        // NULL处理函数转换
        [/IFNULL\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g, 'NVL($1, $2)'],
        [/COALESCE\s*\((.*?)\)/g, 'COALESCE($1)'],
        
        // 字符串函数转换
        [/CONCAT_WS\s*\(\s*['"]([^'"]+)['"]\s*,\s*(.*?)\)/g, (_, sep, args) => {
          const parts = args.split(',').map(p => p.trim())
          return parts.join(` || '${sep}' || `)
        }],
        [/CONCAT\s*\((.*?)\)/g, (_, args) => {
          const parts = args.split(',').map(p => p.trim())
          return parts.join(' || ')
        }],
        
        // 聚合函数转换
        [/GROUP_CONCAT\s*\(\s*DISTINCT\s+([^)]+?)\s*\)/g, 'LISTAGG(DISTINCT $1, \',\') WITHIN GROUP (ORDER BY $1)'],
        [/GROUP_CONCAT\s*\(\s*([^)]+?)\s*\)/g, 'LISTAGG($1, \',\') WITHIN GROUP (ORDER BY $1)']
      ]

      // 应用所有函数转换
      for (const [pattern, replacement] of functionMappings) {
        convertedSql = convertedSql.replace(pattern, replacement)
      }

      // 处理 LIMIT 子句
      const limitMatch = convertedSql.match(/\sLIMIT\s+(\d+)(?:\s*,\s*(\d+))?\s*;?\s*$/)
      if (limitMatch) {
        // 移除原始的 LIMIT 子句
        convertedSql = convertedSql.replace(/\s+LIMIT\s+\d+(?:\s*,\s*\d+)?\s*;?\s*$/, '')
        
        if (limitMatch[2]) {
          // LIMIT x,y 形式转换为 ROW_NUMBER
          const offset = parseInt(limitMatch[1])
          const rowCount = parseInt(limitMatch[2])
          convertedSql = `
            SELECT * FROM (
              SELECT a.*, ROW_NUMBER() OVER (ORDER BY ROWNUM) AS rn 
              FROM (${convertedSql}) a
            ) WHERE rn BETWEEN ${offset + 1} AND ${offset + rowCount}`
        } else {
          // 简单的 LIMIT n 形式
          const rowCount = parseInt(limitMatch[1])
          convertedSql = `
            SELECT * FROM (${convertedSql}) WHERE ROWNUM <= ${rowCount}`
        }
      }
    }
    
    // Oracle 到 MySQL 的转换
    else if (from === 'oracle' && to === 'mysql') {
      // 1. 处理函数转换
      const functionMappings: [RegExp, string][] = [
        // 日期函数转换
        [/TO_CHAR\s*\(\s*([^,]+?)\s*,\s*'YYYY-MM-DD'\s*\)/g, "DATE_FORMAT($1, '%Y-%m-%d')"],
        [/TO_CHAR\s*\(\s*([^,]+?)\s*,\s*'YYYY-MM-DD HH24:MI:SS'\s*\)/g, "DATE_FORMAT($1, '%Y-%m-%d %H:%i:%s')"],
        [/SYSDATE/g, 'NOW()'],
        [/SYSTIMESTAMP/g, 'NOW(3)'],
        
        // NULL处理函数转换
        [/NVL\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g, 'IFNULL($1, $2)'],
        
        // 字符串连接转换
        [/\s*\|\|\s*/g, ', '],
        
        // 聚合函数转换
        [/LISTAGG\s*\(\s*([^,]+?)\s*,\s*'[^']*'\s*\)\s*WITHIN\s+GROUP\s*\(\s*ORDER\s+BY\s+[^)]+?\s*\)/g, 'GROUP_CONCAT($1)']
      ]

      // 应用所有函数转换
      for (const [pattern, replacement] of functionMappings) {
        convertedSql = convertedSql.replace(pattern, replacement)
      }

      // 处理 ROWNUM 和 ROW_NUMBER
      if (convertedSql.includes('ROWNUM') || convertedSql.includes('ROW_NUMBER()')) {
        // 处理 ROW_NUMBER OVER (ORDER BY ...)
        if (convertedSql.includes('ROW_NUMBER()')) {
          const match = convertedSql.match(/SELECT\s+.*?\s+FROM\s+.*?\s+WHERE\s+rn\s+BETWEEN\s+(\d+)\s+AND\s+(\d+)/)
          if (match) {
            const start = parseInt(match[1]) - 1
            const count = parseInt(match[2]) - start
            // 移除 ROW_NUMBER 相关的包装查询
            convertedSql = convertedSql.replace(/SELECT\s+\*\s+FROM\s+\(\s*SELECT.*?ROW_NUMBER.*?WHERE\s+rn\s+BETWEEN.*?\)/is, 
              originalQuery => {
                const innerQuery = originalQuery.match(/FROM\s+\((.*?)\)\s+a/is)?.[1] || ''
                return `${innerQuery} LIMIT ${start}, ${count}`
              }
            )
          }
        }
        // 处理简单的 ROWNUM 限制
        else {
          const rownumMatch = convertedSql.match(/WHERE\s+ROWNUM\s*<=\s*(\d+)/)
          if (rownumMatch) {
            const limit = rownumMatch[1]
            convertedSql = convertedSql.replace(/\s+WHERE\s+ROWNUM\s*<=\s*\d+/i, '')
            convertedSql = `${convertedSql} LIMIT ${limit}`
          }
        }
      }
    }

    // SQL Server 到 MySQL 的转换
    else if (from === 'sqlserver' && to === 'mysql') {
      // 1. 处理函数转换
      const functionMappings: [RegExp, string][] = [
        // 日期函数转换
        [/GETDATE\s*\(\s*\)/g, 'NOW()'],
        [/GETUTCDATE\s*\(\s*\)/g, 'UTC_TIMESTAMP()'],
        [/FORMAT\s*\(\s*([^,]+?)\s*,\s*'yyyy-MM-dd'\s*\)/g, "DATE_FORMAT($1, '%Y-%m-%d')"],
        
        // NULL处理函数转换
        [/ISNULL\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g, 'IFNULL($1, $2)'],
        
        // 字符串函数转换
        [/STRING_AGG\s*\(\s*([^,]+?)\s*,\s*'[^']*'\s*\)/g, 'GROUP_CONCAT($1)'],
        
        // 其他函数转换
        [/DATEADD\s*\(\s*(\w+)\s*,\s*(-?\d+)\s*,\s*([^)]+?)\s*\)/g, 
          (_, unit, number, date) => `DATEADD(${unit}, ${number}, ${date})`]
      ]

      // 应用所有函数转换
      for (const [pattern, replacement] of functionMappings) {
        convertedSql = convertedSql.replace(pattern, replacement)
      }

      // 处理 TOP 子句
      const topMatch = convertedSql.match(/\bSELECT\s+TOP\s+(\d+)\b/i)
      if (topMatch) {
        const limit = topMatch[1]
        convertedSql = convertedSql.replace(/\bSELECT\s+TOP\s+\d+\b/i, 'SELECT')
        convertedSql = `${convertedSql} LIMIT ${limit}`
      }

      // 处理 OFFSET-FETCH
      const offsetFetchMatch = convertedSql.match(/OFFSET\s+(\d+)\s+ROWS\s+FETCH\s+NEXT\s+(\d+)\s+ROWS\s+ONLY/i)
      if (offsetFetchMatch) {
        const [_, offset, limit] = offsetFetchMatch
        convertedSql = convertedSql.replace(/\s+OFFSET\s+\d+\s+ROWS\s+FETCH\s+NEXT\s+\d+\s+ROWS\s+ONLY/i, '')
        convertedSql = `${convertedSql} LIMIT ${offset}, ${limit}`
      }
    }

    // MySQL 到 SQL Server 的转换
    else if (from === 'mysql' && to === 'sqlserver') {
      // 1. 处理函数转换
      const functionMappings: [RegExp, string][] = [
        // 日期函数转换
        [/DATE_FORMAT\s*\(\s*([^,]+?)\s*,\s*['"]%Y-%m-%d['"]\s*\)/g, "FORMAT($1, 'yyyy-MM-dd')"],
        [/NOW\s*\(\s*\)/g, 'GETDATE()'],
        
        // NULL处理函数转换
        [/IFNULL\s*\(\s*([^,]+?)\s*,\s*([^)]+?)\s*\)/g, 'ISNULL($1, $2)'],
        
        // 聚合函数转换
        [/GROUP_CONCAT\s*\(\s*([^)]+?)\s*\)/g, 'STRING_AGG($1, \',\')'],
        
        // 其他函数转换
        [/DATE_ADD\s*\(\s*([^,]+?)\s*,\s*INTERVAL\s+(\d+)\s+(\w+)\s*\)/g,
          (_, date, number, unit) => `DATEADD(${unit}, ${number}, ${date})`]
      ]

      // 应用所有函数转换
      for (const [pattern, replacement] of functionMappings) {
        convertedSql = convertedSql.replace(pattern, replacement)
      }

      // 处理 LIMIT 子句
      const limitMatch = convertedSql.match(/\sLIMIT\s+(\d+)(?:\s*,\s*(\d+))?\s*;?\s*$/)
      if (limitMatch) {
        convertedSql = convertedSql.replace(/\s+LIMIT\s+\d+(?:\s*,\s*\d+)?\s*;?\s*$/, '')
        
        if (limitMatch[2]) {
          // LIMIT x,y 形式转换为 OFFSET-FETCH
          const offset = parseInt(limitMatch[1])
          const rowCount = parseInt(limitMatch[2])
          convertedSql = `${convertedSql} 
            OFFSET ${offset} ROWS 
            FETCH NEXT ${rowCount} ROWS ONLY`
        } else {
          // 简单的 LIMIT n 形式转换为 TOP
          const rowCount = parseInt(limitMatch[1])
          convertedSql = convertedSql.replace(/\bSELECT\b/i, `SELECT TOP ${rowCount}`)
        }
      }
    }

    return convertedSql

  } catch (error) {
    console.error('SQL转换错误:', error)
    throw new Error('SQL转换失败，请检查SQL语法')
  }
}

// SQL分析函数
const analyzeSql = () => {
  const sql = inputEditor?.getValue() || ''
  if (!sql.trim()) {
    analysis.value.valid = false
    return
  }

  try {
    // 分析SQL类型
    const statementType = sql.trim().split(/\s+/)[0].toUpperCase()
    
    // 计算表数量
    const tableCount = (sql.match(/\b(?:FROM|JOIN)\s+(\w+)\b/gi) || []).length
    
    // 计算函数数量
    const functionCount = (sql.match(/\b\w+\s*\(/g) || []).length
    
    // 评估兼容性
    const compatibility = evaluateCompatibility(sql, sourceType.value, targetType.value)

    analysis.value = {
      valid: true,
      statementType,
      tableCount,
      functionCount,
      compatibility
    }
  } catch (error) {
    analysis.value.valid = false
  }
}

// 兼容性评估函数
const evaluateCompatibility = (sql: string, from: string, to: string): string => {
  const incompatibleFeatures = []
  
  // MySQL 转换
  if (from === 'mysql') {
    if (to === 'sqlserver') {
      if (sql.includes('LIMIT')) incompatibleFeatures.push('LIMIT子句')
      if (sql.includes('GROUP_CONCAT')) incompatibleFeatures.push('GROUP_CONCAT函数')
      if (sql.includes('DATE_FORMAT')) incompatibleFeatures.push('DATE_FORMAT函数')
      if (sql.includes('IFNULL')) incompatibleFeatures.push('IFNULL函数')
      if (sql.includes('NOW()')) incompatibleFeatures.push('NOW()函数')
    }
    else if (to === 'oracle' || to === 'dameng') {
      if (sql.includes('LIMIT')) incompatibleFeatures.push('LIMIT子句')
      if (sql.includes('GROUP_CONCAT')) incompatibleFeatures.push('GROUP_CONCAT函数')
      if (sql.includes('DATE_FORMAT')) incompatibleFeatures.push('DATE_FORMAT函数')
      if (sql.includes('IFNULL')) incompatibleFeatures.push('IFNULL函数')
      if (sql.includes('NOW()')) incompatibleFeatures.push('NOW()函数')
    }
  }
  // SQL Server 转换
  else if (from === 'sqlserver') {
    if (to === 'mysql' || to === 'dameng' || to === 'oracle') {
      if (sql.includes('TOP')) incompatibleFeatures.push('TOP子句')
      if (sql.includes('ISNULL')) incompatibleFeatures.push('ISNULL函数')
      if (sql.includes('GETDATE()')) incompatibleFeatures.push('GETDATE()函数')
      if (sql.includes('STRING_AGG')) incompatibleFeatures.push('STRING_AGG函数')
      if (sql.match(/OFFSET\s+\d+\s+ROWS/)) incompatibleFeatures.push('OFFSET-FETCH子句')
    }
  }
  // Oracle 转换
  else if (from === 'oracle') {
    if (to === 'mysql' || to === 'sqlserver') {
      if (sql.includes('ROWNUM')) incompatibleFeatures.push('ROWNUM')
      if (sql.includes('LISTAGG')) incompatibleFeatures.push('LISTAGG函数')
      if (sql.includes('NVL')) incompatibleFeatures.push('NVL函数')
      if (sql.includes('SYSDATE')) incompatibleFeatures.push('SYSDATE')
    }
  }
  // 达梦转换
  else if (from === 'dameng') {
    if (to === 'mysql' || to === 'sqlserver') {
      if (sql.includes('ROWNUM')) incompatibleFeatures.push('ROWNUM')
      if (sql.includes('LISTAGG')) incompatibleFeatures.push('LISTAGG函数')
      if (sql.includes('IFNULL')) incompatibleFeatures.push('IFNULL函数')
      if (sql.includes('SYSDATE')) incompatibleFeatures.push('SYSDATE')
    }
  }
  
  return incompatibleFeatures.length > 0 
    ? `需要转换: ${incompatibleFeatures.join(', ')}` 
    : '完全兼容'
}

// 日志相关函数
const addLog = (type: string, message: string) => {
  logs.value.push({ type, message })
}

const clearLogs = () => {
  logs.value = []
}

// 修改加载示例函数
const loadSample = () => {
  if (!sourceType.value) {
    ElMessage.warning('请先选择源数据库类型')
    return
  }
  
  if (inputEditor) {
    const sampleSql = sampleSqls[sourceType.value]
    if (!sampleSql) {
      ElMessage.warning('当前数据库类型暂无示例SQL')
      return
    }
    
    inputEditor.setValue(sampleSql)
    analyzeSql()
    addLog('info', `已加载 ${databases.find(db => db.value === sourceType.value)?.label || ''} 示例SQL`)
    
    ElMessage.success({
      message: `已加载 ${databases.find(db => db.value === sourceType.value)?.label || ''} 示例SQL`,
      duration: 2000
    })
  }
}

// 复制结果
const copyResult = async () => {
  const result = outputEditor?.getValue()
  if (!result) {
    ElMessage.warning('没有可复制的内容')
    return
  }

  try {
    await navigator.clipboard.writeText(result)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

// 清空内容
const clearContent = () => {
  if (inputEditor) {
    inputEditor.setValue('')
  }
  if (outputEditor) {
    outputEditor.setValue('')
  }
  analysis.value.valid = false
  logs.value = []
  ElMessage.success('已清空')
}

// 处理文件上传
const handleFileUpload = (file: any) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result
    if (content && inputEditor) {
      inputEditor.setValue(content as string)
    }
  }
  reader.readAsText(file.raw)
}

// 添加新的复制和清空方法
const copyInput = async () => {
  const content = inputEditor?.getValue()
  if (!content) {
    ElMessage.warning('没有可复制的内容')
    return
  }
  try {
    await navigator.clipboard.writeText(content)
    ElMessage.success('复制成功')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

const clearOutput = () => {
  if (outputEditor) {
    outputEditor.setValue('')
  }
  ElMessage.success('已清空结果')
}

// 清理编辑器实例
onBeforeUnmount(() => {
  inputEditor?.dispose()
  outputEditor?.dispose()
})
</script>

<style scoped>
.sql-convert-tool {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.editor-container {
  background: var(--bg-primary);
  padding: 1rem;
  border-radius: 8px;
  min-height: 500px;
  margin-bottom: 0;
}

/* 确保左右两列高度一致 */
.el-row {
  display: flex;
  flex-wrap: wrap;
}

/* 确保列等高 */
.el-col {
  display: flex;
  flex-direction: column;
}

.editor-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  height: 100%;
  flex: 1;
}

.editor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  width: 100%;
  min-height: 32px; /* 确保header高度一致 */
}

.left-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-shrink: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.editor-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.monaco-editor {
  flex: 1;
  min-height: 450px;
  border-radius: 6px;
  overflow: hidden;
}

.textarea-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-height: 450px;
}

.floating-actions {
  position: absolute;
  right: 1rem;
  top: 1rem;
  display: flex;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

/* 修改悬浮显示逻辑 */
.textarea-wrapper:hover .floating-actions {
  opacity: 1;
}

/* 在移动设备上始终显示 */
@media (max-width: 768px) {
  .el-row {
    flex-direction: column;
  }
  
  .el-col {
    width: 100%;
    margin-bottom: 1rem;
  }

  .monaco-editor,
  .textarea-wrapper {
    min-height: 300px;
  }

  .editor-container {
    min-height: auto;
  }

  .editor-header {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .left-section {
    flex: 1;
    min-width: 200px;
  }

  .header-actions {
    display: flex;
    gap: 0.5rem;
    flex: 0 0 auto;
  }

  .sample-button {
    margin-left: 0.5rem;
  }

  .floating-actions {
    opacity: 1;
  }
}

.float-btn {
  width: 40px !important;
  height: 40px !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  border: none !important;
  border-radius: 50% !important;
  transition: all 0.3s ease !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1) !important;
  min-width: 40px !important;
  max-width: 40px !important;
  min-height: 40px !important;
  max-height: 40px !important;
  flex: 0 0 40px !important;
  line-height: 1 !important;
  font-size: 16px !important;
}

.float-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.float-btn.copy-btn {
  background-color: #007aff !important;
  color: white !important;
}

.float-btn.copy-btn:hover {
  background-color: #0056b3 !important;
}

.float-btn.clear-btn {
  background-color: #28a745 !important;
  color: white !important;
}

.float-btn.clear-btn:hover {
  background-color: #218838 !important;
}

.float-btn :deep(.el-icon) {
  margin: 0 !important;
  font-size: 16px !important;
}

.options {
  display: flex;
  gap: 1rem;
  margin-left: auto;
}

.sql-analysis {
  margin-top: 1rem;
}

.cards-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
}

.card {
  background: var(--bg-primary);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05),
              0 0 0 1px rgba(0, 0, 0, 0.03);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.disclaimer-card {
  background: var(--el-color-warning-light-9);
}

.disclaimer-content {
  color: var(--text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
}

.disclaimer-content p {
  margin: 0.5rem 0;
}

:root.dark {
  .card {
    background: var(--bg-secondary);
  }

  .disclaimer-card {
    background: rgba(var(--el-color-warning-rgb), 0.1);
  }
}

.convert-button-container {
  display: flex;
  justify-content: center;
  padding: 1.5rem 0;
}

.convert-button {
  font-size: 1.1rem;
  padding: 0.75rem 2.5rem;
  border-radius: 8px;
  font-weight: 500;
  background-color: #007aff !important;
  border-color: #007aff !important;
}

.convert-button:hover {
  background-color: #0056b3 !important;
  border-color: #0056b3 !important;
}
</style> 