import * as f from './functions.mjs'
import * as menus from './menus.mjs'

import './fullscreen.mjs'
import * as endpoint_manager from './endpoint_manager.mjs'
import './page_manager.mjs'



function addEvent(selector, event_name, handler, {stopPropagation = false, preventDefault = false} = {}) {
    document.querySelectorAll(selector).forEach(element => {
        element.addEventListener(event_name, event => {
            if (stopPropagation) {
                event.stopPropagation()
            }
            if (preventDefault) {
                event.preventDefault()
            }
            handler(event)
        })
    })
}

addEvent('body', 'click', () => menus.toggle_info() )
addEvent('#context-menu-opener', 'click', () => menus.show_context_menu(), {stopPropagation: true} )


addEvent('body', 'contextmenu', () => menus.show_context_menu(), {preventDefault: true})
addEvent('#context-menu-shadow', 'click', () => menus.hide_context_menu(), {stopPropagation: true} )

endpoint_manager.init()
menus.request_info_menu(document.querySelector('#homepage'))
