'use strict'

var Class			= require('class')

var Capital = Class.inherit({
	onCreate: function() {

		this.typeId = 1

		this.levelParams = {
		}

		for(var level = 1; level < 30; level++) {
			var item = this.levelParams[level] = {
				energyProduced:		Math.floor(20 * level * Math.pow(1.1, level)),
				popInHour:			Math.floor(10 * level * Math.pow(1.1, level)),
				level_up: {
					minerals:	Math.floor(700 * Math.pow(2.5, level - 1)),
					crystals:	Math.floor(400 * Math.pow(2.5, level - 1)),
					pop:		Math.floor(55 * level * Math.pow(1.1, level)),
				}
			}
			// item.level_up.time = ((item.level_up.minerals + item.level_up.crystals) / 2500) * [1 / (уровень фабрики роботов+1)] * 0,5^уровень фабрики нанитов 
			item.level_up.time = Math.floor( ((item.level_up.minerals + item.level_up.crystals) / 2500) * 1 * Math.pow(0.5, 0) * 1000);
			item.level_up.time = Math.floor( item.level_up.time / config.rate )
			if(item.level_up.time === 0) item.level_up.time = 1

			item.popInHour *= config.rate
			item.popInSec = item.popInHour / ( 60 * 60 )
		}

	},

	getInfo: function(info) {
		info.energyProduced = this.levelParams[info.level].energyProduced
		info.popInHour = this.levelParams[info.level].popInHour
	}
})

module.exports = Capital