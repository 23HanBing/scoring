<template>
  <view class="container">
    <!-- 背景 -->
    <view class="background"></view>
    
    <!-- 顶部信息栏 -->
    <view class="header">
      <view class="game-info">
        <text class="game-title">九球二人追分</text>
        <text class="game-progress">目标: {{ targetScore === 0 ? '无限制' : targetScore + '分' }} | 零和游戏</text>
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
          leading: player && (player.score || 0) > 0
        }"
      >
        <view class="player-avatar" :class="`player-${index + 1}`">
          <text class="player-number">{{ index + 1 }}</text>
        </view>
        <view class="player-info">
          <text class="player-name">{{ player?.name || '玩家' }}</text>
          <text class="player-status" :class="{ positive: (player?.score || 0) > 0, negative: (player?.score || 0) < 0 }">
            {{ (player?.score || 0) > 0 ? '领先' : (player?.score || 0) < 0 ? '落后' : '平局' }}
          </text>
          <view class="player-stats">
            <text class="stat-item">大金: {{ player?.bigGoldCount || 0 }}</text>
            <text class="stat-item">小金: {{ player?.smallGoldCount || 0 }}</text>
            <text class="stat-item">普胜: {{ player?.normalWinCount || 0 }}</text>
            <text class="stat-item">犯规: {{ player?.foulCount || 0 }}</text>
          </view>
        </view>
        <view class="score-display">
          <text class="score-number" :class="{ positive: (player?.score || 0) > 0, negative: (player?.score || 0) < 0 }">
            {{ (player?.score || 0) > 0 ? '+' : '' }}{{ player?.score || 0 }}
          </text>
          <text class="score-label">分</text>
        </view>
      </view>
    </view>
    
    <!-- 零和提示 -->
    <view class="zero-sum-tip">
      <text class="tip-text">💡 总分恒为0：{{ (players[0]?.score || 0) + (players[1]?.score || 0) }}</text>
    </view>
    
    <!-- 计分按钮区域 -->
    <view class="scoring-area" v-if="!gameFinished">
      <view class="player-actions">
        <view 
          v-for="(player, index) in players" 
          :key="player.id"
          class="player-section"
        >
          <view class="player-header">
            <view class="player-avatar-small" :class="`player-${index + 1}`">
              <text class="avatar-text">{{ index + 1 }}</text>
            </view>
            <text class="player-name-small">{{ player?.name || '玩家' }}</text>
          </view>
          
          <view class="score-buttons">
            <button 
              class="score-btn big-gold"
              @tap="scorePoint(player.id, 'big-gold', 10)"
            >
              <text class="btn-title">大金</text>
              <text class="btn-score">+10分</text>
            </button>
            
            <button 
              class="score-btn small-gold"
              @tap="scorePoint(player.id, 'small-gold', 7)"
            >
              <text class="btn-title">小金</text>
              <text class="btn-score">+7分</text>
            </button>
            
            <button 
              class="score-btn normal-win"
              @tap="scorePoint(player.id, 'normal', 4)"
            >
              <text class="btn-title">普胜</text>
              <text class="btn-score">+4分</text>
            </button>
          </view>
          
          <view class="penalty-section">
            <button 
              class="penalty-btn"
              @tap="penaltyPoint(player.id, 'foul', -1)"
            >
              <text class="penalty-title">犯规</text>
              <text class="penalty-score">-1分</text>
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
            <text class="history-player">{{ record.playerName }}</text>
            <text class="history-detail">{{ getActionName(record.type) }}</text>
            <text class="history-score" :class="{ positive: record.score > 0, negative: record.score < 0 }">
              {{ record.score > 0 ? '+' : '' }}{{ record.score }}分
            </text>
          </view>
        </scroll-view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      players: [],
      targetScore: 100,
      showHistoryModal: false
    }
  },
  created() {
    // 将非渲染相关数据移到组件实例属性
    this.gameHistory = []
    this.cachedGameState = null
  },
  computed: {
    gameFinished() {
      if (this.targetScore === 0) return false // 无限制模式永不结束
      return this.players.some(player => player && Math.abs(player.score || 0) >= this.targetScore)
    }
  },
  onLoad() {
    this.initGame()
  },
  methods: {
    initGame() {
      const gameData = uni.getStorageSync('currentGame')
      if (gameData && gameData.mode === 'nine-ball-2p' && gameData.players && gameData.players.length > 0) {
        this.players = gameData.players.map(player => ({
          id: player.id || 1,
          name: player.name || '玩家',
          score: 0,
          bigGoldCount: 0,
          smallGoldCount: 0,
          normalWinCount: 0,
          foulCount: 0
        }))
        this.targetScore = gameData.settings?.targetScore || 100
      } else {
        // 默认数据
        this.players = [
          { id: 1, name: '玩家1', score: 0, bigGoldCount: 0, smallGoldCount: 0, normalWinCount: 0, foulCount: 0 },
          { id: 2, name: '玩家2', score: 0, bigGoldCount: 0, smallGoldCount: 0, normalWinCount: 0, foulCount: 0 }
        ]
        this.targetScore = 100
      }
    },
    
    scorePoint(playerId, type, score) {
      const player = this.players.find(p => p.id === playerId)
      const opponent = this.players.find(p => p.id !== playerId)
      if (!player || !opponent) return
      
      // 批量更新策略
      const updates = this.calculatePlayerUpdates(playerId, type, score, false)
      this.applyPlayerUpdates(updates)
      
      // 记录历史到非响应式属性
      this.recordPlayerHistory(updates.historyRecord)
      
      // 检查是否游戏结束
      if (this.targetScore > 0 && Math.abs(updates.players[0].score || 0) >= this.targetScore) {
        this.finishGame()
      }
      
      // 保存游戏状态
      this.saveGameState()
    },
    
    penaltyPoint(playerId, type, penalty) {
      const player = this.players.find(p => p.id === playerId)
      const opponent = this.players.find(p => p.id !== playerId)
      if (!player || !opponent) return
      
      // 批量更新策略
      const updates = this.calculatePlayerUpdates(playerId, type, penalty, true)
      this.applyPlayerUpdates(updates)
      
      // 记录历史到非响应式属性
      this.recordPlayerHistory(updates.historyRecord)
      
      // 检查是否游戏结束
      const maxScore = Math.max(Math.abs(updates.players[0].score || 0), Math.abs(updates.players[1].score || 0))
      if (this.targetScore > 0 && maxScore >= this.targetScore) {
        this.finishGame()
      }
      
      // 保存游戏状态
      this.saveGameState()
    },
    
    undoLastScore() {
      if (this.gameHistory.length === 0) return
      
      const lastRecord = this.gameHistory.pop()
      const player = this.players.find(p => p.id === lastRecord.playerId)
      
      // 恢复之前的分数
      this.players.forEach(player => {
        player.score = lastRecord.beforeScores[player.id]
      })
      
      // 回退统计数据
      if (player) {
        if (lastRecord.type === 'big-gold' && player.bigGoldCount > 0) {
          player.bigGoldCount -= 1
        } else if (lastRecord.type === 'small-gold' && player.smallGoldCount > 0) {
          player.smallGoldCount -= 1
        } else if (lastRecord.type === 'normal' && player.normalWinCount > 0) {
          player.normalWinCount -= 1
        } else if (lastRecord.type === 'foul' && player.foulCount > 0) {
          player.foulCount -= 1
        }
      }
      
      this.saveGameState()
    },
    
    getWinner() {
      return this.players.find(player => player && (player.score || 0) >= this.targetScore) || 
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
        player.bigGoldCount = 0
        player.smallGoldCount = 0
        player.normalWinCount = 0
        player.foulCount = 0
      })
      this.gameHistory = []
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
        url: '/pages/index/index',
        animationType: 'slide-in-left',
        animationDuration: 300
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
      uni.setStorageSync('nineBall2pGameState', gameState)
    },
    
    // 计算玩家更新 - 避免直接操作响应式数据
    calculatePlayerUpdates(playerId, type, score, isPenalty) {
      const updates = {
        players: [...this.players], // 浅拷贝避免直接修改
        historyRecord: null
      }
      
      const player = updates.players.find(p => p.id === playerId)
      const opponent = updates.players.find(p => p.id !== playerId)
      
      if (isPenalty) {
        // 犯规逻辑：一方犯规失分，另一方得分
        player.score += score // score是负数
        opponent.score -= score // 对手得分
        
        if (type === 'foul') {
          player.foulCount += 1
        }
      } else {
        // 得分逻辑：零和游戏，一方得分，另一方失分
        player.score += score
        opponent.score -= score
        
        // 更新统计数据
        if (type === 'big-gold') {
          player.bigGoldCount += 1
        } else if (type === 'small-gold') {
          player.smallGoldCount += 1
        } else if (type === 'normal') {
          player.normalWinCount += 1
        }
      }
      
      updates.historyRecord = {
        playerId,
        playerName: player.name,
        type,
        score,
        timestamp: Date.now(),
        beforeScores: {
          [player.id]: this.players.find(p => p.id === playerId).score,
          [opponent.id]: this.players.find(p => p.id !== playerId).score
        }
      }
      
      return updates
    },
    
    // 应用玩家更新 - 一次性更新所有数据
    applyPlayerUpdates(updates) {
      this.players = updates.players
    },
    
    // 记录玩家历史到非响应式属性
    recordPlayerHistory(historyRecord) {
      this.gameHistory.push(historyRecord)
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #1565C0;
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
  padding: 24rpx;
  margin-bottom: 16rpx;
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
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 20rpx;
}

.player-1 {
  background: #FF5722;
}

.player-2 {
  background: #2196F3;
}

.player-number {
  font-size: 32rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.player-info {
  flex: 1;
}

.player-name {
  display: block;
  font-size: 28rpx;
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
  font-size: 22rpx;
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
  font-size: 20rpx;
  color: #666666;
  background: rgba(0, 0, 0, 0.05);
  padding: 4rpx 8rpx;
  border-radius: 8rpx;
}

.player-score.winner .stat-item,
.player-score.loser .stat-item {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.2);
}

.score-display {
  text-align: right;
}

.score-number {
  font-size: 48rpx;
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
  font-size: 24rpx;
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

.scoring-area {
  padding: 0 40rpx;
  position: relative;
  z-index: 1;
}

.player-actions {
  display: flex;
  flex-direction: column;
  gap: 30rpx;
}

.player-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  padding: 24rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.player-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.player-avatar-small {
  width: 50rpx;
  height: 50rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16rpx;
}

.avatar-text {
  font-size: 20rpx;
  font-weight: bold;
  color: #FFFFFF;
}

.player-name-small {
  font-size: 26rpx;
  font-weight: bold;
  color: #333333;
}

.score-buttons {
  display: flex;
  gap: 12rpx;
  margin-bottom: 16rpx;
}

.score-btn {
  flex: 1;
  height: 120rpx;
  border: none;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
}

.big-gold {
  background: #FF6F00;
}

.small-gold {
  background: #FFA000;
}

.normal-win {
  background: #4CAF50;
}



.btn-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 6rpx;
}

.btn-score {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
}

.penalty-section {
  display: flex;
  justify-content: center;
}

.penalty-btn {
  width: 240rpx;
  height: 100rpx;
  background: #F44336;
  border: none;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1rpx 4rpx rgba(0, 0, 0, 0.1);
}



.penalty-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 4rpx;
}

.penalty-score {
  font-size: 22rpx;
  color: rgba(255, 255, 255, 0.9);
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
  height: 100rpx;
  border: none;
  border-radius: 50rpx;
  font-size: 32rpx;
  font-weight: bold;
}

.restart {
  background: #FF9800;
  color: #FFFFFF;
}

.home {
  background: #607D8B;
  color: #FFFFFF;
}



.action-text {
  font-size: 32rpx;
  font-weight: bold;
}

.undo-section {
  padding: 20rpx 40rpx;
  position: relative;
  z-index: 1;
}

.undo-btn {
  width: 100%;
  height: 90rpx;
  background: rgba(255, 255, 255, 0.2);
  border: 2rpx solid rgba(255, 255, 255, 0.3);
  border-radius: 45rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.undo-text {
  font-size: 30rpx;
  color: #FFFFFF;
  font-weight: bold;
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
  width: 80%;
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
  padding: 20rpx 30rpx;
  border-bottom: 1rpx solid #F0F0F0;
}

.history-player {
  font-size: 24rpx;
  color: #333333;
  width: 120rpx;
  font-weight: bold;
}

.history-detail {
  flex: 1;
  font-size: 26rpx;
  color: #666666;
  margin-left: 20rpx;
}

.history-score {
  font-size: 24rpx;
  font-weight: bold;
}

.history-score.positive {
  color: #4CAF50;
}

.history-score.negative {
  color: #F44336;
}
</style>