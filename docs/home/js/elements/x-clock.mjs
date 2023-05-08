
export class ClockElement extends HTMLElement {
    constructor() {
        super()
        const shadow = this.attachShadow({ mode: 'closed' })
        shadow.innerHTML = `
            <style>
                :host {
                    display: inline-flex;
                    align-items: flex-end;
                }

                .time {
                    font-size: 100%;
                }

                .seconds {
                    font-size: 50%;
                    padding-left: 0.2em;
                    padding-bottom: 0.2em;
                }

                [part="seconds"]::before {
                    content: ':';
                }
            </style>

            <span id="time" part="time">0:00</span>
            <span part="seconds">00</span>
        `

        this._time = shadow.querySelector('[part="time"]')
        this._seconds = shadow.querySelector('[part="seconds"]')

        this.update_time()
        setInterval(() => this.update_time(), 1000)
    }

    update_time() {
        const time = new Date()
        const h = time.getHours()
        const m = time.getMinutes()
        const s = time.getSeconds()
        this._time.innerHTML = `${h}:${m < 10 ? '0' : ''}${m}`
        this._seconds.innerText = `${s < 10 ? '0' : ''}${s}`
    }
}

  
customElements.define('x-clock', ClockElement)