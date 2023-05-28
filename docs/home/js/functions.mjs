
// const state = {
//     feed_pages_data: [],
//     generated_feed_pages: 0,
//     endpoint: null,
//     last_seen_page: -1
// }


// const feed = document.querySelector('#feed')
// const feed_progress = document.querySelector('#feed-progress')



// export function update_feed_scroll() {
//     const current_page = feed.scrollLeft / feed.clientWidth
//     feed_progress.style.setProperty('--value', `${100 * current_page / (state.feed_pages_data.length)}%`)
//     bottom_info_menu.dataset.enabled = Math.round(current_page) == feed.page
// }


// export function update_seen_pages() {
//     const current_page = feed.page
    
//     const check = () => state.last_seen_page < current_page - 1
    
//     let pages = check() ? feed.querySelectorAll('section') : null

//     while (check()) {
//         const index = (state.last_seen_page += 1)
//         pages[index].dispatchEvent(new CustomEvent('seen'))
//     }
// }

// export function toggle_like() {
//     const current_page = feed.page
//     let pages = feed.querySelectorAll('section')
//     pages[current_page].dispatchEvent(new CustomEvent('save'))
//     hide_context_menu()
// }

// export function fill_feed() {
//     const current_page = feed.page - 1
//     const need_pages = Math.min(current_page + 5, state.feed_pages_data.length)

//     const correct_scroll = feed.scrollLeft

//     while (state.generated_feed_pages < need_pages) {
//         const index = state.generated_feed_pages
//         const entry = state.feed_pages_data[index]

//         const page = create_entry(entry)
//         feed.append(page)
//         state.generated_feed_pages += 1
//     }
    
//     feed.scrollLeft = correct_scroll
//     feed_progress.style.setProperty('--loaded', `${100 * (state.generated_feed_pages + 1) / (state.feed_pages_data.length)}%`)
// }
