
export class QueryError extends Error {
    constructor(response) {
        super('FeedAPI query failed.')
        this.response = response
    }
}

export class FeedAPI {
    constructor(endpoint) {
        this._endpoint = endpoint
    }

    async _fetch(url, options = {}) {
        const res = await this._endpoint.fetch(url, options)

        if (!res.ok)
            throw QueryError(res)

        const data = await res.json()
        return data      
    }

    get() {
        return this._fetch('/feed/')
    }

    getStats() {
        return this._fetch('/feed/stats')
    }

    update({id, like, seen}) {
        return this._fetch('/feed/mark', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id, like, seen})
        })
    }
}