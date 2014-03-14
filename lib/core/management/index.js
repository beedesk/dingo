var fs      = require('fs'),
    path    = require('path'),
    util    = require('util'),
    utils   = require('./utils');

var BUILTINS = {
  'core.management.commands.test': require('./commands/test'),
  'core.management.commands.runserver': require('./commands/runserver'),
  'core.management.commands.help': {
    handle: showUsage,
    option_list: [],
    help: 'Show this list of available commands.',
    args: '[optional port number]'
  },
};

var SEGMENT = path.join('management', 'commands');

var SPACE = 24;

function showUsage() {
  var commands, key, command, paths, group, name,  space, lastgroup = null;

  console.log('Type "manage.js help <subcommand>" for help on a specific subcommand.');

  commands = utils.discover(settings.INSTALLED_APPS, SEGMENT, ['js', 'coffee']);
  commands = util._extend(util._extend({}, BUILTINS), commands);

  for (key in commands) {
    command = commands[key];
    paths = key.split('.');
    name = paths.pop();
    space = new Array(24 - name.length).join(' ');
    group = paths[paths.length - 3];

    if (lastgroup !== group) {
      console.log(util.format('\n[%s]', group));
      lastgroup = group;
    }
    console.log(util.format('\t%s%s - %s', name, space, command.help));
  }
  console.log('\n');
}

function execute_from_command_line(argv) {
  var commands, cmd, cmd_args, code;

  if (argv.length <= 2) {
    showUsage();
    process.exit(1);
  }

  commands = utils.discover(settings.INSTALLED_APPS, SEGMENT, ['js', 'coffee']);
  commands = util._extend(commands, BUILTINS);
  var keys = Object.keys(commands).filter(function(value, index, array) {
    var name = value.split('.').pop();
    return name == argv[2];
  });

  if (keys && keys.length === 1) {
    cmd = commands[keys[0]];
    cmd_args = argv.splice(3);
    cmd.handle.apply(cmd.handle, cmd_args);
  } else {
    // error case
    if (keys.length) {
      console.log('Ambiguous commands found: ' + JSON.stringify(keys));
    }
    showUsage();
    process.exit(1);
  }
}

module.exports = {
  execute_from_command_line: execute_from_command_line
};
