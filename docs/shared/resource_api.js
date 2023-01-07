
export class ResourceAPI {
    constructor(endpoint) {
        this._endpoint = endpoint
    }

    subscribe(callback, interval = 10000) {
        const channel = this._endpoint.channel('/resources/subscribe')
    
        async function updateUsage() {
            const data = await channel.send(true)
            setTimeout(() => { updateUsage() }, interval)
            callback(data)
        }

        updateUsage()
    }
}