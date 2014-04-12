
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
			var html = '<div class="galaxy_list">';
			// console.log(list);
			for(var i = 0, l = list.length; i < l; i++) {
				var item = list[i];
				html += 'галактика <a href="#galaxy/'+item.name+'">'+item.name+'</a>';
			}
			html += '</div>';
			view.innerHTML = html;
		}
		else {
			view.innerHTML = 'problem with loading galaxys list';
		}
	}
})
