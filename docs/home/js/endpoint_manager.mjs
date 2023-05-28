import { Endpoint, endpointsList } from '../../shared/endpoint.js'
import { FeedAPI } from '../../shared/js/api/feed_api.js'

const endpoint_menu_elements = []
const other_menu_elements = []
let homepage = null


function update_resolution() {
    homepage.querySelector('#resolution-info').innerHTML = `
        ${window.innerWidth} x ${window.innerHeight}<br>
        ${document.body.clientWidth} x ${document.body.clientHeight}<br>
        ${document.querySelector('.layout').clientWidth} x ${document.querySelector('.layout').clientHeight}<br>
        ${document.querySelector('#feed').clientHeight} + ${document.querySelector('#feed-progress').clientHeight}<br>
        ${[...document.querySelectorAll('#feed > section')].map(e => e.clientHeight).join(', ')}<br>
    `
}


function create_homepage() {
    homepage = document.createElement('section')
    homepage.id = 'homepage'
    homepage.classList.add('flexbox-column')
    homepage.innerHTML = `
        <div style="flex-grow: 1;"></div>
        <div id="clock" class="flexbox-column">
            <x-clock class="text-border"></x-clock>
            <x-date class="clock-secondary text-border"></x-date>
        </div>
        <div style="flex-grow: 2;"></div>
        <div class="text-border" style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px;">
            <span>Endpoint: </span><span id="endpoint-selector"></span>
            <span>Unread: </span><span id="stats-unread-count"></span>
            <span>Saved: </span><span id="stats-saved-count"></span>
            <span>Archived: </span><span id="stats-archived-count"></span>
            <span>Total: </span><span id="stats-total"> </span>
            <span>Image Cache: </span><span id="image-cache-info"></span>
            <span>Resolution: </span><span id="resolution-info"></span>
        </div>
        <div style="flex-grow: 4;"></div>
    `

    homepage.querySelector('#clock').addEventListener('click', event => {
        event.stopPropagation()
        document.dispatchEvent(new CustomEvent('toggle-fullscreen'))
    })

    homepage.addEventListener('request-context-menu', event => {
        event.stopPropagation()

        homepage.dispatchEvent(new CustomEvent('create-context-menu', {detail: {
            menu: [...endpoint_menu_elements, ...other_menu_elements]
        }, bubbles: true}))
    })

    document.querySelector('#feed').append(homepage)
    document.addEventListener('endpoint-selected', event => update_homepage(event.detail.endpoint))
    window.addEventListener('resize', () => update_resolution())

    update_resolution()
}


function create_context_menu() {
    for (const endpoint of endpointsList) {
        const item = document.createElement('a')
        item.dataset.endpointName = endpoint.name
        item.innerHTML = `<span class="icon material-symbols-outlined">radio_button_unchecked</span><span>${endpoint.name}</span>`
        item.addEventListener('click', event => {
            event.stopPropagation()
            if (item.hasAttribute('href'))
                return

            
            select_endpoint(endpoint.name)
        })

        endpoint_menu_elements.push(item)
    }

    const mange_item = document.createElement('a')
    mange_item.setAttribute('href', '../endpoints')
    mange_item.setAttribute('rel', 'noopener noreferrer')
    mange_item.setAttribute('target', '_blank')
    mange_item.innerHTML = '<span class="material-symbols-outlined">settings_applications</span><span>Manage Endpoints</span>'
    mange_item.addEventListener('click', event => {
        event.stopPropagation()
    })

    other_menu_elements.push(mange_item)
}


async function select_default_endpoint() {
    const name = localStorage.getItem('feed-selected-endpoint')

    if (name === undefined)
        return

    select_endpoint(name)
}

async function select_endpoint(endpoint_name) {
    let endpoint
    try {
        endpoint = await Endpoint.createFromName(endpoint_name)
    } catch(_) {
        endpoint = null
        console.error('Failed to create endpoint from name:', endpoint_name)
        return
    }

    for (const item of endpoint_menu_elements) {
        const icon = item.dataset.endpointName == endpoint_name ? 'radio_button_checked' : 'radio_button_unchecked'
        item.querySelector('.icon').innerText = icon
    }

    localStorage.setItem('feed-selected-endpoint', endpoint_name)
    document.querySelector('#endpoint-selector').innerText = endpoint_name

    document.dispatchEvent(new CustomEvent('endpoint-selected', {detail: {endpoint}}))
}


function update_homepage(endpoint) {
    const feed_api = new FeedAPI(endpoint)

    feed_api.getStats().then(data => {
        // homepage.querySelector('#stats-unread-count').innerText = '-'
        // homepage.querySelector('#stats-saved-count').innerText = '-'
        homepage.querySelector('#stats-archived-count').innerText = 0
        homepage.querySelector('#stats-total').innerText = `${data.count}    (${Math.round(data.size / 1024 / 1024 * 10) / 10} MB)`
    }).catch(() => {
        for (const item of endpoint_menu_elements) {
            if (item.dataset.endpointName == current_endpoint.name()) {
                item.classList.add('failed-endpoint')
                item.setAttribute('href', current_endpoint.url())
                item.setAttribute('rel', 'noopener noreferrer')
                item.setAttribute('target', '_blank')
                item.querySelector('.icon').innerText = 'sync_problem'
            }
        }
    })
}

export function init() {
    create_context_menu()
    create_homepage()
    select_default_endpoint()
}
