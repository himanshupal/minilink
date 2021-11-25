import axios from 'axios'
import { serverURL } from '@/config.json'

export default axios.create({
	baseURL: serverURL
})
