<template lang="pug">
span.icon
	svg(xmlns="http://www.w3.org/2000/svg" :width="width" :height="height" :stroke="color" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round")
		template(v-if="type === `close`")
			line(x1="18" y1="6" x2="6" y2="18")
			line(x1="6" y1="6" x2="18" y2="18")
		template(v-if="type === `trash`")
			polyline(points="3 6 5 6 21 6")
			path(d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2")
			line(x1="10" y1="11" x2="10" y2="17")
			line(x1="14" y1="11" x2="14" y2="17")
		template(v-if="type === `share`")
			circle(cx="18" cy="5" r="3")
			circle(cx="6" cy="12" r="3")
			circle(cx="18" cy="19" r="3")
			line(x1="8.59" y1="13.51" x2="15.42" y2="17.49")
			line(x1="15.41" y1="6.51" x2="8.59" y2="10.49")
		template(v-if="type === `copy`")
			rect(x="9" y="9" width="13" height="13" rx="2" ry="2")
			path(d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1")
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
	name: 'CloseIcon',

	props: {
		color: {
			type: String,
			default: `#fff`
		},
		width: {
			type: Number,
			default: 24
		},
		height: {
			type: Number,
			default: 24
		},
		type: {
			type: String,
			required: true
		}
	}
})
</script>

<style lang="scss">
.icon {
	padding: 2px;
	display: flex;
	align-items: center;
	justify-content: center;
}
</style>
