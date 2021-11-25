<template lang="pug">
Loading
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import axios from '@/axios'
import Loading from '@/components/Loading.vue'

export default defineComponent({
	name: 'Link',

	components: {
		Loading
	},

	setup() {
		const { params } = useRoute()
		const { push } = useRouter()
		const { username, count } = params

		onMounted(async () => {
			try {
				const { data, status } = await axios.get(`/${username}/${count}`)

				if (status === 200) {
					window.location.href = data?.url
				}
			} catch (error: any) {
				push({ name: 'NotFound' })
			}
		})
	}
})
</script>
