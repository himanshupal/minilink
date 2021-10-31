<template lang="pug">
header.header
	.header__title {{ title }}
	.header__subtitle(v-if="!!subtitle") {{ subtitle }}
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
	name: 'Header',

	props: {
		title: {
			type: String,
			required: true
		},
		subtitle: {
			type: String
		}
	}
})
</script>
