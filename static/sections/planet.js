
var SectionPlanet = Class.inherit({

	onCreate: function() {
		this.binded_onLoadPlanet = this.onLoadPlanet.bind(this);
		this.binded_animate = this.animate.bind(this);
	},

	activate: function(params) {
		var planet_uuid = params[0];
		view.innerHTML = '';

		AJAX.create({
			type: 'json',
			post: JSON.stringify({planet_uuid: planet_uuid}),
			url: selfDomain() + '/api/planets/get',
			success: this.binded_onLoadPlanet
		})
	},

	onLoadPlanet: function(answer) {
		if(answer && answer.status && answer.status === 'ok') {

			var planet = answer.result;
			// console.log(planet);
			if(planet) {
				// activateSection('planet/'+capital.planet_uuid);
				view.innerHTML = '<canvas id="planet_canvas" style="opacity:0.8" width="780" height="600"></canvas>';
				this.ctx = planet_canvas.getContext('2d');

				planet_canvas.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
				planet_canvas.addEventListener( 'mousedown', this.onMouseDown.bind(this), false );

				var rect = planet_canvas.getBoundingClientRect();
				this.cyo = rect.top;
				this.cxo = rect.left;

				this.buildings = planet.buildings;
				this.buildings.push({x:3,y:3})

				this.buildings.sort(function(a,b) {
					if(a.y == b.y) {
						if(a.x == b.x) return 0
						return a.x < b.x ? -1 : 1;
					}
					return a.y < b.y ? -1 : 1;
				})

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
			}
			else {
				view.innerHTML = 'error while loading planet info';
			}
		}
		else {
			view.innerHTML = 'problem with loading planet';
		}
	},

	animate: function() {
		requestAnimationFrame( this.binded_animate );
		this.selphase ++;
		this.render();
	},

	onMouseDown: function ( event ) {
		event.preventDefault();
		if(this.overed && this.selected !== this.overed) {
			this.selected = this.overed;
			// this.render();
		}
	},

	onMouseMove: function ( event ) {

		event.preventDefault();

		var x = event.clientX - this.cxo;
		var y = event.clientY - this.cyo;

		var overed = null;
		var b = this.buildings, c = b.length; while(c--) {
			var item = b[c];
			var x1 = this.xpos(10 + item.x * 80, 10 + item.y * 80 + 80), x2 = this.xpos(10 + item.x * 80 + 80, 10 + item.y * 80);
			var y1 = this.ypos(10 + item.x * 80, 10 + item.y * 80, 250), y2 = this.ypos(10 + item.x * 80 + 80, 10 + item.y * 80 + 80);
			console.log(x1+' '+y1+' '+x2+' '+y2+' '+x+' '+y);
			if(x >= x1 && x <= x2 && y >= y1 && y <= y2) {
				overed = item;
				break;
			}
		}
		if(overed !== this.overed) {
			this.overed = overed;
			// console.log(overed);
			// this.render();
		}
	},

	xpos: function(x, y, h) {
		h = h ? h : 0;
		return Math.floor(this.xo + x * this.xp - y * this.xyp ) + 0.5;
	},

	ypos: function(x, y, h) {
		h = h ? h : 0;
		return Math.floor(this.b + y * this.yp + x * this.yxp - h * this.yhp) + 0.5;
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
		for(var i = 0, b = this.buildings, l = b.length; i < l; i++) {
			var item = b[i];
			this.drawHouse(10 + item.x * 80, 10 + item.y * 80, 80, 80, this.overed === item, this.selected === item);
		}
	},

	drawHouse: function(x, y, w, h, overed, selected) {
		var ctx = this.ctx;

		if(overed) {
			ctx.fillStyle		= '#aaaaaa';
		}
		else {
			ctx.fillStyle		= '#444444';
		}

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
	},
})
