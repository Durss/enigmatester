<template>
	<div class="box3d">
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import * as THREE from "three";
import Utils from '../utils/Utils';
import gsap from 'gsap';
import { SlowMo, RoughEase, CustomEase } from 'gsap/all';
import Config from '../utils/Config';

@Component({
	components:{}
})
export default class Box3D extends Vue {

	@Prop()
	public playerIndex:number;

	public _disposed:boolean = false;

	private inc:number = 0;
	private intro:boolean = false;
	private dragging:boolean = false;
	private cameraDistance:number = 180;
	private dragOffset:{x:number, y:number} = {x:0, y:0};
	private angleH:number = Math.PI;
	private angleHInterp:number = this.angleH;

	private _scene: THREE.Scene;
	private _camera: THREE.PerspectiveCamera;
	private _spotlight: THREE.SpotLight;
	private _directionalLight: THREE.DirectionalLight;
	private _renderer: THREE.WebGLRenderer;
	private _cubeGeom: THREE.BoxGeometry;
	private _cube: THREE.Mesh;
	private _plane: THREE.Mesh;
	private _mouseDownHandler:any;
	private _mouseUpHandler:any;
	private _mouseMoveHandler:any;
	private _canvas:HTMLCanvasElement;

	public mounted():void {
		// await this.$nextTick();
		let width = this.$el.clientWidth;
		let height = this.$el.clientHeight;
		let specular = new THREE.Color(0x888888);
		let element = Config.ELEMENTS[this.playerIndex];
		//Generate normal_maps via this tool :
		// https://cpetry.github.io/NormalMap-Online/
		// values :
		//   strength : 1
		//   level : 10
		//   blur/sharp : -1.5
		//   filter : sobel
		//   Invert : height
		var cubeMaterials = [
			new THREE.MeshPhongMaterial({
				map: new THREE.TextureLoader().load(require('@/assets/textures/right.png')),
				lightMap: new THREE.TextureLoader().load(require('@/assets/textures/right_bump.jpg')),
				lightMapIntensity:1,
				normalMap: new THREE.TextureLoader().load(require('@/assets/textures/right_normal.png')),
				normalScale: new THREE.Vector2(.5,.5),
				specularMap: new THREE.TextureLoader().load(require('@/assets/textures/right_bump.jpg')),
				specular,
			}),
			new THREE.MeshPhongMaterial({
				map: new THREE.TextureLoader().load(require('@/assets/textures/left.png')),
				lightMap: new THREE.TextureLoader().load(require('@/assets/textures/left_bump.jpg')),
				lightMapIntensity:1,
				normalMap: new THREE.TextureLoader().load(require('@/assets/textures/left_normal.png')),
				normalScale: new THREE.Vector2(.5,.5),
				specularMap: new THREE.TextureLoader().load(require('@/assets/textures/left_bump.jpg')),
				specular,
			}),
			new THREE.MeshPhongMaterial({
				map: new THREE.TextureLoader().load(require('@/assets/textures/top.png')),
				// normalMap: new THREE.TextureLoader().load(require('@/assets/textures/top_bump.jpg')),
				// specularMap: new THREE.TextureLoader().load(require('@/assets/textures/top_bump.jpg')),
				// specular,
			}),
			new THREE.MeshPhongMaterial({
				map: new THREE.TextureLoader().load(require('@/assets/textures/bottom.png')),
				// normalMap: new THREE.TextureLoader().load(require('@/assets/textures/bottom_bump.jpg')),
				// specularMap: new THREE.TextureLoader().load(require('@/assets/textures/bottom_bump.jpg')),
				// specular,
			}),
			new THREE.MeshPhongMaterial({
				map: new THREE.TextureLoader().load(require('@/assets/textures/front_'+element+'.png')),
				lightMap: new THREE.TextureLoader().load(require('@/assets/textures/front_'+element+'_bump.jpg')),
				lightMapIntensity:1,
				normalMap: new THREE.TextureLoader().load(require('@/assets/textures/front_'+element+'_normal.png')),
				normalScale: new THREE.Vector2(.5,.5),
				specularMap: new THREE.TextureLoader().load(require('@/assets/textures/front_'+element+'_bump.jpg')),
				specular,
			}),
			new THREE.MeshPhongMaterial({
				map: new THREE.TextureLoader().load(require('@/assets/textures/back.png')),
				lightMap: new THREE.TextureLoader().load(require('@/assets/textures/back_bump.jpg')),
				lightMapIntensity:1,
				normalMap: new THREE.TextureLoader().load(require('@/assets/textures/back_normal.png')),
				normalScale: new THREE.Vector2(.5,.5),
				specularMap: new THREE.TextureLoader().load(require('@/assets/textures/back_bump.jpg')),
				specular,
			}),
		];

		//Disable mipmaps & stuff to avoid "non power of 2 texture size blabla"
		for (let i = 0; i < cubeMaterials.length; i++) {
			const m = cubeMaterials[i];
			m.map.generateMipmaps = false;
			m.map.wrapS = m.map.wrapT = THREE.ClampToEdgeWrapping;
			m.map.minFilter = THREE.LinearFilter;
			
			if(m.lightMap) {
				m.lightMap.generateMipmaps = false;
				m.lightMap.wrapS = m.lightMap.wrapT = THREE.ClampToEdgeWrapping;
				m.lightMap.minFilter = THREE.LinearFilter;
			}
			
			if(m.normalMap) {
				m.normalMap.generateMipmaps = false;
				m.normalMap.wrapS = m.normalMap.wrapT = THREE.ClampToEdgeWrapping;
				m.normalMap.minFilter = THREE.LinearFilter;
			}
			
			if(m.specularMap) {
				m.specularMap.generateMipmaps = false;
				m.specularMap.wrapS = m.specularMap.wrapT = THREE.ClampToEdgeWrapping;
				m.specularMap.minFilter = THREE.LinearFilter;
			}
		}

		this._scene = new THREE.Scene()
		this._camera = new THREE.PerspectiveCamera(75, width/height, 1, 10000);
		this._camera.position.z = this.cameraDistance;
		this._renderer = new THREE.WebGLRenderer({ alpha: true, antialias:true });
		this._renderer.setSize(width, height);
		let sideRatio = 0.69597615499254843517138599105812;
		let cubeH = 150;
		let cubeW = cubeH*sideRatio;
		this._cubeGeom = new THREE.BoxGeometry(cubeW, cubeH, cubeW);
		this._cube = new THREE.Mesh(this._cubeGeom, cubeMaterials);
		
		this._spotlight = new THREE.SpotLight(0xffffff, 1);
		this._spotlight.angle = Math.PI/10;
		this._spotlight.decay = 2;
		this._spotlight.target = this._cube;
		this._spotlight.position.y = 100;
		this._scene.add(this._spotlight);

		this._directionalLight = new THREE.DirectionalLight(0xffffff, .1);
		this._directionalLight.position.y = -30;
		this._scene.add(this._directionalLight);

		this._scene.add(new THREE.AmbientLight(0xffffff, .5));

		this._plane = new THREE.Mesh(new THREE.PlaneGeometry(1500,1500, 1, 1),  new THREE.MeshBasicMaterial({map:new THREE.TextureLoader().load(require('@/assets/textures/gradient.jpg'))}));
		(<THREE.MeshBasicMaterial>this._plane.material).transparent = true;
		this._plane.position.z = -600;
		this._scene.add(this._plane);
		// this._scene.background = new THREE.Color(0xffffff);
		this._renderer.setPixelRatio(window.devicePixelRatio);

		this._scene.add(this._cube);
		this._canvas = this._renderer.domElement
		this.$el.appendChild(this._canvas);

		this.cameraDistance = 100;
		let h;
		let loopCount = 0;
		//Step back camera until the box has the proper visual size so
		//the files and the reticle will match perfectly
		do {
			this.cameraDistance ++;
			let distanceToFrontFace = this.cameraDistance - cubeW * .5;
			let vFOV = THREE.MathUtils.degToRad( this._camera.fov );
			h = 2 * Math.tan( vFOV / 2 ) * distanceToFrontFace;
			h = cubeH/h * document.body.clientHeight;
		}while(h > 672 || ++loopCount > 10000)
		


		//Intro animation
		if(Config.ENABLE_INTRO_ANIMATIONS) {
			this.intro = true;
			this._camera.position.y = 2000;
			this.cameraDistance = 1500;
			gsap.registerPlugin(SlowMo, RoughEase, CustomEase);
			gsap.to(this, {duration:3, cameraDistance:200, ease:"sine.inOut"});
			gsap.to(this, {duration:4,
							angleH:Math.PI*2.5,
							ease:CustomEase.create("custom", "M0,0,C0.194,0.126,0.29,0.4,0.33,0.52,0.366,0.63,0.483,1.027,0.67,1.028,0.768,1.028,0.804,0.966,1,1"),
							onComplete:_=> {
								this.intro = false;
							}});
			gsap.to(this._camera.position, {duration:4, y:0, ease:"back.out(1.5)"});
		}else{
			this.angleH = this.angleHInterp -= Math.PI/2;
		}

		this.renderWebgl();
		
		this._mouseDownHandler = (e:MouseEvent) => this.onMouseDown(e);
		this._mouseUpHandler = (e:MouseEvent) => this.onMouseUp(e);
		this._mouseMoveHandler = (e:MouseEvent) => this.onMouseMove(e);
		document.addEventListener("mousedown", this._mouseDownHandler);
		document.addEventListener("mouseup", this._mouseUpHandler);
		document.addEventListener("mousemove", this._mouseMoveHandler);
	}

	public beforeDestroy():void {
		this.$el.removeChild(this._renderer.domElement);
		this._disposed = true;
		this._scene.traverse((object: any) => {
			if (!object.isMesh) return
			object.geometry.dispose()
			if (object.material.isMaterial) {
				this.cleanMaterial(object.material)
			} else {
				// an array of materials
				for (const material of object.material) this.cleanMaterial(material)
			}
		});

		this._renderer.dispose();
		
		//Cleanup renderer completely, dispose() doesn't do all the job
		this._renderer.forceContextLoss();
		// this._renderer.context = null;
		this._renderer.domElement = null;
		this._renderer = null;
		document.removeEventListener("mousedown", this._mouseDownHandler);
		document.removeEventListener("mouseUp", this._mouseUpHandler);
		document.removeEventListener("mouseMove", this._mouseMoveHandler);
	}

	/**
	 * Main render loop
	 */
	private renderWebgl(): void {
		if (!this._disposed) {
			requestAnimationFrame(() => this.renderWebgl());
		}else {
			return;
		}

		if(this.intro) {
			this.angleHInterp = this.angleH;
		}else{
			let a = this.angleH - this.angleHInterp;
			a = (a) % Math.PI*2;
			this.angleHInterp += a * .1;
		}
		
		
		this._camera.position.x = Math.cos(this.angleHInterp) * this.cameraDistance;
		this._camera.position.z = Math.sin(this.angleHInterp) * this.cameraDistance;
		this._camera.lookAt(this._cube.position);

		this._plane.position.x = Math.cos(this.angleHInterp-Math.PI) * this.cameraDistance*2;
		this._plane.position.z = Math.sin(this.angleHInterp-Math.PI) * this.cameraDistance*2;
		this._plane.lookAt(this._camera.position);

		this._spotlight.position.x = Math.cos(this.angleHInterp-Math.PI/3) * this.cameraDistance*2;
		this._spotlight.position.z = Math.sin(this.angleHInterp-Math.PI/3) * this.cameraDistance*2;
		this._spotlight.lookAt(this._cube.position);

		this._directionalLight.position.x = this._camera.position.x;
		this._directionalLight.position.z = this._camera.position.z;
		this._directionalLight.lookAt(this._cube.position);

		//Make cube glow sometimes
		let mats:THREE.MeshPhongMaterial[] = <THREE.MeshPhongMaterial[]>this._cube.material;
		for (let i = 0; i < mats.length; i++) {
			const m = mats[i];
			m.lightMapIntensity = Math.max(0, (Math.sin(this.inc)-.8)*5);
		}

		//Fade in/out the background
		this.inc += .01;
		(<THREE.MeshBasicMaterial>this._plane.material).opacity = (Math.sin(this.inc)+1)/2 * 5 + .4;
		this._renderer.render(this._scene, this._camera);
	}

	/**
	 * Cleans up a material data from memory
	 * 
	 * @param material 
	 */
	private cleanMaterial(material: THREE.Material) {
		material.dispose();

		for (const key of Object.keys(material)) {
			const value = material[key]
			if (value && typeof value === 'object' && 'minFilter' in value) {
				value.dispose();
			}
		}
	}

	private onMouseDown(event:MouseEvent):void {
		if(event.target != this._canvas || this.intro) return;
		let bounds = this.$el.getBoundingClientRect();
		this.dragOffset.x = event.clientX - bounds.left;
		this.dragOffset.y = event.clientY - bounds.top;
		this.dragging = true;
	}

	private onMouseUp(event:MouseEvent):void {
		if(this.intro) return;
		this.dragging = false;
		this.angleH = Math.round(this.angleH/(Math.PI/2))*Math.PI/2;
	}

	private onMouseMove(event:MouseEvent):void {
		if(!this.dragging || this.intro) return;
		let bounds = this.$el.getBoundingClientRect();
		let px = event.clientX - bounds.left;
		let py = event.clientY - bounds.top;
		
		this.angleH += (px-this.dragOffset.x) * .005;

		this.dragOffset.x = px;
		this.dragOffset.y = py;
	}


}
</script>

<style scoped lang="less">
.box3d{
	position: absolute;
	top: 0;
	left: 0;
	// width: 100%;
	height: 100%;
	user-select: none;
	cursor: grab;
	&:active {
		cursor: grabbing;
	}
}
</style>