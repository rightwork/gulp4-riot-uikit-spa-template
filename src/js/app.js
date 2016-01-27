// TODO:
// * look for TODO's
function App(Auth, Router, AppConfig, UserConfig, EventBus, Logger, Pager, Layouts, Globalizer) {
  // the default { } conflicts with json syntax when passing objects in html5 attributes
  riot.util.brackets.set('.. ..')

  var appConfig = new AppConfig()
  var userConfig = new UserConfig()
  // TODO: read browser default locale here, and only fall back on locale if
  // browser not specified?
  var globalizer = new Globalizer()
  globalizer.one('globalize-complete', function() {

    var logger = new Logger(appConfig.logLevel, globalizer)
    var eventBus = new EventBus(logger, globalizer)
    var router = new Router("/", logger, eventBus, globalizer)
    var auth = new Auth(logger, eventBus, globalizer)
    var pager = new Pager(appConfig, logger, eventBus, router, auth, globalizer)
    var layouts = new Layouts(appConfig, logger, eventBus, pager)

    riot.mixin('appConfig', appConfig)
    riot.mixin('logger', logger)
    riot.mixin('eventBus', eventBus)
    riot.mixin('router', router)
    riot.mixin('pager', pager)
    riot.mixin('auth', auth)
    riot.mixin('layouts', layouts)
    riot.mixin('globalizer', globalizer)
    router.start()

  })

  globalizer.on('globalize-complete', function() {
    riot.update();
  })

  globalizer.load(userConfig.get('locale') || appConfig.locale)

}
