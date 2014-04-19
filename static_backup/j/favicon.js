
function Favicon() {

	this.stars = [
	  0,  0, 1
	 ,5,  0, 1.4
	 ,3,  2, 1.1
	 ,7,  2, 1.5
	 ,2,  4, 1.2
	 ,10, 4, 1.6
	 ,8,  6, 1.3
	 ,3,  6, 1.7
	 ,1,  8, 1.2
	 ,9,  8, 1.6
	 ,4,  10, 1.1
	 ,12, 10, 1.5
	 ,3,  12, 1.4
	 ,11, 12, 1.8
	 ,14, 14, 1.1
	 ,5,  14, 1.3
	];

	this.canvas		= document.createElement('canvas');
	this.canvas.width	= 16;
	this.canvas.height	= 16;
	this.ctx		= this.canvas.getContext('2d');

	this.imd = this.ctx.createImageData(1, 1);
	this.imd.data[0] = 255;
	this.imd.data[1] = 255;
	this.imd.data[2] = 255;
	this.imd.data[3] = 255;

	this.stage = 0;

	this.link	= document.createElement('link');
        this.link.type	= 'image/x-icon';
	this.link.rel	= 'shortcut icon';
	this.link.name	= 'fvc';

        this.interval = this.added = 0;

	this.process();
}

Favicon.prototype.process = function () {

	this.ctx.fillStyle = "#000";
	this.ctx.fillRect(0, 0, 16, 16);

	if(this.stage ++ > 16383) this.stage = 0;

	for(var i = 0, l = this.stars.length; i < l; i+=3)
		this.ctx.putImageData(this.imd, parseInt(((this.stage * this.stars[i+2]) + this.stars[i])) % 16, this.stars[i+1]);

	this.link.href	= this.canvas.toDataURL("image/x-icon");

	if(this.added == 0) {
        	document.getElementsByTagName('head')[0].appendChild(this.link);
		this.added ++;
	}
	else {
		var head = document.getElementsByTagName('head')[0];
		for(i = 0, l = head.childNodes.length; i < l; i ++) {
			if(head.childNodes[i].name == 'fvc') {
				head.removeChild(head.childNodes[i]);
				head.appendChild(this.link);
			}
		}
	}

	if(this.interval == 0) {		
		this.interval = setInterval(function(){favicon.process()}, 1000);
	}
}
