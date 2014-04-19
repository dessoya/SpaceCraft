
var SP_PlanetInfo = Class.inherit({

	onCreate: function(section) {
		this.section = section;
		this.loading = false;
		this.binded_onLoadPlanet = this.onLoadPlanet.bind(this);

		this.elementsStates = { };
		this.fieldsElements = { };

		Object.defineProperties(this, {
			info_pop: {
				get: this.makePrivateGetter('info_pop'),
				set: this.setter_pop.bind(this),
			},
			info_pop_usage: {
				get: this.makePrivateGetter('info_pop_usage'),
				set: this.setter_pop_usage.bind(this),
			},
			info_energy: {
				get: this.makePrivateGetter('info_energy'),
				set: this.setter_energy.bind(this),
			},
			info_bld_energy_usage: {
				get: this.makePrivateGetter('info_bld_energy_usage'),
				set: this.setter_bld_energy_usage.bind(this),
			},
			info_energy_usage: {
				get: this.makePrivateGetter('info_energy_usage'),
				set: this.setter_energy_usage.bind(this),
			},
			info_wh_minerals: {
				get: this.makePrivateGetter('info_wh_minerals'),
				set: this.setter_wh_minerals.bind(this),
			},
			info_minerals: {
				get: this.makePrivateGetter('info_minerals'),
				set: this.setter_minerals.bind(this),
			},
			info_mineralsInHour: {
				get: this.makePrivateGetter('info_mineralsInHour'),
				set: this.setter_mineralsInHour.bind(this),
			},
			info_wh_crystals: {
				get: this.makePrivateGetter('info_wh_crystals'),
				set: this.setter_wh_crystals.bind(this),
			},
			info_crystals: {
				get: this.makePrivateGetter('info_crystals'),
				set: this.setter_crystals.bind(this),
			},
			info_crystalsInHour: {
				get: this.makePrivateGetter('info_crystalsInHour'),
				set: this.setter_crystalsInHour.bind(this),
			},
		});

	},

	elementsState: function(name) {
		if(!(name in this.elementsStates)) this.elementsStates[name] = { display: 'none', content: '', classes: { } };
		return this.elementsStates[name];
	},

	setElementContent: function(name, value) {
		if(!(name in this.fieldsElements)) return;
		var state = this.elementsState(name);
		if(state.content !== value) {
			var el = this.fieldsElements[name];
			state.content = value;
			el.innerHTML = value;
		}
	},

	setElementDisplay: function(name, value) {
		if(!(name in this.fieldsElements)) return;
		var state = this.elementsState(name);
		if(state.display !== value) {
			var el = this.fieldsElements[name];
			state.display = value;
			el.style.display = value;
		}
	},

	setElementClass: function(name, className) {
		if(!(name in this.fieldsElements)) return;
		var state = this.elementsState(name);
		if(!(className in state.classes)) {
			state.classes[className] = 1;
			var el = this.fieldsElements[name];
			el.classList.add(className);
		}
	},

	delElementClass: function(name, className) {
		if(!(name in this.fieldsElements)) return;
		var state = this.elementsState(name);
		if(className in state.classes) {
			delete state.classes[className];
			var el = this.fieldsElements[name];
			el.classList.remove(className);
		}
	},

	makePrivateGetter: function(field) {
		var privateName = '_' + field;
		return function() {
			var value = 0
			if(privateName in this && 'number' === typeof this[privateName]) value = this[privateName];
			return value;
		}.bind(this)
	},

	setter_pop: function(value) {
		this._info_pop = value;
		this.setElementContent('pop', Math.floor(value).humanView() + 'M')
		this.setElementDisplay('pop', 'block')
	},

	setter_pop_usage: function(value) {
		this._info_pop_usage = value;
		if(value > 0) {
			this.setElementContent('pop_usage', Math.floor(value).humanView() + 'M')
			this.setElementDisplay('div1', 'block')
			this.setElementDisplay('pop_usage', 'block')
		}
		else {
			this.setElementDisplay('div1', 'none')
			this.setElementDisplay('pop_usage', 'none')
		}
	},

	setter_energy: function(value) {
		this._info_energy = value;
		this.setElementContent('energy', Math.floor(value).humanView())
		this.setElementDisplay('energy', 'block')
	},


	setter_bld_energy_usage: function(value) {
		this._info_bld_energy_usage = value;
		this.setElementContent('free_energy', Math.floor(this._info_energy - value).humanView())
		this.setElementDisplay('div2', 'block')
		this.setElementDisplay('free_energy', 'block')
	},

	setter_energy_usage: function(value) {
		this._info_bld_energy_usage = value;
		if(value < 0) {
			this.setElementContent('energy_usage', Math.floor(-1 * value).humanView())
			this.setElementDisplay('div3', 'block')
			this.setElementDisplay('energy_usage', 'block')
		}
		else {
			this.setElementDisplay('div3', 'none')
			this.setElementDisplay('energy_usage', 'none')
		}
	},

	setter_wh_minerals: function(value) {
		this._info_wh_minerals = value;
		this.setElementContent('wh_minerals', Math.floor(value).humanView())
		this.setElementDisplay('wh_minerals', 'block')
	},

	setter_minerals: function(value) {
		this._info_minerals = value;
		this.setElementContent('minerals', Math.floor(value).humanView())		

		if(this._info_minerals > this._info_wh_minerals) {
			this.setElementClass('minerals', 'red')
		}
		else {
			this.delElementClass('minerals', 'red')
		}

		this.setElementDisplay('div4', 'block')
		this.setElementDisplay('minerals', 'block')
		this.setElementDisplay('div5', 'block')
	},

	setter_mineralsInHour: function(value) {
		this._info_mineralsInHour = value;
		this.setElementContent('mineralsInHour', Math.floor(value).humanView())
		this.setElementDisplay('mineralsInHour', 'block')
	},


	setter_wh_crystals: function(value) {
		this._info_wh_crystals = value;
		this.setElementContent('wh_crystals', Math.floor(value).humanView())
		this.setElementDisplay('wh_crystals', 'block')
	},

	setter_crystals: function(value) {
		this._info_crystals = value;
		this.setElementContent('crystals', Math.floor(value).humanView())

		if(this._info_crystals > this._info_wh_crystals) {
			this.setElementClass('crystals', 'red')
		}
		else {
			this.delElementClass('crystals', 'red')
		}

		this.setElementDisplay('div6', 'block')
		this.setElementDisplay('crystals', 'block')
		this.setElementDisplay('div7', 'block')
	},

	setter_crystalsInHour: function(value) {
		this._info_crystalsInHour = value;
		this.setElementContent('crystalsInHour', Math.floor(value).humanView())
		this.setElementDisplay('crystalsInHour', 'block')
	},
	
	activate: function(planet_uuid) {

		this._info_mineralsInHour = 0;
		this._info_crystalsInHour = 0;
		for(var i = 0, a = this.fieldsOrders, l = a.length; i < l; i += 2) {
			var from = a[i], t = a[i + 1], to = '_' + t;
			this[to] = 0;
		}

		this.planet_uuid = planet_uuid;

		this.interval = setInterval(this.onInterval.bind(this), 700);

		var html = '<div>';
		html += '<div class="resicon population" title="Население"></div>';
		html += '<div id="pi_pop" class="label hide" title="Населения на планете"></div>';
		html += '<div id="pi_div1" class="div hide">/</div>';
		html += '<div id="pi_pop_usage" class="label hide green" title="Безработное население"></div>';

		html += '<div class="resicon energy" title="Энергия"></div>';
		html += '<div id="pi_energy" class="label hide" title="Общая выработка энергии"></div>';
		html += '<div id="pi_div2" class="div hide">/</div>';
		html += '<div id="pi_free_energy" class="label green hide" title="Свободная энергия"></div>';
		html += '<div id="pi_div3" class="div hide">/</div>';
		html += '<div id="pi_energy_usage" class="label red hide" title="Нехватка энергии для населения"></div>';

		html += '<div class="resicon metal" title="Металл"></div>';
		html += '<div id="pi_wh_minerals" class="label hide" title="Вместимость склада для металла"></div>';
		html += '<div id="pi_div4" class="div hide">/</div>';
		html += '<div id="pi_minerals" class="label hide" title="Металла на складе"></div>';
		html += '<div id="pi_div5" class="div hide">/</div>';
		html += '<div id="pi_mineralsInHour" class="label hide" title="Добыча металла в час"></div>';

		html += '<div class="resicon crystal" title="Кристаллы"></div>';
		html += '<div id="pi_wh_crystals" class="label hide" title="Вместимость склада для кристаллов"></div>';
		html += '<div id="pi_div6" class="div hide">/</div>';
		html += '<div id="pi_crystals" class="label hide" title="Кристаллов на складе"></div>';
		html += '<div id="pi_div7" class="div hide">/</div>';
		html += '<div id="pi_crystalsInHour" class="label hide" title="Добыча кристаллов в час"></div>';

		html += '<div style="clear:both"></div></div>';

		planet_info.innerHTML = html;
		hover.apply(planet_info);

		this.elementsStates = {}
		this.fieldsElements = {
			pop:			pi_pop,
			div1:			pi_div1,
			pop_usage:		pi_pop_usage,

			energy:			pi_energy,
			div2:			pi_div2,
			free_energy:	pi_free_energy,
			div3:			pi_div3,
			energy_usage:	pi_energy_usage,

			wh_minerals:	pi_wh_minerals,
			div4:			pi_div4,
			minerals:		pi_minerals,
			div5:			pi_div5,
			mineralsInHour:	pi_mineralsInHour,

			wh_crystals:	pi_wh_crystals,
			div6:			pi_div6,
			crystals:		pi_crystals,
			div7:			pi_div7,
			crystalsInHour:	pi_crystalsInHour,
		}

		this.loadPlanetInfo();
	},

	deactivate: function() {
		clearInterval(this.interval);
	},

	onInterval: function() {
		timerInfo('planetInfo');

		if(!this.loading && Date.now() - this.loadTime > 1000 *5) {
			this.loadPlanetInfo();
		}

		var delta = Math.floor( (Date.now() - this.time) / 1000 );
		if(delta > 0) {

			this.info_pop		+= delta * this.population_sinc;
			this.info_minerals	+= delta * this.minerals_sinc;
			this.info_crystals	+= delta * this.crystals_sinc;

			this.time += delta * 1000;

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
	},

	fieldsOrders: [
		  'population',			'info_pop'
		, 'population_usage',	'info_pop_usage'
		, 'energy',				'info_energy'
		, 'bld_energy_usage',	'info_bld_energy_usage'
		, 'energy_usage',		'info_energy_usage'
		, 'wh_minerals',		'info_wh_minerals'
		, 'minerals',			'info_minerals'
		, 'wh_crystals',		'info_wh_crystals'
		, 'crystals',			'info_crystals'
	],
	applyPlanetInfo: function(planet) {

		this.population_sinc	= planet.population_sinc;
		this.crystals_sinc		= planet.crystals_sinc;
		this.minerals_sinc		= planet.minerals_sinc;

		for(var i = 0, a = this.fieldsOrders, l = a.length; i < l; i += 2) {
			var from = a[i], t = a[i + 1], to = '_' + t, v;

			if(!(to in this)) v = 0;
			else v = this[to];

			var d = Math.abs(planet[from] - v);
			var av = Math.abs(v);
			var p = av / 100;
			if(d > p) this[t] = planet[from];
		}

		var b = this.buildings, ms = 0, cs = 0, c = b.length; while(c--) {
			var item = b[c]
			if(item.mineralsInHour) ms += item.mineralsInHour;
			if(item.crystalsInHour) cs += item.crystalsInHour;
		}
		this.info_mineralsInHour = ms;
		this.info_crystalsInHour = cs;
	},

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
			var planetInfo = answer.result;
			if(planetInfo) {

				this.buildings = planetInfo.buildings;
				this.time = Date.now();

				this.applyPlanetInfo(planetInfo.planet);
				this.section.onLoadPlanetInfo();
			}
			else {
				this.section.onLoadPlanetInfo('error while loading planet info');
			}
		}
		else {
			this.section.onLoadPlanetInfo('error while loading planet info');
		}
	},

})