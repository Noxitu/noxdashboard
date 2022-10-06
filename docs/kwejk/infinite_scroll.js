
const LOAD_AHEAD = 1
const CREATE_AHEAD = 3


export class InfiniteScroll {
    constructor({container, create, load}) {
        this._sections = {}
        this._container = container
        this._createCallback = create
        this._loadCalback = load

        for (var i = 0; i <= CREATE_AHEAD; ++i)
            this.createSection(i)

        for (var i = 0; i <= LOAD_AHEAD; ++i)
            this.loadSection(i)
    }

    onSectionVisible(observer, index, entries) {
        if (!entries[0].isIntersecting)
            return

        console.log(`Visible #${index}`)

        observer.disconnect()

        for (var i = 1; i <= CREATE_AHEAD; ++i)
            this.createSection(index + i)
    
        for (var i = 1; i <= LOAD_AHEAD; ++i)
            this.loadSection(index + i)
    }

    createSection(index) {
        if (index in this._sections)
            return

        const node = document.createElement('section')
        this._createCallback(node, index)
        this._container.append(node)
        this._sections[index] = {node: node, status: 'not loaded'}

        const observer = new IntersectionObserver((entries) => {
            this.onSectionVisible(observer, index, entries)
        }, { threshold: [0.0] })

        observer.observe(node)
    }

    async loadSection(index) {
        const section = this._sections[index]

        if (section.status !== 'not loaded')
            return

        section.status = 'loading'
        await this._loadCalback(section.node, index)
        section.status = 'loaded'
    }
}
