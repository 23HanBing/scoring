<template>
  <view class="container">
    <!-- 背景装饰 -->
    <view class="background"></view>
    
    <!-- 标题区域 -->
    <view class="header">
      <text class="title">{{ modeTitle }}</text>
      <text class="subtitle">{{ modeSubtitle }}</text>
    </view>
    
    <!-- 设置表单 -->
    <view class="form-container">
      <!-- 游戏参数设置 -->
      <view class="form-section">
        <text class="section-title">游戏设置</text>
        
        <!-- 中式八球设置 -->
        <view v-if="gameMode === 'eight-ball'" class="setting-item">
          <text class="setting-label">总局数</text>
          <view class="setting-options">
            <view 
              v-for="option in gameOptions" 
              :key="option.value"
              class="option-btn"
              :class="{ active: selectedOption === option.value }"
              @tap="selectOption(option.value)"
            >
              <text class="option-text">{{ option.label }}</text>
            </view>
          </view>
        </view>
        
        <!-- 九球追分设置 -->
        <view v-if="gameMode.includes('nine-ball')" class="setting-item">
          <text class="setting-label">目标分数</text>
          <view class="setting-options">
            <view 
              v-for="option in scoreOptions" 
              :key="option.value"
              class="option-btn"
              :class="{ active: selectedScore === option.value }"
              @tap="selectScore(option.value)"
            >
              <text class="option-text">{{ option.label }}</text>
            </view>
          </view>
        </view>
      </view>
      
      <!-- 玩家信息设置 -->
      <view class="form-section">
        <text class="section-title">玩家信息</text>
        
        <view class="player-inputs">
          <view 
            v-for="(player, index) in players" 
            :key="index"
            class="player-input-item"
          >
            <view class="player-avatar" :class="`player-${index + 1}`">
              <text class="player-number">{{ index + 1 }}</text>
            </view>
            <input 
              class="player-input"
              :placeholder="`玩家${index + 1}姓名`"
              v-model="players[index].name"
              maxlength="8"
            />
          </view>
        </view>
      </view>
    </view>
    
    <!-- 开始按钮 -->
    <view class="start-container">
      <button class="start-btn" :class="gameMode" @tap="startGame" :disabled="!canStart">
        <text class="start-text">开始比赛</text>
      </button>
    </view>
    
    <!-- 规则提示 -->
    <view class="rules-tip" v-if="gameMode.includes('nine-ball')">
      <text class="tip-text">💡 {{ ruleTip }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      gameMode: '',
      selectedOption: 0, // 默认无限制
      selectedScore: 100, // 默认100分
      players: [],
      gameOptions: [
        { label: '无限制', value: 0 },
        { label: '5局3胜', value: 5 },
        { label: '7局4胜', value: 7 },
        { label: '9局5胜', value: 9 }
      ],
      scoreOptions: [
        { label: '100分', value: 100 },
        { label: '无限制', value: 0 }
      ]
    }
  },
  computed: {
    modeTitle() {
      const titles = {
        'eight-ball': '中式八球',
        'nine-ball-2p': '九球二人追分',
        'nine-ball-3p': '九球三人追分'
      }
      return titles[this.gameMode] || '房间设置'
    },
    modeSubtitle() {
      const subtitles = {
        'eight-ball': '局数制比赛，先达到目标局数获胜',
        'nine-ball-2p': '分数制比赛，零和游戏',
        'nine-ball-3p': '三方零和，需选择对战双方'
      }
      return subtitles[this.gameMode] || '请完成设置'
    },
    ruleTip() {
      if (this.gameMode === 'nine-ball-2p') {
        return '两人总分始终为0，一方得分另一方失分'
      } else if (this.gameMode === 'nine-ball-3p') {
        return '三人总分为0，每次得分需选择对战双方'
      }
      return ''
    },
    canStart() {
      return this.players.every(player => player.name.trim().length > 0)
    }
  },
  onLoad(options) {
    this.gameMode = options.mode || 'eight-ball'
    this.initPlayers()
  },
  methods: {
    initPlayers() {
      const playerCount = this.gameMode === 'nine-ball-3p' ? 3 : 2
      this.players = Array.from({ length: playerCount }, (_, index) => ({
        name: `玩家${index + 1}`,
        id: index + 1
      }))
    },
    selectOption(value) {
      this.selectedOption = value
    },
    selectScore(value) {
      this.selectedScore = value
    },
    startGame() {
      if (!this.canStart) {
        uni.showToast({
          title: '请填写所有玩家姓名',
          icon: 'none'
        })
        return
      }
      
      // 构建游戏数据
      const gameData = {
        mode: this.gameMode,
        players: this.players,
        settings: {}
      }
      
      if (this.gameMode === 'eight-ball') {
        if (this.selectedOption === 0) {
          // 无限制模式
          gameData.settings.totalGames = 0
          gameData.settings.winGames = 0
        } else {
          gameData.settings.totalGames = this.selectedOption
          gameData.settings.winGames = Math.ceil(this.selectedOption / 2)
        }
      } else {
        gameData.settings.targetScore = this.selectedScore
      }
      
      // 保存游戏数据
      uni.setStorageSync('currentGame', gameData)
      
      // 跳转到对应的游戏页面
      const pageMap = {
        'eight-ball': '/pages/eight-ball-game/eight-ball-game',
        'nine-ball-2p': '/pages/nine-ball-2p/nine-ball-2p',
        'nine-ball-3p': '/pages/nine-ball-3p/nine-ball-3p'
      }
      
      uni.navigateTo({
        url: pageMap[this.gameMode],
        animationType: 'slide-in-right',
        animationDuration: 300
      })
    }
  },
  // 转发给好友
  onShareAppMessage(res) {
    return {
      title: '台球计分器 - 房间设置',
      path: '/pages/room-setup/room-setup',
      imageUrl: '/static/logo.png'
    }
  },
  // 分享到朋友圈
  onShareTimeline(res) {
    return {
      title: '台球计分器 - 房间设置',
      query: 'from=timeline',
      imageUrl: '/static/logo.png'
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: #424242;
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
  text-align: center;
  padding: 80rpx 0 40rpx;
  position: relative;
  z-index: 1;
}

.title {
  display: block;
  font-size: 52rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 12rpx;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.4;
}

.form-container {
  padding: 0 40rpx;
  position: relative;
  z-index: 1;
}

.form-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.1);
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 24rpx;
}

.setting-item {
  margin-bottom: 20rpx;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  font-size: 28rpx;
  color: #666666;
  margin-bottom: 16rpx;
}

.setting-options {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
}

.option-btn {
  flex: 1;
  min-width: 140rpx;
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border: 2rpx solid transparent;
}

.option-btn.active {
  background: #E3F2FD;
  border-color: #1976D2;
}

.option-btn:active {
  transform: scale(0.95);
}

.option-text {
  font-size: 26rpx;
  color: #333333;
  font-weight: 500;
}

.option-btn.active .option-text {
  color: #1976D2;
  font-weight: bold;
}

.player-inputs {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.player-input-item {
  display: flex;
  align-items: center;
  gap: 20rpx;
}

.player-avatar {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.player-1 {
  background: linear-gradient(135deg, #FF5722, #FF7043);
}

.player-2 {
  background: linear-gradient(135deg, #2196F3, #42A5F5);
}

.player-3 {
  background: linear-gradient(135deg, #9C27B0, #BA68C8);
}

.player-number {
  font-size: 32rpx;
  font-weight: bold;
  color: #FFFFFF;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.player-input {
  flex: 1;
  height: 80rpx;
  background: #F8F9FA;
  border: 2rpx solid #E0E0E0;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  color: #333333;
}

.player-input:focus {
  border-color: #1976D2;
  background: #FFFFFF;
}

.start-container {
  padding: 40rpx;
  position: relative;
  z-index: 1;
}

.start-btn {
  width: 100%;
  height: 100rpx;
  border-radius: 50rpx;
  border: none;
  font-size: 32rpx;
  font-weight: bold;
  color: #FFFFFF;
  transition: all 0.3s ease;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.15);
}

.start-btn.eight-ball {
  background: linear-gradient(135deg, #C62828, #E53935);
}

.start-btn.nine-ball-2p {
  background: linear-gradient(135deg, #1565C0, #1976D2);
}

.start-btn.nine-ball-3p {
  background: linear-gradient(135deg, #6A1B9A, #7B1FA2);
}

.start-btn:disabled {
  background: #CCCCCC !important;
  color: #999999 !important;
  box-shadow: none;
}

.start-btn:not(:disabled):active {
  transform: scale(0.98);
}

.start-text {
  font-size: 32rpx;
  font-weight: bold;
}

.rules-tip {
  margin: 0 40rpx 40rpx;
  padding: 20rpx;
  background: rgba(255, 193, 7, 0.1);
  border: 1rpx solid rgba(255, 193, 7, 0.3);
  border-radius: 12rpx;
  position: relative;
  z-index: 1;
}

.tip-text {
  font-size: 24rpx;
  color: #F57F17;
  line-height: 1.4;
}
</style>