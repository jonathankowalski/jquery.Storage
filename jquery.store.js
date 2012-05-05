(function($){

	var storage = {
		init: function(params){
			this.params = $.extend({
				env: "debug"
			}, params);
			if(!window.localStorage){
				this.local = false;
			}
			return this;
		},

		setLocal: function(key, value){},

		setSession: function(key, value){},

		get: function(key, context){},

		remove: function(key, context){},

		flush: function(){},

		__set: function(key, value){}
	};

	$.store = storage.init();

})(jQuery)