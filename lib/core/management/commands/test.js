var fs      = require('fs'),
    path    = require('path'),
    Mocha   = require('mocha');

function discover(apps, typename, exts, fn) {
  var classes = {};

  apps.some(function(app, n) {
    var apppath = path.join(settings.BASE_PATH, app),
        fpath = path.join(apppath, typename),
        ext;

    if (fs.existsSync(fpath)) {
      var splitted = fpath.split('.'),
          name = splitted[0];
          ext = splitted[1];

      if (fs.lstatSync(fpath).isDirectory()) {
        fs.readdirSync(fpath).some(function(file, o) {
          if (exts.indexOf(ext) >= 0) {
            fn(path.join(app, typename, name), ext);
          }
        });
      }
    } else {
      exts.some(function(ext) {
        fpath += '.' + ext;
        if (fs.existsSync(fpath)) {
          fn(path.join(app, typename), ext);
          return true;
        }
      });
    }
  });
  return classes;
}

function handle(citeria) {
  var mocha = new Mocha({
      grep: citeria
    }),
      tests;

  var app = require('./runserver').handle(settings.SERVER_PORT);

  tests = discover(settings.INSTALLED_APPS, 'tests', ['js', 'coffee'], function(filepath, ext) {
    mocha.addFile(path.join(settings.BASE_PATH, filepath));
  });

  mocha.run(function(failures){
    process.exit(failures);
  });
}

module.exports = {
  handle: handle,
  option_list: [],
  help: 'Run mocha tests.',
  args: ''
};
