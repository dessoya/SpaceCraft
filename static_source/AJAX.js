
AE_STATUS_0				= 1;
AE_STATUS_NOT_200		= 2;
AE_JSON_PARSE			= 3;
AE_WRONG_JSON_FOMRAT	= 4;
AE_JSON_STATUS_ERROR	= 5;

AJAX = Class.inherit({
	onCreate: function(prop) {

		this.type		= prop.type;
		this.onRequest_	= prop.onRequest;
		this.req		= new XMLHttpRequest();
		this.req.onreadystatechange = this.onRequest.bind(this);

		var url = prop.url, list = ['ac='+Math.random()];
		for(var name in prop.params)
			list.push(name+'='+encodeURIComponent(prop.params[name]));
		if(list.length) url+='?'+list.join('&');

		if(prop.post) {
			this.method = "POST";
			this.request = prop.post;
		}
		else {
			this.method = "GET";
		}
		this.url = url;
		this.req.open(this.method, url, true);
    	this.req.send(this.request);
	},

	onRequest: function() {
		// console.log(this.url+' '+this.req.readyState+' '+this.req.status);
        if (this.req.readyState == 4) {
			if(this.req.status == 0) {
	            this.onRequest_(AE_STATUS_0);
			}
			else if(this.req.status == 200) {
				var answer = this.req.responseText;
				if('json' === this.type) {	
					var json;
			        try {
						json = JSON.parse(answer);
			        } catch (e) {
						json = null;
					}
					var error = null, result = null;
					if(json) {
						result = json;
						if('object' === typeof json && json.status) {
							if(json.status === 'ok') {
								result = json.result;
							}
							else {
								error = AE_JSON_STATUS_ERROR;							
							}
						}
					    else {
							error = AE_WRONG_JSON_FOMRAT;
						}
					}
					else {
						error = AE_JSON_PARSE;
					}

					this.onRequest_(error, result)
				}
				else {          
		            this.onRequest_(null, answer);
				}
			}
			else {
            	this.onRequest_(AE_STATUS_NOT_200, this.req.status);
			}
		}
    }
});