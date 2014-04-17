
Number.prototype.humanView = function () {
	return this.toString().split( /(?=(?:\d{3})+(?:\.|$))/g ).join( " " );
}

document.title = "\u2606" + document.title;

usermenu = UserMenu.create();
detailmenu = DetailMenu.create();

function initSession() {
	AJAX.create({
		type: 'json',
		url: selfDomain() + '/api/session/info',
		success: function(answer, ctx) {
			userinfo = answer.result;
			// if(userinfo.username) userResource = UserResource.create(userinfo)
			window.onhashchange()
		}
	})
}


function activateSection(sectionName) {
	// console.log('activate section '+sectionName);
	window.location.hash = sectionName;
}
window.onhashchange = function() {

	var section = window.location.hash;
	if(section.length > 0 && section[0] === '#') section = section.substr(1);

	if(!sections.check(section)) {
		section = 'main';
		window.location.hash = '';
	}
	sections.activate(section);

	usermenu.update();
	detailmenu.update();
}


function selfDomain() {
	return 'http://' + document.domain + (location.port ? ':' + location.port : '');
}
