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
              <div class="avatar-info">
                <div class="avatar-circle" :style="{ 
                  backgroundImage: getPlayerAvatar(player.id) ? `url(${getPlayerAvatar(player.id)})` : 'none',
                  backgroundColor: !getPlayerAvatar(player.id) ? getAvatarColor(player.id) : undefined
                }">
                  <template v-if="!getPlayerAvatar(player.id)">{{ player.name.charAt(0) }}</template>
                </div>
                <span class="avatar-name">{{ player.name }}</span>
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
        
        <div class="button-group">
          <el-button 
            class="action-btn" 
            @click="addPlayer"
            :disabled="players.length >= 20"
          >
            <el-icon><Plus /></el-icon>
            添加队员
          </el-button>
          
          <el-upload
            class="import-upload"
            accept=".txt"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
          >
            <el-button class="action-btn">
              <el-icon><Upload /></el-icon>
              导入名单
            </el-button>
          </el-upload>

          <el-switch
            v-model="useRandomAvatar"
            active-text="随机头像"
            inactive-text="默认头像"
            @change="handleAvatarTypeChange"
          />
        </div>
      </div>
    </div>

    <!-- 分组设置折叠面板 -->
    <el-collapse v-model="activeCollapse">
      <el-collapse-item name="settings">
        <template #title>
          <h3 class="card-title settings-title">
            <div class="title-left">
              <el-icon><Setting /></el-icon>
              分组设置
            </div>
            <el-button 
              class="toggle-btn" 
              text
            >
              {{ activeCollapse.includes('settings') ? '收起' : '展开' }}
              <el-icon class="toggle-icon" :class="{ 'is-active': activeCollapse.includes('settings') }">
                <ArrowDown />
              </el-icon>
            </el-button>
          </h3>
        </template>
        
        <div class="settings-content">
          <!-- 基础设置区域 -->
          <div class="settings-section">
            <div class="section-content">
              <!-- 分组数量和组名设置放在一行 -->
              <div class="settings-row">
                <div class="count-setting">
                  <span class="setting-label">分组数量</span>
                  <el-input-number 
                    v-model="groupCount" 
                    :min="2" 
                    :max="5"
                    size="default"
                    controls-position="right"
                  />
                </div>
                
                <div class="group-names">
                  <div 
                    v-for="i in groupCount" 
                    :key="i" 
                    class="group-name-item"
                  >
                    <el-input 
                      v-model="groupNames[i-1]" 
                      :prefix="String(i)"
                      :placeholder="`${i}组`"
                      size="default"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分组限制区域 -->
          <div class="settings-section">
            <div class="section-header">
              <h4 class="section-title">分组限制</h4>
              <el-button 
                class="add-restriction-btn" 
                @click="addRestriction"
                type="primary"
                plain
                size="small"
              >
                <el-icon><Plus /></el-icon>
                添加限制
              </el-button>
            </div>
            <div class="section-content">
              <div class="restrictions-list">
                <div 
                  v-for="(restriction, index) in restrictions" 
                  :key="index"
                  class="restriction-item"
                >
                  <el-select 
                    v-model="restriction.player1" 
                    placeholder="选择队员"
                    size="default"
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
                    size="default"
                  >
                    <el-option
                      v-for="player in players"
                      :key="player.id"
                      :label="player.name"
                      :value="player.id"
                    />
                  </el-select>
                  <span class="restriction-text">一组</span>
                  <el-button
                    type="danger"
                    circle
                    size="small"
                    @click="removeRestriction(index)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>
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
      <h3 class="card-title result-header">
        <div class="title-left">
          <el-icon><List /></el-icon>
          分组结果
        </div>
        <div class="result-time">
          {{ formatDateTime(new Date()) }}
        </div>
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
              <div class="member-info">
                <div 
                  class="member-avatar"
                  :style="{ 
                    backgroundImage: getPlayerAvatar(player.id) ? `url(${getPlayerAvatar(player.id)})` : 'none',
                    backgroundColor: !getPlayerAvatar(player.id) ? getAvatarColor(player.id) : 'transparent'
                  }"
                >
                  <template v-if="!getPlayerAvatar(player.id)">{{ player.name.charAt(0) }}</template>
                </div>
                <span class="member-name">{{ player.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 历史记录折叠面板 -->
    <el-collapse v-model="activeCollapse" v-if="groupHistories.length > 0">
      <el-collapse-item name="history">
        <template #title>
          <h3 class="card-title settings-title">
            <div class="title-left">
              <el-icon><Timer /></el-icon>
              历史记录
            </div>
            <el-button 
              class="toggle-btn" 
              text
            >
              {{ activeCollapse.includes('history') ? '收起' : '展开' }}
              <el-icon class="toggle-icon" :class="{ 'is-active': activeCollapse.includes('history') }">
                <ArrowDown />
              </el-icon>
            </el-button>
          </h3>
        </template>

        <!-- 历史记录内容 -->
        <div class="history-list">
          <div 
            v-for="history in groupHistories" 
            :key="history.id"
            class="history-item"
          >
            <div class="history-header">
              <span class="history-time">{{ history.time }}</span>
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
                    class="preview-item"
                  >
                    <div 
                      class="preview-avatar"
                      :style="{ 
                        backgroundImage: getPlayerAvatar(player.id) ? `url(${getPlayerAvatar(player.id)})` : 'none',
                        background: !getPlayerAvatar(player.id) ? getAvatarColor(player.id) : 'none'
                      }"
                    >
                      <template v-if="!getPlayerAvatar(player.id)">{{ player.name.charAt(0) }}</template>
                    </div>
                    <span class="preview-name">{{ player.name }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 清空按钮 -->
        <div class="history-actions">
          <el-button 
            class="clear-btn" 
            type="danger" 
            @click="clearHistory"
          >
            <el-icon><Delete /></el-icon>
            清空记录
          </el-button>
        </div>
      </el-collapse-item>
    </el-collapse>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User,
  Setting,
  List,
  Plus,
  Delete,
  Edit,
  Timer,
  Upload,
  ArrowDown
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
// 头像类型状态
const useRandomAvatar = ref<boolean>(getStorageData('basketballUseRandomAvatar', false))

// 玩家头像种子
const playerAvatarSeeds = ref<Record<number, string>>(getStorageData('basketballPlayerAvatarSeeds', {}))

// 生成随机头像种子
const generateAvatarSeed = () => {
  return Math.random().toString(36).substring(2, 15)
}

// 获取玩家头像
const getPlayerAvatar = (playerId: number) => {
  if (!useRandomAvatar.value) {
    return null
  }
  
  if (!playerAvatarSeeds.value[playerId]) {
    playerAvatarSeeds.value[playerId] = generateAvatarSeed()
  }
  
  return `https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=${playerAvatarSeeds.value[playerId]}`
}

// 处理头像类型切换
const handleAvatarTypeChange = () => {
  saveStorageData('basketballUseRandomAvatar', useRandomAvatar.value)
}

const players = ref<Player[]>(getStorageData('basketballPlayers', defaultPlayers))
const groupCount = ref(getStorageData('basketballGroupCount', 2))
const groupNames = ref<string[]>(getStorageData('basketballGroupNames', []))
const restrictions = ref<Restriction[]>(getStorageData('basketballRestrictions', []))
const groupResult = ref<Player[][]>(getStorageData('basketballGroupResult', []))
const groupHistories = ref<GroupHistory[]>(getStorageData('basketballHistories', []))
const historyId = ref(getStorageData('basketballHistoryId', 0))

// 监听数据变化并保存
watch(
  [players, groupCount, groupNames, restrictions, groupResult, groupHistories, historyId, playerAvatarSeeds],
  ([newPlayers, newGroupCount, newGroupNames, newRestrictions, newGroupResult, newHistories, newHistoryId, newPlayerAvatarSeeds]) => {
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

// 修改折叠面板的激活状态控制
const activeCollapse = ref(['']) // 默认都折叠

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

// 添加文件处理函数
const handleFileChange = (file: File) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const content = e.target?.result as string
    const names = content.split('\n')
      .map(name => name.trim())
      .filter(name => name) // 过滤空行

    if (players.value.length + names.length > 20) {
      ElMessage.warning('导入后队员总数不能超过20人')
      return
    }

    // 获取当前最大ID
    const maxId = Math.max(...players.value.map(p => p.id), 0)
    
    // 添加新队员
    const newPlayers = names.map((name, index) => ({
      id: maxId + index + 1,
      name
    }))

    players.value.push(...newPlayers)
    ElMessage.success(`成功导入 ${newPlayers.length} 名队员`)
  }

  reader.onerror = () => {
    ElMessage.error('文件读取失败')
  }

  reader.readAsText(file.raw as Blob)
}

// 添加日期时间格式化函数
const formatDateTime = (date: Date) => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  const weekday = weekdays[date.getDay()]
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${weekday} ${hours}:${minutes}`
}

// 清空历史记录
const clearHistory = () => {
  ElMessageBox.confirm(
    '确定要清空所有历史记录吗？',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      groupHistories.value = []
      historyId.value = 0
      ElMessage.success('历史记录已清空')
    })
    .catch(() => {})
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
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
  justify-items: center;
}

.player-avatar {
  position: relative;
  text-align: center;
  width: 100%;
  display: flex;
  justify-content: center;
}

.avatar-display {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  max-width: 120px;
}

.avatar-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avatar-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}

.avatar-name {
  font-size: 14px;
  color: var(--text-primary);
  text-align: center;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hover-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) translateY(10px);
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: all 0.3s ease;
  background: rgba(0, 0, 0, 0.6);
  padding: 8px;
  border-radius: 8px;
  z-index: 1;
}

.avatar-display:hover {
  background: var(--bg-hover);
  
  .avatar-circle {
    transform: scale(1.05);
    filter: brightness(0.8);
  }
  
  .hover-actions {
    opacity: 1;
    transform: translate(-50%, -50%) translateY(0);
  }
}

/* 调整按钮样式 */
.hover-actions .el-button {
  --el-button-size: 32px;
  padding: 6px;
  
  .el-icon {
    font-size: 16px;
  }
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

.button-group {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

.action-btn {
  width: 160px;
  border-style: dashed;
}

/* 隐藏上传组件的默认样式 */
.import-upload {
  :deep(.el-upload) {
    display: block;
    width: 160px;
  }
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0;
}

.settings-section {
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
}

.section-title {
  margin: 0;
  font-size: 14px;
  color: var(--text-secondary);
}

.section-content {
  padding: 16px;
}

.settings-row {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}

.count-setting {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 200px;
}

.setting-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.group-names {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.group-name-item {
  width: 120px;
}

.restrictions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.restriction-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--bg-secondary);
  border-radius: 6px;
}

.restriction-text {
  padding: 0 8px;
  color: var(--text-secondary);
  font-size: 14px;
}

:deep(.el-select) {
  flex: 1;
}

/* 暗黑模式适配 */
:root.dark {
  .tool-card {
    background: var(--bg-secondary);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }

  .avatar-display:hover {
    background: var(--bg-secondary);
  }

  .avatar-name {
    color: var(--text-primary);
  }

  .settings-section {
    background: var(--bg-secondary);
    border-color: var(--border-color);
  }

  .section-header {
    background: var(--bg-primary);
    border-color: var(--border-color);
  }

  .section-title {
    color: var(--text-primary);
  }

  .setting-label {
    color: var(--text-secondary);
  }

  .restriction-item {
    background: var(--bg-primary);
  }

  .restriction-text {
    color: var(--text-secondary);
  }

  /* 折叠面板暗黑模式 */
  :deep(.el-collapse) {
    background: var(--bg-secondary);
    border-color: transparent;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }

  :deep(.el-collapse-item__header) {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  :deep(.el-collapse-item__content) {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  /* 输入框暗黑模式 */
  :deep(.el-input__wrapper) {
    background: var(--bg-primary);
    box-shadow: 0 0 0 1px var(--border-color) inset !important;

    &.is-focus {
      box-shadow: 0 0 0 1px var(--el-color-primary) inset !important;
    }
  }

  :deep(.el-input__inner) {
    color: var(--text-primary);
    background: var(--bg-primary);
  }

  /* 数字输入框暗黑模式 */
  :deep(.el-input-number) {
    .el-input__wrapper {
      background: var(--bg-primary);
    }
    .el-input-number__decrease,
    .el-input-number__increase {
      background: var(--bg-primary);
      border-color: var(--border-color);
      color: var(--text-primary);

      &:hover {
        color: var(--el-color-primary);
      }
    }
  }

  /* 按钮暗黑模式 */
  .add-restriction-btn {
    background: var(--bg-primary);
    border-color: var(--border-color);
    color: var(--text-primary);

    &:hover {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    .el-icon {
      color: var(--text-primary);
    }

    &:hover .el-icon {
      color: var(--el-color-primary);
    }
  }

  /* 分组设置暗黑模式 */
  .settings-content {
    background: var(--bg-secondary);
  }

  .settings-section {
    background: var(--bg-secondary);
    border-color: var(--border-color);
  }

  .section-content {
    background: var(--bg-secondary);
  }

  /* 折叠面板暗黑模式 */
  :deep(.el-collapse) {
    background: var(--bg-secondary);
    border-color: transparent;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  }

  :deep(.el-collapse-item__header) {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  :deep(.el-collapse-item__content) {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  :deep(.el-collapse-item__wrap) {
    background: var(--bg-secondary);
  }

  .action-btn {
    background: var(--bg-primary);
    border-color: var(--border-color);
    color: var(--text-primary);

    &:hover {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    &:disabled {
      background: var(--bg-primary);
      border-color: var(--border-color);
      color: var(--text-secondary);
      cursor: not-allowed;

      .el-icon {
        color: var(--text-secondary);
      }
    }
  }

  .toggle-btn {
    color: var(--text-secondary);

    &:hover {
      color: var(--el-color-primary);
    }
  }

  .clear-btn {
    color: var(--el-color-danger);

    &:hover {
      color: var(--el-color-danger-light-3);
    }
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
  display: flex;
  flex-direction: column;
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
  gap: 16px;
  justify-content: center;
}

.member-item {
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: 16px;
  color: var(--text-primary);
}

.member-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  width: 60px;
}

.member-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  font-weight: bold;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
  font-weight: bold;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}

.member-name {
  font-size: 12px;
  color: var(--text-primary);
  text-align: center;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.history-card {
  margin-top: 20px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px; /* 添加底部间距 */
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
  margin: 0 0 20px;
}

.history-time {
  color: var(--text-secondary);
  font-size: 14px;
}

.preview-group-members {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.preview-member {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--bg-secondary);
  border-radius: 4px;
  font-size: 14px;
}

.preview-member .preview-avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
  background-size: cover !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}

.preview-name {
  font-size: 12px;
  color: var(--text-primary);
  text-align: center;
  max-width: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.result-time {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: normal;
}

/* 修改折叠面板相关样式 */
:deep(.el-collapse) {
  --el-collapse-border-color: transparent;
  background: var(--bg-secondary);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

:deep(.el-collapse-item__header) {
  background: transparent;
  padding: 20px 20px 0;
  border-bottom: none;
}

:deep(.el-collapse-item__content) {
  padding: 20px;
}

:deep(.el-collapse-item__arrow) {
  display: none;
}

.toggle-btn {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  outline: inherit;
}

.toggle-icon {
  transition: transform 0.3s ease;
  color: var(--text-secondary);
}

.toggle-icon.is-active {
  transform: rotate(180deg);
}

/* 添加新的样式 */
.settings-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin: 0;
}

.title-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  height: 28px;
  padding: 0 8px;
}

.toggle-icon {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.toggle-icon.is-active {
  transform: rotate(180deg);
}

/* 移除 Element Plus 默认的折叠图标 */
:deep(.el-collapse-item__arrow) {
  display: none;
}

/* 修改历史记录相关样式 */
.history-actions {
  display: flex;
  justify-content: flex-end; /* 右对齐 */
  padding: 0 16px 16px; /* 添加内边距 */
}

.history-preview .preview-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.clear-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 6px;
  transition: all 0.3s ease;
}

/* 确保折叠面板样式一致 */
:deep(.el-collapse-item__content) {
  padding: 20px;
}

/* 暗黑模式下的清空按钮样式 */
:root.dark .clear-btn {
  background: rgba(var(--el-color-danger-rgb), 0.1);
  border-color: rgba(var(--el-color-danger-rgb), 0.2);

  &:hover {
    background: rgba(var(--el-color-danger-rgb), 0.2);
    border-color: rgba(var(--el-color-danger-rgb), 0.3);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

/* 调整折叠面板的间距 */
.el-collapse {
  margin-bottom: 60px; /* 添加底部间距，避免被最小化栏遮挡 */
}

/* 调整历史记录折叠面板的样式 */
.el-collapse + .el-collapse {
  margin-top: 20px; /* 当有多个折叠面板时，添加间距 */
}

/* 移除之前的底部间距样式 */
.el-collapse {
  margin-bottom: 0; /* 移除之前添加的底部间距 */
}

/* 为最后一个折叠面板添加底部间距 */
.basketball-group-tool > .el-collapse:last-child {
  margin-bottom: 60px; /* 避免被最小化栏遮挡 */
}
</style>