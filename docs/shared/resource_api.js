
export class ResourceAPI {
    constructor(endpoint) {
        this._endpoint = endpoint
    }

    subscribe(callback, {interval, onerror} = {interval: 10000}) {
        const channel = this._endpoint.channel('/resources/subscribe')
    
        async function updateUsage() {
            let data
            try {
                data = await channel.send(true)
            }
            catch(_) {
                onerror?.()
                return
            }
            setTimeout(() => { updateUsage() }, interval)
            callback(data)
        }

        updateUsage()
    }
}
