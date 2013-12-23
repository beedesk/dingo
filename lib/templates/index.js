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
    paths.push(templatepath);
  });
  return new nunjucks.Environment(new nunjucks.FileSystemLoader(paths, false));
}

var TemplateView = {
  as_view: function (templatepath) {
    return {
      get: function() {
        return nj.render(templatepath)
      }
    }
  }
}

module.exports = {
  render: nj.render,
  TemplateView: TemplateView
};
