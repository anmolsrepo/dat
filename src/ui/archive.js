var output = require('neat-log/output')
var pretty = require('prettier-bytes')
var chalk = require('chalk')
var downloadUI = require('./components/download')
var importUI = require('./components/import-progress')
var networkUI = require('./components/network')
var sourcesUI = require('./components/sources')
var keyEl = require('./elements/key')
var pluralize = require('./elements/pluralize')

module.exports = archiveUI

function archiveUI (state) {
  if (!state.dat) return 'Starting Dat program...'
  if (!state.writable && !state.hasContent) return 'Connecting to dat network...'

  var dat = state.dat
  var stats = dat.stats.get()
  var title = ''
  var progressView

  if (state.writable || state.opts.showKey) {
    title = `${keyEl(dat.key)}\n`
  }
  if (state.title) title += state.title
  else if (state.writable) title += 'Sharing dat'
  else title += 'Downloading dat'
  if (stats.version > 0) title += `: ${stats.files} ${pluralize('file', stats.file)} (${pretty(stats.byteLength)})`
  else if (stats.version === 0) title += ': (empty archive)'
  if (state.http && state.http.listening) title += `\nServing files over http at http://localhost:${state.http.port}`

  if (!state.writable) {
    progressView = downloadUI(state)
  } else {
    if (state.opts.import) {
      progressView = importUI(state)
    } else {
      progressView = 'Not importing files.' // TODO: ?
    }
  }

  return output`
    ${title}
    ${state.joinNetwork ? '\n' + networkUI(state) : ''}

    ${progressView}
    ${state.opts.sources ? sourcesUI(state) : ''}
    ${state.exiting ? 'Exiting the Dat program...' : chalk.dim('Ctrl+C to Exit')}
  `
}
