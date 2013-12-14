var fs          = require('fs');
var url         = require('url');
var http        = require('http');
var path        = require('path');
var util        = require('util');
var express     = require('express');

var urls        = require('../../../conf/urls');

//  Env
var BASE_DIR    = path.dirname(require.main.filename);

function discover(apps, typename) {
  // @TODO - move to its own module
  var classes = {};
  apps.some(function(app, n) {
    var apppath = path.join(BASE_DIR, app);

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

function endsWith(str, suffix) {
  return str.slice(-suffix.length) == suffix;
};

function handle(port) {
  port = port || settings.SERVER_PORT;

  //-------------------------------------
  //               Debug
  //-------------------------------------
  settings.DEBUG || require('newrelic');

  //-------------------------------------
  //             HTTP Server
  //-------------------------------------
  http.globalAgent.maxSockets = 100;

  //-------------------------------------
  //               Process
  //-------------------------------------
  process.on('uncaughtException', function (error) {
    console.error(error.stack);
  });

  //----------------------------------------------------------
  //                        Express
  //----------------------------------------------------------
  var app = express();

  // Static
  app.use('/', express.static(__dirname + '/static'));

  app.use(express.errorHandler({showStack: true, dumpExceptions: true}));

  //........................ Middleware........................
  //                           HTTPs

  // Collect all `middleware`, `routes` and `views`.
  var VIEWS = {};

  // middlewares
  if ('MIDDLEWARE_CLASSES' in settings) {
    var typename = 'middleware';
    var classes = discover(settings.INSTALLED_APPS, typename);
    settings.MIDDLEWARE_CLASSES.some(function(qname, n) {
      if (qname in classes) {
        console.log(util.format('registering %s, %s: %s', typename, qname, util.inspect(classes[qname])));
        app.use(classes[qname].process_request);
      } else {
        console.warn(util.format('%s "%s" cannot be found.', typename, qname));
      }
    });
  }

  // @TODO - move all view-related code to its own module
  // views
  VIEWS = discover(settings.INSTALLED_APPS, 'views');
  console.log(util.inspect(VIEWS));

  // routes
  ROUTES = urls.include('urls');
  console.log('ROUTES: ' + JSON.stringify(ROUTES));

  app.use(function(req, res, next) {
    console.log(util.format('[route] Matching route for request "%s" to "%s".', req.method, req.url));
    var donext = true;
    ROUTES.some(function(route, n) {
      var urlparsed = url.parse(req.url),
          urlpath,
          processed = false;

      if (!endsWith(urlparsed.pathname, '/')) {
        urlparsed.pathname += '/';
      }
      urlpath = url.format(urlparsed).substring(1);

      route.match(urlpath, function(vieworname, params) {
        var view = vieworname,
            method = req.method.toLowerCase();

        if (typeof(vieworname) === 'string') {
          view = VIEWS[vieworname];
        }
        if (view) {
          if (typeof(view) === 'function') {
            view(req, res, params);
            processed = true;
          } else if (method in view) {
            console.log(util.format('[route] Matched request "%s" to "%s" with view "%s".', req.method, req.url, vieworname));
            view[method](req, res, params);
            processed = true;
          } else {
            console.log(util.format('[route] Matched view "%s" to "%s" but with unsupported method type "%s.', vieworname, req.url, req.method));
          }
        } else {
          res.writeHead(500);
          res.end();
          processed = true;
          console.error(util.format('[route] View "%s" is specified in urls, but cannot be loaded.', vieworname));
        }
      });
      if (processed) {
        donext = false;
        return true;
      }
    });
    if (donext) {
      console.log(util.format('[route] Request "%s" to "%s" does not match any route defined in urls.js.', req.method, req.url));
      res.writeHead(404);
      res.write('404 - Not Found');
      res.end();
    }
  });

  //----------------------------------------------------------
  //                          Start
  //----------------------------------------------------------
  app.listen(port);
  console.log('listening on http://localhost:' + port + '/');
}

module.exports = {
    handle: handle,
    option_list: [],
    help: 'Starts a lightweight Web server for development.',
    args: '[optional port number]'
};
