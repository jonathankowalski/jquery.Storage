(function($){

	var cookieManager = {
		create: function(key, value, days){
			if (days) {
				var date = new Date();
				date.setTime(date.getTime()+(days*24*60*60*1000));
				var expires = "; expires="+date.toGMTString();
			}
			else var expires = "";
			document.cookie = key+"="+value+expires+"; path=/";
		},
		getItem: function(key){
			var keyComplete = key + "=";
			var cookies = document.cookie.split(';');
			for(var i=0;i < cookies.length;i++) {
				var cookie = cookies[i];
				while (cookie.charAt(0)==' '){
					cookie = cookie.substring(1,cookie.length);
				}
				if (cookie.indexOf(keyComplete) == 0){
					return cookie.substring(keyComplete.length,cookie.length);
				}
			}
			return null;
		},

		clear: function(){
			var cookies = document.cookie.split(";");
			for (var i = 0; i < cookies.length; i++){
  				this.removeItem(cookies[i].split("=")[0]);
  			}
		},

		removeItem: function(key){
			this.create(key,"",-1);
		}
	}

	var storage = {

		contexts: {			
			"session": "session",
			"local": "local",
			"cookie": "cookie"
		},

		enabled: {
			"local": true,
			"session": true,
			"cookie": true
		},		

		storageInterface: {
			"local": window.localStorage,
			"session": window.sessionStorage,
			"cookie": cookieManager
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

		set: function(key, value, context){
			var keyValues = this.__parseKeyValues(key, value);
			var context = this.__catchContext(context);
			return this.__addObjectIn(keyValues, context);
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
		},

		__catchContext: function(context){
			var context = context || false;
			if(!context){
				return false;
			}
			if(this.__isSupported(context)){
				return context;
			} else if (this.params.fallback) {
				return 'cookie';
			} else if (this.params.verbose) {
				throw (context+"Storage is not supported");				
			}
		},	

		__isSupported: function(context){
			return this.enabled[context];
		},	

		__addObjectIn: function(element, context){
			for (var key in element){				
				if(element.hasOwnProperty(key)){
					var value = this.__stringifyValue(element[key]);													
					this.addMethods[context](key, value);
				}				
			}	
			return true;
		},		

		__stringifyValue: function(value){
			if(typeof(value) == 'object'){				
				return JSON.stringify(value);
			}
			return value;
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

		get: function(key, context){
			var context = this.__catchContext(context);								
			if(!context){
				var elem = this.__getFromAllContexts(key)
			} else {
				var elem = this.storageInterface[context].getItem(key);
			}
			return this.__getValue(elem);
		},

		__getValue: function(elem){
			try{
				return $.parseJSON(elem);
			} catch(e) {
				return elem;
			}
		},

		__getFromAllContexts: function(key){			
			for(var context in this.contexts){				
				if(this.contexts.hasOwnProperty(context)){
					var element = this.storageInterface[context].getItem(key);
					if(element != null){
						return element;
					}
				}
			}
			return null;
		},

		remove: function(key, context){
			var context = this.__catchContext(context);
			if(!context){
				return this.__removeFromAllContexts(key)
			} else {
				return this.storageInterface[context].removeItem(key);
			}
		},

		__removeFromAllContexts: function(key){
			for(var context in this.contexts){
				if(this.contexts.hasOwnProperty(context)){
					this.storageInterface[context].removeItem(key);
				}
			}
			return true;
		},

		flush: function(context){
			var context = this.__catchContext(context);
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

		api: {
			"get": function(args, context){				
				return this.get(args, context);
			},
			"set": function(key, value, context){
				if(!context){
					context = value;
					value = false;
				}				
				return this.set(key, value, context);	
			},
			"remove": function(key, context){
				return this.remove(key, context);
			}
		},

		__noSuchMethod__: function(funcname, args){
			var allows = ['get', 'set', 'remove'];			
			for (var i = 0; i<allows.length; i++){
				var method = allows[i];
				if(funcname.indexOf(method) == 0){
					var context = funcname.replace(method, '').toLowerCase();
					args.push(context);					
					return this.api[method].apply(this, args);					
				}
			}
			if(this.params.verbose){
				throw ('Nonexistent method');
			}
			return false;
		}
		
	};

	$.store = storage.init();

})(jQuery)