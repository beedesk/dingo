var runserver = require('./commands/runserver');

function execute_from_command_line(argv) {
  if (argv.length <= 2) {
    console.log('Type "manage.js help <subcommand>" for help on a specific subcommand.');
    console.log('[http]');
    console.log('\trunserver\n');
    process.exit(1);
  }

  // @TODO - need to discover other management commands.
  //         Don't just add switches here.
  if (argv[2] === 'runserver') {
    var command_args = argv.splice(3);
    runserver.handle.apply(this, command_args);
  }

}

module.exports = {
  execute_from_command_line: execute_from_command_line
};
