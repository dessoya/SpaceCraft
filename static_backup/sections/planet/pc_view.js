
var PCView = Class.inherit({

	onCreate: function() {
		this.name = 'view';
	},

	deactivate: function() {
	},

	activate: function() {
		this.onSelectBuilding();
	},

	mouseMove: function(x, y) {

		var overed = null;

		var map = {}
		for(var i = 0, b = section.buildings, l = b.length; i < l; i++) {
			var item = b[i];
			var key = item.x + '-' + item.y;
			map[key] = item;
		}

		for(var by = 11; by >= 0; by--) {
			for(var bx = 11; bx >= 0; bx--) {

				var x1 = section.xpos(10 + bx * 80, 10 + by * 80 + 80), x2 = section.xpos(10 + bx * 80 + 80, 10 + by * 80);
				var y1 = section.ypos(10 + bx * 80, 10 + by * 80, 250), y2 = section.ypos(10 + bx * 80 + 80, 10 + by * 80 + 80);

				if(x >= x1 && x <= x2 && y >= y1 && y <= y2) {
					var key = bx + '-' + by;
					if(key in map) {

						overed = map[key].building_uuid;
						break;
					}
				}
			}			
			if(overed) break;
		}
/*
		var b = section.buildings, c = b.length; while(c--) {
			var item = b[c];
			var x1 = section.xpos(10 + item.x * 80, 10 + item.y * 80 + 80), x2 = section.xpos(10 + item.x * 80 + 80, 10 + item.y * 80);
			var y1 = section.ypos(10 + item.x * 80, 10 + item.y * 80, 250), y2 = section.ypos(10 + item.x * 80 + 80, 10 + item.y * 80 + 80);

			if(x >= x1 && x <= x2 && y >= y1 && y <= y2) {
				overed = item.building_uuid;
				break;
			}
		}
*/

		if(overed !== section.overed) {
			section.overed = overed;
			if(overed === null) {
				planet_canvas.style.cursor = 'default';
			}
			else {
				planet_canvas.style.cursor = 'pointer';
			}
		}
	},

	mouseDown: function() {
		if(section.overed) {
			if(section.selected !== section.overed) {
				section.selected = section.overed;
			}
		}
		else {
			this.selected = null;
		}
		this.onSelectBuilding()
	},

	onSelectBuilding: function() {

		if(section.selected) {

			var item = section.bmap[section.selected];

			var html = '<br>';
			html +='<div><div style="float:left"><span class="bld_type">'+section.buildingNames[item.type]+'</span> '+item.level+' lvl';

			if(item.upgrading === 1) html += '&nbsp;<span class="hint" title="Постройка в процессе улучшения">-> '+(item.level + 1)+'</span></div><div title="Постройка в процессе улучшения" class="timer"></div>';
			else {
				html += '&nbsp;<button title="Запустить улучшение до '+(item.level + 1)+' уровня" onclick="levelUp()">-> '+(item.level + 1)+'</button></div>';
			}
			html += '<div style="clear:both"></div></div>';

			if(item.upgrading !== 1) {	
				html += 'требования по улучшению<br>';		
				if(item.l_time) html += 'time: '+item.l_time+'<br>';
				if(item.l_pop) html += 'pop: '+item.l_pop+'<br>';
				if(item.l_minerals) html += 'minerals: '+item.l_minerals+'<br>';
				if(item.l_crystals) html += 'crystals: '+item.l_crystals+'<br>';
			}

			html += '<br>';

			if(item.type > 2) { // skip capital and warehouse
				html += (item.turn_on === 1 ? '<span style="color:green">работает' : '<span style="color:red">выключено')+'</span>&nbsp;';
				html += (item.turn_on === 1 ? '<button onclick="turnOff()">откл.</button>' : '<button onclick="turnOn()">вкл.</button>');
				html += '<br>';		
			}

			if(item.energyProduced) html += 'energy: <span style="color:green">+'+item.energyProduced+'</span><br>';
			if(item.energyUsage) html += 'energy: <span style="color:red">-'+item.energyUsage+'</span><br>';
			if(item.popInHour) html += 'pop: <span style="color:green">+'+item.popInHour+'</span> per hour<br>';
			if(item.popUsage) html += 'pop usage: <span style="color:red">-'+item.popUsage+'</span><br>';
			if(item.mineralsInHour) html += 'minerals: <span style="color:green">+'+item.mineralsInHour+'</span> per hour<br>';
			if(item.crystalsInHour) html += 'crystals: <span style="color:green">+'+item.crystalsInHour+'</span> per hour<br>';
		
			pcsubmenu.innerHTML = '<div class="building_info">'+html+'</div>';
			hover.apply(pcsubmenu);
		}
		else {
			pcsubmenu.innerHTML = '';
		}
	},

	onLoadPlanetInfo: function() {
		this.onSelectBuilding();
	},

});

