var fs      = require('fs');
var path    = require('path');
var util    = require('util');

function endsWith(str, suffix) {
  return str.slice(-suffix.length) == suffix;
};

function discover(apps, typename, exts) {
  // @TODO - move to its own module
  var classes = {};
  apps.some(function(app, n) {
    var apppath = path.join(settings.BASE_PATH, app);

    var fpath = path.join(apppath, typename);
    if (fs.existsSync(fpath) && fs.lstatSync(fpath).isDirectory()) {
      fs.readdirSync(fpath).some(function(file, o) {
        var matchExt = false;
        exts.some(function(ext, n) {
          var end = '.' + ext;
          if (endsWith(file, end)) {
            file = file.substring(0, file.length - end.length);
            matchExt = true;
            return;
          }
        });
        if (matchExt) {
          var mname = path.join(fpath, file);
          var qname = path.join(app, typename, file).replace(/\//gi, '.');

          var object = require(mname);
          if (!!object) {
            classes[qname] = object;
          } else {
            console.warn('Unexpected type: ' + mname);
          }
        }
      });
      return;
    }
    exts.some(function(ext, n) {
      var fullpath = path.join(apppath, typename + '.' + ext);
      if (fs.existsSync(fullpath)) {
        var middlewares = require(fpath);
        Object.keys(middlewares).some(function(mname, m) {
          var mqname = path.join(app, typename, mname).replace(/\//gi, '.');
          classes[mqname] = middlewares[mname];
        });
        return true;
      }
    });
  });
  return classes;
}

module.exports = {
  discover: discover
};
