<template>
  <view class="container">
    <!-- 背景 -->
    <view class="background"></view>
    
    <!-- 顶部信息栏 -->
    <view class="header">
      <view class="game-info">
        <text class="game-title">中式八球</text>
        <text class="game-progress">{{ gameProgressText }}</text>
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
        :class="{ winner: winGames > 0 && (player?.wins || 0) >= winGames, leading: (player?.wins || 0) > 0 && (player?.wins || 0) === Math.max(...players.map(p => p?.wins || 0)) }"
      >
        <view class="player-avatar" :class="`player-${index + 1}`">
          <text class="player-number">{{ index + 1 }}</text>
        </view>
        <view class="player-info">
          <text class="player-name">{{ player?.name || '玩家' }}</text>
          <text class="player-wins">{{ player?.wins || 0 }}胜</text>
          <view class="player-stats">
            <text class="stat-item">炸清: {{ player?.blastCount || 0 }}</text>
            <text class="stat-item">接清: {{ player?.clearCount || 0 }}</text>
            <text class="stat-item">普胜: {{ player?.normalCount || 0 }}</text>
          </view>
        </view>
        <view class="score-display">
          <text class="score-number">{{ player?.wins || 0 }}</text>
          <text class="score-label" v-if="winGames > 0">/{{ winGames }}</text>
          <text class="score-label" v-else>胜</text>
        </view>
      </view>
    </view>
    
    <!-- 当前局信息 -->
    <view class="current-game" v-if="!gameFinished">
      <text class="current-title">第{{ currentGame }}局</text>
      <text class="current-subtitle">选择获胜方式</text>
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
              class="score-btn blast-clear"
              @tap="scorePoint(player.id, 'blast', 1)"
            >
              <text class="btn-title">炸清</text>
            
            </button>
            
            <button 
              class="score-btn clear"
              @tap="scorePoint(player.id, 'clear', 1)"
            >
              <text class="btn-title">接清</text>
                
            </button>
            
            <button 
              class="score-btn normal-win"
              @tap="scorePoint(player.id, 'normal', 1)"
            >
              <text class="btn-title">普胜</text>
              
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
          <text class="winner-score">{{ getWinner().wins }}胜获胜</text>
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
            <text class="history-game">第{{ record.game }}局</text>
            <text class="history-detail">{{ record.playerName }} {{ record.type === 'blast' ? '炸清' : record.type === 'clear' ? '接清' : '普胜' }}</text>
            <text class="history-score">+{{ record.score }}分</text>
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
      totalGames: 5,
      winGames: 3,
      currentGame: 1,
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
      // 无限制模式永不结束
      if (this.winGames === 0) return false
      return this.players.some(player => (player?.wins || 0) >= this.winGames)
    },
    gameProgressText() {
      if (this.totalGames === 0) {
        return '无限制模式'
      }
      return `${this.currentGame}/${this.totalGames}局 (${this.winGames}局获胜)`
    }
  },
  onLoad() {
    this.initGame()
  },
  methods: {
    initGame() {
      const gameData = uni.getStorageSync('currentGame')
      if (gameData && gameData.mode === 'eight-ball' && gameData.players && gameData.players.length > 0) {
        this.players = gameData.players.map(player => ({
          id: player.id || 1,
          name: player.name || '玩家',
          wins: 0,
          blastCount: 0,
          clearCount: 0,
          normalCount: 0
        }))
        this.totalGames = gameData.settings?.totalGames ?? 5
        this.winGames = gameData.settings?.winGames ?? 3
      } else {
        // 默认数据
        this.players = [
          { id: 1, name: '玩家1', wins: 0, blastCount: 0, clearCount: 0, normalCount: 0 },
          { id: 2, name: '玩家2', wins: 0, blastCount: 0, clearCount: 0, normalCount: 0 }
        ]
        this.totalGames = 5
        this.winGames = 3
      }
    },
    
    scorePoint(playerId, type, score) {
      const player = this.players.find(p => p.id === playerId)
      if (!player) return
      
      // 记录历史
      this.gameHistory.push({
        game: this.currentGame,
        playerId,
        playerName: player?.name || '玩家',
        type,
        score,
        timestamp: Date.now()
      })
      
      // 增加胜局和对应统计
      if (player) {
        player.wins = (player.wins || 0) + 1
        
        // 更新对应类型的统计
        if (type === 'blast') {
          player.blastCount = (player.blastCount || 0) + 1
        } else if (type === 'clear') {
          player.clearCount = (player.clearCount || 0) + 1
        } else if (type === 'normal') {
          player.normalCount = (player.normalCount || 0) + 1
        }
      }
      
      // 检查是否游戏结束
      if (player && (player.wins || 0) >= this.winGames) {
        this.finishGame()
      } else {
        this.currentGame += 1
      }
      
      // 保存游戏状态
      this.saveGameState()
    },
    
    undoLastScore() {
      if (this.gameHistory.length === 0) return
      
      const lastRecord = this.gameHistory.pop()
      const player = this.players.find(p => p.id === lastRecord.playerId)
      
      if (player && player.wins > 0) {
        player.wins -= 1
        this.currentGame = lastRecord.game
        
        // 减少对应类型的统计
        if (lastRecord.type === 'blast' && player.blastCount > 0) {
          player.blastCount -= 1
        } else if (lastRecord.type === 'clear' && player.clearCount > 0) {
          player.clearCount -= 1
        } else if (lastRecord.type === 'normal' && player.normalCount > 0) {
          player.normalCount -= 1
        }
      }
      
      this.saveGameState()
    },
    
    getWinner() {
      return this.players.find(player => player && (player.wins || 0) >= this.winGames)
    },
    
    getWinnerIndex() {
      return this.players.findIndex(player => player && (player.wins || 0) >= this.winGames)
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
        if (player) {
          player.wins = 0
          player.blastCount = 0
          player.clearCount = 0
          player.normalCount = 0
        }
      })
      this.currentGame = 1
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
    
    saveGameState() {
      const gameState = {
        players: this.players,
        currentGame: this.currentGame,
        gameHistory: this.gameHistory,
        totalGames: this.totalGames,
        winGames: this.winGames
      }
      uni.setStorageSync('eightBallGameState', gameState)
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #C62828;
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

.player-score.winner .player-name {
  color: #FFFFFF;
}

.player-wins {
  display: block;
  font-size: 22rpx;
  color: #666666;
}

.player-stats {
  display: flex;
  flex-direction: column;
  gap: 2rpx;
  margin-top: 8rpx;
}

.stat-item {
  font-size: 20rpx;
  color: #888888;
  line-height: 1.2;
}

.player-score.winner .stat-item {
  color: rgba(255, 255, 255, 0.8);
}

.player-score.winner .player-wins {
  color: rgba(255, 255, 255, 0.9);
}

.score-display {
  text-align: right;
}

.score-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #4CAF50;
}

.player-score.winner .score-number {
  color: #FFFFFF;
}

.score-label {
  font-size: 24rpx;
  color: #999999;
}

.player-score.winner .score-label {
  color: rgba(255, 255, 255, 0.8);
}

.current-game {
  text-align: center;
  padding: 30rpx 40rpx;
  position: relative;
  z-index: 1;
}

.current-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 8rpx;
}

.current-subtitle {
  display: block;
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
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
  gap: 16rpx;
}

.score-btn {
  flex: 1;
  height: 100rpx;
  border: none;
  border-radius: 12rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.blast-clear {
  background: linear-gradient(135deg, #E91E63, #F06292);
}

.clear {
  background: linear-gradient(135deg, #FF9800, #FFB74D);
}

.normal-win {
  background: linear-gradient(135deg, #4CAF50, #81C784);
}

.score-btn:active {
  transform: scale(0.95);
}

.btn-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 4rpx;
}

.btn-score {
  font-size: 20rpx;
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

.history-game {
  font-size: 24rpx;
  color: #999999;
  width: 100rpx;
}

.history-detail {
  flex: 1;
  font-size: 26rpx;
  color: #333333;
  margin-left: 20rpx;
}

.history-score {
  font-size: 24rpx;
  color: #4CAF50;
  font-weight: bold;
}
</style>