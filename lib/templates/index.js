var fs        = require('fs');
var path      = require('path');
var nunjucks  = require('nunjucks');

var settings  = require('../settings');
var nj = initNunjucks();

function initNunjucks() {
  var paths = [],
      templatepath, env;

  console.log('settings: ' + settings );

  settings.INSTALLED_APPS.some(function(app, n) {
    console.log('BASE_PATH: ' + settings.BASE_PATH);
    templatepath = path.relative(process.cwd(), path.join(settings.BASE_PATH, app, 'templates'));
    // paths.push(templatepath);
    paths.push(path.join(settings.BASE_PATH, app, 'templates'));
  });
  return new nunjucks.Environment(new nunjucks.FileSystemLoader(paths, false));
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
  render: nj.render,
  TemplateView: TemplateView
};
