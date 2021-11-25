<template lang="pug">
Header(:title="path" subtitle="URL Shortner")
section.home
	.home__tabs
		button.home__tab(:class="{ selected: userType === `new`}" @click="userType = `new`") New User
		button.home__tab(:class="{ selected: userType === `existing`}" @click="userType = `existing`") I have a Username
	form.home__form(@submit.prevent="proceed")
		.home__form__field
			label.label(for="username") Username
			input.input(name="username" v-model.trim="username" autofocus)
			label.label.label--error(v-if="!!error.username") {{ error.username }}
		transition(name="bounce")
			.home__form__field(v-if="userType === `new`")
				label.label(for="password") Password
				input.input(name="password" type="password" v-model.trim="password")
				label.label.label--error(v-if="!!error.password") {{ error.password }}
		.home__form__field
			button.button(type="submit") {{ buttonText }}
			label.label.label--info(v-if="showInfo" @click="userType = `new`") Can't remember username? Just create a new account, old one will be deleted automatically after 180 days of inactivity
			transition(name="bounce")
				label.label(v-if="!isEmptyObject(serverMessage)" :class="[ `label--${serverMessage.type}` ]") {{ serverMessage.value }}
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AxiosError } from 'axios'

import Header from '@/components/Header.vue'
import axios from '@/axios'

type ErrorFields = {
	username?: string
	password?: string
}

type ServerMessage = {
	type?: `error` | `message`
	value?: string
}

type UserType = `existing` | `new`

const validate = (data: string, name: string, minLength: number, maxLength?: number): string => {
	if (!data.length) {
		return `Please provide a ${name}`
	} else if (data.length < minLength) {
		return `${name.charAt(0).toUpperCase() + name.slice(1)} must contain atleast ${minLength} characters`
	}

	if (maxLength) {
		if (data.length > maxLength) {
			return `${name.charAt(0).toUpperCase() + name.slice(1)} can't be more than ${maxLength} characters`
		}
	}

	return ``
}

export default defineComponent({
	name: 'Home',

	components: {
		Header
	},

	setup() {
		const route = useRoute()
		const router = useRouter()
		const path = location.hostname

		document.title = `MiniLink`

		const buttonText = ref<string>(``)
		const username = ref<string>(``)
		const password = ref<string>(``)

		const error = reactive<ErrorFields>({})
		const serverMessage = reactive<ServerMessage>({})

		onMounted(async () => {
			if (!!route.hash) {
				await router.replace({ hash: route.hash })
			} else {
				await router.replace({ hash: `#login` })
			}
		})

		const setButtontext = (currentTab: UserType) => {
			switch (currentTab) {
				case `existing`:
					return (buttonText.value = `Continue`)
				case `new`:
					return (buttonText.value = `Register`)
			}
		}

		const userType = computed<UserType>({
			get() {
				const currentTab = route.hash === `#register` ? `new` : `existing`

				setButtontext(currentTab)
				return currentTab
			},
			set(value: UserType) {
				if (value === `existing`) {
					router.replace({ hash: `#login` })
				} else {
					router.replace({ hash: `#register` })
				}

				setButtontext(value)

				if (!isEmptyObject(serverMessage)) {
					delete serverMessage.type
					delete serverMessage.value
				}
			}
		})

		const showInfo = computed<boolean>(() => {
			return userType.value === `existing` && isEmptyObject(serverMessage)
		})

		const isEmptyObject = (object: Record<string, any>): boolean => {
			return !Object.values(object).filter((x) => x.length).length
		}

		const startLoading = () => {
			const initialText = buttonText.value
			const maxDots = 3
			let dots = 0

			return setInterval(() => {
				if (dots === maxDots) {
					buttonText.value = initialText
					dots = 0
				} else {
					buttonText.value = buttonText.value + `.`.repeat(dots)
					dots++
				}
			}, 250)
		}

		const register = async (username: string, password: string): Promise<void> => {
			const stopLoading = startLoading()

			try {
				const { status } = await axios.post('/register', { username, password })

				if (status === 200) {
					serverMessage.type = `message`
					serverMessage.value = `Registration successful, login to proceed`

					userType.value = `existing`
				}
			} catch (error: any) {
				const err: AxiosError = error
				serverMessage.type = `error`
				serverMessage.value = err.response?.data.message
			} finally {
				clearInterval(stopLoading)
			}
		}

		const login = async (username: string): Promise<void> => {
			const stopLoading = startLoading()
			await router.push({ name: `Links`, params: { username } })
			clearInterval(stopLoading)
		}

		const proceed = async (): Promise<void> => {
			if (userType.value === `existing`) {
				error.username = validate(username.value, `username`, 3, 11)

				if (isEmptyObject(error)) {
					await login(username.value)
				}
			} else {
				error.username = validate(username.value, `username`, 3, 11)
				error.password = validate(password.value, `password`, 7)

				if (isEmptyObject(error)) {
					await register(username.value, password.value)
				}
			}
		}

		return {
			path,
			userType,
			buttonText,

			error,
			showInfo,
			serverMessage,

			username,
			password,

			proceed,
			isEmptyObject
		}
	}
})
</script>
