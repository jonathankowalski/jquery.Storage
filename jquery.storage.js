(function($){

	var cookieManager = {
		create: function(key, value, days){
			var date = new Date(),
				expires = "",
				oneDayMs = 24*60*60*1000;
			if (days) {				
				date.setTime( date.getTime() + ( days*oneDayMs ) );
				var expires = "; expires="+date.toGMTString();
			}			
			document.cookie = key+"="+value+expires+"; path=/";
			return true;
		},
		getItem: function(key){
			var keyComplete = key + "=",
				cookies = document.cookie.split(';'),
				i = 0,
				cookie;
			for( ; i < cookies.length ; i++ ) {
				cookie = cookies[i];
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
			var cookies = document.cookie.split(";"),
				i = 0;
			for ( ; i < cookies.length ; i++){
  				this.removeItem(cookies[i].split("=")[0]);
  			}
		},

		removeItem: function(key){
			return this.create(key,"",-1);
		},

		setItem: function(key, value){
			return this.create(key, value);
		}
	};	

	var contextsDefines = {
		"session": {			
			enabled: true,
			storageInterface: window.sessionStorage
		},
		"local": {			
			enabled: true,
			storageInterface: window.localStorage
		},
		"cookie": {			
			enabled: true,
			storageInterface: cookieManager
		}
	};

	var storage = {	

		init: function(params){
			this.params = $.extend({				
				fallback: true,
				verbose: true				
			}, params);
			if(!window.localStorage){
				contextsDefines["local"].enabled = false;
			}
			if(!window.sessionStorage){
				contextsDefines["session"].enabled = false;
			}
			return this;
		},			

		set: function(key, value, context){
			var keyValues = this.__parseKeyValues(key, value),
				context = this.__catchContext(context);
			return this.__addObjectIn(keyValues, context);
		},

		setLocal: function(key, value){
			return this.set(key, value, 'local');
		},
		setSession: function(key, value){
			return this.set(key, value, 'session');
		},
		setCookie: function(key, value){
			return this.set(key, value, 'cookie');
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
			return contextsDefines[context].enabled;
		},	

		__addObjectIn: function(element, context){
			var key,
				value;
			for (key in element){				
				if(element.hasOwnProperty(key)){
					value = this.__stringifyValue(element[key]);													
					contextsDefines[context].storageInterface.setItem(key, value);
				}				
			}	
			return true;
		},		

		__stringifyValue: function(value){
			if( typeof(value) == 'object' ){
				if( typeof(JSON) != 'undefined' ){				
					return JSON.stringify(value);
				} else if ( this.params.verbose ) {
					throw ( 'JSON is needed but unsupported !' );
				} else {
					return false;
				}
			}
			return value;
		},	

		get: function(key, defval, context){
			var context = this.__catchContext(context),
				elem;									
			if(!context){
				elem = this.__getFromAllContexts(key)
			} else {
				elem = contextsDefines[context].storageInterface.getItem(key);
			}			
			if(elem == null){
				return this.__getDefaultValue(key, defval, context);
			}
			return this.__getValue(elem);
		},

		getFromLocal: function(key, defval){
			return this.get(key, defval, 'local');
		},
		getFromSession: function(key, defval){
			return this.get(key, defval, 'session');
		},
		getFromCookie: function(key, defval){
			return this.get(key, defval, 'cookie');
		},

		__getDefaultValue: function(key, defval, context){
			if(!context){
				context = 'cookie';
			}
			if(defval){
				this.set(key, defval, context);
				return defval;
			} else {
				return null;
			}			
		},

		__getValue: function(elem){
			try{
				return $.parseJSON(elem);
			} catch(e) {
				return elem;
			}
		},

		__getFromAllContexts: function(key){			
			var context,
				element;
			for(context in contextsDefines){				
				if(contextsDefines.hasOwnProperty(context)){
					element = contextsDefines[context].storageInterface.getItem(key);
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
				return contextsDefines[context].storageInterface.removeItem(key);
			}
		},

		removeFromLocal: function(key){
			this.remove(key, 'local');
		},
		removeFromSession: function(key){
			this.remove(key, 'session');
		},
		removeFromCookie: function(key){
			this.remove(key, 'cookie');
		},

		__removeFromAllContexts: function(key){
			var context;
			for(context in contextsDefines){
				if(contextsDefines.hasOwnProperty(context)){
					contextsDefines[context].storageInterface.removeItem(key);
				}
			}
			return true;
		},

		flush: function(context){
			var context = this.__catchContext(context);
			if(!context){
				this.__clearAllStorages();
			} else {
				contextsDefines[context].storageInterface.clear();
			}
		},

		__clearAllStorages: function(){
			var context;
			for(context in contextsDefines){
				if(contextsDefines.hasOwnProperty(context)){
					contextsDefines[context].storageInterface.clear();
				}
			}			
		}
		
	};

	$.storage = storage.init();

})(jQuery)