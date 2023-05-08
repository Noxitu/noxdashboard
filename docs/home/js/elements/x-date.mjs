
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

export class DateElement extends HTMLElement {
    constructor() {
        super()

        this.update_date()
        setInterval(() => this.update_date(), 1000)
    }

    update_date() {
        const date = new Date()
        this.innerHTML = date.toLocaleDateString(undefined, options)
    }
}

  
customElements.define('x-date', DateElement)