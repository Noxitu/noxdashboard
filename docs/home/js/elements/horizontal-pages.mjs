
const VARS = {
    vertical: ['column', 'y', 'height', 'scrollTop'],
    horizontal: ['row', 'x', 'width', 'scrollLeft'],
}

let layout = window.localStorage['feed-layout']

if (VARS[layout] === undefined) {
    layout = 'horizontal'
}

const [FLEX_DIRECTION, AXIS, SIZE, SCROLL_POS] = VARS[layout]

export class HorizontalPages extends HTMLElement {
    constructor() {
        super()

        this.page = 0
        this.is_scrolling = false

        const shadow = this.attachShadow({ mode: 'closed' })
        
        shadow.innerHTML = `
        <style>
        :host {
            position: relative;
            display: flex;
            flex-direction: ${FLEX_DIRECTION};
            align-items: stretch;
            overflow-${AXIS}: scroll;
            scroll-snap-type: ${AXIS} mandatory;
        }
        
        ::slotted(section) {
            min-${SIZE}: 100%;
            ${SIZE}: 100%;
            scroll-snap-align: center;
            scroll-snap-stop: always;
        }
        </style>
        <slot></slot>
        `

        this.addEventListener('scroll', () => this.update_page_index())
        this.update_page_index()
    }

    update_page_index() {
        const self_size = this.getClientRects()[0][SIZE]
        this.scroll_position = this[SCROLL_POS] / self_size
        const current_page = Math.round(this.scroll_position)

        this.is_scrolling = Math.abs(current_page * self_size - this[SCROLL_POS]) > 1

        if (this.is_scrolling)
        {
            return
        }

        if (current_page == this.page)
        {
            return
        }

        this.page = current_page
        this.dispatchEvent(new CustomEvent('page_change', {detail: {page: current_page}}))
    }

    get_scroll() {
        return this[SCROLL_POS]
    }

    set_scroll(value) {
        this[SCROLL_POS] = value
    }
}
  
customElements.define('horizontal-pages', HorizontalPages)
