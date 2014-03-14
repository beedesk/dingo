var fs        = require('fs');
var path      = require('path');
var nunjucks  = require('nunjucks');

var settings  = require('../settings');
var nj = initNunjucks();

function initNunjucks() {
  var paths = [],
      templatepath, env;

  settings.INSTALLED_APPS.some(function(app, n) {
    templatepath = path.relative(process.cwd(), path.join(settings.BASE_PATH, app, 'templates'));
    // paths.push(templatepath);
    paths.push(path.join(settings.BASE_PATH, app, 'templates'));
  });
  return new nunjucks.Environment(new nunjucks.FileSystemLoader(paths, true));
}

var TemplateView = {
  as_view: function (templatepath) {
    return {
      get: function(req, res, params) {
        var rendered = nj.render(templatepath, params);
        res.writeHead(200);
        res.write(rendered);
        res.end();
      },
      toString: function() {
        return templatepath;
      }
    }
  }
}

module.exports = {
  render: function() {
    var args = Array.prototype.slice.call(arguments);
    return nj.render.apply(nj, args);
  },
  TemplateView: TemplateView
};
