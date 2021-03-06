<template>
	<div class="fileselector" v-if="files">
		<div ref="carousel">
			<img :src="files(key)" v-for="key in keys" :key="key" class="image" :ref="'sheet_'+key" @click="select(key)" />
		</div>
		<div ref="expanded">
			<File :path="files(key)" v-for="key in selectedSheets" :key="key" class="imageSelected" @unselect="unselect(key)" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Utils from '../utils/Utils';
import gsap from 'gsap';
import Config from '../utils/Config';
import File from './File.vue';

@Component({
	components:{
		File
	}
})
export default class FileSelector extends Vue {

	@Prop()
	public playerIndex:number;

	public maxFilesOpened:number = 10;

	public files:__WebpackModuleApi.RequireContext = null;
	public angle:number = 0;
	public angleInterp:number = this.angle;
	public disposed:boolean = false;
	public intro:boolean = false;
	public keys:string[] = [];
	public selectedSheets:string[] = [];
	public selectedSheetsPos:{[id:string]:{x:number,y:number}} = {};
	public carousel:HTMLDivElement = null;
	
	private dragging:boolean = false;
	private dragStart:{x:number, y:number} = {x:0, y:0};
	private dragOffset:{x:number, y:number} = {x:0, y:0};
	private radius:number = 80;
	private center:{x:number, y:number} = {x:0, y:0};
	private offsetY:number = 70;
	private timeoutWheel:number = 0;;

	private _mouseDownHandler:any;
	private _mouseUpHandler:any;
	private _mouseMoveHandler:any;
	private _mouseWheelHandler:any;
	private _keyDownHandler:any;
	private _resizeHandler:any;


	public async mounted():Promise<void> {
		this.files = require.context("@/assets/files");
		this.keys = this.files.keys();
		//Remove other users hints sheets
		for (let i = 0; i < this.keys.length; i++) {
			if(/.*[0-9]+\..{3,4}$/gi.test(this.keys[i])) {
				let index = parseInt(this.keys[i].replace(/.*([0-9]+)\..{3,4}$/gi, "$1"));
				if(index-1 != this.playerIndex) {
					this.keys.splice(i, 1);
					i--;
				}
			}
		}
		
		await this.$nextTick();
		this.center.x = (<HTMLDivElement>this.$el).getBoundingClientRect().width * .5;
		this.center.y = document.body.clientHeight + this.radius - this.offsetY;
		
		let step = (Math.PI*2)/this.keys.length;
		this.angle = -Math.PI/2 + step * 3;
		this.roundAngle();
		this.angleInterp = this.angle;

		if(Config.ENABLE_INTRO_ANIMATIONS) {
			this.center.y += this.offsetY * 2;
			this.intro = true;
			gsap.to(this.center, 3, {y:this.center.y - this.offsetY*2, ease:"back.out(10)", delay:2});
			gsap.to(this, 3, {angle:this.angle + Math.PI*2, ease:"sine.out", delay:2, onComplete:_=>this.intro = false});
		}
		
		this.renderWheel();
		console.log("Mount files, set event listeners");
		this._mouseDownHandler = (e:MouseEvent) => this.onMouseDown(e);
		this._mouseUpHandler = (e:MouseEvent) => this.onMouseUp(e);
		this._mouseMoveHandler = (e:MouseEvent) => this.onMouseMove(e);
		this._mouseWheelHandler = (e:MouseWheelEvent) => this.onMouseWheel(e);
		this._keyDownHandler = (e:KeyboardEvent) => this.onKeyDown(e);
		this._resizeHandler = (e:KeyboardEvent) => this.onResize(e);
		this.carousel = <HTMLDivElement>this.$refs.carousel;
		this.carousel.addEventListener("mousedown", this._mouseDownHandler);
		document.addEventListener("mouseup", this._mouseUpHandler);
		document.addEventListener("mousemove", this._mouseMoveHandler);
		document.addEventListener("keydown", this._keyDownHandler);
		this.carousel.addEventListener("wheel", this._mouseWheelHandler);
		window.addEventListener("resize", this._resizeHandler);
	}

	public beforeDestroy():void {
		this.disposed = true;
		this.carousel.removeEventListener("mousedown", this._mouseDownHandler);
		document.removeEventListener("mouseup", this._mouseUpHandler);
		document.removeEventListener("mousemove", this._mouseMoveHandler);
		document.removeEventListener("keydown", this._keyDownHandler);
		this.carousel.removeEventListener("wheel", this._mouseWheelHandler);
		window.removeEventListener("resize", this._resizeHandler);
	}

	private onResize(e:Event):void {
		let width = this.$el.clientWidth;
		let height = this.$el.clientHeight;
		this.center.x = (<HTMLDivElement>this.$el).getBoundingClientRect().width * .5;
		this.center.y = document.body.clientHeight + this.radius - this.offsetY;
	}

	/**
	 * Round up the current angle to have a card in the middle
	 */
	public roundAngle():void {
		let step = (Math.PI*2)/(this.keys.length);
		this.angle = Math.round(this.angle/step)*step;
	}

	/**
	 * Select a file from carousel
	 */
	public select(key:string):void {
		if(this.selectedSheets.length == this.maxFilesOpened) {
			this.$store.state.alert = "You can't select more than "+this.maxFilesOpened+" files !<br />Please do some cleanup to select another one thanks :)";
			return;
		}
		//Sheet already opened ?
		if(this.selectedSheets.indexOf(key) > -1) {
			this.unselect(key);
			return;
		}
		
		let dragDist = Math.sqrt(Math.pow(this.dragStart.x - this.dragOffset.x, 2) + Math.pow(this.dragStart.y - this.dragOffset.y, 2));
		if(dragDist > 5) return;//avoid selecting a file if we dragged the carousel

		for (let i = 0; i < this.keys.length; i++) {
			if(this.keys[i] == key) {
				// this.keys.splice(i, 1);
				const img = <HTMLImageElement>this.$refs["sheet_"+key][0];
				img.style.opacity = ".9";
			}
		}
		this.selectedSheets.push(key);
		
		//Round carousel to proper position
		this.roundAngle();
	}

	public onKeyDown(event:KeyboardEvent):void {
		let step = (Math.PI*2)/(this.keys.length);
		if(event.keyCode == 37) this.angle += step;
		if(event.keyCode == 39) this.angle -= step;
	}

	/**
	 * Close a file
	 */
	public unselect(key:string):void {
		for (let i = 0; i < this.selectedSheets.length; i++) {
			if(this.selectedSheets[i] == key) {
				this.selectedSheets.splice(i, 1);
			}
		}
		const img = <HTMLImageElement>this.$refs["sheet_"+key][0];
		img.style.opacity = "1";
		// this.keys.push(key);
		this.keys.sort();

		//Round carousel to proper position
		this.roundAngle();
	}

	/**
	 * Main render loop
	 */
	private renderWheel(): void {
		if (!this.disposed) {
			requestAnimationFrame(() => this.renderWheel());
		}else {
			return;
		}

		if(this.intro) {
			this.angleInterp = this.angle;
		}else{
			let a = this.angle - this.angleInterp;
			a = a % (Math.PI*2);
			this.angleInterp += a * .08;
		}

		let step = (Math.PI*2)/(this.keys.length);
		let locAngle = this.angleInterp - Math.PI/2;// + step/this.keys.length*5;
		for (let i = 0; i < this.keys.length; i++) {
			let key = this.keys[i];
			const img = <HTMLImageElement>this.$refs["sheet_"+key][0];
			
			let inc = i*step;

			//z-sort
			let z = Utils.angularDistance(Math.PI/2, locAngle + inc)*(180/Math.PI);
			img.style.zIndex = Math.round(z).toString();

			//Slide the center item a bit upward
			let py = Math.sin(locAngle + inc) * this.radius + this.center.y;
			let threshold = 15;
			if(Math.abs(180-z) < threshold) {
				py -= (threshold-Math.abs(180-z))/threshold*70;
			}

			//Place item
			img.style.left = (Math.cos(locAngle + inc) * this.radius*5 + this.center.x)+"px";
			img.style.top = py+"px";
			
			//Fade background items
			let fadeRatio = .55;// 0 < fadeRatio < 1
			let b = Math.max(0,(z/180-fadeRatio)) * 100 * 1/(1-fadeRatio);
			let filter = "brightness("+b+"%)";
			if(this.selectedSheets.indexOf(key) > -1) {
				filter = "brightness("+(b+20)+"%) saturate(0)";
			}
			img.style.filter = filter;
		}
	}

	/**
	 * Scroll carousel
	 */
	private onMouseWheel(event:MouseWheelEvent, force:boolean = false):void {
		clearTimeout(this.timeoutWheel);
		if(!force) {
			this.timeoutWheel = setTimeout(()=> {
				this.onMouseWheel(event, true);
			}, 10);
			return;
		}
		let delta = event.deltaY == 0? event.deltaX : event.deltaY;
		if(delta == 0) return;
		this.angle -= Math.abs(delta)/delta * (Math.PI*2)/this.keys.length;
	}

	/**
	 * Start dragging carousel
	 */
	private onMouseDown(event:MouseEvent):void {
		let bounds = this.$el.getBoundingClientRect();
		this.dragOffset.x = this.dragStart.x = event.clientX - bounds.left;
		this.dragOffset.y = this.dragStart.y = event.clientY - bounds.top;
		this.dragging = true;
		event.preventDefault();
	}

	/**
	 * Stop dragging carousel
	 */
	private onMouseUp(event:MouseEvent):void {
		if(this.dragging) {
			this.roundAngle();
		}
		this.dragging = false;
	}

	/**
	 * Dragging carousel
	 */
	private onMouseMove(event:MouseEvent):void {
		if(!this.dragging) return;
		let bounds = this.$el.getBoundingClientRect();
		let px = event.clientX - bounds.left;
		let py = event.clientY - bounds.top;
		
		this.angle += (px-this.dragOffset.x) * .005;

		this.dragOffset.x = px;
		this.dragOffset.y = py;
	}

}
</script>

<style scoped lang="less">
.fileselector{
	position: absolute;
	z-index: 1;
	top:0;
	left:0;
	.image {
		position: absolute;
		left: 50%;
		margin: 0;
		transform-origin: top center;
		transform: translate(-50%, 0);
		user-select: none;
		cursor: pointer;
		transition: margin-top .25s;
		&:hover {
			margin-top: -50px;
		}
	}
	.imageSelected {
		cursor: grab;
		&:active {
			cursor: grabbing;
		}
	}
}
</style>