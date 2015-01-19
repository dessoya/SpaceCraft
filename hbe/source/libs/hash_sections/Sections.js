
Sections = Class.inherit({

	onCreate: function() {
		this.sections = { }
		this.re_sections = [ ];
		this.all = [ ];

		var self = this;

		window.onhashchange = function(force) {

			var hash = window.location.hash;
			if(hash.length > 0 && hash[0] === '#') hash = hash.substr(1);

			if(!self.check(hash)) {
				hash = 'main';
				window.location.hash = '';
			}

			// /* debug */ console.log('hash '+hash)
			self.activate(hash, force);
		}

	},

	addSection: function(section) {
		this.all.push(section);
		section.sections = this;

		var pattern = section.pattern, patterns;

		if('string' === typeof pattern) patterns = [ pattern ]
		else patterns = pattern;

		for(var i = 0, l = patterns.length; i < l; i++) {

			pattern = patterns[i];

			if(pattern.indexOf('*') !== -1) {				
				var count = 0;
				do {
					var index = pattern.indexOf('*');
					if(index !== -1) {
						count ++;
						pattern = pattern.substr(0, index) + '([A-Za-z\\-\\d]+?)' + pattern.substr(index + 1);
					}
				} while(index !== -1)
				var re = new RegExp('^' + pattern + "$");

				this.re_sections.push({ re: re, count: count, section: section });
			}
			else {
				this.sections[pattern] = section;
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
		// /* debug */ console.log('check section ' + sectionName)
		if(sectionName in this.sections) return true;
		var section = this.find(sectionName);
		if(section) return true;
		return false;
	},

	setSection: function(sectionName) {
		window.location.hash = '#' + sectionName;
	},

	activate: function(sectionName, force) {

		if(!force && this.sectionName === sectionName) return;
		this.sectionName = sectionName;

		var section = null
		if(sectionName in this.sections) {
			section = this.sectionName in this.sections ? this.sections[this.sectionName] : null;
		}
		else {
			section = this.find(sectionName)
			var params = []
			if(section) {
				params = section.params
				section = section.section
			}
		}

		if(this.section && this.section.deactivate) this.section.deactivate()
		window.section = this.section = section

		if(section) section.activate(params)
	},

	start: function(force) {
		var c = this.all.length; while(c--) {
			var s = this.all[c];
			if(s.start) s.start();
		}
		window.onhashchange(force);
	}

})
