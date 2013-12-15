
function showUsage() {
  console.log('Type "manage.js help <subcommand>" for help on a specific subcommand.');
  console.log('\n[http]');
  console.log('\trunserver - run http server\n');
  console.log('\n[test]');
  console.log('\ttest - test\n');
}
function execute_from_command_line(argv) {
  var cmd;
  var cmd_args;


  if (argv.length <= 2) {
    showUsage();
    process.exit(1);
  }


  // @TODO - need to discover other management commands.
  //         Don't just add switches here.
  if (argv[2] === 'runserver') {
    cmd = require('./commands/runserver');
    cmd_args = argv.splice(3);
    cmd.handle.apply(this, cmd_args);

  } else if (argv[2] === 'test') {
    cmd = require('./commands/test');
    cmd_args = argv.splice(3);
    cmd.handle.apply(this, cmd_args);

  } else {
    showUsage();
    process.exit(1);
  }

}

module.exports = {
  execute_from_command_line: execute_from_command_line
};
