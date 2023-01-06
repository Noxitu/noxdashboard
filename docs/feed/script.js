import { Entry } from './entry.js'

history.scrollRestoration = 'manual'

async function init() {
    const res = await fetch('/feed/')
    const data = await res.json().then(items => items.map(item => new Entry(item)))

    for (const post of data) {
        const send_update = () => {
            fetch('/feed/mark', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "id": post.id,
                    "like": post.like,
                    "seen": post.seen
                })
            })
        }

        document.body.append(post.create({
            'like.click': () => {
                post.like = !post.like
                post.render()
                send_update()
            },
            'seen.click': () => {
                post.seen = (post.seen == Entry.STATUS_SEEN ? Entry.STATUS_NOT_SEEN_MANUAL : Entry.STATUS_SEEN)
                post.render()
                send_update()
            },
            'seen.auto': () => {
                post.seen = Entry.STATUS_SEEN
                post.render()
                send_update()
            }
        }))
    }
}

window.addEventListener('load', init)
