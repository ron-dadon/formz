const DOCS = !!process.env.DOCS

module.exports = DOCS ? require('./webpack.config.docs') : require('./webpack.config.lib')
