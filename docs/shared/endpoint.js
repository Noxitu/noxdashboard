export const STORAGE_KEY = 'noxdashboard.endpoints.list'

export const endpointsList = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
export const endpointsObject = Object.fromEntries(endpointsList.map((item) => [item.name, item]))

export class Endpoint {
    constructor(endpoint) {
        this._endpoint = endpoint
    }

    name() {
        return this._endpoint.name
    }

    url() {
        return this._endpoint.endpoint
    }

    fetch(url, options = {}) {
        if (options.headers === undefined)
            options.headers = {}

        options.headers['X-Token'] = this._endpoint.key

        return fetch(`${this._endpoint.endpoint}${url.substring(1)}`, options)
    }

    channel(url) {
        url = `${this._endpoint.endpoint}${url.substring(1)}`
        url = url.replace('http://', 'ws://')
        url = url.replace('https://', 'wss://')

        let callback = null

        const socketPromise = new Promise((resolve, reject) => {
            const socket = new WebSocket(url + `?token=${this._endpoint.key}`)

            socket.addEventListener('open', ev => {
                resolve(socket)
            })

            socket.addEventListener('message', ev => {
                const call = callback
                callback = null
                call(JSON.parse(ev.data))
            })
        })

        return {
            send: async function (message) {
                const socket = await socketPromise
                return await new Promise((resolve, reject) => {
                    callback = resolve
                    socket.send(JSON.stringify(message))
                })
            }
        }
    }

    static async createFromName(name) {
        const endpoint = endpointsObject[name]

        if (endpoint === undefined)
            throw Error(`No endpoint named "${name}".`)

        return new Endpoint(endpoint)
    }

    static async createFromQuery(query) {
        console.log(`Querying for endpoint supporting "${query}".`)

        const promise = new Promise((resolve, reject) => {
            let count = endpointsList.length

            function not() {
                count -= 1

                if (count == 0)
                    reject()
            }

            async function check(item) {
                try {
                    const endpoint = new Endpoint(item)
                    const res = await endpoint.fetch(query)
                    const data = await res.json()

                    if (data === true) {
                        console.log(`Found endpoint "${item.name}" for "${query}".`)
                        return resolve(endpoint)
                    }

                    not()
                } catch (ex) {
                    console.log(ex)
                    not()
                }
            }

            for (const item of endpointsList) {
                check(item)
            }
        })

        return await promise
    }
}
