(function($){

	var storage = {

		localStorage: true,
		sessionEnabled: true,

		init: function(params){
			this.params = $.extend({
				env: "debug",
				fallback: true,
				verbose: true
			}, params);
			if(!window.localStorage){
				this.localEnabled = false;
			}
			if(!window.sessionStorage){
				this.sessionEnabled = false;
			}
			return this;
		},

		setInLocal: function(key, value){			
			var keyValues = this.__parseKeyValues(key, value);			
			if(this.localStorage){				
				return this.__set(keyValues, 'local');
			} else if(this.params.fallback) {
				return this.__setFallback(key, value);
			} else if(this.params.verbose) {
				throw ("localStorage is unsupported");
			}
			return false;
		},

		__set: function(element, context){
			for (var key in element){				
				if(!element.hasOwnProperty(key)){
					continue;
				}
				switch(context){
					case 'local':
						this.__addToLocal(key, element[key]);
						break;
					case 'session':
						this.__addToSession(key, element[key]);
						break;
				}
			}			
		},

		__addToLocal: function(key, value){			
			window.localStorage[key] = value;	
		},

		__addToSession: function(key, value){			
			window.sessionStorage[key] = value;	
		},

		setInSession: function(key, value){},

		get: function(key, context){},

		remove: function(key, context){},

		flush: function(){},

		__parseKeyValues: function(key, value){
			if(value){
				var obj = {}
				obj[key] = value;
				return obj;
			} else {
				if(typeof(key) == "object"){
					return key;
				}				
			}
		},



		__setFallback: function(key, value){}
	};

	$.store = storage.init();

})(jQuery)