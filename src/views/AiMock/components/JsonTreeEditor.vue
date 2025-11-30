<template>
  <div class="json-tree-editor">
    <el-tree
      v-if="isJson"
      :data="nodes"
      :props="treeProps"
      node-key="pathKey"
    >
      <template #default="{ data }">
        <div
          class="node"
          @dblclick="startEdit(data)"
        >
          <span class="node-key">{{ data.key }}</span>
          <span
            v-if="data.isLeaf"
            class="node-sep"
            >:
          </span>
          <span
            v-if="data.isLeaf && !data.editing"
            class="node-value"
            >{{ formatPrimitive(data.value) }}</span
          >
          <el-input
            v-if="data.isLeaf && data.editing"
            v-model="data.editBuffer"
            size="small"
            @blur="commitEdit(data)"
            @keyup.enter="commitEdit(data)"
            class="node-input"
          />
        </div>
      </template>
    </el-tree>

    <div
      v-else
      class="fallback-wrapper"
    >
      <div :class="['fallback', { expanded }]">
        {{ stringValue }}
      </div>
      <button
        v-if="collapsible && stringValue.length > 100"
        class="btn-toggle"
        @click="expanded = !expanded"
      >
        <span>{{ expanded ? '收起' : '展开' }}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { JsonTreeNode, JsonModelValue } from '@/types/jsonTree.ts'

const props = defineProps<{
  modelValue: JsonModelValue
  collapsible?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: string): void
}>()

const rootObj = ref<any>(null)
const nodes = ref<JsonTreeNode[]>([])
const expanded = ref(false)
const treeProps = { children: 'children' }

const stringValue = computed(() =>
  typeof props.modelValue === 'string'
    ? props.modelValue
    : JSON.stringify(props.modelValue, null, 2)
)

watch(
  () => props.modelValue,
  (val) => {
    try {
      const parsed = typeof val === 'string' ? JSON.parse(val) : val
      rootObj.value = parsed
      nodes.value = buildNodes(parsed, [])
    } catch {
      rootObj.value = null
      nodes.value = []
    }
    expanded.value = false
  },
  { immediate: true }
)

const isJson = computed(() => rootObj.value !== null && typeof rootObj.value === 'object')

/**
 * 构建树节点列表
 * @param obj 原始对象或数组
 * @param path 当前路径（用于生成唯一 pathKey）
 */
function buildNodes(obj: any, path: (string | number)[]): JsonTreeNode[] {
  if (Array.isArray(obj)) {
    return obj.map((item, idx) => toNode(item, `[${idx}]`, path.concat(idx)))
  }
  if (obj && typeof obj === 'object') {
    return Object.keys(obj).map((key) => toNode((obj as any)[key], key, path.concat(key)))
  }
  return [toNode(obj, '', path)]
}

/**
 * 将任意值转换为树节点
 * @param value 当前值
 * @param key 键名（对象键或数组索引的展示文本）
 * @param path 路径数组
 */
function toNode(value: any, key: string, path: (string | number)[]): JsonTreeNode {
  if (value && typeof value === 'object') {
    return {
      key,
      children: buildNodes(value, path),
      path,
      pathKey: path.join('/'),
      isLeaf: false
    }
  }
  return {
    key,
    value,
    path,
    pathKey: path.join('/'),
    isLeaf: true,
    editing: false,
    editBuffer: ''
  }
}

/**
 * 将基本类型格式化为展示文本
 * @param v 基本类型值
 */
function formatPrimitive(v: any): string {
  if (typeof v === 'string') return `"${v}"`
  if (v === null) return 'null'
  return String(v)
}

/**
 * 根据原值类型将输入字符串转换为合适的类型
 * @param input 用户输入的文本
 * @param original 原始值（用于确定目标类型）
 */
function coerceValue(input: string, original: any): any {
  if (typeof original === 'number') {
    const n = Number(input)
    return Number.isNaN(n) ? input : n
  }
  if (typeof original === 'boolean') {
    const s = input.toLowerCase()
    if (s === 'true') return true
    if (s === 'false') return false
    return input
  }
  if (original === null) {
    return input.toLowerCase() === 'null' ? null : input
  }
  return input
}

/**
 * 开始编辑叶子节点
 * @param node 目标节点
 */
function startEdit(node: JsonTreeNode) {
  if (!node.isLeaf) return
  node.editing = true
  node.editBuffer = typeof node.value === 'string' ? node.value : String(node.value)
}

/**
 * 提交节点编辑并更新模型
 * @param node 目标节点
 */
function commitEdit(node: JsonTreeNode) {
  if (!node.isLeaf) return
  node.editing = false
  const raw = (node.editBuffer ?? '').trim()
  const newVal = coerceValue(raw, node.value)
  node.value = newVal
  setByPath(rootObj.value, node.path, newVal)
  emit('update:modelValue', JSON.stringify(rootObj.value, null, 2))
}

/**
 * 通过路径设置对象中的值
 * @param obj 根对象
 * @param path 路径数组
 * @param value 要设置的新值
 */
function setByPath(obj: any, path: (string | number)[], value: any) {
  if (!path.length) return
  let cur = obj
  for (let i = 0; i < path.length - 1; i++) {
    cur = cur[path[i] as any]
  }
  cur[path[path.length - 1] as any] = value
}
</script>

<style scoped lang="less">
.json-tree-editor {
  font-family: 'SF Mono', Monaco, Consolas, monospace;
  font-size: 12px;
  color: #1d1d1f;

  .node {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 4px;

    .node-key { font-weight: 600; color: #374151; }
    .node-sep { color: #6b7280; }
    .node-value { color: #111827; }

    .node-input {
      :deep(.el-input__inner) {
        height: 24px;
        line-height: 24px;
        font-size: 12px;
      }
    }
  }

  .fallback-wrapper {
    position: relative;

    .fallback {
      background: #ffffff;
      color: #6b7280;
      border: 1px solid #e8e8e8;
      border-radius: 6px;
      padding: 8px;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 60px;
      overflow: hidden;
      position: relative;

      &.expanded { max-height: none; }
      &:not(.expanded)::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        height: 20px;
        background: linear-gradient(to bottom, transparent, white);
        pointer-events: none;
      }
    }

    .btn-toggle {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      margin-top: 6px;
      padding: 4px 10px;
      background: white;
      color: #6b7280;
      border: 1px solid #e8e8e8;
      border-radius: 5px;
      font-size: 11px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: #f9fafb;
        border-color: #6b7cff;
        color: #1d1d1f;
      }
      svg {
        width: 12px;
        height: 12px;
        transition: transform 0.2s;
      }
    }
  }
}
</style>
