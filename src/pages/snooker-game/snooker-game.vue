<template>
  <view class="container">
    <view v-if="isLoading" class="skeleton-container">
      <view class="skeleton-title"></view>
      <view class="skeleton-row"></view>
      <view class="skeleton-row"></view>
    </view>

    <view v-else class="content-wrapper fade-in">
      <!-- 玩家1分数区 -->
      <view class="player-score-section" :class="{ active: atTable === 'A' }">
        <view class="player-info">
          <text class="player-name">{{ playerA }}</text>
          <text class="total-score">{{ scores.A }}</text>
        </view>
        <view class="score-details">
          <text class="current-break">本杆：{{ atTable === 'A' ? currentBreak : 0 }}</text>
          <text class="highest-break">单杆最高：{{ highestBreaks.A }}</text>
        </view>
      </view>

      <!-- 玩家2分数区 -->
      <view class="player-score-section" :class="{ active: atTable === 'B' }">
        <view class="player-info">
          <text class="player-name">{{ playerB }}</text>
          <text class="total-score">{{ scores.B }}</text>
        </view>
        <view class="score-details">
          <text class="current-break">本杆：{{ atTable === 'B' ? currentBreak : 0 }}</text>
          <text class="highest-break">单杆最高：{{ highestBreaks.B }}</text>
        </view>
      </view>

      <!-- 球台状态区 -->
      <view class="balls-section">
        <!-- 红球 -->
        <button class="ball red" :disabled="redsRemaining === 0 || phase === 'colors'" @tap="onPotRed">
          <text class="ball-text">红球</text>
          <text class="ball-count">剩余{{ redsRemaining }}</text>
        </button>

        <!-- 彩球组 -->
        <view class="color-balls">
          <button class="ball yellow" :disabled="!canPotColor(2)" @tap="potColor(2)">
            <text class="ball-text">黄</text>
            <text class="ball-value">2</text>
          </button>
          <button class="ball green" :disabled="!canPotColor(3)" @tap="potColor(3)">
            <text class="ball-text">绿</text>
            <text class="ball-value">3</text>
          </button>
          <button class="ball brown" :disabled="!canPotColor(4)" @tap="potColor(4)">
            <text class="ball-text">棕</text>
            <text class="ball-value">4</text>
          </button>
          <button class="ball blue" :disabled="!canPotColor(5)" @tap="potColor(5)">
            <text class="ball-text">蓝</text>
            <text class="ball-value">5</text>
          </button>
          <button class="ball pink" :disabled="!canPotColor(6)" @tap="potColor(6)">
            <text class="ball-text">粉</text>
            <text class="ball-value">6</text>
          </button>
          <button class="ball black" :disabled="!canPotColor(7)" @tap="potColor(7)">
            <text class="ball-text">黑</text>
            <text class="ball-value">7</text>
          </button>
        </view>
      </view>

      <!-- 剩余分数显示 -->
      <view class="remaining-points">
        <text>剩余分数：{{ remainingPoints }}</text>
      </view>

      <!-- 操作按钮区 -->
      <view class="action-buttons">
        <!-- 犯规和不进按钮 -->
        <view class="main-actions">
          <button class="action-btn foul-btn" @tap="openFoulDialog">
            <text>犯规</text>
          </button>
          <button class="action-btn miss-btn" @tap="missShot">
            <text>不进</text>
          </button>
          <button class="action-btn free-ball-btn" @tap="openFreeBallDialog">
            <text>自由球</text>
          </button>
        </view>

        <!-- 撤销和新局按钮 -->
        <view class="secondary-actions">
          <button class="action-btn undo-btn" @tap="undo">
            <text>撤销</text>
          </button>
          <button class="action-btn new-frame-btn" @tap="endFrame">
            <text>新的一局</text>
          </button>
        </view>
      </view>

      <!-- 历史记录 -->
      <view class="history-section">
        <view class="history-header" @tap="toggleHistory">
          <text>历史记录 {{ showHistory ? '▼' : '▲' }}</text>
        </view>
        <view v-if="showHistory" class="history-list">
          <view v-for="(event, idx) in events" :key="idx" class="history-item">
            <text class="history-text">{{ event.text }}</text>
            <text class="history-time">{{ formatTime(event.ts) }}</text>
          </view>
        </view>
      </view>

      <!-- 犯规对话框 -->
      <view v-if="showFoulDialog" class="overlay" @tap="closeOverlays">
        <view class="panel" @tap.stop>
          <text class="panel-title">犯规</text>
          <view class="form-row">
            <text class="label">分值</text>
            <view class="seg">
              <button v-for="p in [4,5,6,7]" :key="p" 
                      :class="['seg-btn',{active:foulPoints===p}]" 
                      @tap="foulPoints=p">{{p}}</button>
            </view>
          </view>
          <view class="form-row">
            <text class="label">犯规方</text>
            <view class="seg">
              <button :class="['seg-btn',{active:foulBy==='A'}]" @tap="foulBy='A'">{{playerA}}</button>
              <button :class="['seg-btn',{active:foulBy==='B'}]" @tap="foulBy='B'">{{playerB}}</button>
            </view>
          </view>
          <view class="form-row switch-row">
            <text class="label">Miss</text>
            <switch :checked="foulMiss" @change="e=>foulMiss=e.detail.value" />
          </view>
          <view class="dialog-actions">
            <button class="panel-cancel" @tap="closeOverlays">取消</button>
            <button class="panel-ok" @tap="confirmFoul">确定</button>
          </view>
        </view>
      </view>

      <!-- 自由球对话框 -->
      <view v-if="showFreeBallDialog" class="overlay" @tap="closeOverlays">
        <view class="panel" @tap.stop>
          <text class="panel-title">自由球</text>
          <view class="form-row">
            <text class="label">得分</text>
            <input class="score-input" type="number" v-model.number="freeBallScore" placeholder="输入得分" />
          </view>
          <view class="dialog-actions">
            <button class="panel-cancel" @tap="closeOverlays">取消</button>
            <button class="panel-ok" @tap="confirmFreeBall">确定</button>
          </view>
        </view>
      </view>

      <!-- 犯规提示条 -->
      <view v-if="showFoulBanner" class="foul-banner">
        <text>犯规 +{{ lastFoulPoints }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import performanceMonitor from '@/utils/performance.js'

export default {
  data() {
    return {
      isLoading: true,
      playerA: '',
      playerB: '',
      redsRemaining: 15,
      colorsOnTable: { Y:true, G:true, B:true, Br:true, Pk:true, Bk:true },
      scores: { A:0, B:0 },
      highestBreaks: { A:0, B:0 }, // 单杆最高分
      atTable: 'A',
      currentBreak: 0,
      phase: 'reds', // 'reds' 或 'colors'
      showFoulDialog: false,
      foulPoints: 4,
      foulBy: 'A',
      foulMiss: false,
      showFreeBallDialog: false,
      freeBallScore: 1,
      events: [],
      remainingPoints: 0,
      undoStack: [],
      redoStack: [],
      matchFrames: { A:0, B:0 },
      initialReds: 15,
      showHistory: true,
      showFoulBanner: false,
      lastFoulPoints: 0,
      scoreFlash: false,
      // 新增：标记上一击是否为红球，用于红球阶段的彩球判定
      lastPotRed: false,
      // 新增：从设置页读取的配置项
      missHint: true,
      freeBallGuide: true
    }
  },
  
  onShow() {
    setTimeout(() => { this.isLoading = false }, 100)
    const setup = uni.getStorageSync('snooker:setup') || {}
    this.playerA = setup.playerA || '玩家1'
    this.playerB = setup.playerB || '玩家2'
    const setupReds = setup.reds || 15
    this.redsRemaining = setupReds
    this.initialReds = setupReds
    // 读取设置页的开关配置
    this.missHint = setup.missHint !== undefined ? setup.missHint : true
    this.freeBallGuide = setup.freeBallGuide !== undefined ? setup.freeBallGuide : true
    
    // 加载比赛小分
    const frames = uni.getStorageSync('snooker:match')
    if (frames && typeof frames.A === 'number' && typeof frames.B === 'number') {
      this.matchFrames = frames
    }
    
    // 读取上次对局状态
    const saved = uni.getStorageSync('snooker:state')
    if (saved && saved.playerA && saved.playerB && saved.initialReds === setupReds) {
      // 只有当保存的红球数与设置页一致时才恢复对局状态
      Object.assign(this, saved)
    } else if (saved && saved.initialReds !== setupReds) {
      // 红球数设置已改变，清除旧的对局状态
      uni.removeStorageSync('snooker:state')
    }
    
    this.recalc()
  },
  
  methods: {
    // 保存对局状态
    saveState() {
      const snapshot = {
        playerA: this.playerA,
        playerB: this.playerB,
        redsRemaining: this.redsRemaining,
        colorsOnTable: this.colorsOnTable,
        scores: this.scores,
        highestBreaks: this.highestBreaks,
        atTable: this.atTable,
        currentBreak: this.currentBreak,
        phase: this.phase,
        events: this.events,
        remainingPoints: this.remainingPoints,
        matchFrames: this.matchFrames,
        initialReds: this.initialReds,
        // 持久化 lastPotRed 以保证重载后行为一致
        lastPotRed: this.lastPotRed,
        // 持久化设置项，确保重载后配置一致
        missHint: this.missHint,
        freeBallGuide: this.freeBallGuide
      }
      try { 
        uni.setStorageSync('snooker:state', JSON.parse(JSON.stringify(snapshot))) 
      } catch(e) {}
    },

    // 推入撤销栈
    pushUndo() {
      const state = JSON.parse(JSON.stringify({
        redsRemaining: this.redsRemaining,
        colorsOnTable: this.colorsOnTable,
        scores: this.scores,
        highestBreaks: this.highestBreaks,
        atTable: this.atTable,
        currentBreak: this.currentBreak,
        phase: this.phase,
        events: this.events,
        // 纳入 lastPotRed 保证撤销后判定正确
        lastPotRed: this.lastPotRed
      }))
      this.undoStack.push(state)
      if (this.undoStack.length > 50) this.undoStack.shift()
      this.redoStack.length = 0
    },

    // 新增：打开犯规对话框
    openFoulDialog() {
      this.foulBy = this.atTable
      this.foulPoints = 4
      this.foulMiss = false
      this.showFoulDialog = true
    },

    // 新增：是否还有彩球在台面（清彩阶段用）
    hasColorsRemaining() {
      return Object.values(this.colorsOnTable).some(Boolean)
    },

    // 新增：撤销最近一步
    undo() {
      if (!this.undoStack.length) {
        return uni.showToast({ title: '没有可撤销的操作', icon: 'none' })
      }
      // 将当前快照放入重做栈（预留）
      const cur = JSON.parse(JSON.stringify({
        redsRemaining: this.redsRemaining,
        colorsOnTable: this.colorsOnTable,
        scores: this.scores,
        highestBreaks: this.highestBreaks,
        atTable: this.atTable,
        currentBreak: this.currentBreak,
        phase: this.phase,
        events: this.events,
        lastPotRed: this.lastPotRed
      }))
      this.redoStack.push(cur)

      const prev = this.undoStack.pop()
      this.redsRemaining = prev.redsRemaining
      this.colorsOnTable = prev.colorsOnTable
      this.scores = prev.scores
      this.highestBreaks = prev.highestBreaks
      this.atTable = prev.atTable
      this.currentBreak = prev.currentBreak
      this.phase = prev.phase
      this.events = prev.events
      this.lastPotRed = prev.lastPotRed === true
      this.recalc()
      uni.showToast({ title: '已撤销', icon: 'none' })
    },
    // 重新计算剩余分数等信息
    recalc() {
      if (this.redsRemaining <= 0) this.phase = 'colors'
      
      const colorSum = (this.colorsOnTable.Y ? 2 : 0) + 
                      (this.colorsOnTable.G ? 3 : 0) + 
                      (this.colorsOnTable.Br ? 4 : 0) + 
                      (this.colorsOnTable.B ? 5 : 0) + 
                      (this.colorsOnTable.Pk ? 6 : 0) + 
                      (this.colorsOnTable.Bk ? 7 : 0)
      
      this.remainingPoints = this.redsRemaining * 8 + colorSum
      this.saveState()
    },

    // 判断能否打某颜色球
    canPotColor(value) {
      if (this.phase === 'reds') {
        // 规则：红球阶段仅当上一杆打进红球后，才允许打任意彩球（随后彩球复位）
        return this.lastPotRed === true
      } else {
        // 清彩阶段，必须按顺序：黄2、绿3、棕4、蓝5、粉6、黑7
        const order = [2, 3, 4, 5, 6, 7]
        const colorMap = { 2:'Y', 3:'G', 4:'Br', 5:'B', 6:'Pk', 7:'Bk' }
        for (const val of order) {
          if (this.colorsOnTable[colorMap[val]]) {
            return val === value
          }
        }
      }
      return false
    },

    // 进红球
    onPotRed() {
      if (this.redsRemaining <= 0) {
        return uni.showToast({title:'无红球可打',icon:'none'})
      }
      
      this.pushUndo()
      performanceMonitor.startTimer('进红球')
      
      this.scores[this.atTable] += 1
      this.currentBreak += 1
      this.redsRemaining -= 1
      // 记录上一击为红球
      this.lastPotRed = true
      
      // 更新单杆最高
      if (this.currentBreak > this.highestBreaks[this.atTable]) {
        this.highestBreaks[this.atTable] = this.currentBreak
      }
      
      this.events.unshift({ 
        text: `${this.atTable==='A'?this.playerA:this.playerB} 进红球 +1`, 
        ts: Date.now() 
      })
      
      this.triggerScoreFlash()
      this.recalc()
      performanceMonitor.endTimer('进红球','interaction')
    },

    // 进彩球
    potColor(value) {
      if (!this.canPotColor(value)) {
        const msg = this.phase === 'colors' ? '需按清彩顺序' : '请先进红球'
        
        // Miss 提示功能：当用户尝试打错球时给出提示
        if (this.missHint && this.phase === 'colors') {
          const nextBall = this.getNextColorBall()
          if (nextBall) {
            const colorNames = { 2:'黄球', 3:'绿球', 4:'棕球', 5:'蓝球', 6:'粉球', 7:'黑球' }
            msg = `清彩阶段需按顺序，下一个应打 ${colorNames[nextBall.value]}（${nextBall.value}分）`
          }
        }
        
        return uni.showToast({ title: msg, icon: 'none' })
      }
    
      this.pushUndo()
      performanceMonitor.startTimer('进彩球')
      
      this.scores[this.atTable] += value
      this.currentBreak += value
      
      // 红球阶段击打彩球后，应重置 lastPotRed（下一杆应回到红球）
      if (this.phase === 'reds') {
        this.lastPotRed = false
      }
      
      // 更新单杆最高
      if (this.currentBreak > this.highestBreaks[this.atTable]) {
        this.highestBreaks[this.atTable] = this.currentBreak
      }
      
      // 清彩阶段移除彩球（按顺序不复位）
      if (this.phase === 'colors') {
        const colorMap = { 2:'Y', 3:'G', 4:'Br', 5:'B', 6:'Pk', 7:'Bk' }
        const key = colorMap[value]
        if (key) this.colorsOnTable[key] = false
      }
      
      const colorNames = { 2:'黄球', 3:'绿球', 4:'棕球', 5:'蓝球', 6:'粉球', 7:'黑球' }
      this.events.unshift({ 
        text: `${this.atTable==='A'?this.playerA:this.playerB} 进${colorNames[value]} +${value}`, 
        ts: Date.now() 
      })
      
      this.triggerScoreFlash()
      this.recalc()
      performanceMonitor.endTimer('进彩球','interaction')
      
      // 检查是否结束
      if (this.phase === 'colors' && !this.hasColorsRemaining()) {
        this.endFrame(true)
      }
    },

    // 新增：获取清彩阶段下一个应打的彩球
    getNextColorBall() {
      if (this.phase !== 'colors') return null
      
      const order = [2, 3, 4, 5, 6, 7]
      const colorMap = { 2:'Y', 3:'G', 4:'Br', 5:'B', 6:'Pk', 7:'Bk' }
      
      for (const val of order) {
        if (this.colorsOnTable[colorMap[val]]) {
          return { value: val, key: colorMap[val] }
        }
      }
      return null
    },

    // 新增：Free Ball 指引功能
    showFreeBallGuide() {
      if (!this.freeBallGuide) return
      
      // 简化的 Free Ball 判定：当前选手犯规且台面上有多个球可选时
      const availableBalls = []
      
      if (this.phase === 'reds' && this.redsRemaining > 0) {
        availableBalls.push('红球')
      }
      
      if (this.phase === 'colors') {
        const nextBall = this.getNextColorBall()
        if (nextBall) {
          const colorNames = { 2:'黄球', 3:'绿球', 4:'棕球', 5:'蓝球', 6:'粉球', 7:'黑球' }
          availableBalls.push(colorNames[nextBall.value])
        }
      }
      
      // 在特定犯规情况下，所有彩球都可作为 Free Ball
      const allColors = Object.keys(this.colorsOnTable).filter(key => this.colorsOnTable[key])
      if (allColors.length > 1) {
        const colorNames = { Y:'黄球', G:'绿球', Br:'棕球', B:'蓝球', Pk:'粉球', Bk:'黑球' }
        const colorOptions = allColors.map(key => colorNames[key]).join('、')
        
        uni.showModal({
          title: 'Free Ball 指引',
          content: `当前可选择任意彩球作为 Free Ball：${colorOptions}`,
          showCancel: false,
          confirmText: '知道了'
        })
      }
    },
    // 不进（换人）
    missShot() {
      this.pushUndo()
      this.switchTurn()
      // 未进球则重置 lastPotRed
      this.lastPotRed = false
      this.events.unshift({ 
        text: `${this.atTable==='A'?this.playerB:this.playerA} 不进，换人击打`, 
        ts: Date.now() 
      })
      // 保存最新状态，支持离开后继续对局
      this.recalc()
      },
      
      // 新增：结束本局并开始新的一局
      // 仅当显式传入 true 时跳过确认；处理按钮绑定传入的事件对象
      endFrame(arg) {
        const skipConfirm = arg === true
        const scoreA = this.scores.A
        const scoreB = this.scores.B
        let winner = null
        if (scoreA > scoreB) winner = 'A'
        if (scoreB > scoreA) winner = 'B'
    
        const applyAndNext = (startSide) => {
          if (winner) {
            this.matchFrames[winner] += 1
            try { uni.setStorageSync('snooker:match', this.matchFrames) } catch(e) {}
            this.events.unshift({
              text: `${winner==='A'?this.playerA:this.playerB} 赢下本局（${scoreA} - ${scoreB}）`,
              ts: Date.now()
            })
          } else {
            this.events.unshift({
              text: `平局（${scoreA} - ${scoreB}），开始新局`,
              ts: Date.now()
            })
          }
          this.resetForNextFrame(startSide || winner || 'A')
        }
    
        if (skipConfirm) {
          return applyAndNext(winner || 'A')
        }
    
        if (!winner) {
          // 平局：让用户选择下一局开球者
          uni.showActionSheet({
            title: '平局，请选择下一局开球方',
            itemList: [`${this.playerA} 开球`, `${this.playerB} 开球`],
            success: (res) => {
              const idx = res.tapIndex
              const side = idx === 0 ? 'A' : 'B'
              applyAndNext(side)
            },
            fail: () => applyAndNext('A')
          })
          return
        }
    
        uni.showModal({
          title: '结束本局',
          content: `${winner==='A'?this.playerA:this.playerB} 以 ${Math.max(scoreA,scoreB)} - ${Math.min(scoreA,scoreB)} 领先，开始新的一局？`,
          confirmText: '开始新局',
          cancelText: '取消',
          success: (res) => {
            if (res.confirm) applyAndNext(winner)
          }
        })
      },
    // 换人击打
    switchTurn() {
      this.atTable = this.atTable === 'A' ? 'B' : 'A'
      this.currentBreak = 0
      // 换人后应重置
      this.lastPotRed = false
    },

    // 确认犯规
    confirmFoul() {
      this.pushUndo()
      performanceMonitor.startTimer('犯规')
      
      const offender = this.foulBy
      const receiver = offender === 'A' ? 'B' : 'A'
      const pts = this.foulPoints
      
      this.scores[receiver] += pts
      this.lastFoulPoints = pts
      // 犯规后重置 lastPotRed
      this.lastPotRed = false
      
      // 显示犯规提示
      this.showFoulBanner = true
      setTimeout(() => this.showFoulBanner = false, 1500)
      
      this.events.unshift({ 
        text: `${offender==='A'?this.playerA:this.playerB} 犯规 +${pts} 送分给 ${receiver==='A'?this.playerA:this.playerB}${this.foulMiss?'（Miss）':''}`, 
        ts: Date.now() 
      })
      
      // 通常换人击打
      if (this.atTable === offender) {
        this.switchTurn()
      }
      
      this.showFoulDialog = false
      this.recalc()
      performanceMonitor.endTimer('犯规','interaction')
      
      // Miss重打选择
      if (this.foulMiss) {
        uni.showModal({
          title: 'Miss 判罚',
          content: '是否选择重打？',
          cancelText: '继续',
          confirmText: '重打',
          success: (res) => {
            if (res.confirm) {
              this.atTable = offender
              this.currentBreak = 0
              this.lastPotRed = false
              this.events.unshift({ 
                text: `Miss 重打：${offender==='A'?this.playerA:this.playerB} 重新击打`, 
                ts: Date.now() 
              })
            }
          }
        })
      }
    },

    // 重置为下一局
    resetForNextFrame(winnerSide) {
      this.scores = { A:0, B:0 }
      this.currentBreak = 0
      this.redsRemaining = this.initialReds
      this.colorsOnTable = { Y:true, G:true, B:true, Br:true, Pk:true, Bk:true }
      this.phase = 'reds'
      this.atTable = winnerSide || 'A'
      this.highestBreaks = { A:0, B:0 }

      // 新的一局：清空撤销/重做栈与历史记录，避免跨局撤销导致状态错乱
      this.undoStack = []
      this.redoStack = []
      this.events = []
      // 新局重置 lastPotRed
      this.lastPotRed = false

      uni.removeStorageSync('snooker:state')
      // 依据新状态重新计算剩余分数并保存
      this.recalc()
    },

    // 分数闪烁动效
    triggerScoreFlash() {
      this.scoreFlash = true
      setTimeout(() => this.scoreFlash = false, 400)
    },

    // 切换历史记录显示
    toggleHistory() {
      this.showHistory = !this.showHistory
    },

    // 格式化时间
    formatTime(timestamp) {
      const date = new Date(timestamp)
      return `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}`
    },

    // 关闭弹层
    // 打开自由球对话框
    openFreeBallDialog() {
      this.freeBallScore = 1
      this.showFreeBallDialog = true
    },

    // 确认自由球
    confirmFreeBall() {
      if (!this.freeBallScore || this.freeBallScore < 1 || this.freeBallScore > 7) {
        return uni.showToast({ title: '请输入1-7的有效分数', icon: 'none' })
      }

      this.pushUndo()
      performanceMonitor.startTimer('自由球')

      this.scores[this.atTable] += this.freeBallScore
      this.currentBreak += this.freeBallScore

      // 更新单杆最高
      if (this.currentBreak > this.highestBreaks[this.atTable]) {
        this.highestBreaks[this.atTable] = this.currentBreak
      }

      this.events.unshift({ 
        text: `${this.atTable==='A'?this.playerA:this.playerB} 自由球 +${this.freeBallScore}`, 
        ts: Date.now() 
      })

      this.triggerScoreFlash()
      this.recalc()
      this.showFreeBallDialog = false
      performanceMonitor.endTimer('自由球','interaction')
    },

    closeOverlays() {
      this.showFoulDialog = false
      this.showFreeBallDialog = false
    },
  },
  // 转发给好友
  onShareAppMessage(res) {
    return {
      title: `斯诺克对局 - ${this.playerA} ${this.scores.A}:${this.scores.B} ${this.playerB}`,
      path: '/pages/snooker-game/snooker-game',
      imageUrl: '/static/logo.png' // 暂时使用logo，后续可生成分数图片
    }
  },
  // 分享到朋友圈
  onShareTimeline(res) {
    return {
      title: `斯诺克对局 - ${this.playerA} ${this.scores.A}:${this.scores.B} ${this.playerB}`,
      query: 'from=timeline',
      imageUrl: '/static/logo.png' // 暂时使用logo，后续可生成分数图片
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
  color: #fff;
  padding: 20rpx;
}

/* 玩家分数区域 */
.player-score-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  border: 3rpx solid transparent;
  transition: all 0.3s ease;
}

.player-score-section.active {
  border-color: #4CAF50;
  background: rgba(76, 175, 80, 0.2);
  box-shadow: 0 0 30rpx rgba(76, 175, 80, 0.3);
}

.player-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15rpx;
}

.player-name {
  font-size: 36rpx;
  font-weight: bold;
}

.total-score {
  font-size: 48rpx;
  font-weight: bold;
  color: #FFD700;
}

.score-details {
  display: flex;
  justify-content: space-between;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

/* 球台状态区 */
.balls-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.ball {
  border-radius: 50%;
  width: 120rpx;
  height: 120rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: bold;
  border: none;
  margin: 10rpx;
  transition: all 0.3s ease;
  box-shadow: 0 8rpx 15rpx rgba(0,0,0,0.3);
}

.ball:active {
  transform: scale(0.95);
}

.ball:disabled {
  opacity: 0.3 !important;
  filter: grayscale(80%) brightness(0.6) !important;
  transform: none !important;
  cursor: not-allowed;
  background: #666 !important;
}

.ball.red {
  background: linear-gradient(135deg, #dc143c 0%, #b91c3c 100%);
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  margin-bottom: 20rpx;
}

.color-balls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 15rpx;
}

.ball.yellow { background: linear-gradient(135deg, #FFD700 0%, #FFC107 100%); color: #333; }
.ball.green { background: linear-gradient(135deg, #4CAF50 0%, #388E3C 100%); }
.ball.brown { background: linear-gradient(135deg, #8D6E63 0%, #6D4C41 100%); }
.ball.blue { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); }
.ball.pink { background: linear-gradient(135deg, #E91E63 0%, #C2185B 100%); }
.ball.black { background: linear-gradient(135deg, #424242 0%, #212121 100%); }

.ball-text {
  font-size: 24rpx;
}

.ball-value, .ball-count {
  font-size: 20rpx;
  margin-top: 5rpx;
}

/* 剩余分数 */
.remaining-points {
  text-align: center;
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
  color: #FFD700;
}

/* 操作按钮区 */
.action-buttons {
  margin-bottom: 30rpx;
}

.main-actions, .secondary-actions {
  display: flex;
  gap: 20rpx;
  margin-bottom: 15rpx;
}

.action-btn {
  flex: 1;
  height: 80rpx;
  border-radius: 15rpx;
  color: #fff;
  font-size: 32rpx;
  font-weight: bold;
  border: none;
  transition: all 0.3s ease;
}

.foul-btn {
  background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%);
}

.free-ball-btn {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.score-input {
  width: 200rpx;
  height: 60rpx;
  border: 2rpx solid #ddd;
  border-radius: 10rpx;
  padding: 0 15rpx;
  font-size: 28rpx;
  text-align: center;
  background: #fff;
  color: #333;
}

.miss-btn {
  background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
}

.undo-btn {
  background: linear-gradient(135deg, #607D8B 0%, #455A64 100%);
}

.new-frame-btn {
  background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%);
}

.action-btn:active {
  transform: scale(0.98);
}

/* 历史记录区 */
.history-section {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20rpx;
  padding: 30rpx;
}

.history-header {
  font-size: 32rpx;
  font-weight: bold;
  text-align: center;
  padding: 15rpx 0;
  border-bottom: 2rpx solid rgba(255, 255, 255, 0.2);
  margin-bottom: 20rpx;
}

.history-list {
  max-height: 400rpx;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15rpx 0;
  border-bottom: 1rpx solid rgba(255, 255, 255, 0.1);
}

.history-text {
  font-size: 28rpx;
  flex: 1;
}

.history-time {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

/* 弹层样式 */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 999;
}

.panel {
  width: 100%;
  background: #fff;
  border-top-left-radius: 30rpx;
  border-top-right-radius: 30rpx;
  padding: 40rpx 30rpx;
  color: #333;
  animation: slideUp 0.3s ease;
}

.panel-title {
  display: block;
  text-align: center;
  font-size: 36rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 20rpx 0;
}

.label {
  font-size: 32rpx;
  color: #555;
}

.seg {
  display: flex;
  gap: 15rpx;
}

.seg-btn {
  min-width: 100rpx;
  height: 70rpx;
  background: #ECEFF1;
  border-radius: 15rpx;
  color: #555;
  font-size: 28rpx;
  border: none;
}

.seg-btn.active {
  background: #2E7D32;
  color: #fff;
}

.switch-row {
  padding: 15rpx 0;
}

.dialog-actions {
  display: flex;
  gap: 20rpx;
  margin-top: 30rpx;
}

.panel-cancel, .panel-ok {
  flex: 1;
  height: 80rpx;
  border-radius: 15rpx;
  font-size: 32rpx;
  border: none;
}

.panel-cancel {
  background: #ECEFF1;
  color: #555;
}

.panel-ok {
  background: #2E7D32;
  color: #fff;
}

/* 犯规提示条 */
.foul-banner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80rpx;
  background: linear-gradient(135deg, #F44336 0%, #D32F2F 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  font-weight: bold;
  font-size: 32rpx;
  animation: slideDown 0.3s ease;
}

/* 骨架屏 */
.skeleton-container {
  padding: 40rpx;
}

.skeleton-title {
  height: 60rpx;
  width: 50%;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15rpx;
  margin-bottom: 20rpx;
}

.skeleton-row {
  height: 100rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 15rpx;
  margin-bottom: 20rpx;
}

/* 动画 */
.fade-in {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0.8;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes slideDown {
  from {
    transform: translateY(-100%);
  }
  to {
    transform: translateY(0);
  }
}

/* 分数闪烁动效 */
.player-score-section.active {
  animation: scoreFlash 0.4s ease;
}

@keyframes scoreFlash {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
}
</style>