
const clock = document.querySelector('#clock')
const feed_pages = document.querySelector('#feed > horizontal-pages')
const feed_progress = document.querySelector('#feed > #feed-progress')

let generated_feed_pages = 0

// Events

clock.addEventListener('click', () => {
    if (document.fullscreenElement !== null) {
        document.exitFullscreen()
    } else {
        document.documentElement.requestFullscreen({ navigationUI: 'hide' })
    }
})

let previous_page = null

clock.addEventListener('contextmenu', event => {
    event.preventDefault()

    const current_page = get_active_page()
    show_page(current_page !== 'settings' ? 'settings' : previous_page)
    previous_page = current_page
})

feed_pages.addEventListener('page_change', () => {
    fill_feed()
})

feed_pages.addEventListener('scroll', () => {
    const current_page = feed_pages.scrollLeft / feed_pages.clientWidth
    feed_progress.style.setProperty('--value', `${100 * current_page / (generated_feed_pages - 1)}%`)
})

// Functions

function get_active_page() {
    return document.querySelector('section[data-page]:not(.hidden)')?.dataset?.page
}

function show_page(page) {
    document.querySelectorAll('section[data-page]').forEach( e => {
        e.classList.toggle('hidden', e.dataset.page != page)
    })
}

function fill_feed() {
    const current_page = feed_pages.page
    const need_pages = current_page + 5

    const correct_scroll = feed_pages.scrollLeft

    while (generated_feed_pages < need_pages) {
        const page = document.createElement('section')
        page.classList.add('text-border', 'flex-1')
        page.style.cssText = 'justify-content: center; font-size: min(50vh, 50vw); padding-bottom: 10vh;'
        page.innerHTML = `<div>${generated_feed_pages+1}</div>`
        feed_pages.append(page)
        generated_feed_pages += 1
    }

    feed_pages.scrollLeft = correct_scroll
}

fill_feed()

show_page('feed')