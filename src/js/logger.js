var Logger = function(logLevel){
  this.logger = logGlobalDontUseDirectly
  if(logLevel){
    this.logger.setLevel(logLevel)
  }

  this.trace = function(message) {
    this.logger.trace(message)
  }

  this.debug = function(message) {
    this.logger.debug(message)
  }

  this.info = function(message) {
    this.logger.info(message)
    this.logger.trace(message)
  }

  this.warn = function(message) {
    this.logger.warn(message)
  }

  this.error = function(message) {
    this.logger.error(message)
  }
}
