var PCBuild = Class.inherit({
	onCreate: function() {
		this.name = 'build';
		this.active = false;
	},
	deactivate: function() {
		this.active = false;
	},
	activate: function() {
		this.active = true;
		this.getBuildList();
		this.build_type = null;
	},
	getBuildList: function() {
		AJAX.create({
			type: 'json',
			post: JSON.stringify({planet_uuid: section.planet_uuid}),
			url: selfDomain() + '/api/planets/build_list',
			success: function(answer) {
				// console.log(answer)
				if(answer && answer.status && answer.status === 'ok') {
					this.buildings = answer.result.buildings;
					this.makeSubMenu();
				}
				else {
				}
			}.bind(this)
		})
	},

	makeSubMenu: function() {
		var html = [];
		for(var i = 0; i < this.buildings.length; i ++) {
			var item = this.buildings[i]
			html.push('<div onclick="section.active_pc.build('+item.type+')" class="build '+(this.build_type===item.type?' active':'')+'">'+section.buildingNames[item.type]+'</div>')
		}
		pcsubmenu.innerHTML = html.join('')
	},

	build: function(type) {
		this.build_type = type;
		this.makeSubMenu();
	},

	onLoadPlanetInfo: function() {
	},

	mouseMove: function(x, y) {
		if(!this.build_type) return;

		var overed = false;
		for(var by = 11; by >= 0; by--) {
			for(var bx = 11; bx >= 0; bx--) {

				var x1 = section.xpos(10 + bx * 80, 10 + by * 80 + 80), x2 = section.xpos(10 + bx * 80 + 80, 10 + by * 80);
				var y1 = section.ypos(10 + bx * 80, 10 + by * 80, 250), y2 = section.ypos(10 + bx * 80 + 80, 10 + by * 80 + 80);

				if(x >= x1 && x <= x2 && y >= y1 && y <= y2) {
					overed = true;
					break;
				}
			}			
			if(overed) break;
		}

		if(overed) {
			section.phantom = { x: bx, y: by, type: this.build_type };
		}
		else {
			section.phantom = null;
		}

	},

	mouseDown: function() {
		if(section.phantom && !section.conflict) {

			AJAX.create({
				type: 'json',
				post: JSON.stringify({planet_uuid: section.planet_uuid, type: this.build_type, x: section.phantom.x, y: section.phantom.y }),
				url: selfDomain() + '/api/planets/build',
				success: function(answer) {
					section.loadPlanetInfo();
				}.bind(this)
			})

			this.build_type = null;
			section.phantom = null;
			this.makeSubMenu();
		}
	},

});
