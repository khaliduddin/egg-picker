import { createApp } from 'vue'
import App from './App.vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import router from './router'
import VueKonva from 'vue-konva'
import store from './store'
//import Web3 from 'web3'

createApp(App).use(store).use(router).use(VueKonva).mount('#app')
