<template lang="pug">
template(v-if="loading")
	Loading
template(v-else)
	Header(:title="username" :subtitle="`Are you sure to delete this?`")
		button(@click="showModal = true") Create New
	section.links
		.links__cards
			transition-group(name="shrink")
				.links__card(v-for="link in data" :key="link.id")
					.links__card__count {{ link.count }}
					template(v-if="selected === link.id")
						.confirm
							.confirm__message {{ message }}
							.confirm__buttons(v-if="selected === toDelete")
								button.yes(@click="deleteLink") Yes
								button.no(@click="toDelete = ``") No
					template(v-else)
						.field
							.data.data--about {{ link.about }}
						.field
							.label Short URL
							.data.data--link {{ link.short }}
						.field
							.label Full URL
							.data.data--link {{ link.full }}
						.timestamps
							.field
								.label Created At
								.data {{ link.createdAt }}
							.field
								.label Expiring On
								.data {{ link.expiringOn }}
						Icon.icon--delete(type="trash" @click="toDelete = link.id")
						Icon.icon--share(:type="sharingAllowed ? `share` : `copy`" color="#151515" @click="share(link.id)")
Modal(v-if="showModal" @close="showModal = false")
	form.newlink(@submit.prevent="createLink")
		.newlink__field
			label.label Full URL of Website
			input.input( v-model="newLink.url")
			label.label.label--error {{ formErrors.url }}
		.newlink__field
			label.label Short info about this URL
			input.input(maxlength="48" v-model="newLink.about")
			label.label.label--error {{ formErrors.about }}
		.newlink__field
			label.label Your Password
			input.input(type="password" v-model="newLink.password")
			label.label.label--error {{ formErrors.password }}
		.newlink__field
			label.label Expire at
			input.input(type="datetime-local" v-model="newLink.expireOn" :min="now")
			label.label.label--error {{ formErrors.expireOn }}
		.newlink__field
			button.button(type="submit") Create New MiniLink
		transition(name="shrink")
			.newlink__field(v-if="formErrors.serverMessage")
				label.label(:class="[`label--${formErrors.serverMessage.type}`]") {{ formErrors.serverMessage.value }}
				label.label.label--info(v-if="formErrors.serverMessage.type === `message`") Closing in {{ autoClose }} seconds...
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import dayjs from 'dayjs'
import Loading from '@/components/Loading.vue'
import Header from '@/components/Header.vue'
import Modal from '@/components/Modal.vue'
import Icon from '@/components/Icon.vue'

type NewLink = {
	url?: string
	about?: string
	password?: string
	expireOn: string
}

type ServerMessage = {
	type?: `error` | `message`
	value?: string
}

type ErrorFields = {
	url?: string
	about?: string
	password?: string
	expireOn?: string
	serverMessage?: ServerMessage
}

type Link = {
	id: string
	count: number
	about: string
	short: string
	full: string
	createdAt: string
	expiringOn: string
}

type Links = Array<Link>

const links = [
	{
		id: `1`,
		count: 1,
		about: `This is some info about this URL`,
		short: `https://cjdbsc`,
		full: `https://sacavav`,
		createdAt: `jdbvchjadcac`,
		expiringOn: `cjbsjvhjagdhca`
	},
	{
		id: `2`,
		count: 2,
		about: `This is some info about this URL`,
		short: `https://cjdbsc`,
		full: `https://sacavav`,
		createdAt: `jdbvchjadcac`,
		expiringOn: `cjbsjvhjagdhca`
	},
	{
		id: `3`,
		count: 3,
		about: `This is some info about this URL`,
		short: `https://cjdbsc`,
		full: `https://sacavav`,
		createdAt: `jdbvchjadcac`,
		expiringOn: `cjbsjvhjagdhca`
	},
	{
		id: `4`,
		count: 4,
		about: `This is some info about this URL`,
		short: `https://minilink.himanshupal.xyz/ab6c4`,
		full: `https://sacavav`,
		createdAt: `jdbvchjadcac`,
		expiringOn: `cjbsjvhjagdhca`
	},
	{
		id: `5`,
		count: 5,
		about: `This is some info about this URL`,
		short: `https://cjdbsc`,
		full: `https://sacavav`,
		createdAt: `jdbvchjadcac`,
		expiringOn: `cjbsjvhjagdhca`
	},
	{
		id: `6`,
		count: 6,
		about: `This is some info about this URL`,
		short: `https://cjdbsc`,
		full: `https://sacavav`,
		createdAt: `jdbvchjadcac`,
		expiringOn: `cjbsjvhjagdhca`
	},
	{
		id: `7`,
		count: 7,
		about: `This is some info about this URL`,
		short: `https://cjdbsc`,
		full: `https://sacavav`,
		createdAt: `jdbvchjadcac`,
		expiringOn: `cjbsjvhjagdhca`
	},
	{
		id: `8`,
		count: 8,
		about: `This is some info about this URL`,
		short: `https://cjdbsc`,
		full: `https://sacavav`,
		createdAt: `jdbvchjadcac`,
		expiringOn: `cjbsjvhjagdhca`
	},
	{
		id: `9`,
		count: 9,
		about: `This is some info about this URL`,
		short: `https://cjdbsc`,
		full: `https://sacavav`,
		createdAt: `jdbvchjadcac`,
		expiringOn: `cjbsjvhjagdhca`
	},
	{
		id: `10`,
		count: 10,
		about: `This is some info about this URL`,
		short: `https://cjdbsc`,
		full: `https://sacavav`,
		createdAt: `jdbvchjadcac`,
		expiringOn: `cjbsjvhjagdhca`
	},
	{
		id: `11`,
		count: 11,
		about: `This is some info about this URL`,
		short: `https://cjdbsc`,
		full: `https://sacavav`,
		createdAt: `jdbvchjadcac`,
		expiringOn: `cjbsjvhjagdhca`
	},
	{
		id: `12`,
		count: 12,
		about: `This is some info about this URL`,
		short: `https://cjdbsc`,
		full: `https://sacavav`,
		createdAt: `jdbvchjadcac`,
		expiringOn: `cjbsjvhjagdhca`
	}
]

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
	name: 'Links',

	components: {
		Loading,
		Header,
		Modal,
		Icon
	},

	setup() {
		const { params } = useRoute()
		const { username } = params

		const loading = ref<boolean>(true)

		const toDelete = ref<string>(``)
		const message = ref<string>(``)
		const selected = ref<string>(``)

		const autoClose = ref<number>(5)
		const showModal = ref<boolean>(false)

		const now = computed<string>(() => dayjs().format(`YYYY-MM-DDTHH:mm`))
		const defaultExpiration = ref<string>(dayjs().add(7, 'day').format(`YYYY-MM-DDTHH:mm`))

		const newLink = reactive<NewLink>({
			expireOn: defaultExpiration.value
		})

		const data = ref<Links>(links)
		const formErrors = reactive<ErrorFields>({})

		const sharingAllowed = computed<boolean>(() => {
			return !!navigator.share
		})

		const share = async (id: string) => {
			const [toShare] = links.filter((link) => link.id === id)

			if (navigator.share) {
				await navigator.share({
					title: toShare.about,
					url: toShare.short
				})
				message.value = `Shared...`
			} else {
				await navigator.clipboard.writeText(toShare.short)
				message.value = `Short URL copied to clipboard...`
			}
			selected.value = id

			setTimeout(() => {
				message.value = ``
				selected.value = ``
			}, 2500)
		}

		const clearObjects = () => {
			for (const key of Object.keys(newLink)) {
				delete newLink[key as keyof NewLink]
			}

			delete formErrors.serverMessage
		}

		const createLink = () => {
			formErrors.url = validate(newLink.url, `URL`, 10, /^(http:\/\/|https:\/\/)/)
			formErrors.about = validate(newLink.about, `short info`)
			formErrors.password = validate(newLink.password, `password`, 7)

			if (isEmptyObject(formErrors)) {
				console.log({ ...newLink })

				setTimeout(() => {
					formErrors.serverMessage = {
						type: `message`,
						value: `Database connection Error!`
					}

					{
						setInterval(() => {
							if (!autoClose.value) {
								showModal.value = false
								clearObjects()
								data.value.push({
									id: String(Math.floor(Math.random() * 10)),
									count: data.value.length + 1,
									short: `https://newshorturl`,
									full: newLink.url ?? ``,
									createdAt: String(Date.now()),
									expiringOn: newLink.expireOn,
									about: newLink.about ?? ``
								})
							}
							autoClose.value--
						}, 1000)
					}
				}, 1500)
			}
		}

		const deleteLink = () => {
			console.log(`${toDelete.value} deleted!`)
			data.value = data.value.filter((link) => link.id !== toDelete.value)
		}

		watch(toDelete, (value) => {
			selected.value = value

			if (!!value) {
				message.value = `Are you sure to delete this?`
			}
		})

		onMounted(() => {
			setTimeout(() => {
				loading.value = false
			}, 2500)
		})

		return {
			now,
			data,
			loading,

			userId: `Are you sure to delete this?`,
			username,
			formErrors,

			newLink,
			toDelete,
			message,
			selected,

			autoClose,
			showModal,
			sharingAllowed,

			share,
			createLink,
			deleteLink
		}
	}
})
</script>
