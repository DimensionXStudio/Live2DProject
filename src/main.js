import { createApp } from 'vue'
import App from './App.vue'

// pinia与持久化插件
import { createPinia } from 'pinia'
import piniaPluginPersist from "pinia-plugin-persist";

// element-ui-plus相关
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import 'element-plus/theme-chalk/index.css'
import 'element-plus/theme-chalk/dark/css-vars.css'
import zhCn from "element-plus/dist/locale/zh-cn.mjs"

import router from "@/router";


const pinia = createPinia()
pinia.use(piniaPluginPersist);

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
	app.component(key, component)
}

app.use(pinia)
app.use(ElementPlus,  {locale: zhCn})
app.use(router)
app.mount('#app')
