import { Endpoint } from '../shared/endpoint.js'

const PREFIX = '[FeedAPI]'

export class KwejkAPI {
    constructor() {
        this._endpoint = Endpoint.createFromQuery('/feed/health')
    }

    async getLatestID() {
        const res = await (await this._endpoint).fetch('/kwejk/pages/latest_id')
        const data = await res.json()
        return data.id
    }

    async getPage(page_id) {
        const res = await (await this._endpoint).fetch(`/kwejk/pages/${page_id}`)
        const data = await res.json()
        return data
    }
}