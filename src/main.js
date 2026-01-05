import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import StudentApp from './views/StudentApp.vue'
import ParentAdmin from './views/ParentAdmin.vue'
import ControlWindow from './views/ControlWindow.vue'

const routes = [
  { path: '/', redirect: '/student' },
  { path: '/student', component: StudentApp },
  { path: '/parent', component: ParentAdmin },
  { path: '/control', component: ControlWindow },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
