import { Endpoint } from "../_shared/endpoint.js"

window.addEventListener('load', () => {
    const timeout = 10000

    async function initUsage(name) {
        const endpoint = await Endpoint.createFromName(name)
        const channel = endpoint.channel('/resources/subscribe')
    
        async function updateUsage() {
            const data = await channel.send(true)
            const root = document.querySelector(`[data-usage="${name}"]`)
            root.querySelector('.cpu_usage').style.cssText += `--bars-filled: ${data.cpu / 10};`;
            root.querySelector('.mem_usage').style.cssText += `--bars-filled: ${data.mem / 10};`;

            setTimeout(() => { updateUsage(name) }, timeout)
        }

        updateUsage(name)
    }

    initUsage('oracle')
    initUsage('local')
})