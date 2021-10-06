const fs = require('fs')
const BASE_PATH = './build/static/js'
const files = fs.readdirSync(BASE_PATH)

const jsFiles = files.filter(file => file.endsWith('.js'))
console.table(jsFiles)
const filesData = jsFiles.map(file => fs.readFileSync(`${BASE_PATH}/${file}`, { encoding: 'utf-8' }))
fs.writeFileSync('../../docs/examples/app.js', filesData.join('\n'))
