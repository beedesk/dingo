var fs      = require('fs');
var path    = require('path');
var util    = require('util');


function discover(apps, typename) {
  // @TODO - move to its own module
  var classes = {};
  apps.some(function(app, n) {
    var apppath = path.join(settings.BASE_PATH, app);

    var fpath = path.join(apppath, typename);
    var fjspath = path.join(apppath, typename + '.js');
    var fcoffeepath = path.join(apppath, typename + '.coffee');
    if (fs.existsSync(fpath) && fs.lstatSync(fpath).isDirectory()) {
      fs.readdirSync(fpath).some(function(file, o) {
        if (file.match('.js$')) {
          file = file.substring(0, file.length - 3);
        } else if (file.match('.coffee$')) {
          file = file.substring(0, file.length - 7);
        } else {
          return;
        }
        var mname = path.join(fpath, file);
        var qname = path.join(app, typename, file).replace(/\//gi, '.');

        var middleware = require(mname);
        if (!!middleware) {
          classes[qname] = middleware;
          console.log(util.format('found "%s"', qname));
        } else {
          console.warn('Unexpected type: ' + mname);
        }
      });
    } else if (fs.existsSync(fjspath) || fs.existsSync(fcoffeepath)) {
      var middlewares = require(fpath);
      Object.keys(middlewares).some(function(mname, m) {
        var mqname = path.join(app, typename, mname).replace(/\//gi, '.');
        classes[mqname] = middlewares[mname];
      });
    }
  });
  return classes;
}

module.exports = {
  discover: discover
};
