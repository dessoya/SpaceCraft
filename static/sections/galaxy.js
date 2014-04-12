
var SectionGalaxy = Class.inherit({

	onCreate: function() {
		this.binded_onLoad = this.onLoad.bind(this);
		this.binded_animate = this.animate.bind(this);
	},

	activate: function(params) {
		detailmenu.setItem('galaxys');
		view.innerHTML = 'galaxy '+params[0]+'<br><div style="background:#000;opacity:0.8;width:100%;height:600px" id="galaxy_map"></div>';

		AJAX.create({
			type: 'json',
			post: JSON.stringify({ name: params[0] }),
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
		this.init(answer.result);
		this.animate();
	},

	init: function(stars_) {
/*
		var container, stats;
		var camera, scene, renderer, group,topgroup, particle;
		var mouseX = 0, mouseY = 0, mouse2D, raycaster, projector, ROLLOVERED;
		var deltaX = 0, origX = 0, mouseDown = false, clickedY, origY = 200, deltaY = 0, cube, cube2;
		var _2dcontext;

		var clock = new THREE.Clock();
		var acc = 0;

		var windowHalfX = window.innerWidth / 2;
		var windowHalfY = window.innerHeight / 2;
*/
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

		for(var id_ in stars_) {
			var star_ = stars_[id_];
			// console.log(star_);

			var particle = new THREE.Particle( new THREE.ParticleCanvasMaterial( { color: cm[star_.sc], program: this.program } ) );

			particle.position.x = star_.x;
			particle.position.y = star_.y;
			particle.position.z = star_.z;

			particle.scale.x = particle.scale.y = star_.scn / 7;
			particle._name = id_;
			this.group.add( particle );
		}

		// var map = THREE.ImageUtils.loadTexture( 'earth_atmos_2048.jpg' );

		var materials = [
			// new THREE.MeshPhongMaterial( { color: 0xffffff, map: map } )
		];

		var geometry = new THREE.SphereGeometry( 45, 10, 10 );

		// var meshPlanet = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: map, overdraw: true } ) );

		// meshPlanet.position.set( 100, 0, 0 );

		var meshmaterials = [
			new THREE.MeshBasicMaterial( { color: 0x808080, wireframe: true, opacity: 0.8, transparent: true } )
		];

		geometry = new THREE.CubeGeometry( 10, 10, 10, 1, 1, 1 );

		var cube = THREE.SceneUtils.createMultiMaterialObject( geometry , meshmaterials );
		cube.position.set( 1000000, 1000000, 1000000 );
		this.topgroup.add( cube );

		geometry = new THREE.CubeGeometry( 15, 15, 15, 1, 1, 1 );
		var cube2 = THREE.SceneUtils.createMultiMaterialObject( geometry , meshmaterials );
		cube2.position.set( 1000000, 1000000, 1000000 );
		this.topgroup.add( cube2 );

		this.renderer = new THREE.CanvasRenderer();
		this.renderer.setSize( galaxy_map.clientWidth, galaxy_map.clientHeight );

		this.container.appendChild( this.renderer.domElement );

		this._2dcontext = this.renderer.domElement.getContext('2d');

/*
				stats = new Stats();
				stats.domElement.style.position = 'absolute';
				stats.domElement.style.top = '0px';
				container.appendChild( stats.domElement );

				document.addEventListener( 'mousemove', onDocumentMouseMove, false );
				document.addEventListener( 'mousedown', onDocumentMouseDown, false );
				document.addEventListener( 'mouseup', onDocumentMouseUp, false );
*/

		// window.addEventListener( 'resize', this.onWindowResize, false );

		this.windowHalfX = galaxy_map.clientWidth / 2;
		this.windowHalfY = galaxy_map.clientHeight / 2;

		this.camera.aspect = galaxy_map.clientWidth / galaxy_map.clientHeight;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize( galaxy_map.clientWidth, galaxy_map.clientHeight );

	},

	animate: function() {

		requestAnimationFrame( this.binded_animate );

		this.render();
		// stats.update();
	},

	render: function() {

		var delta = this.clock.getDelta();
		// console.log(delta);
		this.acc += delta;

		this.camera.position.y = this.origY + this.deltaY * 1 + 100;
		this.camera.lookAt( this.scene.position );

		this.topgroup.rotation.y = this.origX + this.deltaX * 0.001 + this.acc * 0.1;
/*
		this.raycaster = this.projector.pickingRay( this.mouse2D.clone(), this.camera );
		this.raycaster.far = 200;
		this.raycaster.near = 200;
		this.raycaster.precision = 20;
*/
		this.renderer.render( this.scene, this.camera );
	}

})
