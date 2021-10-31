import { nextTick } from '@vue/runtime-core'
import { createRouter, createWebHistory, Router, RouterHistory, RouteRecordRaw, isNavigationFailure } from 'vue-router'

import { appName } from '@/config.json'

import Home from '@/pages/Home.vue'
import Links from '@/pages/Links.vue'

const routes: Array<RouteRecordRaw> = [
	{
		path: `/`,
		name: `Home`,
		component: Home
	},
	{
		path: `/:username`,
		name: `Links`,
		component: Links,
		meta: {
			title: `Links`
		}
	}
]

const history: RouterHistory = createWebHistory()

const router: Router = createRouter({ routes, history })

router.afterEach((to, from, failure) => {
	if (isNavigationFailure(failure)) {
		console.warn(`Couldn't navigate from ${from.fullPath} to ${to.fullPath}`)
		console.warn(failure.message)
	}

	nextTick(() => {
		document.title = String(to.meta.title ? `${to.meta.title} • ${appName}` : appName)
	})
})

export default router
