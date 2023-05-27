import { Endpoint, endpointsList } from '../../shared/endpoint.js'
import { FeedAPI } from '../../shared/js/api/feed_api.js'
import { create_entry } from './entry.mjs'


const state = {
    feed_pages_data: [],
    generated_feed_pages: 0,
    endpoint: null,
    last_seen_page: -1
}


const feed = document.querySelector('#feed')
const feed_progress = document.querySelector('#feed-progress')
const context_menu = document.querySelector('#context-menu')
const context_menu_shadow = document.querySelector('#context-menu-shadow')
const context_menu_fullscreen_icon = document.querySelector('#context-menu-fullscreen-icon')


export function show_context_menu(event) {
    event.preventDefault()

    context_menu.classList.remove('hidden')
    context_menu_shadow.classList.remove('hidden')

    setTimeout(() => {
        context_menu.classList.remove('hiding')
        context_menu_shadow.classList.remove('hiding')
    }, 1)
}


export function hide_context_menu() {
    context_menu.classList.add('hiding')
    context_menu_shadow.classList.add('hiding')

    setTimeout(() => {
        context_menu.classList.add('hidden')
        context_menu_shadow.classList.add('hidden')
    }, 300)
}


export function update_feed_scroll() {
    const current_page = feed.scrollLeft / feed.clientWidth
    feed_progress.style.setProperty('--value', `${100 * current_page / (state.feed_pages_data.length)}%`)
}


export function toggle_fullscreen() {
    if (document.fullscreenElement !== null) {
        document.exitFullscreen()
        context_menu_fullscreen_icon.innerText = 'fullscreen'
    } else {
        document.documentElement.requestFullscreen({ navigationUI: 'hide' })
        context_menu_fullscreen_icon.innerText = 'fullscreen_exit'
    }
}

export async function init_endpoints() {
    const child = document.querySelector('#context-menu a')
    
    for (const endpoint of endpointsList) {
        const icon = document.createElement('a')
        icon.classList.add('material-symbols-outlined')
        icon.innerText = 'radio_button_unchecked'
        icon.dataset.endpointIcon = endpoint.name
        icon.addEventListener('click', () => select_endpoint(endpoint.name))
        child.before(icon)

        const label = document.createElement('a')
        label.innerText = endpoint.name
        label.dataset.endpointLabel = endpoint.name
        label.addEventListener('click', () => select_endpoint(endpoint.name))
        child.before(label)
    }

    const activeEndpointName = localStorage.getItem('feed-selected-endpoint')
    select_endpoint(activeEndpointName)
}

export async function select_endpoint(name) {
    const icon = document.querySelector(`[data-endpoint-icon="${name}"]`)
    const label = document.querySelector(`[data-endpoint-label="${name}"]`)

    if (label.classList.contains('failed-endpoint'))
        return

    if (name === null)
        return

    let endpoint
    try {
        endpoint = await Endpoint.createFromName(name)
    } catch(_) {
        return
    }

    localStorage.setItem('feed-selected-endpoint', name)
    document.querySelector('#endpoint-selector').innerText = name
    document.querySelectorAll('[data-endpoint-icon]').forEach(e => {
        const isActive = e.dataset.endpointIcon == name
        e.innerText = isActive ? 'radio_button_checked' : 'radio_button_unchecked'
    })

    const feed_api = new FeedAPI(endpoint)
    state.endpoint = endpoint

    feed_api.getStats().then(data => {
        // console.log(data)
        // document.querySelector('#stats-unread-count').innerText = '-'
        // document.querySelector('#stats-saved-count').innerText = '-'
        document.querySelector('#stats-archived-count').innerText = 0
        document.querySelector('#stats-total').innerText = `${data.count}    (${Math.round(data.size / 1024 / 1024 * 10) / 10} MB)`
    }).catch(() => {
        const set_failed = e => {
            e.classList.add('failed-endpoint')
            e.setAttribute('href', endpoint.url())
            e.setAttribute('target', '_blank')
        }
        
        icon.innerText = 'sync_problem'
        set_failed(icon)
        set_failed(label)
    })

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

        state.feed_pages_data = data
        state.feed_pages_data.push(null)
        fill_feed()
    })
}

export function update_seen_pages() {
    const current_page = feed.page
    
    const check = () => state.last_seen_page < current_page - 1
    
    let pages = check() ? feed.querySelectorAll('section') : null

    while (check()) {
        const index = (state.last_seen_page += 1)
        pages[index].dispatchEvent(new CustomEvent('seen'))
    }
}

export function toggle_like() {
    const current_page = feed.page
    let pages = feed.querySelectorAll('section')
    pages[current_page].dispatchEvent(new CustomEvent('save'))
    hide_context_menu()
}

export function fill_feed() {
    const current_page = feed.page - 1
    const need_pages = Math.min(current_page + 5, state.feed_pages_data.length)

    const correct_scroll = feed.scrollLeft

    while (state.generated_feed_pages < need_pages) {
        const index = state.generated_feed_pages
        const entry = state.feed_pages_data[index]

        const page = create_entry(entry)
        feed.append(page)
        state.generated_feed_pages += 1
    }

    feed.scrollLeft = correct_scroll
    feed_progress.style.setProperty('--loaded', `${100 * (state.generated_feed_pages + 1) / (state.feed_pages_data.length)}%`)
}