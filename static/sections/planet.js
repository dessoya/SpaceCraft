
// dom helpers
function levelUp() {
	AJAX.create({
		type: 'json',
		post: JSON.stringify({planet_uuid: section.planet_uuid, building_uuid: section.selected}),
		url: selfDomain() + '/api/planets/building/level_up',
		success: function(answer) {
			var result = answer.result
			if(result.result) {
				section.loadPlanetInfo();
			}
			else {
				if(result.not_enought) alert('не удалось запустить улучшение ! причина '+result.not_enought);
				else alert('не удалось запустить улучшение !');
			}
		}
	})
}

function turnOn() {
	AJAX.create({
		type: 'json',
		post: JSON.stringify({planet_uuid: section.planet_uuid, building_uuid: section.selected}),
		url: selfDomain() + '/api/planets/building/turn_on',
		success: function(answer) {
			var result = answer.result
			if(result.result) {
				section.loadPlanetInfo();
			}
			else {
				if(result.not_enought) alert('не удалось активировать ! причина '+result.not_enought);
				else alert('не удалось активировать !');
			}
		}
	})
}

function turnOff() {
	AJAX.create({
		type: 'json',
		post: JSON.stringify({planet_uuid: section.planet_uuid, building_uuid: section.selected}),
		url: selfDomain() + '/api/planets/building/turn_off',
		success: function(answer) {
			section.loadPlanetInfo();
		}
	})
}

var SectionPlanet = Class.inherit({

	onCreate: function() {

		this.binded_onLoadPlanet = this.onLoadPlanet.bind(this);
		this.binded_animate = this.animate.bind(this);

		this.planetinfo = SP_PlanetInfo.create();

		this.pc = [ PCView.create(), PCBuild.create() ];
		this.pc_item = -1;
		this.active_pc = null;
	},

	deactivate: function() {
		clearInterval(this.interval);
		cancelAnimationFrame(this.requestId);
		if(this.active_pc) this.active_pc.deactivate();
	},

	activate: function(params) {

		this.pc[0].overed = null;
		this.pc[0].selected = null;

		var planet_uuid = this.planet_uuid = params[0];

		detail_submenu.innerHTML = '<div id="pcmenu"></div><div id="pcsubmenu"></div>';

		this.activatePC(0);

		view.innerHTML = '<div id="planet_info">&nbsp;</div><br><canvas id="planet_canvas" style="opacity:0.8" width="780" height="600"></canvas>';
		this.ctx = planet_canvas.getContext('2d');

		planet_canvas.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
		planet_canvas.addEventListener( 'mousedown', this.onMouseDown.bind(this), false );

		var rect = planet_canvas.getBoundingClientRect();
		this.cyo = rect.top;
		this.cxo = rect.left;

		this.buildings = [];

		this.w = 780; this.h = 600;

		this.b = Math.floor(this.h - this.h / 3) - 10;
		this.yo = Math.floor( (this.h / 3) / 5 ) + 10;
		this.xo = Math.floor( this.w / 5 ) + 10;

		this.xp = (this.w - this.xo) / 1010;
		this.xyp = this.xo / 1010;

		this.yp = (this.h / 3 - this.yo) / 1010;
		this.yxp = (this.yo) / 1010;
		this.yhp = 200 / 1010;

		this.overed = null;
		this.selphase = 0;

		this.animate();

		this.planet = null;

		this.interval = setInterval(this.onInterval.bind(this), 700);

		this.loading = false;
		this.loadPlanetInfo();
	},

	// misc

	buildingNames: {
		1: 'Capital',
		2: 'Warehouse',
		3: 'EStation',
		4: 'MMine',
		5: 'CMine',
	},

	// planet controlers section

	activatePC: function(item) {

		if(this.pc_item === item) return;
		this.pc_item = item;
		if(this.active_pc) this.active_pc.deactivate();
		this.active_pc = this.pc[item];
		this.makePCMenu();

		pcsubmenu.innerHTML = '';
		this.active_pc.activate();
	},

	makePCMenu: function() {
		var html = [];
		for(var i = 0; i < this.pc.length; i++) {
			html.push('<div onclick="section.activatePC('+i+')" class="mitem '+(i === this.pc_item ? 'active':'')+'">'+this.pc[i].name+'</div>');
		}
		pcmenu.innerHTML = '<div>'+html.join('')+'<div style="clear:both"></div></div>';
	},

	// planet info stuff

	loadPlanetInfo: function() {
		if(this.loading) return;

		this.loading = true;
		AJAX.create({
			type: 'json',
			post: JSON.stringify({planet_uuid: this.planet_uuid}),
			url: selfDomain() + '/api/planets/get',
			success: this.binded_onLoadPlanet
		})
	},

	onLoadPlanet: function(answer) {
		this.loading = false;
		this.loadTime = Date.now();

		if(answer && answer.status && answer.status === 'ok') {

			var planet = answer.result;
			// console.log(planet);
			if(planet) {

				this.buildings = planet.buildings;

				this.buildings.sort(function(a,b) {
					if(a.y == b.y) {
						if(a.x == b.x) return 0;
						return a.x < b.x ? -1 : 1;
					}
					return a.y < b.y ? -1 : 1;
				})

				var c = this.buildings.length; this.bmap = {}; while(c--) {
					var b = this.buildings[c];
					this.bmap[b.building_uuid] = b;
				}

				this.planet = planet.planet;
				this.time = Date.now();
				this.makePlanetInfo();

				if(this.active_pc) this.active_pc.onLoadPlanetInfo();
			}
			else {
				view.innerHTML = 'error while loading planet info';
				this.deactivate();
			}
		}
		else {
			view.innerHTML = 'problem with loading planet';
			this.deactivate();
		}
	},

	onInterval: function() {
		if(!this.loading && Date.now() - this.loadTime > 1000 *5) {
			this.loadPlanetInfo();
		}

		if(this.planet) {

			var delta = Math.floor( (Date.now() - this.time) / 1000 );
			if(delta > 0) {
				this.planet.population += delta * this.planet.population_sinc;
				this.planet.minerals += delta * this.planet.minerals_sinc;
				this.planet.crystals += delta * this.planet.crystals_sinc;
				this.time += delta * 1000;
				this.makePlanetInfo();

				var need_load = false, c = this.buildings.length; while(c--) {
					var b = this.buildings[c];
					if(b.upgrading === 1 && b.upgrade_in_progress === 1) {
						b.upgrade_elapsed  += delta
						if(b.upgrade_elapsed >= b.upgrade_time) {
							b.upgrading = 0
							need_load = true
						}
					}		
				}

				if(need_load) {
					this.loadPlanetInfo()
				}
			}

		}
	},

	makePlanetInfo: function() {
		if(this.planet) {
			var html = '';
			html += '<div>';

			html += '<div class="resicon population" title="население"></div>';
			html += '<div class="label" title="всего">' + Math.floor(this.planet.population).humanView()+'M</div>';
			if(this.planet.population_usage > 0) {
				html += '<div class="div">/</div>';
				html += '<div class="label green" title="безработные">' + Math.floor(this.planet.population_usage).humanView() + 'M</div>';
			}
			else {
				html += '<div class="label" title="безработные">( '+(this.planet.population_usage < 0 ? 'нехватка '+(Math.floor(-1*this.planet.population_usage)) : 'безработные '+Math.floor(this.planet.population_usage) )+' )';
			}

			html += '<div class="resicon energy" title="энергия"></div>';
			html += '<div class="label" title="общая выработка энергии">' + Math.floor(this.planet.energy).humanView()+'</div>';
			html += '<div class="div">/</div>';
			html += '<div class="label green" title="свободная энергия">' + Math.floor(this.planet.energy - this.planet.bld_energy_usage).humanView()+'</div>';
			if(this.planet.energy_usage < 0) {
				html += '<div class="div">/</div>';
				html += '<div class="label red" title="нехватка энергии для населения">' + Math.floor(-1 * this.planet.energy_usage).humanView()+'</div>';
			}

			html += '<div class="resicon metal" title="металл"></div>';
			html += '<div class="label" title="вместимость склада для металла">' + Math.floor(this.planet.wh_minerals).humanView() + '</div>';
			html += '<div class="div">/</div>';
			html += '<div class="label" title="металла на складе">' + Math.floor(this.planet.minerals).humanView()+'</div>';
			html += '<div class="div">/</div>';
			html += '<div class="label" title="добыча металла в час">5</div>';

			html += '<div class="resicon crystal" title="кристаллы"></div>';
			html += '<div class="label" title="вместимость склада для кристаллов">' + Math.floor(this.planet.wh_crystals).humanView() + '</div>';
			html += '<div class="div">/</div>';
			html += '<div class="label" title="кристаллов на складе">' + Math.floor(this.planet.crystals).humanView()+'</div>';
			html += '<div class="div">/</div>';
			html += '<div class="label" title="добыча скристаллов в час">5</div>';

			html += '<div style="clear:both"></div></div>';
			planet_info.innerHTML = html;
		}
	},

	onMouseDown: function ( event ) {
		event.preventDefault();
		if(this.active_pc) this.active_pc.mouseDown();
	},

	onMouseMove: function ( event ) {

		event.preventDefault();

		var x = event.clientX - this.cxo;
		var y = event.clientY - this.cyo;

		if(this.active_pc) this.active_pc.mouseMove(x, y);
	},

	xpos: function(x, y, h) {
		h = h ? h : 0;
		return Math.floor(this.xo + x * this.xp - y * this.xyp ) + 0.5;
	},

	ypos: function(x, y, h) {
		h = h ? h : 0;
		return Math.floor(this.b + y * this.yp + x * this.yxp - h * this.yhp) + 0.5;
	},

	animate: function() {
		this.requestId = requestAnimationFrame( this.binded_animate );
		this.selphase ++;
		this.render();
	},

	render: function() {
		var ctx = this.ctx;

		ctx.fillStyle = '#000000';
		ctx.fillRect(0, 0, this.w, this.h);

		ctx.strokeStyle		= '#ffffff';
		ctx.fillStyle		= '#222222';

		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(this.xpos(10,  10 ), this.ypos(10,  10 ));
		ctx.lineTo(this.xpos(990, 10 ), this.ypos(990, 10 ));
		ctx.lineTo(this.xpos(990, 990), this.ypos(990, 990));
		ctx.lineTo(this.xpos(10,  990), this.ypos(10,  990));

		ctx.closePath();				
		ctx.fill();
		ctx.stroke();

		// this.drawHouse(890, 890, 100, 100);
		var map = {}
		for(var i = 0, b = this.buildings, l = b.length; i < l; i++) {
			var item = b[i];
			var key = item.x + '-' + item.y;
			map[key] = item;
		}

		var pkey = null;
		if(this.phantom) {
			pkey = this.phantom.x + '-' + this.phantom.y;
		}

		this.conflict = false;
		for(var by = 0; by < 12; by++) {
			for(var bx = 0; bx < 12; bx++) {
				var key = bx + '-' + by;
				if(key in map) {
					var item = map[key];
					this.drawHouse(10 + item.x * 80, 10 + item.y * 80, 80, 80, item, item.type, 
						this.overed === item.building_uuid,
						this.selected === item.building_uuid,
						key === pkey
					);
					if(key === pkey) this.conflict = true;
				}
				else if(pkey === key) {
					this.drawHouse(10 + bx * 80, 10 + by * 80, 80, 80, { turn_on: 1 }, this.phantom.type, false, false);
				}
			}
		}
	},

	drawHouse: function(x, y, w, h, bld, type, overed, selected, conflict) {
		var ctx = this.ctx;

		var colors = {
			1: [ '#444422', '#aaaa44' ],
			2: [ '#444444', '#aaaaaa' ],
			3: [ '#224422', '#44aa44' ],
			4: [ '#224444', '#44aaaa' ],
			5: [ '#222244', '#4444aa' ],
		}

		if(conflict) {
			ctx.fillStyle = '#ff3344';
			ctx.strokeStyle		= '#dddddd';
			ctx.lineWidth = 1;
		}
		else {

		ctx.fillStyle = colors[type][overed ? 1 : 0]

		if(selected) {
			var c = this.selphase % 200;
			if(c > 100) {
				c -= 100;
				c = 100 - c;
				var b = c + 100;
				ctx.strokeStyle		= 'rgb('+b+','+c+','+c+')';
			}
			else {
				var b = c + 100;
				ctx.strokeStyle		= 'rgb('+b+','+c+','+c+')';
			}
			ctx.lineWidth = 3;
		}
		else {
			ctx.strokeStyle		= '#dddddd';
			ctx.lineWidth = 1;
		}
		}

		ctx.beginPath();
		ctx.moveTo(this.xpos(x,  y ), this.ypos(x,  y ));
		ctx.lineTo(this.xpos(x,  y, 250), this.ypos(x,  y, 250));
		ctx.lineTo(this.xpos(x + w,  y, 250), this.ypos(x + w,  y, 250));
		ctx.lineTo(this.xpos(x + w,  y), this.ypos(x + w,  y));
		ctx.closePath();				
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(this.xpos(x,  y ), this.ypos(x,  y ));
		ctx.lineTo(this.xpos(x,  y, 250), this.ypos(x,  y, 250));
		ctx.lineTo(this.xpos(x,  y + h , 250), this.ypos(x,  y + h, 250));
		ctx.lineTo(this.xpos(x,  y + h ), this.ypos(x,  y + h));
		ctx.closePath();				
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(this.xpos(x,  y + h), this.ypos(x,  y + h));
		ctx.lineTo(this.xpos(x,  y + h, 250), this.ypos(x,  y + h, 250));
		ctx.lineTo(this.xpos(x + w,  y + h, 250), this.ypos(x + w,  y + h, 250));
		ctx.lineTo(this.xpos(x + w,  y + h), this.ypos(x + w,  y + h));
		ctx.closePath();				
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(this.xpos(x + w,  y + h), this.ypos(x + w,  y + h));
		ctx.lineTo(this.xpos(x + w,  y + h, 250), this.ypos(x + w,  y + h, 250));
		ctx.lineTo(this.xpos(x + w,  y, 250), this.ypos(x + w,  y, 250));
		ctx.lineTo(this.xpos(x + w,  y), this.ypos(x + w,  y));
		ctx.closePath();				
		ctx.fill();
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(this.xpos(x,y,250), this.ypos(x,y,250));
		ctx.lineTo(this.xpos(x+w,y,250), this.ypos(x+w,y,250));
		ctx.lineTo(this.xpos(x+w,y+h,250), this.ypos(x+w,y+h,250));
		ctx.lineTo(this.xpos(x,y+h,250), this.ypos(x,y+h,250));
		ctx.closePath();				
		ctx.fill();
		ctx.stroke();

		
		ctx.font = 'normal 10px Verdana';
		ctx.textBaseline = 'bottom';
		ctx.fillStyle = '#000';
		ctx.fillText(this.buildingNames[type], this.xpos(x,y,270), this.ypos(x,y,270));
		ctx.fillStyle = (bld.turn_on === 1) ? '#fff' : '#f00';
		ctx.fillText(this.buildingNames[type], this.xpos(x,y,270)+1, this.ypos(x,y,270)+1);

		if(bld.upgrading === 1) {

			ctx.lineWidth = 1;

			if(bld.upgrade_in_progress === 1) {
				ctx.fillStyle = '#ffffff';
				ctx.strokeStyle	= '#ffffff';
			}
			else {
				ctx.fillStyle = '#bb5555';
				ctx.strokeStyle	= '#bb5555';
			}
			var x = this.xpos(x,y,270) - 5.5, y = this.ypos(x,y,270) - 25.5

			ctx.fillRect(x, y, 50, 8);
			
			var prc = bld.upgrade_elapsed / (bld.upgrade_time / 48)
			
			ctx.fillStyle = '#000';
			ctx.strokeStyle	= '#000';
			ctx.fillRect(x + 1 + prc, y + 1, 48 - prc, 6);

			ctx.textBaseline = 'bottom';
			if(bld.upgrade_in_progress === 1) {
				ctx.fillStyle = '#fff';
			}
			else {
				ctx.fillStyle = '#bb5555';
			}

			ctx.fillText( Math.floor(bld.upgrade_elapsed / (bld.upgrade_time / 100)) +'%', x, y - 2);
		}
	},
})
