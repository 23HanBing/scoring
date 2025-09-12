<template>
  <view class="container">
    <!-- 骨架屏 -->
    <view v-if="isLoading" class="skeleton-container">
      <view class="skeleton-header">
        <view class="skeleton-title"></view>
        <view class="skeleton-subtitle"></view>
      </view>
      <view class="skeleton-card"></view>
      <view class="skeleton-card"></view>
    </view>

    <!-- 实际内容 -->
    <view v-else class="content-wrapper fade-in">
      <view class="header">
        <text class="title">斯诺克设置</text>
        <text class="subtitle">设置玩家、红球数与高级提示</text>
      </view>

      <view class="form-container">
        <view class="form-section">
          <text class="section-title">玩家信息</text>
          <view class="form-item">
            <text class="label">玩家1</text>
            <input class="input" v-model="playerA" placeholder="输入玩家1名称"/>
          </view>
          <view class="form-item">
            <text class="label">玩家2</text>
            <input class="input" v-model="playerB" placeholder="输入玩家2名称"/>
          </view>
        </view>

        <view class="form-section">
          <text class="section-title">比赛设置</text>
          <view class="form-item">
            <text class="label">红球数</text>
            <view class="options">
              <button :class="['option-btn', { active: reds===15 }]" @tap="reds=15">15</button>
              <button :class="['option-btn', { active: reds===10 }]" @tap="reds=10">10</button>
              <button :class="['option-btn', { active: reds===6 }]" @tap="reds=6">6</button>
            </view>
          </view>
          <view class="form-item switch-item">
            <text class="label">Miss 提示</text>
            <switch :checked="missHint" @change="e=>missHint=e.detail.value"/>
          </view>
          <view class="form-item switch-item">
            <text class="label">Free Ball 指引</text>
            <switch :checked="freeBallGuide" @change="e=>freeBallGuide=e.detail.value"/>
          </view>
        </view>
      </view>

      <view class="bottom-bar">
        <button class="primary-btn" @tap="startGame">开始比赛</button>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      isLoading: true,
      playerA: '玩家1',
      playerB: '玩家2',
      reds: 15,
      missHint: true,
      freeBallGuide: true
    }
  },
  onShow() {
    setTimeout(() => {
      this.isLoading = false
    }, 100)
  },
  methods: {
    startGame() {
      if (!this.playerA || !this.playerB) {
        uni.showToast({title: '请填写玩家姓名', icon: 'none'})
        return
      }
      // 先将设置缓存到本地，后续由对局页读取（纯前端）
      uni.setStorageSync('snooker:setup', {
        playerA: this.playerA,
        playerB: this.playerB,
        reds: this.reds,
        missHint: this.missHint,
        freeBallGuide: this.freeBallGuide
      })
      uni.navigateTo({
        url: '/pages/snooker-game/snooker-game',
        animationType: 'slide-in-right',
        animationDuration: 300
      })
    }
  },
  // 转发给好友
  onShareAppMessage(res) {
    return {
      title: '斯诺克计分器 - 比赛设置',
      path: '/pages/snooker-mode/snooker-mode',
      imageUrl: '/static/logo.png'
    }
  },
  // 分享到朋友圈
  onShareTimeline(res) {
    return {
      title: '斯诺克计分器 - 比赛设置',
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
  position: relative
}

.header {
  text-align: center;
  padding: 80rpx 0 40rpx;
  position: relative;
  z-index: 1
}

.title {
  display: block;
  font-size: 52rpx;
  font-weight: bold;
  color: #FFF;
  margin-bottom: 12rpx;
  text-shadow: 0 2px 4px rgba(0, 0, 0, .3)
}

.subtitle {
  display: block;
  font-size: 26rpx;
  color: rgba(255, 255, 255, .8);
  line-height: 1.4
}

.form-container {
  padding: 0 40rpx;
  position: relative;
  z-index: 1
}

.form-section {
  background: rgba(255, 255, 255, .95);
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 30rpx;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, .1)
}

.section-title {
  display: block;
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 24rpx
}

.form-item {
  margin-bottom: 20rpx
}

.form-item:last-child {
  margin-bottom: 0
}

.label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 12rpx
}

.input {
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 0 20rpx
}

.options {
  display: flex;
  gap: 16rpx
}

.option-btn {
  flex: 1;
  min-width: 140rpx;
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center
}

.option-btn.active {
  background: #2E7D32;
  color: #fff
}

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between
}

.bottom-bar {
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20rpx 40rpx 40rpx;
  background: linear-gradient(180deg, rgba(66, 66, 66, 0), rgba(66, 66, 66, 0.6))
}

.primary-btn {
  width: 100%;
  height: 88rpx;
  background: #2E7D32;
  color: #fff;
  border-radius: 16rpx;
  font-size: 32rpx
}

/* 骨架屏与淡入 */
.skeleton-container {
  padding: 40rpx
}

.skeleton-header {
  margin-bottom: 20rpx
}

.skeleton-title, .skeleton-subtitle, .skeleton-card {
  background: rgba(255, 255, 255, .2);
  border-radius: 12rpx
}

.skeleton-title {
  height: 48rpx;
  width: 60%;
  margin-bottom: 12rpx
}

.skeleton-subtitle {
  height: 28rpx;
  width: 40%
}

.skeleton-card {
  height: 120rpx;
  margin-top: 16rpx
}

.fade-in {
  animation: fadeIn .3s ease-in
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6rpx)
  }
  to {
    opacity: 1;
    transform: translateY(0)
  }
}
</style>