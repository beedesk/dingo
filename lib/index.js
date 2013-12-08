
module.exports = {
  settings: require('./settings'),
  conf: {urls: require('./conf/urls')},
  core: {management: {commands: {runserver: require('./core/management/commands/runserver')}}}
}