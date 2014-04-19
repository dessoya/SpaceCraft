
var SectionGalaxys = Class.inherit({

	onCreate: function() {
		this.binded_onLoadGalaxysList = this.onLoadGalaxysList.bind(this);
	},

	activate: function() {
		detailmenu.setItem('galaxys');
		view.innerHTML = '';


		AJAX.create({
			type: 'json',
			url: selfDomain() + '/api/galaxys/list',
			success: this.binded_onLoadGalaxysList
		})		
	},

	onLoadGalaxysList: function(answer) {
		if(answer && answer.status && answer.status === 'ok') {
			var list = answer.result;
			var html = '<div class="galaxy_list">Галактики:<br>';
			// console.log(list);
			for(var i = 0, l = list.length; i < l; i++) {
				var item = list[i];
				html += '<a href="#galaxy/'+item.galaxy_uuid+'">'+item.name+'</a> '+(item.user_star_systems.length ? item.user_star_systems.length+' систем': '')+'<br>';
			}
			html += '</div>';
			view.innerHTML = html;
		}
		else {
			view.innerHTML = 'problem with loading galaxys list';
		}
	}
})
