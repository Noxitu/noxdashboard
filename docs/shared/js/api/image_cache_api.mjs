
export class QueryError extends Error {
    constructor(response) {
        super('ImageCacheAPI query failed.')
        this.response = response
    }
}

export class ImageCacheAPI {
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

    stats() {
        return this._fetch('/mangaimg/stats')
    }
}