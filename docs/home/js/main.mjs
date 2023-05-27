import * as f from './functions.mjs'


function addEvent(selector, event, handler) {
    document.querySelectorAll(selector).forEach(element => {
        element.addEventListener(event, handler)
    })
}


addEvent('body', 'contextmenu', event => f.show_context_menu(event) )
addEvent('#context-menu-shadow', 'click', () => f.hide_context_menu() )

addEvent('#clock', 'click', () => f.toggle_fullscreen() )

addEvent('#feed', 'page_change', () => f.update_seen_pages() )
addEvent('#feed', 'page_change', () => f.fill_feed() )

addEvent('#feed', 'scroll', () => f.update_feed_scroll())

addEvent('[data-context-menu="fullscreen"]', 'click', () => {
    f.toggle_fullscreen()
    f.hide_context_menu()
})

addEvent('[data-context-menu="save"]', 'click', () => {
    f.toggle_like()
    f.hide_context_menu()
})

f.init_endpoints()
