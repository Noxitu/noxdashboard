
function source(timestamp, image, title, source, { round } = { round: true }) {
    return `
        <div class="source">
            <span class="icon ${round ? 'round' : ''}" style="background-image: url(../shared/${image});"></span>
            <span class="title">${title}</span>
            <span class="timestamp">${new Date(timestamp * 1000).toLocaleString()} · ${source}</span>
        </div>
    `
}

function add_seen_anchor(post, div) {
    if (post.seen == Entry.STATUS_NOT_SEEN_AUTO) {
        div.innerHTML += '<div class="seen-anchor"></div>'
        const anchor = div.querySelector('.seen-anchor')

        const observer = new IntersectionObserver((entries) => {
            if (!entries[0].isIntersecting)
                return

            if (post.seen == Entry.STATUS_NOT_SEEN_AUTO)
                post.automaticly_see()

            observer.disconnect()
        }, { threshold: [1.0] })

        setTimeout(function () {
            observer.observe(anchor)
        }, 1)
    }
}

function actions(post, actions) {
    const div = document.createElement('div')
    div.classList.add('actions')
    div.style.cssText += `--action-count: ${actions.length};`

    const html = []

    for (const action of actions) {
        html.push(`<a data-${action}>`)
        html.push('<span class="icon material-symbols-outlined">question_mark</span>')
        html.push('<span class="label">----</span>')
        html.push('</a>')
    }

    div.innerHTML = html.join('\n')
    add_seen_anchor(post, div)

    return div
}

const ADDERS = {
    kwejk: function (post, section) {
        section.innerHTML = `
            ${source(post.timestamp, 'kwejk.png', 'Kwejk', 'Kwejk')}
            
            <img src="${post.content.image}">
            <p class="polish">${post.content.title}</p>
        `

    },
    youtube: function (post, section) {
        section.innerHTML = `
            ${source(post.timestamp, 'youtube.svg', post.content.channel, 'Youtube', { round: false })}
            
            <img src="https://i3.ytimg.com/vi/${post.id}/maxresdefault.jpg">
            <p>${post.content.title}</p>

        `
    },
    mangapill: function (post, section) {
        section.innerHTML = `
            ${source(post.timestamp, 'YourName-Manga.png', 'Manga', 'MangaPill')}
            
            <center><img src="${post.content.image}" style="max-height: 500px; width: auto; margin: auto;"></center>
            <p><b>${post.content.title} - Chapter ${post.content.chapter}</b></p>
            <p><i>${post.content.subtitle}</i></p>

        `
    },
    gogoanime: function (post, section) {
        section.innerHTML = `
            ${source(post.timestamp, 'YourName-Anime.png', 'Anime', 'GogoAnime')}
            
            <center><img src="${post.content.image}" style="max-height: 500px; width: auto; margin: auto;"></center>
            <p><b>${post.content.title} - ${post.content.episode}</b></p>

        `
    }
}

const STATUS_SEEN_MASK = 1
const STATUS_LIKED_MASK = 2

export class Entry {
    static STATUS_NOT_SEEN_AUTO = 0
    static STATUS_SEEN = 1
    static STATUS_NOT_SEEN_MANUAL = 2

    constructor(data) {
        for (const key of Object.keys(data)) {
            this[key] = data[key]
        }
    }

    create(callbacks) {
        this.element = document.createElement('section')
        ADDERS[this.source](this, this.element)
        this.element.append(actions(this, ['like', 'seen', 'open']))
        this.render()
        this.get_action('like').addEventListener('click', () => callbacks['like.click']())
        this.get_action('seen').addEventListener('click', () => callbacks['seen.click']())
        this.automaticly_see = () => callbacks['seen.auto']()

        return this.element
    }

    get_action(name) {
        return this.element.querySelector(`.actions [data-${name}]`)
    }

    render() {
        const render_action = (action, [value, icon, label]) => {
            const e = this.get_action(action)
            e.dataset[action] = value
            e.querySelector('.icon').innerHTML = icon
            e.querySelector('.label').innerHTML = label
        }

        const LIKE_VALUES = {
            true: ['yes', 'favorite', 'Liked'],
            false: ['no', 'heart_plus', 'Like']
        }

        const SEEN_VALUES = {
            0: ['not', 'visibility', 'Not seen'],
            1: ['seen', 'visibility', 'Seen'],
            2: ['not', 'visibility', 'Not seen'],
        }

        render_action('like', LIKE_VALUES[this.like])
        render_action('seen', SEEN_VALUES[this.seen])
        render_action('open', ['', 'open_in_new', 'Open'])

        const open = this.get_action('open')
        open.href = this.content.url
        open.rel = 'noopener noreferrer'
        open.target = '_blank'
    }
}
