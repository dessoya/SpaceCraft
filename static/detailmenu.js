
var DetailMenu = Class.inherit({

	onCreate: function() {
		this.item = 'main';
	},

	update: function() {
		if(userinfo && userinfo.user_uuid) {
			this.AuthMenu();
		}
		else {
			this.UnAuthMenu();	
		}
	},

	UnAuthMenu: function() {
		detail.innerHTML = '';
	},

	makeDetailItem: function(hash, title, section) {
		return section === this.item ?
			'<div><a href="'+hash+'">[ '+title+' ]</a></div>' :
			'<div>&nbsp;&nbsp;<a href="'+hash+'">'+title+'</a></div>';
	},

	AuthMenu: function() {

		var html = '<div class="usermenu">';
		html += this.makeDetailItem('#','главная', 'main');
		html += this.makeDetailItem('#profile','профиль', 'profile');
		html += this.makeDetailItem('#capital','столица', 'capital');
		html += this.makeDetailItem('#ыныеуьы','системы', 'systems');
		html += this.makeDetailItem('#planets','планеты', 'planets');
		html += this.makeDetailItem('#galaxys','галактики', 'galaxys');
		html += '</div>';

		detail.innerHTML = html;
	},

	setItem: function(item) {
		this.item = item;
	}
})