const STORAGE_KEY = 'noxdashboard.endpoints.list'

function refresh(row) {
    row.innerHTML = `
        <td><input name="name" type="text" value="${row._entry.name}" size="6" disabled placeholder="Name" autocomplete="off"></td>
        <td><input name="endpoint" type="text" value="${row._entry.endpoint}" size="24" disabled placeholder="Endpoint URL" autocomplete="off"></td>
        <td><a class="endpoint-open material-icons" href="${row._entry.endpoint}" target="_blank" rel="noopener noreferrer">open_in_new</a></td>
        <td><input name="key" type="password" value="${row._entry.key}" size="6" disabled placeholder="API Key" autocomplete="off"></td>
        <td><input name="update" type="button" value="Update" onclick="update(this);"></td>
        <td><input name="cancel" type="button" value="Cancel" onclick="update(this);"></td>
    `
}

function create(entry) {
    const row = document.createElement('tr')
    row._entry = entry
    refresh(row)
    return row
}

function save(row) {
    row._entry.name = row.querySelector('[name="name"]').value
    row._entry.endpoint = row.querySelector('[name="endpoint"]').value
    row._entry.key = row.querySelector('[name="key"]').value

    const entries = []

    for (var row of document.querySelectorAll('tr')) {
        if (row._entry === undefined)
            continue

        if (row._entry.name === '') {
            row.remove()
            continue
        }

        entries.push(row._entry)
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

window.update = function(item) {
    const cancelCurrent = document.querySelector('tr.editing input[name="cancel"]')

    const row = item.parentElement.parentElement
    const opening = !row.classList.contains('editing')
    const saving = (row.classList.contains('editing') && item.name == 'update')

    if (opening && cancelCurrent !== null)
        cancelCurrent.click()

    if (saving) {
        save(row)
    }

    row.classList.toggle('editing')
    refresh(row)

    if (opening)
        row.querySelectorAll('input:not([type="button"])').forEach( e => { e.disabled = false })
}

window.add = function() {
    const separator = document.querySelector('#separator')

    const row = create({name: '', endpoint: '', key: ''})
    separator.before(row)
    row.querySelector('input[name="update"]').click()
}

function init() {
    const separator = document.querySelector('#separator')

    const entries = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')

    for (var entry of entries) {
        const row = create(entry)
        separator.before(row)
    }
}


window.addEventListener('load', init)