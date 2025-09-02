/**
 * 微信小程序性能监控工具
 * 根据官方文档建议实现的性能优化监控
 */

class PerformanceMonitor {
  constructor() {
    this.timers = new Map()
    this.metrics = {
      pageLoad: [],
      setDataCalls: [],
      renderTime: []
    }
  }

  // 开始计时
  startTimer(name) {
    this.timers.set(name, Date.now())
  }

  // 结束计时并记录
  endTimer(name, category = 'general') {
    const startTime = this.timers.get(name)
    if (startTime) {
      const duration = Date.now() - startTime
      this.timers.delete(name)
      
      if (!this.metrics[category]) {
        this.metrics[category] = []
      }
      
      this.metrics[category].push({
        name,
        duration,
        timestamp: Date.now()
      })
      
      // 开发环境下输出性能信息
      if (process.env.NODE_ENV === 'development') {
        console.log(`[性能监控] ${name}: ${duration}ms`)
      }
      
      return duration
    }
    return 0
  }

  // 监控setData调用
  monitorSetData(component, data, callback) {
    const startTime = Date.now()
    const dataSize = JSON.stringify(data).length
    
    // 记录setData调用信息
    this.metrics.setDataCalls.push({
      component: component.constructor.name || 'Unknown',
      dataSize,
      timestamp: startTime
    })
    
    // 如果数据量过大，发出警告
    if (dataSize > 1024) { // 1KB
      console.warn(`[性能警告] setData数据量过大: ${dataSize}字节，建议优化`)
    }
    
    // 执行原始setData
    if (component.setData) {
      component.setData(data, () => {
        const duration = Date.now() - startTime
        this.metrics.renderTime.push({
          component: component.constructor.name || 'Unknown',
          duration,
          dataSize,
          timestamp: Date.now()
        })
        
        if (callback) callback()
      })
    }
  }

  // 监控页面加载性能
  monitorPageLoad(pageName) {
    const startTime = Date.now()
    
    return {
      end: () => {
        const duration = Date.now() - startTime
        this.metrics.pageLoad.push({
          page: pageName,
          duration,
          timestamp: Date.now()
        })
        
        if (process.env.NODE_ENV === 'development') {
          console.log(`[页面加载] ${pageName}: ${duration}ms`)
        }
        
        return duration
      }
    }
  }

  // 获取性能报告
  getReport() {
    const report = {
      summary: {
        totalSetDataCalls: this.metrics.setDataCalls.length,
        avgRenderTime: this.getAverageTime(this.metrics.renderTime),
        avgPageLoadTime: this.getAverageTime(this.metrics.pageLoad),
        largeSetDataCalls: this.metrics.setDataCalls.filter(call => call.dataSize > 1024).length
      },
      details: this.metrics
    }
    
    return report
  }

  // 计算平均时间
  getAverageTime(timeArray) {
    if (timeArray.length === 0) return 0
    const total = timeArray.reduce((sum, item) => sum + item.duration, 0)
    return Math.round(total / timeArray.length)
  }

  // 清空监控数据
  clear() {
    this.timers.clear()
    this.metrics = {
      pageLoad: [],
      setDataCalls: [],
      renderTime: []
    }
  }

  // 输出性能建议
  getOptimizationSuggestions() {
    const suggestions = []
    
    // 检查setData调用频率
    if (this.metrics.setDataCalls.length > 50) {
      suggestions.push('setData调用过于频繁，建议合并多次调用')
    }
    
    // 检查数据传输量
    const largeDataCalls = this.metrics.setDataCalls.filter(call => call.dataSize > 1024)
    if (largeDataCalls.length > 0) {
      suggestions.push(`发现${largeDataCalls.length}次大数据量传输，建议优化数据结构`)
    }
    
    // 检查渲染时间
    const slowRenders = this.metrics.renderTime.filter(render => render.duration > 100)
    if (slowRenders.length > 0) {
      suggestions.push(`发现${slowRenders.length}次渲染耗时过长，建议检查模板复杂度`)
    }
    
    return suggestions
  }
}

// 创建全局实例
const performanceMonitor = new PerformanceMonitor()

// 导出监控工具
export default performanceMonitor

// 便捷方法
export const startTimer = (name) => performanceMonitor.startTimer(name)
export const endTimer = (name, category) => performanceMonitor.endTimer(name, category)
export const monitorPageLoad = (pageName) => performanceMonitor.monitorPageLoad(pageName)
export const getPerformanceReport = () => performanceMonitor.getReport()
export const getOptimizationSuggestions = () => performanceMonitor.getOptimizationSuggestions()