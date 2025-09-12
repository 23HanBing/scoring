<template>
  <view class="container">
    <!-- 背景 -->
    <view class="background"></view>

    <!-- 顶部信息栏 -->
    <view class="header">
      <view class="game-info">
        <text class="game-title">九球三人追分</text>
        <text class="game-progress">目标: {{ targetScore === 0 ? '无限制' : targetScore + '分' }} | 三方零和</text>
      </view>
      <view class="action-btns">
        <button class="action-btn" @tap="showHistory">
          <text class="btn-text">📊</text>
        </button>
        <button class="action-btn" @tap="resetGame">
          <text class="btn-text">🔄</text>
        </button>
      </view>
    </view>

    <!-- 比分显示 -->
    <view class="score-board">
      <view
          v-for="(player, index) in players"
          :key="player.id"
          class="player-score"
          :class="{
          winner: player && targetScore > 0 && Math.abs(player.score || 0) >= targetScore && (player.score || 0) > 0,
          loser: player && targetScore > 0 && Math.abs(player.score || 0) >= targetScore && (player.score || 0) < 0,
          leading: player && (player.score || 0) > 0 && (player.score || 0) === Math.max(...players.filter(p => p).map(p => p.score || 0))
        }"
      >
        <view class="player-avatar" :class="`player-${index + 1}`">
          <text class="player-number">{{ index + 1 }}</text>
        </view>
        <view class="player-info">
          <text class="player-name">{{ player?.name || '玩家' }}</text>
          <text class="player-status"
                :class="{ positive: (player?.score || 0) > 0, negative: (player?.score || 0) < 0 }">
            {{ (player?.score || 0) > 0 ? '领先' : (player?.score || 0) < 0 ? '落后' : '平局' }}
          </text>
          <view class="player-stats">
            <text class="stat-item">大金:{{ player?.stats?.bigGold || 0 }}</text>
            <text class="stat-item">小金:{{ player?.stats?.smallGold || 0 }}</text>
            <text class="stat-item">普胜:{{ player?.stats?.normal || 0 }}</text>
            <text class="stat-item">犯规:{{ player?.stats?.foul || 0 }}</text>
          </view>
        </view>
        <view class="score-display">
          <text class="score-number"
                :class="{ positive: (player?.score || 0) > 0, negative: (player?.score || 0) < 0 }">
            {{ (player?.score || 0) > 0 ? '+' : '' }}{{ player?.score || 0 }}
          </text>
          <text class="score-label">分</text>
        </view>
      </view>
    </view>

    <!-- 零和提示 -->
    <view class="zero-sum-tip">
      <text class="tip-text">💡 三方总分恒为0：{{ players.reduce((sum, p) => sum + p.score, 0) }}</text>
    </view>

    <!-- 计分选择模式 -->
    <view class="scoring-mode" v-if="!gameFinished">
      <!-- 胜局类计分 -->
      <view class="win-section">
        <view class="section-header">
          <text class="section-title">胜局计分</text>
          <text class="section-subtitle">选择赢方和输方</text>
        </view>

        <view class="score-type-selection">
          <view class="score-type-row">
            <button
                class="score-type-btn big-gold"
                @tap="selectScoreType('big-gold', 10)"
                :class="{ active: selectedScoreType === 'big-gold' }"
            >
              <text class="type-title">大金</text>
              <text class="type-score">±10分</text>
            </button>

            <button
                class="score-type-btn small-gold"
                @tap="selectScoreType('small-gold', 7)"
                :class="{ active: selectedScoreType === 'small-gold' }"
            >
              <text class="type-title">小金</text>
              <text class="type-score">±7分</text>
            </button>

            <button
                class="score-type-btn normal-win"
                @tap="selectScoreType('normal', 4)"
                :class="{ active: selectedScoreType === 'normal' }"
            >
              <text class="type-title">普胜</text>
              <text class="type-score">±4分</text>
            </button>
          </view>
        </view>

        <!-- 玩家选择区域 -->
        <view class="player-selection" v-if="selectedScoreType">
          <view class="selection-step">
            <text class="step-title">谁赢了？</text>
            <view class="player-options">
              <view
                  v-for="(player, index) in players"
                  :key="'winner-' + player.id"
                  class="player-option"
                  :class="{ selected: selectedWinner === player.id }"
                  @tap="selectWinner(player.id)"
              >
                <view class="player-avatar-option" :class="`player-${index + 1}`">
                  <text class="avatar-number">{{ index + 1 }}</text>
                </view>
                <text class="player-name-option">{{ player?.name || '玩家' }}</text>
              </view>
            </view>
          </view>

          <view class="selection-step" v-if="selectedWinner && selectedScoreType !== 'big-gold'">
            <text class="step-title">谁输了？</text>
            <view class="player-options">
              <view
                  v-for="(player) in availableLosers"
                  :key="'loser-' + player.id"
                  class="player-option"
                  :class="{ selected: selectedLoser === player.id }"
                  @tap="selectLoser(player.id)"
              >
                <view class="player-avatar-option" :class="`player-${getPlayerIndex(player.id) + 1}`">
                  <text class="avatar-number">{{ getPlayerIndex(player.id) + 1 }}</text>
                </view>
                <text class="player-name-option">{{ player.name }}</text>
              </view>
            </view>
          </view>

          <!-- 确认按钮 -->
          <view class="confirm-section"
                v-if="selectedWinner && (selectedScoreType === 'big-gold' || (selectedScoreType !== 'big-gold' && selectedLoser))">
            <view class="score-preview" v-if="selectedScoreType === 'big-gold'">
              <text class="preview-text">{{ getPlayerName(selectedWinner) }}获得{{
                  selectedScore * 2
                }}分，其他两人各失{{ selectedScore }}分
              </text>
            </view>
            <view class="score-preview" v-else>
              <text class="preview-text">{{ getPlayerName(selectedWinner) }}获得{{
                  selectedScore
                }}分，{{ getPlayerName(selectedLoser) }}失{{ selectedScore }}分
              </text>
            </view>
            <button class="confirm-btn" @tap="confirmWinScore">
              <text class="confirm-text">确认计分</text>
            </button>
            <button class="cancel-btn" @tap="resetSelection">
              <text class="cancel-text">重新选择</text>
            </button>
          </view>
        </view>
      </view>

      <!-- 犯规类计分 -->
      <view class="foul-section">
        <view class="section-header">
          <text class="section-title">犯规计分</text>
          <text class="section-subtitle">选择犯规方和被犯规方</text>
        </view>

        <view class="foul-selection">
          <view class="selection-step">
            <text class="step-title">谁犯规了？</text>
            <view class="player-options">
              <view
                  v-for="(player, index) in players"
                  :key="'foul-' + player.id"
                  class="player-option foul-option"
                  :class="{ selected: selectedFouler === player.id }"
                  @tap="selectFouler(player.id)"
              >
                <view class="player-avatar-option" :class="`player-${index + 1}`">
                  <text class="avatar-number">{{ index + 1 }}</text>
                </view>
                <text class="player-name-option">{{ player?.name || '玩家' }}</text>
                <text class="foul-penalty">-1分</text>
              </view>
            </view>
          </view>

          <view class="selection-step" v-if="selectedFouler">
            <text class="step-title">谁被犯规了？</text>
            <view class="player-options">
              <view
                  v-for="(player) in availableFoulVictims"
                  :key="'victim-' + player.id"
                  class="player-option victim-option"
                  :class="{ selected: selectedFoulVictim === player.id }"
                  @tap="selectFoulVictim(player.id)"
              >
                <view class="player-avatar-option" :class="`player-${getPlayerIndex(player.id) + 1}`">
                  <text class="avatar-number">{{ getPlayerIndex(player.id) + 1 }}</text>
                </view>
                <text class="player-name-option">{{ player.name }}</text>
                <text class="foul-gain">+1分</text>
              </view>
            </view>
          </view>

          <!-- 确认按钮 -->
          <view class="confirm-section" v-if="selectedFouler && selectedFoulVictim">
            <view class="score-preview">
              <text class="preview-text">{{
                  getPlayerName(selectedFouler)
                }}犯规失1分，{{ getPlayerName(selectedFoulVictim) }}得1分
              </text>
            </view>
            <button class="confirm-btn" @tap="confirmFoulScore">
              <text class="confirm-text">确认犯规</text>
            </button>
            <button class="cancel-btn" @tap="resetFoulSelection">
              <text class="cancel-text">重新选择</text>
            </button>
          </view>
        </view>
      </view>
    </view>

    <!-- 游戏结束界面 -->
    <view class="game-over" v-if="gameFinished">
      <view class="winner-section">
        <text class="winner-title">🎉 比赛结束</text>
        <view class="winner-info">
          <view class="winner-avatar" :class="`player-${getWinnerIndex() + 1}`">
            <text class="winner-number">{{ getWinnerIndex() + 1 }}</text>
          </view>
          <text class="winner-name">{{ getWinner().name }}</text>
          <text class="winner-score">{{ getWinner().score }}分获胜</text>
        </view>
      </view>

      <view class="game-actions">
        <button class="action-button restart" @tap="restartGame">
          <text class="action-text">重新开始</text>
        </button>
        <button class="action-button home" @tap="goHome">
          <text class="action-text">返回首页</text>
        </button>
      </view>
    </view>

    <!-- 撤销按钮 -->
    <view class="undo-section" v-if="gameHistory.length > 0 && !gameFinished">
      <button class="undo-btn" @tap="undoLastScore">
        <text class="undo-text">↶ 撤销上一步</text>
      </button>
    </view>

    <!-- 历史记录弹窗 -->
    <view class="history-modal" v-if="showHistoryModal" @tap="hideHistory">
      <view class="history-content" @tap.stop>
        <view class="history-header">
          <text class="history-title">比赛记录</text>
          <button class="close-btn" @tap="hideHistory">×</button>
        </view>
        <scroll-view class="history-list" scroll-y>
          <view
              v-for="(record, index) in gameHistory"
              :key="index"
              class="history-item"
          >
            <text class="history-winner">{{ record.winnerName }}</text>
            <text class="history-detail">{{ getActionName(record.type) }}</text>
            <text class="history-losers">{{ record.loserNames ? record.loserNames.join('、') : '' }}</text>
            <text class="history-score" :class="{ positive: record.score > 0, negative: record.score < 0 }">
              {{ record.score > 0 ? '+' : '' }}{{ record.score }}分
            </text>
          </view>
        </scroll-view>
      </view>
    </view>

    <!-- 隐藏的canvas用于截图 -->
    <canvas
        canvas-id="shareCanvas"
        :style="{ width: canvasWidth + 'px', height: canvasHeight + 'px', position: 'absolute', left: '-9999px', top: '-9999px' }"
    ></canvas>
  </view>
</template>

<script>
export default {
  data() {
    return {
      // 仅保留渲染相关的数据
      players: [],
      targetScore: 100,
      showHistoryModal: false,

      // 胜局类选择状态
      selectedScoreType: null,
      selectedScore: 0,
      selectedWinner: null,
      selectedLoser: null,

      // 犯规类选择状态
      selectedFouler: null,
      selectedFoulVictim: null,

      // canvas截图相关
      canvasWidth: 375,
      canvasHeight: 667,
      shareImagePath: ''
    }
  },

  // 将渲染无关的数据移到组件实例上
  created() {
    // 游戏历史记录不需要响应式，移到实例属性
    this.gameHistory = []
    // 缓存数据，避免频繁计算
    this.cachedGameState = null
  },
  computed: {
    gameFinished() {
      if (this.targetScore === 0) return false // 无限制模式
      return this.players.some(player => player && Math.abs(player.score || 0) >= this.targetScore)
    },

    availableLosers() {
      return this.players.filter(p => p.id !== this.selectedWinner)
    },

    availableFoulVictims() {
      return this.players.filter(p => p.id !== this.selectedFouler)
    }
  },
  onLoad() {
    this.initGame()
  },
  methods: {
    initGame() {
      // 首先尝试加载已保存的游戏状态
      const savedGameState = uni.getStorageSync('nineBall3pGameState')
      if (savedGameState && savedGameState.players && savedGameState.players.length > 0) {
        this.players = savedGameState.players
        this.gameHistory = savedGameState.gameHistory || []
        this.targetScore = savedGameState.targetScore || 100
        return
      }

      // 如果没有保存的状态，从房间设置加载
      const gameData = uni.getStorageSync('currentGame')
      if (gameData && gameData.mode === 'nine-ball-3p' && gameData.players && gameData.players.length > 0) {
        this.players = gameData.players.map(player => ({
          id: player.id || 1,
          name: player.name || '玩家',
          score: 0,
          stats: {
            bigGold: 0,
            smallGold: 0,
            normal: 0,
            foul: 0
          }
        }))
        this.targetScore = gameData.settings?.targetScore || 100
      } else {
        // 默认数据
        this.players = [
          {id: 1, name: '玩家1', score: 0, stats: {bigGold: 0, smallGold: 0, normal: 0, foul: 0}},
          {id: 2, name: '玩家2', score: 0, stats: {bigGold: 0, smallGold: 0, normal: 0, foul: 0}},
          {id: 3, name: '玩家3', score: 0, stats: {bigGold: 0, smallGold: 0, normal: 0, foul: 0}}
        ]
        this.targetScore = 100
      }
    },


    checkGameEnd() {
      if (this.targetScore === 0) return false // 无限制模式永不结束
      return this.players.some(player => player && Math.abs(player.score || 0) >= this.targetScore)
    },

    undoLastScore() {
      if (this.gameHistory.length === 0) return

      const lastRecord = this.gameHistory.pop()

      // 恢复之前的分数和统计数据
      this.players.forEach(player => {
        player.score = lastRecord.beforeScores[player.id]
        if (lastRecord.beforeStats && lastRecord.beforeStats[player.id]) {
          player.stats = {...lastRecord.beforeStats[player.id]}
        }
      })

      this.saveGameState()
    },

    getWinner() {
      if (this.targetScore === 0) {
        // 无限制模式，返回分数最高的玩家
        return this.players.reduce((prev, current) => ((prev?.score || 0) > (current?.score || 0)) ? prev : current)
      }
      // 有目标分数时，返回达到目标分数的玩家，或分数最高的玩家
      return this.players.find(player => player && Math.abs(player.score || 0) >= this.targetScore) ||
          this.players.reduce((prev, current) => ((prev?.score || 0) > (current?.score || 0)) ? prev : current)
    },

    getWinnerIndex() {
      const winner = this.getWinner()
      return this.players.findIndex(player => player.id === winner.id)
    },


    finishGame() {
      const winner = this.getWinner()
      uni.showToast({
        title: `${winner.name}获胜！`,
        icon: 'success'
      })
    },

    restartGame() {
      this.players.forEach(player => {
        player.score = 0
        player.stats = {
          bigGold: 0,
          smallGold: 0,
          normal: 0,
          foul: 0
        }
      })
      this.gameHistory = []

      // 重置选择状态
      this.selectedScoreType = null
      this.selectedScore = 0
      this.selectedWinner = null
      this.selectedLoser = null
      this.selectedFouler = null
      this.selectedFoulVictim = null

      this.saveGameState()
    },

    resetGame() {
      uni.showModal({
        title: '重置比赛',
        content: '确定要重置当前比赛吗？',
        success: (res) => {
          if (res.confirm) {
            this.restartGame()
          }
        }
      })
    },

    goHome() {
      uni.reLaunch({
        url: '/pages/index/index'
      })
    },

    showHistory() {
      this.showHistoryModal = true
    },

    hideHistory() {
      this.showHistoryModal = false
    },

    getActionName(type) {
      const names = {
        'big-gold': '大金',
        'small-gold': '小金',
        'normal': '普胜',
        'foul': '犯规'
      }
      return names[type] || type
    },

    saveGameState() {
      const gameState = {
        players: this.players,
        gameHistory: this.gameHistory,
        targetScore: this.targetScore
      }
      uni.setStorageSync('nineBall3pGameState', gameState)
    },

    // 选择计分类型
    selectScoreType(type, score) {
      this.selectedScoreType = type
      this.selectedScore = score
      // 只重置玩家选择，不重置计分类型
      this.selectedWinner = null
      this.selectedLoser = null
    },

    // 选择赢家
    selectWinner(playerId) {
      this.selectedWinner = playerId
      this.selectedLoser = null
    },

    // 选择输家
    selectLoser(playerId) {
      this.selectedLoser = playerId
    },

    // 获取玩家名称
    getPlayerName(playerId) {
      const player = this.players.find(p => p.id === playerId)
      return player ? player.name : '玩家'
    },

    // 确认胜局计分 - 优化版本，减少频繁更新
    confirmWinScore() {
      if (!this.selectedWinner || !this.selectedScore) return
      if (this.selectedScoreType !== 'big-gold' && !this.selectedLoser) return

      // 批量更新策略：先计算所有变更，再一次性应用
      const updates = this.calculateScoreUpdates()
      this.applyScoreUpdates(updates)

      // 记录历史到非响应式属性
      this.recordGameHistory(updates)

      this.resetSelection()
      this.saveGameState()

      if (this.checkGameEnd()) {
        this.finishGame()
      }
    },

    // 计算分数更新 - 避免直接操作响应式数据
    calculateScoreUpdates() {
      const winner = this.players.find(p => p.id === this.selectedWinner)
      const updates = {
        players: [...this.players], // 浅拷贝避免直接修改
        historyRecord: null
      }

      if (this.selectedScoreType === 'big-gold') {
        // 大金逻辑
        const totalScore = this.selectedScore * 2
        const losers = updates.players.filter(p => p.id !== this.selectedWinner)
        const lossPerPlayer = totalScore / losers.length

        updates.players.forEach(player => {
          if (player.id === this.selectedWinner) {
            player.score += totalScore
            player.stats.bigGold += 1
          } else {
            player.score -= lossPerPlayer
          }
        })

        updates.historyRecord = {
          winnerId: this.selectedWinner,
          winnerName: winner.name,
          loserIds: losers.map(p => p.id),
          loserNames: losers.map(p => p.name),
          type: this.selectedScoreType,
          score: this.selectedScore,
          timestamp: Date.now()
        }
      } else {
        // 小金和普胜逻辑
        const loser = this.players.find(p => p.id === this.selectedLoser)

        updates.players.forEach(player => {
          if (player.id === this.selectedWinner) {
            player.score += this.selectedScore
            if (this.selectedScoreType === 'small-gold') {
              player.stats.smallGold += 1
            } else if (this.selectedScoreType === 'normal') {
              player.stats.normal += 1
            }
          } else if (player.id === this.selectedLoser) {
            player.score -= this.selectedScore
          }
        })

        updates.historyRecord = {
          winnerId: this.selectedWinner,
          winnerName: winner.name,
          loserIds: [this.selectedLoser],
          loserNames: [loser.name],
          type: this.selectedScoreType,
          score: this.selectedScore,
          timestamp: Date.now()
        }
      }

      return updates
    },

    // 应用分数更新 - 一次性更新所有数据
    applyScoreUpdates(updates) {
      this.players = updates.players
    },

    // 记录游戏历史到非响应式属性
    recordGameHistory(updates) {
      this.gameHistory.push(updates.historyRecord)
    },

    // 重置胜局选择
    resetSelection() {
      this.selectedScoreType = null
      this.selectedScore = 0
      this.selectedWinner = null
      this.selectedLoser = null
    },

    // 选择犯规者
    selectFouler(playerId) {
      this.selectedFouler = playerId
      this.selectedFoulVictim = null
    },

    // 选择被犯规者
    selectFoulVictim(playerId) {
      this.selectedFoulVictim = playerId
    },


    // 确认犯规计分
    confirmFoulScore() {
      if (!this.selectedFouler || !this.selectedFoulVictim) return

      const fouler = this.players.find(p => p.id === this.selectedFouler)
      const victim = this.players.find(p => p.id === this.selectedFoulVictim)

      // 记录历史
      this.gameHistory.push({
        winnerId: this.selectedFoulVictim,
        winnerName: victim.name,
        loserIds: [this.selectedFouler],
        loserNames: [fouler.name],
        type: 'foul',
        score: 1,
        timestamp: Date.now(),
        beforeScores: this.players.reduce((acc, p) => {
          acc[p.id] = p.score
          return acc
        }, {}),
        beforeStats: this.players.reduce((acc, p) => {
          acc[p.id] = {...p.stats}
          return acc
        }, {})
      })

      // 计分：犯规者失1分，被犯规者得1分，第三人不变
      fouler.score -= 1
      victim.score += 1

      // 更新统计：犯规者犯规+1
      fouler.stats.foul += 1

      this.resetFoulSelection()
      this.saveGameState()

      if (this.checkGameEnd()) {
        this.finishGame()
      }
    },

    // 重置犯规选择
    resetFoulSelection() {
      this.selectedFouler = null
      this.selectedFoulVictim = null
    },

    // 获取玩家索引
    getPlayerIndex(playerId) {
      return this.players.findIndex(p => p.id === playerId)
    },

    // 生成页面截图用于分享 <mcreference link="https://www.cnblogs.com/dongzhi1111/p/14044739.html" index="1">1</mcreference> <mcreference link="https://uniapp.dcloud.net.cn/api/canvas/canvasToTempFilePath.html" index="2">2</mcreference>
    async generateShareImage() {
      return new Promise((resolve, reject) => {
        const ctx = uni.createCanvasContext('shareCanvas', this)

        // 设置canvas尺寸
        const canvasW = this.canvasWidth
        const canvasH = this.canvasHeight

        // 绘制背景
        ctx.setFillStyle('#6A1B9A')
        ctx.fillRect(0, 0, canvasW, canvasH)

        // 绘制标题
        ctx.setFillStyle('#ffffff')
        ctx.setFontSize(24)
        ctx.setTextAlign('center')
        ctx.fillText('九球三人对局', canvasW / 2, 50)

        // 绘制目标分数
        ctx.setFontSize(16)
        ctx.fillText(`目标: ${this.targetScore === 0 ? '无限制' : this.targetScore + '分'}`, canvasW / 2, 80)

        // 绘制三个玩家信息
        const colors = ['#FF5722', '#2196F3', '#4CAF50']
        const yPositions = [130, 250, 370]

        this.players.forEach((player, index) => {
          const y = yPositions[index]

          // 玩家头像背景
          ctx.setFillStyle(colors[index])
          ctx.fillRect(30, y, 80, 80)

          // 玩家编号
          ctx.setFillStyle('#ffffff')
          ctx.setFontSize(18)
          ctx.setTextAlign('center')
          ctx.fillText((index + 1).toString(), 70, y + 50)

          // 玩家姓名
          ctx.setTextAlign('left')
          ctx.setFontSize(16)
          ctx.fillText(player.name, 130, y + 25)

          // 玩家分数
          ctx.setFillStyle(player.score > 0 ? '#4CAF50' : player.score < 0 ? '#f44336' : '#ffffff')
          ctx.setFontSize(28)
          ctx.fillText(player.score.toString(), 130, y + 55)

          // 统计信息
          ctx.setFillStyle('#ffffff')
          ctx.setFontSize(12)
          ctx.fillText(`大金:${player.bigGoldCount} 小金:${player.smallGoldCount} 普胜:${player.normalWinCount}`, 130, y + 75)
        })

        // 绘制时间戳
        ctx.setFontSize(12)
        ctx.setTextAlign('center')
        ctx.fillText(new Date().toLocaleString(), canvasW / 2, canvasH - 30)

        ctx.draw(false, (() => {
          setTimeout(() => {
            uni.canvasToTempFilePath({
              canvasId: 'shareCanvas',
              destWidth: canvasW * 2,
              destHeight: canvasH * 2,
              quality: 1,
              fileType: 'jpg',
              success: (res) => {
                this.shareImagePath = res.tempFilePath
                resolve(res.tempFilePath)
              },
              fail: (err) => {
                console.error('生成分享图片失败:', err)
                reject(err)
              }
            }, this)
          }, 500)
        }))
      })
    }
  },
  // 转发给好友
  async onShareAppMessage(res) {
    const scores = this.players.map(p => `${p.name}:${p.score}`).join(' | ')

    try {
      const imagePath = await this.generateShareImage()
      return {
        title: `九球三人对局 - ${scores}`,
        path: '/pages/nine-ball-3p/nine-ball-3p',
        imageUrl: imagePath
      }
    } catch (error) {
      console.error('分享图片生成失败，使用默认图片:', error)
      return {
        title: `九球三人对局 - ${scores}`,
        path: '/pages/nine-ball-3p/nine-ball-3p',
        imageUrl: '/static/logo.png'
      }
    }
  },
  // 分享到朋友圈
  async onShareTimeline(res) {
    const scores = this.players.map(p => `${p.name}:${p.score}`).join(' | ')

    try {
      const imagePath = await this.generateShareImage()
      return {
        title: `九球三人对局 - ${scores}`,
        query: 'from=timeline',
        imageUrl: imagePath
      }
    } catch (error) {
      console.error('分享图片生成失败，使用默认图片:', error)
      return {
        title: `九球三人对局 - ${scores}`,
        query: 'from=timeline',
        imageUrl: '/static/logo.png'
      }
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #6A1B9A;
  position: relative;
}

.background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
}


.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 60rpx 40rpx 20rpx;
  position: relative;
  z-index: 1;
}

.game-info {
  flex: 1;
}

.game-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.game-progress {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
}

.action-btns {
  display: flex;
  gap: 16rpx;
}

.action-btn {
  width: 60rpx;
  height: 60rpx;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  font-size: 24rpx;
  color: #FFFFFF;
}

.score-board {
  margin: 20rpx 40rpx;
  position: relative;
  z-index: 1;
}

.player-score {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  padding: 20rpx;
  margin-bottom: 12rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.player-score.winner {
  background: #FFD700;
}

.player-score.loser {
  background: #F44336;
}

.player-score.leading {
  border: 2rpx solid #4CAF50;
}

.player-avatar {
  width: 70rpx;
  height: 70rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.player-1 {
  background: #FF5722;
}

.player-2 {
  background: #2196F3;
}

.player-3 {
  background: #9C27B0;
}

.player-number {
  font-size: 28rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.player-info {
  flex: 1;
}

.player-name {
  display: block;
  font-size: 26rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 4rpx;
}

.player-score.winner .player-name,
.player-score.loser .player-name {
  color: #FFFFFF;
}

.player-status {
  display: block;
  font-size: 20rpx;
  color: #666666;
}

.player-status.positive {
  color: #4CAF50;
}

.player-status.negative {
  color: #F44336;
}

.player-score.winner .player-status,
.player-score.loser .player-status {
  color: rgba(255, 255, 255, 0.9);
}

.player-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 8rpx;
  margin-top: 8rpx;
}

.stat-item {
  font-size: 18rpx;
  color: #666666;
  background: rgba(0, 0, 0, 0.05);
  padding: 4rpx 8rpx;
  border-radius: 6rpx;
  border: 1rpx solid rgba(0, 0, 0, 0.1);
}

.player-score.winner .stat-item,
.player-score.loser .stat-item {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.2);
}

.score-display {
  text-align: right;
}

.score-number {
  font-size: 40rpx;
  font-weight: bold;
  color: #333333;
}

.score-number.positive {
  color: #4CAF50;
}

.score-number.negative {
  color: #F44336;
}

.player-score.winner .score-number,
.player-score.loser .score-number {
  color: #FFFFFF;
}

.score-label {
  font-size: 20rpx;
  color: #999999;
}

.player-score.winner .score-label,
.player-score.loser .score-label {
  color: rgba(255, 255, 255, 0.8);
}

.zero-sum-tip {
  margin: 0 40rpx 20rpx;
  padding: 16rpx 20rpx;
  background: rgba(255, 193, 7, 0.15);
  border: 1rpx solid rgba(255, 193, 7, 0.3);
  border-radius: 12rpx;
  position: relative;
  z-index: 1;
}

.tip-text {
  font-size: 24rpx;
  color: #F57F17;
  text-align: center;
}

/* 计分模式样式 */
.scoring-mode {
  padding: 40rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30rpx;
  margin: 40rpx;
  box-shadow: 0 10rpx 30rpx rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
}

.win-section, .foul-section {
  margin-bottom: 40rpx;
  padding: 30rpx;
  background: #f8f9fa;
  border-radius: 20rpx;
  border: 2rpx solid #e9ecef;
}

.foul-section {
  background: #fff5f5;
  border-color: #ffebee;
}

.section-header {
  text-align: center;
  margin-bottom: 30rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #2c3e50;
  display: block;
  margin-bottom: 8rpx;
}

.section-subtitle {
  font-size: 24rpx;
  color: #7f8c8d;
  display: block;
}

.score-type-selection {
  margin-bottom: 30rpx;
}

.score-type-row {
  display: flex;
  gap: 15rpx;
}

.score-type-btn {
  flex: 1;
  padding: 25rpx 15rpx;
  border-radius: 15rpx;
  border: 3rpx solid transparent;
  color: white;
  font-weight: bold;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8rpx;
  transition: all 0.3s ease;
}

.score-type-btn:active {
  transform: scale(0.95);
}

.score-type-btn.active {
  border-color: #2196f3;
  transform: scale(1.05);
}

.score-type-btn.big-gold {
  background: linear-gradient(135deg, #ffd700, #ffb300);
}

.score-type-btn.small-gold {
  background: linear-gradient(135deg, #ffb300, #ff8f00);
}

.score-type-btn.normal-win {
  background: linear-gradient(135deg, #4caf50, #388e3c);
}

.type-title {
  font-size: 26rpx;
  font-weight: bold;
}

.type-score {
  font-size: 22rpx;
  opacity: 0.9;
}

.player-selection, .foul-selection {
  margin-top: 20rpx;
}

.selection-step {
  margin-bottom: 30rpx;
}

.step-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #2c3e50;
  text-align: center;
  display: block;
  margin-bottom: 20rpx;
}

.player-options {
  display: flex;
  gap: 15rpx;
}

.player-option {
  flex: 1;
  padding: 25rpx 15rpx;
  background: #ffffff;
  border-radius: 15rpx;
  border: 3rpx solid transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10rpx;
  transition: all 0.3s ease;
}

.player-option:active {
  transform: scale(0.95);
}

.player-option.selected {
  border-color: #2196f3;
  background: #e3f2fd;
  transform: scale(1.02);
}

.foul-option {
  background: #ffebee;
}

.foul-option.selected {
  background: #ffcdd2;
  border-color: #f44336;
}

.victim-option {
  background: #e8f5e8;
}

.victim-option.selected {
  background: #c8e6c9;
  border-color: #4caf50;
}

.player-avatar-option {
  width: 60rpx;
  height: 60rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
}

.avatar-number {
  font-size: 24rpx;
  font-weight: bold;
}

.player-name-option {
  font-size: 24rpx;
  color: #2c3e50;
  font-weight: 600;
  text-align: center;
}

.foul-penalty {
  font-size: 20rpx;
  color: #e74c3c;
  font-weight: bold;
}

.foul-gain {
  font-size: 20rpx;
  color: #4caf50;
  font-weight: bold;
}

.confirm-section {
  display: flex;
  gap: 20rpx;
  justify-content: center;
  margin-top: 30rpx;
}

.confirm-btn {
  padding: 25rpx 40rpx;
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
  border: none;
  border-radius: 15rpx;
  font-weight: bold;
  transition: all 0.3s ease;
}

.confirm-btn:active {
  transform: scale(0.95);
}

.cancel-btn {
  padding: 25rpx 40rpx;
  background: #95a5a6;
  color: white;
  border: none;
  border-radius: 15rpx;
  font-weight: bold;
  transition: all 0.3s ease;
}

.cancel-btn:active {
  transform: scale(0.95);
}

.confirm-text, .cancel-text {
  font-size: 26rpx;
  font-weight: bold;
}

.game-over {
  position: relative;
  z-index: 1;
  padding: 60rpx 40rpx;
  text-align: center;
}

.winner-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 40rpx;
  margin-bottom: 40rpx;
  box-shadow: 0 8rpx 24rpx rgba(0, 0, 0, 0.15);
}

.winner-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 30rpx;
}

.winner-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16rpx;
}

.winner-avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.winner-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.winner-name {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.winner-score {
  font-size: 24rpx;
  color: #666666;
}

.game-actions {
  display: flex;
  gap: 20rpx;
}

.action-button {
  flex: 1;
  height: 80rpx;
  border: none;
  border-radius: 40rpx;
  font-size: 28rpx;
  font-weight: bold;
  transition: all 0.3s ease;
}

.restart {
  background: linear-gradient(135deg, #FF9800, #FFB74D);
  color: #FFFFFF;
}

.home {
  background: linear-gradient(135deg, #607D8B, #78909C);
  color: #FFFFFF;
}

.action-button:active {
  transform: scale(0.95);
}

.action-text {
  font-size: 28rpx;
  font-weight: bold;
}

.undo-section {
  padding: 20rpx 40rpx;
  position: relative;
  z-index: 1;
}

.undo-btn {
  width: 100%;
  height: 70rpx;
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 35rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.undo-text {
  font-size: 26rpx;
  color: #FFFFFF;
}

.history-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.history-content {
  width: 85%;
  max-height: 70%;
  background: #FFFFFF;
  border-radius: 16rpx;
  overflow: hidden;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: #F5F5F5;
  border-bottom: 1rpx solid #E0E0E0;
}

.history-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.close-btn {
  width: 50rpx;
  height: 50rpx;
  background: none;
  border: none;
  font-size: 36rpx;
  color: #666666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.history-list {
  max-height: 500rpx;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
  font-size: 22rpx;
}

.history-winner {
  color: #333333;
  width: 80rpx;
  font-weight: bold;
}

.history-detail {
  color: #666666;
  width: 60rpx;
  text-align: center;
}

.history-losers {
  flex: 1;
  color: #999999;
  margin-left: 16rpx;
  font-size: 20rpx;
}

.history-score {
  font-weight: bold;
  width: 80rpx;
  text-align: right;
}

.history-score.positive {
  color: #4CAF50;
}

.history-score.negative {
  color: #F44336;
}

.score-preview {
  text-align: center;
  margin-bottom: 20rpx;
  padding: 20rpx;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 12rpx;
  border: 1rpx solid rgba(33, 150, 243, 0.3);
}

.preview-text {
  font-size: 24rpx;
  color: #1976d2;
  font-weight: 600;
}
</style>