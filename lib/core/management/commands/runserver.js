var fs          = require('fs');
var http        = require('http');
var path        = require('path');
var util        = require('util');
var connect     = require('connect');

var settings    = require('../../../settings');
var urls        = require('../../../conf/urls');

//  Env
var BASE_DIR    = path.dirname(require.main.filename);

function discover(apps, typename) {
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
    console.log(error.stack);
  });

  //----------------------------------------------------------
  //                        Connect
  //----------------------------------------------------------
  var app = connect();

  // Static
  app.use('/', connect.static(__dirname + '/static'));

  app.use(connect.errorHandler({showStack: true, dumpExceptions: true}));

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

  // views
  VIEWS = discover(settings.INSTALLED_APPS, 'views');
  console.log(util.inspect(VIEWS));

  // routes
  ROUTES = urls.include('urls');
  console.log('ROUTES: ' + JSON.stringify(ROUTES));

  app.use(function(req, res, next) {
    var donext = true;
    ROUTES.some(function(route, n) {
      console.log('request: ' + req.url);
      var urlpath = req.url.substring(1),
          processed = false;
      
      route.match(urlpath, function(vieworname) {
        var view = vieworname,
            method = req.method.toLowerCase();

        if (typeof(vieworname) === 'string') {
          view = VIEWS[vieworname];
          console.log('view is a string');
        }
        if (view) {
          console.log('view is found');
          if (typeof(view) === 'function') {
            view(req, res);
            processed = true;
          } else if (method in view) {
            console.log('view support the current method.');
            view[method](req, res);
            processed = true;
          } else {
            console.log(util.format('View "%s" does not support method type "%s.', vieworname, req.method));
          }
        } else {
          res.writeHead(500);
          res.end();
          processed = true;
          console.error(util.format('View %s is specified in urls, but is not found.', vieworname));
        }
      });
      if (processed) {
        donext = false;
        return true;
      }
    });
    if (donext) {
      next();
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
