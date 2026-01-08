import { BasicEntry, LoadingEntry, EndpointEntry } from './entry.js'
import { Endpoint, endpointsList } from '../shared/endpoint.js'
import { FeedAPI } from './feed_api.js'

history.scrollRestoration = 'manual'

async function init() {
    const loading_entry = new LoadingEntry(endpointsList.length)
    loading_entry.append_to(document.body)

    const promises = []

    for (const endpoint_desc of endpointsList) {
        const endpoint = new Endpoint(endpoint_desc)

        const promise = new FeedAPI(endpoint).get().then(data => {
            loading_entry.increase()
            return {
                data: data.items,
                endpoint: endpoint,
            }
        }).catch(() => {
            return {
                data: null,
                endpoint: endpoint,
            }
        })
        
        promises.push(promise)
    }

    const feeds = await Promise.all(promises)

    loading_entry.remove()

    for (const feed of feeds) {
        const entry = new EndpointEntry(feed.endpoint, feed.data !== null)
        entry.append_to(document.body)
    }

    // TODO: proper merge of feeds

    for (const feed of feeds) {
        if (feed.data === null)
            continue

        for (const entry_desc of feed.data) {
            const entry = new BasicEntry(feed.endpoint, entry_desc)
            entry.append_to(document.body)
        }
    }
}

window.addEventListener('load', init)
