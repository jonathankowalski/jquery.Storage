(function($){

	var storage = {

		contexts: {
			"local": "local",
			"session": "session"
		},

		enabled: {
			"local": true,
			"session": true
		},		

		storageInterface: {
			"local": window.localStorage,
			"session": window.sessionStorage
		},

		init: function(params){
			this.params = $.extend({				
				fallback: true,
				verbose: true				
			}, params);
			if(!window.localStorage){
				this.enabled["local"] = false;
			}
			if(!window.sessionStorage){
				this.enabled["session"] = false;
			}
			return this;
		},

		setInLocal: function(key, value){
			var value = value || false;
			return this.__set(key, value, this.contexts.local);
		},

		setInSession: function(key, value){
			var value = value || false;
			return this.__set(key, value, this.contexts.session);
		},		

		__set: function(key, value, context){
			var keyValues = this.__parseKeyValues(key, value);
			if(this.__isSupported(context)){
				return this.__addObjectIn(keyValues, context);
			} else if (this.params.fallback) {
				return this.__addObjectIn(keyValues, 'cookie');
			} else if (this.params.verbose) {
				throw (context+"Storage is not supported");
			}		
			return false;
		},

		__isSupported: function(context){
			return this.enabled[context];
		},

		__addObjectIn: function(element, context){
			for (var key in element){				
				if(!element.hasOwnProperty(key)){
					continue;
				}
				this.addMethods[context](key, element[key]);
			}	
			return true;
		},		

		addMethods: {
			"local": function(key, value){			
				window.localStorage[key] = value;	
			},
			"session": function(key, value){			
				window.sessionStorage[key] = value;	
			},
			"cookie":  function(key, value){
				document.cookie = key+"="+value+"; path=/";
			}
		},		

		get: function(key, context){},

		remove: function(key, context){},

		flush: function(context){
			var context = context || false;
			if(!context){
				this.__clearAllStorages();
			} else {
				this.storageInterface[context].clear();
			}
		},

		__clearAllStorages: function(){
			for(var context in this.contexts){
				if(this.contexts.hasOwnProperty(context)){
					this.storageInterface[context].clear();
				}
			}			
		},

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
		}
	};

	$.store = storage.init();

})(jQuery)