// TODO:
// * removing main is messed up
// * atom beautify messes up {{ }}.  pick something else?
// * look for TODO's
function App(Auth, Router, AppConfig, EventBus, Logger, Pager, Layouts) {
  // the default { } conflicts with json syntax when passing objects in html5 attributes
  riot.util.brackets.set('{{ }}')

  var appConfig = new AppConfig()
  var logger = new Logger(appConfig.logLevel)
  var eventBus = new EventBus(logger)
  var router = new Router(logger, eventBus, "/")
  var auth = new Auth(logger, eventBus)
  var pager = new Pager(appConfig, logger, eventBus, router, auth)
  var layouts = new Layouts(appConfig, logger, eventBus)

  riot.mixin('appConfig', appConfig)
  riot.mixin('logger', logger)
  riot.mixin('eventBus', eventBus)
  riot.mixin('router', router)
  riot.mixin('pager', pager)
  riot.mixin('auth', auth)
  riot.mixin('layouts', layouts)

  router.start()
}
