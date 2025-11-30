import { createRouter, createWebHashHistory } from 'vue-router'
import AiMock from '@/views/AiMock/AiMock.vue'

const routes = [
  {
    path: '/',
    name: 'AiMock',
    component: AiMock
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
})

export default router
