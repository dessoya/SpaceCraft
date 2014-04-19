
var UserMenu = Class.inherit({

	update: function() {
		if(userinfo && userinfo.user_uuid) {
			this.AuthMenu();
		}
		else {
			this.UnAuthMenu();	
		}
	},

	UnAuthMenu: function() {
		auth_list.innerHTML = 
		[
		 '<a href="'+authservice+'/api/vk?app='+app+'&sess='+sess+'">[ vk ]</a>',
		 '<a href="'+authservice+'/api/facebook?app='+app+'&sess='+sess+'">[ facebook ]</a>',
		'<a href="'+authservice+'/api/gmail?app='+app+'&sess='+sess+'">[ google ]</a>'
		].join('') + '<span style="float:right">Войти через: </span>'
	},

	AuthMenu: function() {

		var plus = [];
		var argplus;

		if(userinfo.google_uuid) {
			argplus = 'from=google&uuid='+userinfo.google_uuid;
		}
		else if(userinfo.vk_uuid) {
			argplus = 'from=vk&uuid='+userinfo.vk_uuid;
		}
		else if(userinfo.facebook_uuid) {
			argplus = 'from=facebook&uuid='+userinfo.facebook_uuid;
		}

		if(!userinfo.google_uuid) plus.push('<a href="'+authservice+'/api/gmail?app='+app+'&'+argplus+'&sess='+sess+'">[ + google ]</a>&nbsp;');
		if(!userinfo.vk_uuid) plus.push('<a href="'+authservice+'/api/vk?app='+app+'&'+argplus+'&sess='+sess+'">[ + vk ]</a>&nbsp;');
		if(!userinfo.facebook_uuid) plus.push('<a href="'+authservice+'/api/facebook?app='+app+'&'+argplus+'&sess='+sess+'">[ + facebook ]</a>&nbsp;');
		auth_list.innerHTML = plus.join('')
		auth_list.innerHTML += '<a href="javascript:logout()">[ logout ]</a><a href="#profile">'+userinfo.username+'</a><span style="float:right">hello </span>';

	}
})