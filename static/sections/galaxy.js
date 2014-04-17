
var SectionGalaxy = Class.inherit({

	onCreate: function() {
		this.binded_onLoad = this.onLoad.bind(this);
		this.binded_animate = this.animate.bind(this);
	},

	deactivate: function() {
		cancelAnimationFrame(this.requestId);
	},

	activate: function(params) {
		detailmenu.setItem('galaxys');
		view.innerHTML = 'galaxy <span id="galaxy_name">'+params[0]+'</span><br><div style="background:#000;opacity:0.8;width:100%;height:600px" id="galaxy_map"></div>';

		AJAX.create({
			type: 'json',
			post: JSON.stringify({ galaxy_uuid: params[0] }),
			url: selfDomain() + '/api/galaxys/load',
			success: this.binded_onLoad,
/*
			success: function(answer, ctx) {
				init(answer);
				animate();
			}
*/
		})
	},

	onLoad: function(answer) {
		galaxy_name.innerHTML = answer.result.name;
		this.init(answer.result.star_systems, answer.result.user_star_systems);
		this.animate();
	},

	init: function(stars_, uss_) {

		this.mouseX = 0;
		this.mouseY = 0;

		this.deltaX = 0;
		this.origX = 0;

		this.origY = 200;
		this.deltaY = 0;

		this.clock = new THREE.Clock();
		this.acc = 0;

		this.windowHalfX = galaxy_map.clientWidth / 2;
		this.windowHalfY = galaxy_map.clientHeight / 2;

		this.container = galaxy_map;

		this.mouse2D = new THREE.Vector3( 0, 8000, 4.5 );
		this.projector = new THREE.Projector();

		this.camera = new THREE.PerspectiveCamera( 50, galaxy_map.clientWidth / galaxy_map.clientHeight, 100, 2000 );
		this.camera.position.z = 500;
		this.camera.position.y = 1000;
		// this.camera.position.x = 1000;

		this.scene = new THREE.Scene();

		this.scene.add( new THREE.AmbientLight( 0x404040 ) );

		this.light = new THREE.DirectionalLight( 0xffffff );
		this.light.position.set( 0, 1, 0 );
		this.scene.add( this.light );

		var PI2 = Math.PI * 2;
		this.program = function ( context ) {
			context.beginPath();
			context.arc( 0, 0, 1, 0, PI2, true );
			context.closePath();
			context.fill();
		}

		this.topgroup = new THREE.Object3D();
		this.scene.add( this.topgroup );

		this.group = new THREE.Object3D();
		this.topgroup.add( this.group );

		var cm = [ 0xdd462F, 0xdd666F, 0xdd868F, 0xddD68F, 0xadd6aF, 0xddD6FF, 0x8ED6FF ];

		var geometry = new THREE.CubeGeometry( 7, 7, 7, 1, 1, 1 );
		var meshmaterials = [
			new THREE.MeshBasicMaterial( { color: 0x808080, wireframe: true, opacity: 0.8, transparent: true } )
		];

		// var cnt_ = 0;
		this.uss = [];
		for(var id_ in stars_) {
			var star_ = stars_[id_];
			// console.log(star_);

			var particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: cm[star_.sc], program: this.program } ) );

			particle.position.x = star_.x;
			particle.position.y = star_.y;
			particle.position.z = star_.z;			

			particle.scale.x = particle.scale.y = star_.scn / 7;
			particle._name = id_.substr(-5);
			this.group.add( particle );

			if(id_ in uss_) {

				var cube = THREE.SceneUtils.createMultiMaterialObject( geometry , meshmaterials );
				cube.position.set( star_.x, star_.y, star_.z );
				this.topgroup.add( cube );

				this.uss.push(particle);
			}
		}

		this.renderer = new THREE.CanvasRenderer();
		this.renderer.setSize( galaxy_map.clientWidth, galaxy_map.clientHeight );

		this.container.appendChild( this.renderer.domElement );

		this._2dcontext = this.renderer.domElement.getContext('2d');


		this.windowHalfX = galaxy_map.clientWidth / 2;
		this.windowHalfY = galaxy_map.clientHeight / 2;

		this.camera.aspect = galaxy_map.clientWidth / galaxy_map.clientHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( galaxy_map.clientWidth, galaxy_map.clientHeight );

	},

	animate: function() {
		this.requestId = requestAnimationFrame( this.binded_animate );
		this.render();
	},

	render: function() {

		var delta = this.clock.getDelta();
		// console.log(delta);
		this.acc += delta;

		this.camera.position.y = this.origY + this.deltaY * 1 + 100;
		this.camera.lookAt( this.scene.position );

		this.topgroup.rotation.y = this.origX + this.deltaX * 0.001 + this.acc * 0.1;

		this.renderer.render( this.scene, this.camera );

		this._2dcontext.font = 'normal 10px Verdana';
		this._2dcontext.textBaseline = 'bottom';
		this._2dcontext.fillStyle = '#aaa';

		var c = this.uss.length; while(c--) {
			var item = this.uss[c];

			var p = new THREE.Vector3();
			p.getPositionFromMatrix( item.matrixWorld );
			var vector = this.projector.projectVector( p, this.camera );

			var x = ( vector.x * this.windowHalfX ) + this.windowHalfX;
			var y = - ( vector.y * this.windowHalfY ) + this.windowHalfY;

			this._2dcontext.textAlign = vector.x > 0 ? 'right' : 'left';
			this._2dcontext.fillText('system **'+item._name, x, y - 5);
		}
	}
})
