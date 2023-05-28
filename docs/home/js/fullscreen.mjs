
function is_fullscreen() {
    return document.fullscreenElement !== null
}

function toggle_fullscreen() {
    if (is_fullscreen()) {
        document.exitFullscreen()
    } else {
        document.documentElement.requestFullscreen({ navigationUI: 'hide' })
    }
}

document.addEventListener('toggle-fullscreen', () => toggle_fullscreen() )

document.addEventListener('fullscreenchange', () => {
    document.dispatchEvent(new CustomEvent('fullscreen-changed', {detail: {
        is_fullscreen: is_fullscreen()
    }}))
})
