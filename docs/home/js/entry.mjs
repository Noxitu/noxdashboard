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

    html.push(`
        <div style="position: absolute; top: 0; left: 0; pointer-events: none; opacity: 75%;">
            <span style="color: gold; padding: 5px;" class="material-symbols-outlined text-border" data-icon="seen">visibility_off</span>
            <span style="color: red; padding: 5px;" class="material-symbols-outlined text-border" data-icon="saved">favorite</span>
        </div>
    `)

    page.innerHTML = html.join('')

    let last_context = 0

    page.querySelector('img').addEventListener('contextmenu', ev => {
        const now = new Date().getTime()

        if (last_context + 5000 > now) {
            ev.stopPropagation()
        }
        else {
            last_context = now
        }
    })
}


const ENTRY_TYPES = {
    kwejk: (page, entry) => {
        create_image_entry(page, entry.content.image, entry.content.title)
    },
    mangapill: (page, entry) => {
        const image = entry.content.image.replace('https://cdn.readdetectiveconan.com/file/mangapill/i/', 'https://192.168.18.6:5000/mangaimg/image/')
        // const image = entry.content.image.replace('https://cdn.readdetectiveconan.com/file/mangapill/i/', entry.endpoint.url() + 'mangaimg/image/')

        const has_subtitle = entry.content.subtitle != ''
        const title = `${has_subtitle ? entry.content.subtitle : entry.content.title} - Chapter ${entry.content.chapter}`
        const subtitle = has_subtitle ? entry.content.title : undefined
        create_image_entry(page, image, title, subtitle)
    },
    gogoanime: (page, entry) => {
        create_image_entry(page, entry.content.image, `${entry.content.title} - ${entry.content.episode}`)
    },
}

function update_page(page, entry) {
    page.dataset.seen = entry.seen
    page.dataset.saved = entry.like
}

export function create_entry(entry) {
    const page = document.createElement('section')
    page.classList.add('text-border', 'flexbox-column')
    page.style.cssText = 'justify-content: center; font-size: 2vh; position: relative;'
    update_page(page, entry)

    if (entry !== null) {
        const creator = ENTRY_TYPES[entry.source]

        if (creator === undefined) {
            console.error(entry)
        }

        creator(page, entry)

        page.addEventListener('seen', async () => {
            if (entry.seen === 0 || entry.seen === false) {
                entry.seen = entry.seen === 0 ? 1 : true
                await (new FeedAPI(entry.endpoint).update(entry))
                update_page(page, entry)
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
            update_page(page, entry)
        })

    }

    return page
}