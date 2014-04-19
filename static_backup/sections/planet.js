
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
		this.binded_animate = this.animate.bind(this);

		this.planetinfo = SP_PlanetInfo.create(this);

		this.pc = [ PCView.create(), PCBuild.create() ];
		this.pc_item = -1;
		this.active_pc = null;
	},

	deactivate: function() {
		cancelAnimationFrame(this.requestId);
		if(this.active_pc) this.active_pc.deactivate();
		this.planetinfo.deactivate();
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
		this.planetinfo.activate(planet_uuid);
	},

	// misc
	loadPlanetInfo: function() {
		this.planetinfo.loadPlanetInfo();
	},

	buildingNames: {
		1: 'Столица',
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

	onLoadPlanetInfo: function(err) {
		this.buildings = this.planetinfo.buildings;
		var c = this.buildings.length; this.bmap = {}; while(c--) {
			var b = this.buildings[c];
			this.bmap[b.building_uuid] = b;
		}

		if(this.active_pc) this.active_pc.onLoadPlanetInfo();
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
		timerInfo('planet animate');
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
		var xb = this.xpos(x,y,270) - 4, yb = this.ypos(x,y,270) - 4
		ctx.fillText(this.buildingNames[type], xb, yb);
		ctx.fillStyle = (bld.turn_on === 1) ? '#fff' : '#f00';
		ctx.fillText(this.buildingNames[type], xb + 1, yb + 1);

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
