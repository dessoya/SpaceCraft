
var SectionProfile = Class.inherit({

	save: function() {
		var un = username.value;

		AJAX.create({
			type: 'json',
			post: JSON.stringify({ username: un }),
			url: selfDomain() + '/api/profile/save',
			success: function(answer, ctx) {
				window.location.hash = '';
				initSession();
			}
		})
	},

	activate: function() {
		detailmenu.setItem('profile');

		if(userinfo.username) {
			view.innerHTML = 'username: <input type="text" id="username" value="'+userinfo.username+'" /><br><button onclick="sections.sections.profile.save()">сохранить</button>';
			username.focus();
		}
		else {
			window.location.hash = '';
		}
	}
})