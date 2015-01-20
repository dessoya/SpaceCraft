apps = {
	'188.244.38.210': 'sc_work',
	'192.168.88.253': 'sc_home'
}

authservice = 'http://ilion-clan.org:11500';

function selfDomain() {
	return 'http://' + document.domain + (location.port ? ':' + location.port : '');
}
