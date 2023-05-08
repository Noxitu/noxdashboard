
export class HorizontalPages extends HTMLElement {
    constructor() {
        super()

        this.page = 0
        this.is_scrolling = false

        const shadow = this.attachShadow({ mode: 'closed' })
        
        shadow.innerHTML = `
        <style>
        :host {
            display: flex;
            align-items: stretch;
            overflow-x: scroll;
            scroll-snap-type: x mandatory;
        }
        
        ::slotted(section) {
            min-width: 100vw;
            width: 100vw;
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
        const current_page = Math.round(this.scrollLeft / this.clientWidth)

        this.is_scrolling = (current_page * this.clientWidth != this.scrollLeft)

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
}

  
customElements.define('horizontal-pages', HorizontalPages)