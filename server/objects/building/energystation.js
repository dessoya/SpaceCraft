'use strict'

var Class			= require('class')
  , util			= require('util')

var EnergyStation = Class.inherit({
	onCreate: function() {

		this.typeId = 3

		this.levelParams = {
		}

		for(var level = 1; level < 30; level++) {
			var item = this.levelParams[level] = {
				popUsage:			Math.floor(10 * level * Math.pow(1.1, level)),
				energyProduced:		Math.floor(20 * level * Math.pow(1.1, level)),
				level_up: {
					minerals:	Math.floor(75 * Math.pow(1.5, level - 1)),
					crystals:	Math.floor(30 * Math.pow(1.5, level - 1)),
					pop:		Math.floor(5 * level * Math.pow(1.1, level)),
				}
			}
			// item.level_up.time = ((item.level_up.minerals + item.level_up.crystals) / 2500) * [1 / (уровень фабрики роботов+1)] * 0,5^уровень фабрики нанитов 
			item.level_up.time = Math.floor( ((item.level_up.minerals + item.level_up.crystals) / 2500) * 1 * Math.pow(0.5, 0) * 1000);
			item.level_up.time = Math.floor( item.level_up.time / config.rate )
			if(item.level_up.time === 0) item.level_up.time = 1
		}
		var l = this.levelParams[1].level_up
		this.levelParams[0] = { level_up: { minerals: Math.floor(l.minerals / 2), crystals: Math.floor(l.crystals / 2), time: Math.floor(l.time/ 2) } }
		// console.log(util.inspect(this.levelParams,{depth:null}))
	},

	getInfo: function(info) {
		info.energyProduced = this.levelParams[info.level].energyProduced
		info.popUsage = this.levelParams[info.level].popUsage
	}

})

module.exports = EnergyStation