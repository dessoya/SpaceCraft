
// hardcore vanilla js

hover = {
	init: function() {
		var el = document.createElement('div');
		el.id = 'hoverHint';
		el.style.display = 'none'
		// el.style.display = 'block';
		el.style.position = 'absolute';
		el.style.top = '0';
		el.style.left = '0';
		el.style.cursor = 'default';
		el.style.font = '9px verdana';
		el.innerHTML = '<div style="box-shadow: 4px 4px 15px #aa8866; border:1px solid black; border-radius: 4px"><div id="hoverBody" style="border:1px solid #ffaa88; border-radius: 4px; background:#000; padding:4px 7px 5px 7px"></div></div>';
		var b = document.querySelector('body');
		b.style.position = 'relative';
		b.appendChild(el);
	},

	onMouseOut: function(event) {
		hoverHint.style.display = 'none';
	},

	apply: function(element) {
		var list = element.querySelectorAll('[title]'), c = list.length; while(c--) {
			element = list[c];
			var title = element.title;

			element.addEventListener('mousemove', this.onMouseMove.bind(title));
			element.addEventListener('mouseout', this.onMouseOut);

			element.removeAttribute('title');
		}
	},

	onMouseMove: function(event) {
		event.preventDefault();
		var x = event.clientX + 15;
		var y = event.clientY + 5;
		hoverBody.innerHTML = this;
		hoverHint.style.left = ''+x+'px';
		hoverHint.style.top = ''+y+'px';
		hoverHint.style.display = 'block';
	},
}