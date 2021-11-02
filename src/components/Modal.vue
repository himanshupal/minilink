<template lang="pug">
aside.modal
	.modal__content
		Icon.icon.icon--close(type="close" @click="$emit(`close`)")
		slot
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import Icon from '../components/Icon.vue'

export default defineComponent({
	name: 'Modal',

	components: {
		Icon
	}
})
</script>
