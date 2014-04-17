'use strict'

var Class			= require('class')
  , util			= require('util')

var MineralsMine = Class.inherit({
	onCreate: function() {

		this.typeId = 4

		this.levelParams = {
		}

		for(var level = 1; level < 30; level++) {
			var item = this.levelParams[level] = {
				popUsage:			Math.floor(11 * level * Math.pow(1.1, level)),
				energyUsage:		Math.floor(10 * level * Math.pow(1.1, level)),
				crystalsInHour:		Math.floor(20 * level * Math.pow(1.1, level)),
				level_up: {
					minerals:	Math.floor(48 * Math.pow(1.6, level - 1)),
					crystals:	Math.floor(24 * Math.pow(1.6, level - 1)),
					pop:		Math.floor(6 * level * Math.pow(1.1, level)),
				}
			}
			// item.level_up.time = ((item.level_up.minerals + item.level_up.crystals) / 2500) * [1 / (уровень фабрики роботов+1)] * 0,5^уровень фабрики нанитов 
			item.level_up.time = Math.floor( ((item.level_up.minerals + item.level_up.crystals) / 2500) * 1 * Math.pow(0.5, 0) * 1000);
			item.level_up.time = Math.floor( item.level_up.time / config.rate )
			if(item.level_up.time === 0) item.level_up.time = 1
			item.crystalsInHour *= config.rate
			item.crystalsInSec = item.crystalsInHour / ( 60 * 60 )
		}
		var l = this.levelParams[1].level_up
		this.levelParams[0] = { energyUsage: 0, popUsage: Math.floor(l.pop / 2), level_up: { pop: Math.floor(l.pop / 2), minerals: Math.floor(l.minerals / 2), crystals: Math.floor(l.crystals / 2), time: Math.floor(l.time/ 2) } }
	},

	getInfo: function(info) {
		if(this.levelParams[info.level].crystalsInHour) info.crystalsInHour = this.levelParams[info.level].crystalsInHour
		info.popUsage = this.levelParams[info.level].popUsage
		info.energyUsage = this.levelParams[info.level].energyUsage
	}
})

module.exports = MineralsMine