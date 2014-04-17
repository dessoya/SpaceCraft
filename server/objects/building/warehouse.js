'use strict'

var Class			= require('class')

var Warehouse = Class.inherit({
	onCreate: function() {

		this.typeId = 2

		this.levelParams = {
		}

		for(var level = 1; level < 30; level++) {
			var item = this.levelParams[level] = {
				level_up: {
					minerals:	Math.floor(1000 * Math.pow(2, level - 1)),
					crystals:	Math.floor(100 * Math.pow(2, level - 1)),
					pop:		Math.floor(25 * level * Math.pow(1.1, level)),
				},
				wh_minerals:	Math.floor(10000 * Math.pow(2, level - 1)),
				wh_crystals:	Math.floor(8000 * Math.pow(2, level - 1)),
			}
			item.level_up.time = Math.floor( ((item.level_up.minerals + item.level_up.crystals) / 2500) * 1 * Math.pow(0.5, 0) * 1000);
			item.level_up.time = Math.floor( item.level_up.time / config.rate )
			if(item.level_up.time === 0) item.level_up.time = 1
		}
		var l = this.levelParams[1].level_up
		this.levelParams[0] = { energyUsage: 0, popUsage: Math.floor(l.pop / 2), level_up: { pop: Math.floor(l.pop / 2), minerals: Math.floor(l.minerals / 2), crystals: Math.floor(l.crystals / 2), time: Math.floor(l.time/ 2) } }
	},

	getInfo: function(info) {
	}

})

module.exports = Warehouse