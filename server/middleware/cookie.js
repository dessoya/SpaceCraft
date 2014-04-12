'use strict'

var re_spliter = /\s*\;\s*/, re_args_spliter = /\s*=\s*/

module.exports = {
	'?middleware': function(req,res,info) {
		var cookie = req._cookie = {}
		if(req.headers.cookie) {
			var pairs = req.headers.cookie.split(re_spliter)
			var i = pairs.length; while(i--) {
				var p = pairs[i].split(re_args_spliter)
				cookie[p[0]] = p[1]
			}
		}
		// console.dir(cookie)
	}
}