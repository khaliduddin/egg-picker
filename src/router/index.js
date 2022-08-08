import { createRouter, createWebHashHistory } from 'vue-router'
import MainPage from '../components/MainPage.vue'
import GamePage from '../components/GamePage.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: MainPage
  },
  {
    path: '/game',
    name: 'game',
    component: GamePage
  },
  {
    path: '/gameover',
    name: 'gameover',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../components/GameOverPage.vue')
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
