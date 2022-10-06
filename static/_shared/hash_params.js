const PREFIX = '[HashParams]'

const hash = document.location.hash.substring(1)
console.log(PREFIX, `hash = "${hash}"`)

export const HASH_PARAMS = Object.fromEntries(new URLSearchParams(hash).entries())

console.log(PREFIX, HASH_PARAMS)
