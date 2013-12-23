
function endsWith(str, suffix) {
  return str.slice(-suffix.length) == suffix;
}

function recurse(root, segement, exts, files) {
  var absolutepath = path.join(root, segement);

  if (fs.lstatSync(absolutepath).isDirectory()) {
    fs.readdirSync(absolutepath).some(function(file, o) {
      recurse(root, path.join(segement, file), exts, files);
    });
  } else {
    exts.some(function(ext, n) {
      var end = '.' + ext;
      if (endsWith(segement, end)) {
        var qname = segement.slice(0, -end.length).replace(/\//gi, '.');
        files[qname] = segement;
        return true;
      }
    });
  }
}

function discover(apps, typename, exts) {
  var files = {};
  apps.some(function(app, n) {
    var absolutepath = path.join(settings.BASE_PATH, app, typename);
    if (fs.existsSync(absolutepath) && fs.lstatSync(absolutepath).isDirectory()) {
      recurse(settings.BASE_PATH, app, exts, files);
    }
  });
  return files;
}

function collecttemplates() {
  var templates = discover(settings.INSTALLED_APPS, 'templates', ['html']);
  console.log('templates: ' + JSON.stringify(templates));
}
