<template lang="pug">
div
	template(v-if="loading")
		Loading
	template(v-else)
		Header(:title="username" :subtitle="`Last activity: ${lastActive}`")
			button(@click="showModal = true") Create New
		section.links
			.links__cards
				transition-group(name="shrink")
					.links__card(v-for="link in data" :key="link._id")
						.links__card__count {{ link.count }}
						template(v-if="selected === link._id")
							.confirm
								.confirm__message {{ message }}
								.confirm__buttons(v-if="selected === toDelete")
									button.yes(@click="showDeleteModal = true") Yes
									button.no(@click="toDelete = ``") No
						template(v-else)
							.field
								.data.data--about {{ link.info }}
							.field
								.label Short URL
								.data.data--link(@click="push(`${fullPath}/${link.count}`)") {{ `${fullPath}/${link.count}` }}
							.field
								.label Full URL
								a.data.data--link(target="_blank" :href="link.url") {{ link.url }}
							.timestamps
								.field
									.label Created At
									.data {{ formatDate(link.createdAt) }}
								.field
									.label Expiring On
									.data {{ formatDate(link.expireAt) }}
							Icon.icon--delete(type="trash" @click="toDelete = link._id")
							Icon.icon--share(:type="sharingAllowed ? `share` : `copy`" color="#151515" @click="share(link._id)")
	Modal(v-if="showModal" @close="showModal = false")
		form.form(ref="modal" @submit.prevent="createLink")
			.form__field
				label.label Full URL
				input.input( v-model="form.url")
				label.label.label--error {{ formErrors.url }}
			.form__field
				label.label Short info about this URL
				input.input(maxlength="48" v-model="form.about")
				label.label.label--error {{ formErrors.about }}
			.form__field
				label.label Your password
				input.input(type="password" v-model="form.password")
				label.label.label--error {{ formErrors.password }}
			.form__field
				label.label Expire at
				input.input(type="datetime-local" v-model="form.expireAt" :min="now")
				label.label.label--error {{ formErrors.expireAt }}
			.form__field
				button.button(type="submit") Shorten Link
			transition(name="shrink")
				.form__field(v-if="formErrors.serverMessage")
					label.label(:class="[`label--${formErrors.serverMessage.type}`]") {{ formErrors.serverMessage.value }}
	Modal(v-if="showDeleteModal" @close="showDeleteModal = false")
		form.form(ref="deleteModal" @submit.prevent="deleteLink")
			.form__field
				label.label Enter Password
				input.input(type="password" v-model="form.password")
				label.label.label--error {{ formErrors.password }}
			.form__field
				button.button(type="submit") Delete
			transition(name="shrink")
				.form__field(v-if="formErrors.serverMessage")
					label.label(:class="[`label--${formErrors.serverMessage.type}`]") {{ formErrors.serverMessage.value }}
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { AxiosError } from 'axios'
import dayjs from 'dayjs'

import Loading from '@/components/Loading.vue'
import Header from '@/components/Header.vue'
import Modal from '@/components/Modal.vue'
import Icon from '@/components/Icon.vue'
import axios from '@/axios'

type NewLink = {
	url?: string
	about?: string
	password?: string
	expireAt: string
}

type ServerMessage = {
	type?: `error` | `message`
	value?: string
}

type ErrorFields = {
	url?: string
	about?: string
	password?: string
	expireAt?: string
	serverMessage?: ServerMessage
}

type Link = {
	_id: string
	count: number
	url: string
	short: string
	info: string
	createdAt: string
	expireAt: string
}

type User = {
	_id: string
	createdAt: number
	lastActive: number
	linksCreated: number
	username: string
}

type Links = Array<Link>

const validate = (data: string | undefined, name: string, minLength?: number, regex?: RegExp): string => {
	if (!data) {
		return `Please provide a ${name}`
	} else if (minLength && data.length < minLength) {
		return `${name.charAt(0).toUpperCase() + name.slice(1)} must contain atleast ${minLength} characters`
	} else if (regex && !regex.test(data)) {
		return `It should start with http[s]://`
	}

	return ``
}

const isEmptyObject = (object: Record<string, any>): boolean => {
	return !Object.values(object).filter((x) => x.length).length
}

export default defineComponent({
	name: 'LinksPage',

	components: {
		Loading,
		Header,
		Modal,
		Icon
	},

	setup() {
		const { params, fullPath } = useRoute()
		const { push, replace } = useRouter()
		const { username } = params

		const loading = ref<boolean>(true)

		const toDelete = ref<string>(``)
		const message = ref<string>(``)
		const selected = ref<string>(``)

		const autoClose = ref<number>(5)
		const showModal = ref<boolean>(false)
		const showDeleteModal = ref<boolean>(false)

		const data = ref<Links>([])
		const userData = ref<User>()
		const formErrors = reactive<ErrorFields>({})

		const modal = ref<HTMLDivElement>()
		const deleteModal = ref<HTMLDivElement>()

		const now = computed<string>(() => dayjs().format(`YYYY-MM-DDTHH:mm`))
		const defaultExpiration = ref<string>(dayjs().add(7, 'day').format(`YYYY-MM-DDTHH:mm`))
		const lastActive = computed<string>(() => formatDate(userData.value?.lastActive))

		const form = reactive<NewLink>({
			expireAt: defaultExpiration.value
		})

		const sharingAllowed = computed<boolean>(() => {
			return !!navigator.share
		})

		const share = async (_id: string) => {
			const [toShare] = data.value?.filter((link) => link._id === _id)

			const shortUrl = `${fullPath}/${toShare.count}`

			if (navigator.share) {
				await navigator.share({
					title: toShare.info,
					url: shortUrl
				})
				message.value = `Shared...`
			} else {
				await navigator.clipboard.writeText(shortUrl)
				message.value = `Short URL copied to clipboard...`
			}
			selected.value = _id

			setTimeout(() => {
				message.value = ``
				selected.value = ``
			}, 2500)
		}

		const clearFields = (object: Object = form) => {
			for (const key of Object.keys(object)) {
				delete object[key as keyof typeof object]
			}

			delete formErrors.serverMessage
		}

		const createLink = async () => {
			formErrors.url = validate(form.url, `URL`, 10, /^http(s?):\/\//)
			formErrors.about = validate(form.about, `short info`)
			formErrors.password = validate(form.password, `password`, 7)

			if (isEmptyObject(formErrors)) {
				formErrors.serverMessage = {
					type: `message`,
					value: `Please wait...`
				}

				try {
					const { data: link, status } = await axios.post('/create', {
						username,
						password: form.password,

						url: form.url,
						info: form.about,
						expireAt: form.expireAt
					})

					if (status === 200) {
						data.value.push(link)
						showModal.value = false
						clearFields()
					}
				} catch (error: any) {
					const err: AxiosError = error
					formErrors.serverMessage = {
						type: `error`,
						value: err.response?.data.message
					}
				}
			}
		}

		const deleteLink = async () => {
			formErrors.password = validate(form.password, `password`, 7)

			if (isEmptyObject(formErrors)) {
				formErrors.serverMessage = {
					type: `message`,
					value: `Please wait...`
				}

				try {
					const { status } = await axios.delete(`/${toDelete.value}`, {
						data: {
							password: form.password
						}
					})
					if (status === 200) {
						data.value = data.value.filter((link) => link._id !== toDelete.value)
						showDeleteModal.value = false
						clearFields()
					}
				} catch (error: any) {
					const err: AxiosError = error
					formErrors.serverMessage = {
						type: `error`,
						value: err.response?.data.message
					}
				}
			}
		}

		const formatDate = (timestamp?: number) => {
			return dayjs(timestamp).format(`ddd, MMM D YYYY' h:m A`)
		}

		watch(toDelete, (value) => {
			selected.value = value

			if (!!value) {
				message.value = `Are you sure to delete this?`
			}
		})

		watch(showModal, (v) => {
			const checkClickArea = (e: any) => {
				if (e.target.contains(modal.value)) {
					showModal.value = !showModal.value
				}
			}

			if (v) {
				document.addEventListener('click', checkClickArea)
			} else {
				document.removeEventListener('click', checkClickArea)
			}
		})

		watch(showDeleteModal, (v) => {
			const checkClickArea = (e: any) => {
				if (e.target.contains(deleteModal.value)) {
					showDeleteModal.value = !showDeleteModal.value
				}
			}

			if (v) {
				document.addEventListener('click', checkClickArea)
			} else {
				document.removeEventListener('click', checkClickArea)
			}
		})

		onMounted(async () => {
			try {
				const { data: fetchedData, status } = await axios.get(`/${username}`)

				if (status === 200) {
					data.value = fetchedData.data
					userData.value = fetchedData.user
				}
			} catch (error: any) {
				const err: AxiosError = error
				if (err.response?.status === 404) {
					replace({ name: `NotFound` })
				}
			} finally {
				loading.value = false
			}
		})

		return {
			now,
			data,
			loading,

			fullPath,
			lastActive,
			username,
			formErrors,

			form,
			modal,
			deleteModal,
			toDelete,
			message,
			selected,

			autoClose,
			showModal,
			showDeleteModal,
			sharingAllowed,

			push,
			share,
			createLink,
			deleteLink,
			formatDate
		}
	}
})
</script>
