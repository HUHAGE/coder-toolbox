<template>
  <div class="basketball-group-tool">
    <!-- 队员管理卡片 -->
    <div class="tool-card players-card">
      <h3 class="card-title">
        <el-icon><User /></el-icon>
        队员管理
      </h3>
      <div class="players-container">
        <TransitionGroup name="player-list" tag="div" class="players-grid">
          <div v-for="player in players" 
               :key="player.id" 
               class="player-avatar"
               :class="{ 'is-editing': editingId === player.id }"
          >
            <!-- 显示模式 -->
            <div class="avatar-display" @click="startEditing(player.id)">
              <div class="avatar-circle" :style="{ background: getAvatarColor(player.id) }">
                {{ player.name.charAt(0) }}
              </div>
              
              <!-- 悬浮操作按钮 -->
              <div class="hover-actions">
                <el-button
                  type="primary"
                  circle
                  size="small"
                  @click.stop="startEditing(player.id)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                  type="danger"
                  circle
                  size="small"
                  @click.stop="removePlayer(player.id)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>

            <!-- 编辑模式 -->
            <div class="avatar-edit">
              <el-input 
                v-model="player.name" 
                size="small"
                @blur="finishEditing"
                @keyup.enter="finishEditing"
                v-focus="editingId === player.id"
              />
            </div>
          </div>
        </TransitionGroup>
        
        <el-button 
          class="add-player-btn" 
          @click="addPlayer"
          :disabled="players.length >= 20"
        >
          <el-icon><Plus /></el-icon>
          添加队员
        </el-button>
      </div>
    </div>

    <!-- 分组设置卡片改为可折叠 -->
    <el-collapse v-model="activeCollapse">
      <el-collapse-item name="settings">
        <template #title>
          <h3 class="card-title settings-title">
            <el-icon><Setting /></el-icon>
            分组设置
          </h3>
        </template>
        
        <div class="settings-content">
          <div class="setting-item">
            <span class="setting-label">分组数量</span>
            <el-input-number 
              v-model="groupCount" 
              :min="2" 
              :max="5"
              size="large"
              controls-position="right"
            />
          </div>
          
          <div class="setting-item">
            <span class="setting-label">组名设置</span>
            <div class="group-names">
              <div v-for="i in groupCount" :key="i" class="group-name-item">
                <el-input 
                  v-model="groupNames[i-1]" 
                  :placeholder="`${i}组`"
                  size="small"
                />
              </div>
            </div>
          </div>

          <div class="setting-item">
            <span class="setting-label">分组限制</span>
            <div class="restrictions">
              <div 
                v-for="(restriction, index) in restrictions" 
                :key="index"
                class="restriction-item"
              >
                <el-select 
                  v-model="restriction.player1" 
                  placeholder="选择队员"
                  size="small"
                >
                  <el-option
                    v-for="player in players"
                    :key="player.id"
                    :label="player.name"
                    :value="player.id"
                  />
                </el-select>
                <span class="restriction-text">不能和</span>
                <el-select 
                  v-model="restriction.player2" 
                  placeholder="选择队员"
                  size="small"
                >
                  <el-option
                    v-for="player in players"
                    :key="player.id"
                    :label="player.name"
                    :value="player.id"
                  />
                </el-select>
                <el-button
                  circle
                  class="delete-btn"
                  @click="removeRestriction(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button 
                class="add-restriction-btn" 
                @click="addRestriction"
              >
                <el-icon><Plus /></el-icon>
                添加限制
              </el-button>
            </div>
          </div>
        </div>
      </el-collapse-item>
    </el-collapse>

    <!-- 分组按钮 -->
    <div class="group-action">
      <el-button 
        type="primary" 
        size="large" 
        class="group-btn"
        @click="generateGroups"
      >
        <img src="@/assets/icons/篮球.svg" class="basketball-icon" />
        开始分组
      </el-button>
    </div>

    <!-- 分组结果卡片 -->
    <div class="tool-card result-card" v-if="groupResult.length">
      <h3 class="card-title">
        <el-icon><List /></el-icon>
        分组结果
      </h3>
      <div class="group-results">
        <div 
          v-for="(group, index) in groupResult" 
          :key="index"
          class="group-item"
        >
          <div class="group-header">
            {{ groupNames[index] || `${index + 1}组` }}
          </div>
          <div class="group-members">
            <div 
              v-for="player in group" 
              :key="player.id"
              class="member-item"
            >
              <div 
                class="member-avatar"
                :style="{ background: getAvatarColor(player.id) }"
              >
                {{ player.name.charAt(0) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录卡片 -->
    <div class="tool-card history-card" v-if="groupHistories.length > 0">
      <h3 class="card-title">
        <el-icon><Timer /></el-icon>
        历史记录
      </h3>
      <div class="history-list">
        <div 
          v-for="history in groupHistories" 
          :key="history.id"
          class="history-item"
        >
          <div class="history-header">
            <span class="history-time">{{ history.time }}</span>
            <el-button 
              type="primary" 
              link
              @click="groupResult = history.groups; groupNames = history.groupNames"
            >
              查看详情
            </el-button>
          </div>
          <div class="history-preview">
            <div 
              v-for="(group, index) in history.groups" 
              :key="index"
              class="preview-group"
            >
              <div class="preview-header">
                {{ history.groupNames[index] || `${index + 1}组` }}
              </div>
              <div class="preview-members">
                <div 
                  v-for="player in group" 
                  :key="player.id"
                  class="preview-avatar"
                  :style="{ background: getAvatarColor(player.id) }"
                >
                  {{ player.name.charAt(0) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  User,
  Setting,
  List,
  Plus,
  Delete,
  Edit,
  Timer
} from '@element-plus/icons-vue'

interface Player {
  id: number
  name: string
}

interface Restriction {
  player1: number
  player2: number
}

interface GroupHistory {
  id: number
  time: string
  groups: Player[][]
  groupNames: string[]
}

// 添加预定义的颜色数组
const avatarColors = [
  '#409EFF', // 蓝色
  '#67C23A', // 绿色
  '#E6A23C', // 黄色
  '#F56C6C', // 红色
  '#909399', // 灰色
  '#9B5DCE', // 紫色
  '#36B4C5', // 青色
  '#FF9F43', // 橙色
  '#4834D4', // 靛蓝
  '#6AB04C', // 草绿
  '#FF6B6B', // 珊瑚红
  '#4834D4', // 深紫
  '#30336B', // 深蓝
  '#F97F51', // 橘红
  '#B33771', // 玫红
  '#8E44AD', // 紫罗兰
  '#2980B9', // 天蓝
  '#27AE60', // 翠绿
  '#D35400', // 深橙
  '#16A085'  // 青绿
]

// 获取头像背景颜色的方法
const getAvatarColor = (id: number) => {
  return avatarColors[id % avatarColors.length]
}

// 初始队员数据
const defaultPlayers = [
  { id: 1, name: '欢' },
  { id: 2, name: '坤' },
  { id: 3, name: '猴' },
  { id: 4, name: '龙' },
  { id: 5, name: '创' },
  { id: 6, name: '鹏' },
  { id: 7, name: '君' },
  { id: 8, name: '兵' },
  { id: 9, name: '伟' }
]

// 从 localStorage 读取数据的函数
const getStorageData = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key)
  return stored ? JSON.parse(stored) : defaultValue
}

// 保存数据到 localStorage 的函数
const saveStorageData = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value))
}

// 修改初始化数据的方式
const players = ref<Player[]>(getStorageData('basketballPlayers', defaultPlayers))
const groupCount = ref(getStorageData('basketballGroupCount', 2))
const groupNames = ref<string[]>(getStorageData('basketballGroupNames', []))
const restrictions = ref<Restriction[]>(getStorageData('basketballRestrictions', []))
const groupResult = ref<Player[][]>(getStorageData('basketballGroupResult', []))
const groupHistories = ref<GroupHistory[]>(getStorageData('basketballHistories', []))
const historyId = ref(getStorageData('basketballHistoryId', 0))

// 监听数据变化并保存
watch(
  [players, groupCount, groupNames, restrictions, groupResult, groupHistories, historyId],
  ([newPlayers, newGroupCount, newGroupNames, newRestrictions, newGroupResult, newHistories, newHistoryId]) => {
    saveStorageData('basketballPlayers', newPlayers)
    saveStorageData('basketballGroupCount', newGroupCount)
    saveStorageData('basketballGroupNames', newGroupNames)
    saveStorageData('basketballRestrictions', newRestrictions)
    saveStorageData('basketballGroupResult', newGroupResult)
    saveStorageData('basketballHistories', newHistories)
    saveStorageData('basketballHistoryId', newHistoryId)
  },
  { deep: true }
)

// 添加折叠面板的激活状态控制
const activeCollapse = ref([''])  // 默认折叠

// 添加自定义指令用于自动聚焦
const vFocus = {
  mounted: (el: HTMLElement) => el.querySelector('input')?.focus()
}

// 编辑状态控制
const editingId = ref<number | null>(null)

// 开始编辑
const startEditing = (id: number) => {
  editingId.value = id
}

// 完成编辑
const finishEditing = () => {
  if (editingId.value !== null) {
    const player = players.value.find(p => p.id === editingId.value)
    if (player) {
      validatePlayerName(player)
    }
    editingId.value = null
  }
}

// 添加新队员
const addPlayer = () => {
  if (players.value.length >= 20) {
    ElMessage.warning('最多添加20名队员')
    return
  }
  const newId = Math.max(...players.value.map(p => p.id), 0) + 1
  players.value.push({ id: newId, name: '' })
}

// 删除队员
const removePlayer = (id: number) => {
  players.value = players.value.filter(p => p.id !== id)
  // 清理相关的限制
  restrictions.value = restrictions.value.filter(
    r => r.player1 !== id && r.player2 !== id
  )
}

// 验证队员姓名
const validatePlayerName = (player: Player) => {
  player.name = player.name.trim()
  if (!player.name) {
    ElMessage.warning('队员姓名不能为空')
  }
}

// 添加分组限制
const addRestriction = () => {
  restrictions.value.push({ player1: 0, player2: 0 })
}

// 删除分组限制
const removeRestriction = (index: number) => {
  restrictions.value.splice(index, 1)
}

// 生成分组
const generateGroups = () => {
  if (players.value.length < groupCount.value) {
    ElMessage.warning('队员数量不能少于分组数')
    return
  }

  // 验证所有队员都有名字
  if (players.value.some(p => !p.name.trim())) {
    ElMessage.warning('请填写所有队员的姓名')
    return
  }

  // 验证分组限制的有效性
  for (const restriction of restrictions.value) {
    if (!restriction.player1 || !restriction.player2) {
      ElMessage.warning('请完善分组限制设置')
      return
    }
    if (restriction.player1 === restriction.player2) {
      ElMessage.warning('分组限制不能选择同一个队员')
      return
    }
  }

  // 复制队员数组并打乱顺序
  const shuffledPlayers = [...players.value]
    .sort(() => Math.random() - 0.5)

  // 尝试生成符合限制条件的分组
  let attempts = 0
  const maxAttempts = 100
  
  while (attempts < maxAttempts) {
    const tempGroups = Array.from({ length: groupCount.value }, () => [] as Player[])
    const playersCopy = [...shuffledPlayers]
    
    // 随机分配队员
    while (playersCopy.length > 0) {
      for (let i = 0; i < groupCount.value && playersCopy.length > 0; i++) {
        const randomIndex = Math.floor(Math.random() * playersCopy.length)
        const player = playersCopy.splice(randomIndex, 1)[0]
        tempGroups[i].push(player)
      }
    }
    
    // 检查是否违反限制条件
    let isValid = true
    for (const restriction of restrictions.value) {
      for (const group of tempGroups) {
        const hasPlayer1 = group.some(p => p.id === restriction.player1)
        const hasPlayer2 = group.some(p => p.id === restriction.player2)
        if (hasPlayer1 && hasPlayer2) {
          isValid = false
          break
        }
      }
      if (!isValid) break
    }
    
    if (isValid) {
      // 创建新的历史记录
      const newHistory: GroupHistory = {
        id: ++historyId.value,
        time: new Date().toLocaleString(),
        groups: JSON.parse(JSON.stringify(tempGroups)), // 深拷贝分组结果
        groupNames: [...groupNames.value] // 保存当前的组名设置
      }
      groupHistories.value.unshift(newHistory) // 将新记录添加到历史记录开头
      groupResult.value = tempGroups
      ElMessage.success('分组成功！')
      return
    }
    
    attempts++
  }
  
  ElMessage.error('无法生成满足限制条件的分组方案，请调整限制条件')
}
</script>

<style scoped>
.basketball-group-tool {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 0px 20px 20px;
}

.tool-card {
  background: var(--bg-secondary);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 20px;
  color: var(--text-primary);
  font-size: 18px;
  
  .el-icon {
    font-size: 20px;
    color: var(--el-color-primary);
  }
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.player-avatar {
  position: relative;
  text-align: center;
}

.avatar-display {
  position: relative;
  cursor: pointer;
  padding: 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.avatar-display:hover {
  background: var(--bg-primary);
}

.avatar-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  margin: 0 auto 8px;
  transition: transform 0.3s ease;
}

.avatar-display:hover .avatar-circle {
  transform: scale(1.05);
}

.hover-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.avatar-display:hover .hover-actions {
  opacity: 1;
  pointer-events: auto;
}

.avatar-edit {
  display: none;
  padding: 8px;
}

.player-avatar.is-editing .avatar-display {
  display: none;
}

.player-avatar.is-editing .avatar-edit {
  display: block;
}

.add-player-btn {
  width: 100%;
  border-style: dashed;
  margin-top: 12px;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.setting-label {
  font-weight: 500;
  color: var(--text-primary);
}

.group-names {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
}

.restrictions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.restriction-item {
  display: flex;
  align-items: center;
  gap: 8px;
  
  .restriction-text {
    color: var(--text-secondary);
    margin: 0 8px;
  }
}

.group-action {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.group-btn {
  padding: 12px 36px;
  font-size: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  .basketball-icon {
    width: 24px;
    height: 24px;
  }
}

.group-results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.group-item {
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.group-header {
  background: var(--el-color-primary);
  color: white;
  padding: 8px 16px;
  font-weight: 500;
  text-align: center;
}

.group-members {
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 16px;
  color: var(--text-primary);
}

.member-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: bold;
}

/* 动画效果 */
.player-list-enter-active,
.player-list-leave-active {
  transition: all 0.3s ease;
}

.player-list-enter-from,
.player-list-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

/* 暗色模式适配 */
:root.dark {
  .tool-card {
    background: var(--bg-secondary);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }
  
  .group-item {
    background: var(--bg-secondary);
    border-color: var(--border-color);
  }
  
  .member-item {
    background: var(--bg-primary);
  }
}

/* 添加折叠面板相关样式 */
:deep(.el-collapse) {
  --el-collapse-border-color: transparent;
  background: var(--bg-secondary);
  border-radius: 12px;
}

:deep(.el-collapse-item__header) {
  background: transparent;
  padding: 20px;
}

:deep(.el-collapse-item__content) {
  padding: 0 20px 20px;
}

.settings-title {
  margin: 0;
}

.history-card {
  margin-top: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.history-item {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--bg-primary);
  border-bottom: 1px solid var(--border-color);
}

.history-time {
  color: var(--text-secondary);
  font-size: 14px;
}

.history-preview {
  padding: 16px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.preview-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-header {
  font-size: 14px;
  color: var(--text-secondary);
}

.preview-members {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.preview-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 12px;
  font-weight: bold;
}
</style> 