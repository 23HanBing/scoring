<template>
  <view class="container">
    <!-- 骨架屏 -->
    <view v-if="isLoading" class="skeleton-container">
      <view class="skeleton-header">
        <view class="skeleton-title"></view>
        <view class="skeleton-subtitle"></view>
      </view>
      <view class="skeleton-cards">
        <view class="skeleton-card"></view>
        <view class="skeleton-card"></view>
      </view>
    </view>
    
    <!-- 实际内容 -->
    <view v-else class="content-wrapper">
      <!-- 背景 -->
      <view class="background"></view>
      
      <!-- 标题 -->
      <view class="header">
        <text class="title">选择九球模式</text>
        <text class="subtitle">请选择参与人数</text>
      </view>
    
    <!-- 模式选择 -->
    <view class="mode-container">
      <view class="mode-card two-player" @tap="selectTwoPlayer">
        <view class="card-icon">
          <text class="player-number">2P</text>
        </view>
        <view class="card-content">
          <text class="card-title">二人追分</text>
          <text class="card-desc">零和游戏，总分恒为0\n大金+10，小金+7，普胜+4，犯规-1</text>
        </view>
        <view class="card-arrow">›</view>
      </view>
      
      <view class="mode-card three-player" @tap="selectThreePlayer">
        <view class="card-icon">
          <text class="player-number">3P</text>
        </view>
        <view class="card-content">
          <text class="card-title">三人追分</text>
          <text class="card-desc">三方零和，需选择对战双方\n赢方得分，败方失分，第三方不变</text>
        </view>
        <view class="card-arrow">›</view>
      </view>
    </view>
    
    <!-- 规则说明 -->
    <view class="rules-section">
      <view class="rules-header" @tap="toggleRules">
        <text class="rules-title">规则说明</text>
        <text class="rules-toggle">{{ showRules ? '▲' : '▼' }}</text>
      </view>
      <view class="rules-content" v-if="showRules">
        <view class="rule-item">
          <text class="rule-title">大金：</text>
          <text class="rule-desc">开球有下球并一次清完，获得10分</text>
        </view>
        <view class="rule-item">
          <text class="rule-title">小金：</text>
          <text class="rule-desc">桌面上有一号球和九号球并依次清完，获得7分</text>
        </view>
        <view class="rule-item">
          <text class="rule-title">普胜：</text>
          <text class="rule-desc">正常打进九号球，获得4分</text>
        </view>
        <view class="rule-item">
          <text class="rule-title">犯规：</text>
          <text class="rule-desc">违规操作，扣除1分</text>
        </view>
      </view>
    </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      showRules: false,
      isLoading: true
    }
  },
  onShow() {
    // 页面显示时快速隐藏骨架屏
    setTimeout(() => {
      this.isLoading = false
    }, 100)
  },
  onReady() {
    this.isLoading = false
  },
  methods: {
    selectTwoPlayer() {
      uni.navigateTo({
        url: '/pages/room-setup/room-setup?mode=nine-ball-2p',
        animationType: 'slide-in-right',
        animationDuration: 300
      })
    },
    selectThreePlayer() {
      uni.navigateTo({
        url: '/pages/room-setup/room-setup?mode=nine-ball-3p',
        animationType: 'slide-in-right',
        animationDuration: 300
      })
    },
    toggleRules() {
      this.showRules = !this.showRules
    }
  },
  // 转发给好友
  onShareAppMessage(res) {
    return {
      title: '九球计分器 - 模式选择',
      path: '/pages/nine-ball-mode/nine-ball-mode',
      imageUrl: '/static/logo.png'
    }
  },
  // 分享到朋友圈
  onShareTimeline(res) {
    return {
      title: '九球计分器 - 模式选择',
      query: 'from=timeline',
      imageUrl: '/static/logo.png'
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%);
  position: relative;
  overflow: hidden;
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
  padding: 100rpx 0 60rpx;
  position: relative;
  z-index: 1;
}

.title {
  display: block;
  font-size: 56rpx;
  font-weight: bold;
  color: #FFFFFF;
  margin-bottom: 16rpx;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.8);
}

.mode-container {
  padding: 0 50rpx;
  position: relative;
  z-index: 1;
}

.mode-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20rpx;
  padding: 35rpx 25rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 3rpx 12rpx rgba(0, 0, 0, 0.15);
  position: relative;
}



.two-player {
  border-left: 6rpx solid #1565C0;
}

.three-player {
  border-left: 6rpx solid #6A1B9A;
}

.card-icon {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 25rpx;
}

.two-player .card-icon {
  background: linear-gradient(135deg, #1565C0, #1976D2);
}

.three-player .card-icon {
  background: linear-gradient(135deg, #6A1B9A, #7B1FA2);
}

.player-number {
  font-size: 32rpx;
  font-weight: bold;
  color: #FFFFFF;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.card-content {
  flex: 1;
}

.card-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 8rpx;
}

.card-desc {
  display: block;
  font-size: 24rpx;
  color: #666666;
  line-height: 1.4;
}

.card-arrow {
  font-size: 40rpx;
  color: #CCCCCC;
  font-weight: bold;
}

.rules-section {
  margin: 40rpx 50rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16rpx;
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1rpx solid #E0E0E0;
}

.rules-title {
  font-size: 30rpx;
  font-weight: bold;
  color: #333333;
}

.rules-toggle {
  font-size: 24rpx;
  color: #666666;
  transition: transform 0.3s ease;
}

.rules-content {
  padding: 20rpx 30rpx 30rpx;
  background: rgba(255, 255, 255, 0.95);
}

.rule-item {
  display: flex;
  margin-bottom: 16rpx;
}

.rule-item:last-child {
  margin-bottom: 0;
}

.rule-title {
  font-size: 26rpx;
  font-weight: bold;
  color: #1565C0;
  width: 120rpx;
  flex-shrink: 0;
}

.rule-desc {
  font-size: 26rpx;
  color: #666666;
  flex: 1;
}

/* 骨架屏样式 */
.skeleton-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0D47A1 0%, #1565C0 50%, #1976D2 100%);
  padding: 120rpx 60rpx 60rpx;
}

.skeleton-header {
  text-align: center;
  margin-bottom: 80rpx;
}

.skeleton-title {
  width: 240rpx;
  height: 48rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8rpx;
  margin: 0 auto 20rpx;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-subtitle {
  width: 180rpx;
  height: 32rpx;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 6rpx;
  margin: 0 auto;
  animation: skeleton-loading 1.5s ease-in-out infinite 0.2s;
}

.skeleton-cards {
  display: flex;
  flex-direction: column;
  gap: 40rpx;
}

.skeleton-card {
  height: 140rpx;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

@keyframes skeleton-loading {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

.content-wrapper {
  opacity: 0;
  animation: fadeIn 0.3s ease-in-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>