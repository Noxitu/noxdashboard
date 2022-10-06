import {HASH_PARAMS} from '../shared/hash_params.js'
import {KwejkAPI} from './kwejk_api.js'
import {InfiniteScroll} from './infinite_scroll.js'

const KWEJK_API = new KwejkAPI()

function createPost(post) {
    const item = document.createElement('div')
    item.className = 'post'

    const title = document.createElement('h2')
    title.innerText = post[1].replaceAll('&quot;', '"')
    item.append(title)

    const date = document.createElement('h6')
    const match = /obrazki\/(\d{4}\/\d{2})\//.exec(post[0])
    date.innerHTML = match ? match[1].replace('/', '-') : ''
    item.append(date)

    const img = document.createElement('img')
    img.referrerPolicy = 'no-referrer'
    img.src = post[0]
    item.append(img)

    return item
}

async function getFirstPage() {
    if ('page' in HASH_PARAMS)
        return parseInt(HASH_PARAMS.page)

    return await KWEJK_API.getLatestID()
}

async function init() {
    const first_page_id = await getFirstPage()

    new InfiniteScroll({
        container: document.body,
        create: function(node, index) {
            const page_id = first_page_id - index
            console.log(`Create #${index} [${page_id}]`)

            const html = []
            html.push(`<h1><a href="#page=${page_id}">#${page_id}</a></h1>`)
            html.push(`<main><div class="loading" style="height: 500px;"></div></main>`)
        
            node.innerHTML = html.join('\n')
        },
        load: async function(node, index) {
            const page_id = first_page_id - index
            console.log(`Load #${index} [${page_id}]`)

            const page = await KWEJK_API.getPage(page_id)
            const main = node.querySelector('main')
            main.innerHTML = ''

            for(const post of page.posts) {
                main.append(createPost(post))
            }
        },
    })
}

window.addEventListener('load', init)
