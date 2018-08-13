const DOCS = !!process.env.DOCS

console.log(DOCS ? 'Building docs...' : 'Building lib...')

module.exports = DOCS ? require('./webpack.config.docs') : require('./webpack.config.lib')
