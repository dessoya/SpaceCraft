
TopUserMenu = Class.inherit({

	setUnauthMenu: function(params) {

		usermenu.innerHTML = tmpls.TopUserMenu_unauth({
			authservice:'http://livegx.net:11500',
			session_uuid:params.session_uuid,
			methods:[{
				title: 'google',
				name: 'google',
				width: 55
			},{
				title: 'facebook',
				name: 'facebook',
				width: 68
			},{
				title: 'vk',
				name: 'vk',
				width: 34
			}]
		})

	},

	setAuthMenu: function(params) {

		usermenu.innerHTML = tmpls.TopUserMenu_auth({
			authservice:'http://livegx.net:11500',
			session_uuid:params.session_uuid,
			username:params.user.username,
			exists_methods: { google: params.user.google_uuid, facebook: params.user.facebook_uuid, vk: params.user.vk_uuid },
			methods:[{
				title: 'google',
				name: 'google'
			},{
				title: 'facebook',
				name: 'facebook'
			},{
				title: 'vk',
				name: 'vk'
			}]
		})

	}

})