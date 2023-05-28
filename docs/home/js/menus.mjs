
const no_actions_text = document.createElement('span')
no_actions_text.innerText = 'No actions available'

const fullscreen_item = document.createElement('a')
fullscreen_item.innerHTML = '<span class="material-symbols-outlined">fullscreen</span><span>Fullscreen</span>'
fullscreen_item.addEventListener('click', event => {
    event.stopPropagation()
    fullscreen_item.dispatchEvent(new CustomEvent('toggle-fullscreen', {bubbles: true}))
})

const fullscreen_icon = fullscreen_item.querySelector('.material-symbols-outlined')

document.addEventListener('fullscreen-changed', event => {
    fullscreen_icon.innerText = (event.detail.is_fullscreen ? 'fullscreen_exit' : 'fullscreen')
})


const context_menu = document.querySelector('#context-menu')
const context_menu_shadow = document.querySelector('#context-menu-shadow')
const top_info_menu = document.querySelector('#top-info-menu')
const bottom_info_menu = document.querySelector('#bottom-info-menu')


function menu_hide(elements, duration=300) {
    elements.forEach(e => e.classList.add('hiding') )

    setTimeout(() => {
        elements.forEach(e => e.classList.add('hidden') )
    }, duration)
}


function menu_show(elements) {
    elements.forEach(e => e.classList.remove('hidden') )

    setTimeout(() => {
        elements.forEach(e => e.classList.remove('hiding') )
    }, 1)
}


function is_menu_hidden(menu) {
    return menu.classList.contains('hiding')
}


export function toggle_info() {
    const menu_func = is_menu_hidden(top_info_menu) ? menu_show : menu_hide
    menu_func([top_info_menu, bottom_info_menu])
}


export function show_context_menu() {
    menu_show([context_menu, context_menu_shadow])
    context_menu.replaceChildren(fullscreen_item)

    const page = feed.querySelectorAll('section')[feed.page]
    bottom_info_menu.replaceChildren(no_actions_text)
    page.dispatchEvent(new CustomEvent('request-context-menu'))
}


export function hide_context_menu() {
    menu_hide([context_menu, context_menu_shadow])
}


export function request_info_menu(element) {
    bottom_info_menu.replaceChildren(no_actions_text)
    element.dispatchEvent(new CustomEvent('request-info-menu'))
}


document.body.addEventListener('create-info-menu', event => {
    bottom_info_menu.replaceChildren(...event.detail.menu)
})

document.body.addEventListener('create-context-menu', event => {
    context_menu.replaceChildren(...event.detail.menu, fullscreen_item)
})