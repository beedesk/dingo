var util = require('util');

module.exports = {
  settings: require('./settings'),
  conf: {urls: require('./conf/urls')},
  core: {
    management: util._extend(
      {
        commands: {
          runserver: require('./core/management/commands/runserver')
        }
      },
      require('./core/management')
    )
  },
  templates: require('./templates')
}
