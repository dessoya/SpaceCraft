
var Sections = Class.inherit({

	onCreate: function() {
		this.sections = {
			main:			SectionMain.create(),

			profile:		SectionProfile.create(),

			galaxys:		SectionGalaxys.create(),
			'galaxy/*':		SectionGalaxy.create(),

			capital:		SectionCapital.create(),

			'planet/*':		SectionPlanet.create(),
		}

		var re_sections = this.re_sections = [];
		for(var name in this.sections) {
			if(name.indexOf('*') !== -1) {
				
				var section = this.sections[name];
				var count = 0;
				do {
					var index = name.indexOf('*');
					if(index !== -1) {
						count ++;
						name = name.substr(0, index) + '([a-z\\-\\d]+?)' + name.substr(index + 1);
					}
				} while(index !== -1)
				var re = new RegExp('^'+name+'$');

				re_sections.push({re:re, count:count, section: section});
			}
		}
	},

	find: function(sectionName) {
		var s = this.re_sections, l = s.length; while(l--) {
			var item = s[l], a;
			if(a = item.re.exec(sectionName)) {
				var params = [];
				for(var i = 0, c = item.count; i < c; i++) {
					params.push(a[i + 1]);
				}
				return { section: item.section, params: params }
			}
		}
		return null;
	},

	check: function(sectionName) {
		var section = this.find(sectionName);
		if(section) return true;
		return (sectionName in this.sections) ? true : false;
	},

	activate: function(sectionName) {		
		if(this.sectionName === sectionName) return;
		this.sectionName = sectionName;
		var section = this.find(sectionName);
		if(section) {
			section.section.activate(section.params);
		}
		else {
			this.sections[this.sectionName].activate();
		}
	}

})