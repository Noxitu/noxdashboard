import { FeedAPI } from '../../shared/js/api/feed_api.js'
import { create_entry } from './entry.mjs'
import * as menus from './menus.mjs'

let entries = null
let generated_feed_pages = 0
let last_seen_page = -1

const feed = document.querySelector('#feed')
const feed_progress = document.querySelector('#feed-progress')

function download_entries(endpoint) {
    if (entries !== null) {
        console.warn('Changing endpoint after successful load not supported.')
        return
    }

    const feed_api = new FeedAPI(endpoint)
    feed_api.get().then(data => {
        let unread_count = 0
        let saved_count = 0

        for (const entry of data) {
            if (entry.seen == false || entry.seen == 0) {
                unread_count += 1
            }

            if (entry.like == true || entry.like == 1) {
                saved_count += 1
            }

            entry.endpoint = endpoint
        }

        document.querySelector('#stats-unread-count').innerText = unread_count
        document.querySelector('#stats-saved-count').innerText = saved_count

        entries = data
        entries.push(null)
        create_pages()
    })
}


function create_pages() {
    const current_page = feed.page - 1
    const need_pages = Math.min(current_page + 5, entries.length)

    const correct_scroll = feed.scrollLeft

    while (generated_feed_pages < need_pages) {
        const entry = entries[generated_feed_pages]

        const page = create_entry(entry)
        feed.append(page)
        generated_feed_pages += 1
    }
    
    feed.scrollLeft = correct_scroll
    feed_progress.style.setProperty('--loaded', `${100 * (generated_feed_pages + 1) / (entries.length)}%`)
}


function update_feed_scroll() {
    const current_page = feed.scrollLeft / feed.clientWidth
    feed_progress.style.setProperty('--value', `${100 * current_page / (entries.length)}%`)
    document.querySelector('#bottom-info-menu').dataset.enabled = Math.round(current_page) == feed.page
}


function update_seen_pages() {
    const check = () => last_seen_page < feed.page - 1
    
    let pages = check() ? feed.querySelectorAll('section') : null

    while (check()) {
        const index = (last_seen_page += 1)
        pages[index].dispatchEvent(new CustomEvent('seen'))
    }
}

function request_info_menu() {
    const page = feed.querySelectorAll('section')[feed.page]
    console.log(feed.page, feed.querySelectorAll('section'))
    menus.request_info_menu(page)
}

document.addEventListener('endpoint-selected', event => download_entries(event.detail.endpoint))

feed.addEventListener('scroll', () => update_feed_scroll())

feed.addEventListener('page_change', () => {
    console.log('change')
    update_seen_pages()
    create_pages()
    request_info_menu()
})
