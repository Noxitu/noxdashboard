import { ResourceAPI } from "../shared/resource_api.js"
import { FeedAPI } from "./feed_api.js"

function fill_open_action(element, url, label = 'Open', icon = 'open_in_new') {
    element.querySelector('.icon').innerText = icon
    element.querySelector('.label').innerText = label
    element.href = url
    element.rel = 'noopener noreferrer'
    element.target = '_blank'
}

function create_source_header(source) {
    const div = document.createElement('div')
    div.classList.add('source')
    div.innerHTML = `
        <span class="icon ${source.round !== false ? 'round' : ''}" style="background-image: url(../shared/${source.image});"></span>
        <span class="title">${source.title}</span>
        <span class="timestamp">${source.timestamp !== null ? new Date(source.timestamp * 1000).toLocaleString() : ''} · ${source.name}</span>
    `

    return div
}

function get_source_info(data) {
    const SOURCES = {
        kwejk: {title: 'Kwejk', image: 'kwejk.png'},
        youtube: {title: data.content.channel, image: 'youtube.svg', round: false},
        mangapill: {title: 'Manga', image: 'YourName-Manga.png'},
        gogoanime: {title: 'Anime', image: 'YourName-Anime.png'},
    }
    return {
        ...{
            name: data.source,
            timestamp: data.timestamp,
        },
        ...SOURCES[data.source]
    }
}

function get_content(post) {
    return {
        kwejk: () => `
            <img src="${post.content.image}">
            <p class="polish">${post.content.title}</p>
        `,
        youtube: () => `
            <img src="https://i3.ytimg.com/vi/${post.id}/maxresdefault.jpg">
            <p>${post.content.title}</p>
        `,
        mangapill: () => `
            <center><img src="${post.content.image}" style="max-height: 500px; width: auto; margin: auto;"></center>
            <p><b>${post.content.title} - Chapter ${post.content.chapter}</b></p>
            <p><i>${post.content.subtitle}</i></p>
        `,
        gogoanime: () => `
            <center><img src="${post.content.image}" style="max-height: 500px; width: auto; margin: auto;"></center>
            <p><b>${post.content.title} - ${post.content.episode}</b></p>
        `,
    }[post.source]()
}

function add_seen_event(div, callback) {
    const anchor = document.createElement('div')
    anchor.classList.add('seen-anchor')
    div.append(anchor)

    const observer = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting)
            return
            
        callback()

        observer.disconnect()
    }, { threshold: [1.0] })

    setTimeout(function () {
        observer.observe(anchor)
    }, 1)
}

export class Entry {
    constructor(source_info) {
        this.element = document.createElement('section')

        this.element.append(create_source_header(source_info))
    }

    append_to(feed_container) {
        feed_container.append(this.element)
    }

    remove() {
        this.element.remove()
    }

    add_actions(actions) {
        this.actions_element = document.createElement('div')
        this.actions_element.classList.add('actions')
        this.actions_element.style.cssText += `--action-count: ${actions.length};`

        const html = []

        for (const action of actions) {
            html.push(`<a data-${action}>`)
            html.push('<span class="icon material-symbols-outlined">question_mark</span>')
            html.push(`<span class="label">${action}</span>`)
            html.push('</a>')
        }

        this.actions_element.innerHTML = html.join('\n')
        this.element.append(this.actions_element)
        this.actions = Object.fromEntries(
            [...this.actions_element.querySelectorAll('a')].map( (value, i) => [actions[i], value] )
        )
    }
}

const STATUS_NOT_SEEN = false
const STATUS_SEEN = true

export class BasicEntry extends Entry {
    constructor(endpoint, post) {
        super(get_source_info(post))
        this.endpoint = endpoint
        this.post = post

        // todo: remove once api server is updated
        if (this.post.like === true) { this.post.like = 1 }
        if (this.post.like === false) { this.post.like = 0 }
        if (this.post.seen === 0) { this.post.seen = false}
        if (this.post.seen === 1) { this.post.seen = true}
        if (this.post.seen === 2) { this.post.seen = true}

        this.element.innerHTML += get_content(post)
        this.add_actions(['like', 'seen', 'open'])

        this.actions.like.addEventListener('click', () => this.toggle_like())
        this.actions.seen.addEventListener('click', () => this.toggle_seen())

        if (this.post.seen == STATUS_NOT_SEEN)
            add_seen_event(this.actions_element, () => this.auto_see())

        this.update_actions()
    }

    send_update() {
        new FeedAPI(this.endpoint).update(this.post)
    }

    toggle_like() {
        console.log('toggle_like', this)
        this.post.like = 1 - this.post.like
        this.update_actions()
        this.send_update()
    }

    toggle_seen() {
        // this.post.seen = (this.post.seen == STATUS_SEEN ? STATUS_NOT_SEEN_MANUAL : STATUS_SEEN)
        // this.update_actions()
        // this.send_update()
    }

    auto_see() {
        if (this.post.seen != STATUS_NOT_SEEN)
            return

        this.post.seen = STATUS_SEEN
        this.update_actions()
        this.send_update()
    }

    update_actions() {
        const fill_action = (action, [value, icon, label]) => {
            const e = this.actions[action]
            e.dataset[action] = value
            e.querySelector('.icon').innerHTML = icon
            e.querySelector('.label').innerHTML = label
        }

        const LIKE_VALUES = {
            1: ['yes', 'favorite', 'Liked'],
            0: ['no', 'heart_plus', 'Like']
        }

        const SEEN_VALUES = {
            false: ['not', 'visibility', 'Not seen'],
            true: ['seen', 'visibility', 'Seen'],
        }

        fill_action('like', LIKE_VALUES[this.post.like])
        fill_action('seen', SEEN_VALUES[this.post.seen])
        fill_open_action(this.actions.open, this.post.content.url)
    }
}

export class LoadingEntry extends Entry {
    constructor(count) {
        super({
            title: 'Loading...',
            name: 'internal',
            image: 'CloudServer.png',
            timestamp: null
        })
        this.progress = document.createElement('progress')
        this.progress.max = count
        this.progress.value = 0
        this.element.append(this.progress)
    }

    increase() {
        this.progress.value += 1
    }
}

export class EndpointEntry extends Entry {
    constructor(endpoint, is_valid) {
        super({
            title: `Endpoint: ${endpoint.name()}`,
            name: 'internal',
            image: 'CloudServer.png',
            timestamp: null
        })

        this.endpoint = endpoint

        if (is_valid)
            this.init_valid_endpoint()
        else
            this.init_invalid_endpoint()

        fill_open_action(this.actions.endpoints, '../endpoints', 'Endpoints', 'format_list_bulleted_add')
    }

    init_valid_endpoint() {
        this.feed_stats_element = document.createElement('p')
        this.feed_stats_element.style.cssText = 'display: grid; grid-template-columns: auto 1fr; gap: 2px 1em;'
        this.feed_stats_element.innerHTML = `
            <b>CPU</b> <progress class="cpu-usage" max="100"></progress>
            <b>RAM</b> <progress class="ram-usage" max="100"></progress>
            <b>Entry count</b> <span class="feed-count">-</span>
            <b>DB size</b> <span class="feed-size">-</span> 
        `
        this.element.append(this.feed_stats_element)
        const getStatElement = s => this.feed_stats_element.querySelector(s)

        new ResourceAPI(this.endpoint).subscribe(data => {
            getStatElement('.cpu-usage').value = data.cpu
            getStatElement('.ram-usage').value = data.mem
        })

        new FeedAPI(this.endpoint).getStats().then(data => {
            getStatElement('.feed-count').innerHTML = data.count
            getStatElement('.feed-size').innerHTML = `${Math.round(data.size / 1024 / 1024 * 10) / 10} MB`
        })

        this.add_actions(['endpoints'])
        
    }

    init_invalid_endpoint() {
        this.feed_stats_element = document.createElement('p')
        this.feed_stats_element.style.cssText = 'display: grid; grid-template-columns: auto 1fr; gap: 2px 1em;'
        this.feed_stats_element.innerHTML = `
            <b>CPU</b> <progress class="cpu-usage" max="100"></progress>
            <b>RAM</b> <progress class="ram-usage" max="100"></progress>
        `
        this.element.append(this.feed_stats_element)
        const getStatElement = s => this.feed_stats_element.querySelector(s)

        new ResourceAPI(this.endpoint).subscribe(data => {
            getStatElement('.cpu-usage').value = data.cpu
            getStatElement('.ram-usage').value = data.mem
        })

        const p = document.createElement('p')
        p.innerHTML = 'Endpoint /feed query failed.'
        this.element.append(p)

        this.add_actions(['endpoints', 'open'])
        fill_open_action(this.actions.open, this.endpoint.url())
    }
}
