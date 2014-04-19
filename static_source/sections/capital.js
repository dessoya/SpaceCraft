
var SectionCapital = Class.inherit({

	onCreate: function() {
		this.binded_onLoadCapital = this.onLoadCapital.bind(this);
	},

	activate: function() {
		detailmenu.setItem('capital');
		view.innerHTML = '';

		AJAX.create({
			type: 'json',
			url: selfDomain() + '/api/profile/capital/get',
			success: this.binded_onLoadCapital
		})

	},

	onLoadCapital: function(answer) {
		if(answer && answer.status && answer.status === 'ok') {

			var capital = answer.result;
			// console.log(capital);
			if(capital) {
				activateSection('planet/'+capital.planet_uuid);
			}
			else {
				view.innerHTML = 'У вас нет столицы либо вы не авторизован';
			}
		}
		else {
			view.innerHTML = 'problem with loading capital';
		}
	}
})
