function Globalizer(){
	var self = riot.observable(this)
	self.m = function(path, args){
		var g = Globalize
		if(!args){
			return g.messageFormatter(path)()
		}
		else{
			// TODO: need to slice out path here
			return g.messageFormatter(path).apply(arguments)
		}
	}
	self.load = function(locale){
		$.getScript('js/formatters-' + locale + '.js')
			.done(function(script, textStatus){
				console.log(textStatus)
				Globalize.locale( locale );
				self.locale = locale

				// Use Globalize to format dates.
				self.date = Globalize.dateFormatter({
					datetime: "medium"
				});

				// Use Globalize to format numbers.
				self.number = Globalize.numberFormatter();

				// Use Globalize to format currencies.
				self.usd = Globalize.currencyFormatter ( "USD" );
				self.eur = Globalize.currencyFormatter ( "EUR" );

				// Use Globalize to get the plural form of a numeric value.
				self.plural = Globalize.pluralGenerator ( );

				// message formatters are automatically injected via a HACK: in the
				// gulpfile script.

				// Use Globalize to format a relative time.
				self.relTime = Globalize.relativeTimeFormatter("second")//( -35, "second" );

				self.trigger('globalize-complete')
			})
			.fail(function(jqxhr, settings, exception){
				console.log("error loading globalize formatters from server")
			})
	}
}
