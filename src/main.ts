import { createApp, App } from 'vue'
import VueRouter from '@/router'

import Layout from '@/Layout.vue'

const app: App = createApp(Layout)

app.use(VueRouter)
app.mount('#app')
