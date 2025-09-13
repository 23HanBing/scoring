<template>
  <view class="container">
    <!-- 骨架屏 -->
    <view v-if="isLoading" class="skeleton-container">
      <view class="skeleton-header">
        <view class="skeleton-title"></view>
        <view class="skeleton-subtitle"></view>
      </view>
      <view class="skeleton-cards">
        <view class="skeleton-card">
          <view class="skeleton-icon"></view>
          <view class="skeleton-content">
            <view class="skeleton-text skeleton-text-title"></view>
            <view class="skeleton-text skeleton-text-desc"></view>
          </view>
        </view>
        <view class="skeleton-card">
          <view class="skeleton-icon"></view>
          <view class="skeleton-content">
            <view class="skeleton-text skeleton-text-title"></view>
            <view class="skeleton-text skeleton-text-desc"></view>
          </view>
        </view>
      </view>
    </view>
    
    <!-- 实际内容 -->
    <view v-else class="content-container">
      <!-- 背景动画 -->
      <view class="background">
        <view class="ball ball-1"></view>
        <view class="ball ball-2"></view>
        <view class="ball ball-3"></view>
      </view>
      
      <!-- 标题区域 -->
      <view class="header">
        <text class="main-title">台球计分</text>
        <text class="sub-title">专业计分，精准记录</text>
      </view>
      
      <!-- 游戏模式选择 -->
      <view class="mode-container">
        <view class="mode-card eight-ball" @tap="selectEightBall">
          <view class="card-icon">
            <text class="ball-number">8</text>
          </view>
          <view class="card-content">
            <text class="card-title">中式八球</text>
            <text class="card-desc">局数制比赛\n炸清、接清、普胜</text>
          </view>
          <view class="card-arrow">›</view>
        </view>
        
        <view class="mode-card nine-ball" @tap="selectNineBall">
          <view class="card-icon">
            <text class="ball-number">9</text>
          </view>
          <view class="card-content">
            <text class="card-title">九球追分</text>
            <text class="card-desc">分数制比赛\n大金、小金、普胜、犯规</text>
          </view>
          <view class="card-arrow">›</view>
        </view>
        <view class="mode-card snooker" @tap="selectSnooker">
          <view class="card-icon">
            <text class="ball-number">S</text>
          </view>
          <view class="card-content">
            <text class="card-title">斯诺克</text>
            <text class="card-desc">专业斯诺克计分\n红-彩循环、清彩、犯规、自由球</text>
          </view>
          <view class="card-arrow">›</view>
        </view>
      </view>
      
      <!-- 底部信息 -->
      <view class="footer">
        <text class="version">v1.0.0</text>
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
      navigating: false
    }
  },
  onLoad() {
    // 监控主页加载性能
    this.pageLoadMonitor = performanceMonitor.monitorPageLoad('主页')
    
    // 预加载关键资源
    this.preloadResources()
  },
  onShow() {
    // 页面显示时快速隐藏骨架屏
    if (this.isLoading) {
      setTimeout(() => {
        this.isLoading = false
      }, 100)
    }
  },
  onReady() {
    // 页面渲染完成，结束监控
    this.isLoading = false
    if (this.pageLoadMonitor) {
      this.pageLoadMonitor.end()
    }
  },
  methods: {
    preloadResources() {
      // 微信小程序暂不支持 uni.preloadPage，使用其他优化方式
      // 可以预加载一些静态资源或进行数据预处理
      console.log('页面资源预处理完成')
    },
    selectEightBall() {
      if (this.navigating) return
      this.navigating = true
      performanceMonitor.startTimer('页面跳转-八球')
      uni.navigateTo({
        url: '/pages/room-setup/room-setup?mode=eight-ball',
        animationType: 'slide-in-right',
        animationDuration: 300,
        complete: () => {
          performanceMonitor.endTimer('页面跳转-八球', 'navigation')
          setTimeout(() => {
            this.navigating = false
          }, 400)
        }
      })
    },
    selectNineBall() {
      if (this.navigating) return
      this.navigating = true
      performanceMonitor.startTimer('页面跳转-九球')
      uni.navigateTo({
        url: '/pages/nine-ball-mode/nine-ball-mode',
        animationType: 'slide-in-right',
        animationDuration: 300,
        complete: () => {
          performanceMonitor.endTimer('页面跳转-九球', 'navigation')
          setTimeout(() => {
            this.navigating = false
          }, 400)
        }
      })
    },
    selectSnooker() {
      if (this.navigating) return
      this.navigating = true
      performanceMonitor.startTimer('页面跳转-斯诺克')
      uni.navigateTo({
        url: '/pages/snooker-mode/snooker-mode',
        animationType: 'slide-in-right',
        animationDuration: 300,
        complete: () => {
          performanceMonitor.endTimer('页面跳转-斯诺克', 'navigation')
          setTimeout(() => {
            this.navigating = false
          }, 400)
        }
      })
    }
  },
  // 转发给好友
  onShareAppMessage(res) {
    return {
      title: '台球计分器 - 专业计分工具',
      path: '/pages/index/index',
      imageUrl: '/static/logo.png'
    }
  },
  // 分享到朋友圈
  onShareTimeline(res) {
    return {
      title: '台球计分器 - 专业计分工具',
      query: 'from=timeline',
      imageUrl: '/static/logo.png'
    }
  }
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

/* 移除复杂的背景动画，保持简洁 */

.header {
  text-align: center;
  padding: 120rpx 0 80rpx;
  position: relative;
  z-index: 1;
}

.title {
  display: block;
  font-size: 64rpx;
  font-weight: bold;
  color: #ffffff;
  margin-bottom: 20rpx;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.sub-title {
  display: block;
  font-size: 28rpx;
  color: rgba(255, 255, 255, 0.9);
}

.mode-container {
  padding: 0 60rpx;
  position: relative;
  z-index: 2;
}

.mode-card {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20rpx;
  padding: 40rpx 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.15);
  border: 1rpx solid rgba(255, 255, 255, 0.2);
  position: relative;
  transition: all 0.3s ease;
}

.mode-card:hover {
  box-shadow: 0 12rpx 40rpx rgba(0, 0, 0, 0.2);
  transform: translateY(-4rpx);
  background: rgba(255, 255, 255, 0.98);
}



.eight-ball {
  border-left: 8rpx solid #C62828;
}

.nine-ball {
  border-left: 8rpx solid #1565C0;
}
.snooker {
  border-left: 8rpx solid #2E7D32;
}
.snooker .card-icon {
  background: #2E7D32;
}

.card-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 30rpx;
  position: relative;
}

.eight-ball .card-icon {
  background: #C62828;
}

.nine-ball .card-icon {
  background: #1565C0;
}

.ball-number {
  font-size: 48rpx;
  font-weight: bold;
  color: #FFFFFF;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.card-content {
  flex: 1;
}

.card-title {
  display: block;
  font-size: 36rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
}

.card-desc {
  display: block;
  font-size: 26rpx;
  color: #666666;
  line-height: 1.4;
}

.card-arrow {
  font-size: 48rpx;
  color: #CCCCCC;
  font-weight: bold;
}

.footer {
  position: absolute;
  bottom: 60rpx;
  left: 0;
  right: 0;
  text-align: center;
  z-index: 0;
  pointer-events: none;
}

.version {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.6);
}

/* 骨架屏样式 */
.skeleton-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0D4F0C 0%, #1B5E20 50%, #2E7D32 100%);
  padding: 120rpx 60rpx 60rpx;
}

.skeleton-header {
  text-align: center;
  margin-bottom: 80rpx;
}

.skeleton-title {
  width: 200rpx;
  height: 64rpx;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8rpx;
  margin: 0 auto 20rpx;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-subtitle {
  width: 160rpx;
  height: 28rpx;
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
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24rpx;
  padding: 40rpx 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.15);
}

.skeleton-icon {
  width: 100rpx;
  height: 100rpx;
  border-radius: 50%;
  background: rgba(200, 200, 200, 0.3);
  margin-right: 30rpx;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-content {
  flex: 1;
}

.skeleton-text {
  background: rgba(200, 200, 200, 0.3);
  border-radius: 4rpx;
  animation: skeleton-loading 1.5s ease-in-out infinite;
}

.skeleton-text-title {
  width: 120rpx;
  height: 36rpx;
  margin-bottom: 10rpx;
}

.skeleton-text-desc {
  width: 200rpx;
  height: 26rpx;
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

.content-container {
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
