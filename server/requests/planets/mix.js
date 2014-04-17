'use strict'

module.exports = {
	'/api/planets/get':					require('./get.js'),
	'/api/planets/build':				require('./build.js'),
	'/api/planets/build_list':			require('./build_list.js'),
	'/api/planets/building/level_up':	require('./building/level_up.js'),
	'/api/planets/building/turn_on':	require('./building/turn_on.js'),
	'/api/planets/building/turn_off':	require('./building/turn_off.js'),
}