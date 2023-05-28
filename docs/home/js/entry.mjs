import { FeedAPI } from '../../shared/js/api/feed_api.js'

function create_image_entry(page, image_url, title, subtitle) {
    const html = []

    html.push(`
        <div style="position: relative; flex-shrink: 1; flex-grow: 1; width: 100%;">
            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; justify-content: center;" class="flexbox-column">
                <img src="${image_url}" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
        </div>`)

    html.push(`<div style="max-width: 90vw; overflow-wrap: anywhere; margin: 3vh"><b>${title}</b></div>`)

    if (subtitle !== undefined) {
        html.push(`<div style="max-width: 90vw; overflow-wrap: anywhere; margin: 3vh">${subtitle}</div>`)
    }

    page.innerHTML = html.join('')

    let last_context = 0

    page.querySelector('img').addEventListener('contextmenu', ev => {
        const now = new Date().getTime()

        if (last_context + 5000 > now) {
            ev.stopPropagation()
            last_context = 0
        }
        else {
            last_context = now
        }
    })
}


function create_amazon_entry(page, entry) {
    const html = []

    html.push(`
    <div style="position: relative; flex-shrink: 1; flex-grow: 1; width: 100%; display: flex; flex-direction: column;">
        <div style="display: flex; flex-direction: row; align-items: center; justify-content: space-evenly;">
            <img style="max-width: 30vh; max-height: 8vw;" src="../shared/amazon.png">
            <h6>${new Date(1000 * entry.timestamp).toLocaleString()}</h6>
        </div>

        <table style="flex-grow: 1;">
            <tr><th>Title</th><th>Price</th><th>Previous</th><th>Lowest</th></tr>
    `)

    for (const item of entry.content.wishlist) {
        function colorize(price) {
            if (price === undefined || price == item.price)
                return ''

            return ` style="color: #${price < item.price ? '8ae234' : 'ef2929'}"`
        }

        html.push(`
            <tr>
                <td>${item.title}</td>
                <td>${item.price}</td>
                <td${colorize(item.previous_price)}>${item.previous_price || ''}</td>
                <td${colorize(item.lowest_price)}>${item.lowest_price || ''}</td>
            </tr>
        `)  
    }

    html.push(`
            </table>
        </div>
    `)

    page.innerHTML = html.join('')
}


const ENTRY_TYPES = {
    kwejk: (page, entry) => {
        create_image_entry(page, entry.content.image, entry.content.title)
    },
    mangapill: (page, entry) => {
        const image = entry.content.image.replace('https://cdn.readdetectiveconan.com/file/mangapill/i/', entry.endpoint.url() + 'mangaimg/image/')

        const has_subtitle = entry.content.subtitle != ''
        const title = `${entry.content.title} - Chapter ${entry.content.chapter}`
        const subtitle = has_subtitle ? entry.content.subtitle : undefined
        create_image_entry(page, image, title, subtitle)
    },
    gogoanime: (page, entry) => {
        create_image_entry(page, entry.content.image, `${entry.content.title} - ${entry.content.episode}`)
    },
    amazon_wishlist_watch: (page, entry) => {
        create_amazon_entry(page, entry)
    }
}

export function create_entry(entry) {
    const page = document.createElement('section')
    page.classList.add('text-border', 'flexbox-column')
    page.style.cssText = 'justify-content: center; font-size: 2vh; position: relative;'

    if (entry !== null) {
        const creator = ENTRY_TYPES[entry.source]

        if (creator === undefined) {
            console.error(entry)
        }

        const save_item = document.createElement('a')
        save_item.addEventListener('click', event => {
            event.stopPropagation()
            page.dispatchEvent(new CustomEvent('save'))
        })

        function update_save_item() {
            if (entry.like === 1 || entry.like === true) {
                save_item.innerHTML = '<span class="material-symbols-outlined">bookmark</span> Saved'
            }
            else {
                save_item.innerHTML = '<span class="material-symbols-outlined">bookmark_add</span> Save'
            }
        }

        update_save_item()

        let open_item = null

        if (entry.content.url !== undefined) {
            open_item = document.createElement('a')
            open_item.innerHTML = '<span class="material-symbols-outlined">open_in_new</span> Open'
            open_item.setAttribute('rel', 'noopener noreferrer')
            open_item.setAttribute('target', '_blank')
            open_item.setAttribute('href', entry.content.url)
            open_item.addEventListener('click', event => event.stopPropagation() )
        }

        creator(page, entry)

        page.addEventListener('seen', async () => {
            if (entry.seen === 0 || entry.seen === false) {
                entry.seen = entry.seen === 0 ? 1 : true
                await (new FeedAPI(entry.endpoint).update(entry))
            }
        })

        page.addEventListener('save', async () => {
            entry.like = {
                0: 1,
                1: 0,
                false: true,
                true: false,
            }[entry.like]

            await (new FeedAPI(entry.endpoint).update(entry))
            update_save_item()
        })

        page.addEventListener('request-info-menu', event => {
            event.stopPropagation()

            page.dispatchEvent(new CustomEvent('create-info-menu', {detail: {
                menu: [
                    save_item, 
                    ...(open_item !== null ? [open_item] : [])
                ]
            }, bubbles: true}))
        })
    }

    return page
}