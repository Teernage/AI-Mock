<template>
  <div class="header-card">
    <div class="hero">
      <div class="titles">
        <h1>API Mock</h1>
        <p>轻量级接口模拟工具</p>
      </div>
      <button
        class="btn-open-tab"
        @click="openInNewTab"
      >
        在新标签页中打开
      </button>
    </div>
    <div class="stats">
      <div class="stat">
        <div class="num">{{ p.total ?? 0 }}</div>
        <div class="label">总规则</div>
      </div>
      <div class="stat enabled">
        <div class="num">{{ p.enabled ?? 0 }}</div>
        <div class="label">已启用</div>
      </div>
      <div class="stat disabled">
        <div class="num">{{ p.disabled ?? 0 }}</div>
        <div class="label">已禁用</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const p = defineProps<{ total?: number; enabled?: number; disabled?: number }>()
/**
 * 在新标签页中打开
 */
const openInNewTab = () => {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.create({ url: window.location.href })
  }
}
</script>

<style scoped lang="less">
.header-card {
  border-radius: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #6b7cff 0%, #8b9aff 100%);
  box-shadow: 0 8px 24px rgba(107, 124, 255, 0.15);
  overflow: hidden;
}
.hero {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  color: #fff;
}
.titles h1 {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}
.titles p {
  font-size: 12px;
  opacity: 0.9;
  margin-top: 6px;
}
.btn-open-tab {
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.92);
  color: #4f46e5;
  border: none;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.btn-open-tab:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(107, 124, 255, 0.25);
}
.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 14px;
}

.stat {
  background: #fff;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-height: 56px;
  box-shadow: 0 6px 18px rgba(107, 124, 255, 0.18);
}
.stat .icon {
  font-size: 18px;
}
.stat .num {
  font-size: 20px;
  font-weight: 700;
  color: #1d1d1f;
  font-variant-numeric: tabular-nums;
}
.stat.enabled .num {
  color: #16a34a;
  font-weight: 800;
}
.stat.disabled .num {
  color: #ef4444;
  font-weight: 800;
}
.stat .label {
  font-size: 12px;
  color: #8e8e93;
}
</style>
