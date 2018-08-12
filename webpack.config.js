const LIB = !!process.env.LIB

module.exports = LIB ? require('./webpack.config.lib') : require('./webpack.config.docs')
