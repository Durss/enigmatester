<template>
	<div class="box3d">
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import * as THREE from "three";
import Utils from '../utils/Utils';

@Component({
	components:{}
})
export default class Box3D extends Vue {
	public _disposed:boolean = false;

	private inc:number = 0;
	private dragging:boolean = false;
	private cameraDistance:number = 200;
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
		let element = "water";
		//Generate normal_maps via this tool :
		// https://cpetry.github.io/NormalMap-Online/
		// values :
		// strength : 1
		// level : 10
		// blur/sharp : -1.5
		// filter : sovel
		var cubeMaterials = [
			new THREE.MeshPhongMaterial({
				map: new THREE.TextureLoader().load(require('@/assets/textures/right.png')),
				bumpMap: new THREE.TextureLoader().load(require('@/assets/textures/right_normal.png')),
				bumpScale:1,
				specularMap: new THREE.TextureLoader().load(require('@/assets/textures/right_bump.jpg')),
				specular,
			}),
			new THREE.MeshPhongMaterial({
				map: new THREE.TextureLoader().load(require('@/assets/textures/left.png')),
				bumpMap: new THREE.TextureLoader().load(require('@/assets/textures/left_normal.png')),
				bumpScale:1,
				specularMap: new THREE.TextureLoader().load(require('@/assets/textures/left_bump.jpg')),
				specular,
			}),
			new THREE.MeshPhongMaterial({
				map: new THREE.TextureLoader().load(require('@/assets/textures/top.png')),
				// bumpMap: new THREE.TextureLoader().load(require('@/assets/textures/top_bump.jpg')),
				// specularMap: new THREE.TextureLoader().load(require('@/assets/textures/top_bump.jpg')),
				// specular,
			}),
			new THREE.MeshPhongMaterial({
				map: new THREE.TextureLoader().load(require('@/assets/textures/bottom.png')),
				// bumpMap: new THREE.TextureLoader().load(require('@/assets/textures/bottom_bump.jpg')),
				// specularMap: new THREE.TextureLoader().load(require('@/assets/textures/bottom_bump.jpg')),
				// specular,
			}),
			new THREE.MeshPhongMaterial({
				map: new THREE.TextureLoader().load(require('@/assets/textures/front_'+element+'.png')),
				bumpMap: new THREE.TextureLoader().load(require('@/assets/textures/front_'+element+'_normal.png')),
				bumpScale:1,
				specularMap: new THREE.TextureLoader().load(require('@/assets/textures/front_'+element+'_bump.jpg')),
				specular,
			}),
			new THREE.MeshPhongMaterial({
				map: new THREE.TextureLoader().load(require('@/assets/textures/back.png')),
				bumpMap: new THREE.TextureLoader().load(require('@/assets/textures/back_normal.png')),
				bumpScale:1,
				specularMap: new THREE.TextureLoader().load(require('@/assets/textures/back_bump.jpg')),
				specular,
			}),
		];

		this._scene = new THREE.Scene()
		this._camera = new THREE.PerspectiveCamera(75, width/height, 1, 10000);
		this._camera.position.z = this.cameraDistance;
		this._renderer = new THREE.WebGLRenderer({ alpha: true, antialias:true });
		this._renderer.setSize(width, height);
		this._cubeGeom = new THREE.BoxGeometry(100, 150, 100);
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
		
		let a = this.angleH - this.angleHInterp;
		a = (a + Math.PI) % Math.PI*2 - Math.PI;
		this.angleHInterp += a * .1;
		
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
		if(event.target != this._canvas) return;
		let bounds = this.$el.getBoundingClientRect();
		this.dragOffset.x = event.clientX - bounds.left;
		this.dragOffset.y = event.clientY - bounds.top;
		this.dragging = true;
	}

	private onMouseUp(event:MouseEvent):void {
		this.dragging = false;
		this.angleH = Math.round(this.angleH/(Math.PI/2))*Math.PI/2;
	}

	private onMouseMove(event:MouseEvent):void {
		if(!this.dragging) return;
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
	width: 100%;
	height: 100%;
	user-select: none;
}
</style>