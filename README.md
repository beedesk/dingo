# dingo

Django inspired web development framework on NodeJS.


### Usages

See, https://github.com/beedesk/dingo-example for usage.


### Features

Django is a frameowork that is refined over years and are doing "millions of things" for its user. 

Here are a list of items that Dingo intends to supports, eventually. (checked items were implemented.)


#### Project structures

- [x] Support `node apps/manage.js runserver $PORT`
- [x] Available on npm registry `npm install dingo --save`
- [ ] Support `dingo-admin startproject mysite`
- [x] Example `manage.js` file available.
- [x] Example project folder structure available.
- [ ] Support `node apps/manage.js startapp app_xyz`
- [x] Example app folder structure available.
- [x] Let you specify variables in `apps/settings.js`
- [x] Support multiple app folders under `apps`
- [x] Discover `views.js` file (or multiple js files under `views` folder) for each app.
- [x] Discover `middleware.js` file (or multiple js files under `middleware` folder) for each app. (Don't forget to specify it in `settings.MIDDLEWARE_CLASSES`.)
- [x] Support `urls.js` conf at `apps` folder level
- [x] Support app level delegate with `include('app_xyz.urls')`
- [x] Support regex url rules `patterns('', url(/^app_xyz$/, 'app_xyz.views.index'))`
- [x] Support parameters in url rules (ie, url('/P?<param_name_xyz>\\d{5,10}', app_xyz.views.index)).
- [ ] Support `urlresolver.reverse()`
- [ ] Support test runner `node apps/manage.js test`
- [ ] Support collect static `node apps/manage.js collectstatic`
- [ ] Support custom management commands `node apps/manage.js xyz_custom_commands`
- [ ] Support tastypie API key authication (with embedded SQL)


#### Major components

- [ ] Support ORM (not anytime soon)
- [ ] Support Account Management (not anytime soon)
- [ ] Support Admin (not anytime soon)
