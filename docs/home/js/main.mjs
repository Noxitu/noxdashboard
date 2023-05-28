import * as menus from './menus.mjs'
import './fullscreen.mjs'
import * as endpoint_manager from './endpoint_manager.mjs'
import './page_manager.mjs'

endpoint_manager.init()
menus.request_info_menu(document.querySelector('#homepage'))
