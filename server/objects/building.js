'use strict'

global.BT_CAPITAL			= 1
global.BT_WAREHOUSE			= 2
global.BT_ENERGYSTATION		= 3
global.BT_MMINE				= 4
global.BT_CMINE				= 5

var Class			= require('class')

var Building = Class.inherit({
	onCreate: function() {
		this.capital = require('./building/capital.js').create()
		this.warehouse = require('./building/warehouse.js').create()
		this.energystation = require('./building/energystation.js').create()
		this.mineralsmine = require('./building/mineralsmine.js').create()
		this.crystalsmine = require('./building/crystalsmine.js').create()

		this.typeMap = {
			1: this.capital,
			2: this.warehouse,
			3: this.energystation,
			4: this.mineralsmine,
			5: this.crystalsmine,
		}
	},

	getInfo: function(info,row) {
		var treator = this.typeMap[info.type]

		if(info.upgrading === 1) {
			info.upgrade_elapsed = row.upgrade_elapsed
			info.upgrade_time = treator.levelParams[info.level].level_up.time
			info.upgrade_in_progress = row.upgrade_in_progress
		}

		var l = treator.levelParams[info.level].level_up
		if(l) {
			if(l.minerals) info.l_minerals = l.minerals
			if(l.crystals) info.l_crystals = l.crystals
			if(l.pop) info.l_pop = l.pop
			if(l.time) info.l_time = l.time
		}

		treator.getInfo(info)
	}
})

module.exports = Building