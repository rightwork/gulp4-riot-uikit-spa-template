function Auth(logger, eventBus){
  var self = riot.observable(this)

  self.loginData = {}

  self.authorizeForTag = function(tag) {
    // TODO: implement
    return true
  }

  self.authenticate = function(data){
    // just checking to see if already logged in?
    if(!data && !$.isEmptyObject(self.loginData)){
      eventBus.broadcast(self, 'auth.pass', self.loginData)
      return true
    }
    else {
      if(typeof data === 'undefined'){
        data = {}
      }

      var success = function(){
        data.password = "<hidden>"
        self.loginData = data
        eventBus.broadcast(self, 'auth.registered', data)
        return true
      }

      var fail = function(){
        logger.warn("Auth: failed")
        self.loginData = {}
        eventBus.broadcast(self, "auth.fail")
        return false
      }

      // TODO: authenticate here with success/fail callbacks
      if(!data && !$.isEmptyObject(self.loginData)){
        return success()
      }
      else if(data.username == 'a') {
        return success()
      }
      else {
        return fail()
      }
    }
  }

  // TODO: make this a function call, rather than event?
  eventBus.onBroadcast(self, "login.request", function(data){
    self.authenticate(data)
  })
}
