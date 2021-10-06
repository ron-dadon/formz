const fs = require('fs')
const BASE_PATH = './build/static/js'
const files = fs.readdirSync(BASE_PATH)

const jsFiles = files.filter(file => file.endsWith('.js'))
const filesData = jsFiles.map(file => fs.readFileSync(`${BASE_PATH}/${file}`))
const concatedBuffer = Buffer.concat(filesData)
fs.writeFileSync('../../docs/examples/app.js', concatedBuffer)
