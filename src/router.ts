import { nextTick } from '@vue/runtime-core'
import { createRouter, createWebHistory, Router, RouterHistory, RouteRecordRaw, isNavigationFailure } from 'vue-router'

import { appName } from '@/config.json'

import Home from '@/pages/Home.vue'

const routes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: 'Home',
		component: Home,
		meta: {
			title: 'Welcome'
		}
	}
]

const history: RouterHistory = createWebHistory()

const router: Router = createRouter({ routes, history })

router.afterEach((to, from, failure) => {
	if (isNavigationFailure(failure)) {
		console.error('Failed Navigation!')
	}

	nextTick(() => {
		document.title = String(to.meta.title ? `${to.meta.title} • ${appName}` : appName)
	})
})

export default router
