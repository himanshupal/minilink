<template lang="pug">
.not-found
	.not-found__title Not Found
	.not-found__message The link you&apos;re following appears to be broken
	router-link.not-found__home(:to="{ name: `Home`, hash: `#register` }") Click here for homepage
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
	name: 'NotFound'
})
</script>
