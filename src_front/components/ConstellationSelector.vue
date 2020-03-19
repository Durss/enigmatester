<template>
	<div class="constellationselector" v-if="constellations">
		<img :src="constellations(key)" v-for="key in keys" :key="key" class="image" ref="images">
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Utils from '../utils/Utils';

@Component({
	components:{}
})
export default class ConstellationSelector extends Vue {

	public constellations:__WebpackModuleApi.RequireContext = null;
	public angle:number = 0;
	public angleInterp:number = this.angle;
	public disposed:boolean = false;
	
	private dragging:boolean = false;
	private dragOffset:{x:number, y:number} = {x:0, y:0};

	private _mouseDownHandler:any;
	private _mouseUpHandler:any;
	private _mouseMoveHandler:any;
	private _mouseWheelHandler:any;

	public get keys():string[] {
		return this.constellations.keys();
	}

	public async mounted():Promise<void> {
		this.constellations = require.context("@/assets/constellations");
		
		await this.$nextTick();
		this.renderWheel();
		
		this._mouseDownHandler = (e:MouseEvent) => this.onMouseDown(e);
		this._mouseUpHandler = (e:MouseEvent) => this.onMouseUp(e);
		this._mouseMoveHandler = (e:MouseEvent) => this.onMouseMove(e);
		this._mouseWheelHandler = (e:MouseWheelEvent) => this.onMouseWheel(e);
		document.addEventListener("mousedown", this._mouseDownHandler);
		document.addEventListener("mouseup", this._mouseUpHandler);
		document.addEventListener("mousemove", this._mouseMoveHandler);
		document.addEventListener("wheel", this._mouseWheelHandler);
	}

	public beforeDestroy():void {
		this.disposed = true;
		document.removeEventListener("mousedown", this._mouseDownHandler);
		document.removeEventListener("mouseUp", this._mouseUpHandler);
		document.removeEventListener("mouseMove", this._mouseMoveHandler);
		document.removeEventListener("wheel", this._mouseWheelHandler);
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

		let a = this.angle - this.angleInterp;
		a = (a + Math.PI) % Math.PI*2 - Math.PI;
		this.angleInterp += a * .08;

		let imgs:HTMLImageElement[] = <HTMLImageElement[]>this.$refs.images;
		let radius = 80;
		let centerX = document.body.clientWidth * .5;
		let centerY = document.body.clientHeight + radius - 70;
		for (let i = 0; i < imgs.length; i++) {
			const img = imgs[i];
			let inc = (i*360/imgs.length)*Math.PI/180;
			let z = Utils.angularDistance(Math.PI/2, this.angleInterp + inc)*(180/Math.PI);
			img.style.zIndex = Math.round(z).toString();

			let py = Math.sin(this.angleInterp + inc) * radius + centerY;
			let threshold = 15;
			if(Math.abs(180-z) < threshold) {
				py -= (threshold-Math.abs(180-z))/threshold*70;
			}

			img.style.left = (Math.cos(this.angleInterp + inc) * radius*5 + centerX)+"px";
			img.style.top = py+"px";
			
			let fadeRatio = .55;// 0 < fadeRatio < 1
			let b = Math.max(0,(z/180-fadeRatio)) * 100 * 1/(1-fadeRatio);
			img.style.filter = "brightness("+b+"%)";
		}
	}

	private onMouseWheel(event:MouseWheelEvent):void {
			this.angle -= Math.abs(event.deltaY)/event.deltaY * (Math.PI*2)/this.keys.length;
	}

	private onMouseDown(event:MouseEvent):void {
		let bounds = this.$el.getBoundingClientRect();
		this.dragOffset.x = event.clientX - bounds.left;
		this.dragOffset.y = event.clientY - bounds.top;
		this.dragging = true;
	}

	private onMouseUp(event:MouseEvent):void {
		this.dragging = false;
	}

	private onMouseMove(event:MouseEvent):void {
		if(!this.dragging) return;
		let bounds = this.$el.getBoundingClientRect();
		let px = event.clientX - bounds.left;
		let py = event.clientY - bounds.top;
		
		// this.angleH += (px-this.dragOffset.x) * .005;

		this.dragOffset.x = px;
		this.dragOffset.y = py;
	}

}
</script>

<style scoped lang="less">
.constellationselector{
	position: absolute;
	z-index: 1;
	top:0;
	left:0;
	.image {
		position: absolute;
		bottom: -600px;
		left: 50%;
		transform: translate(-50%, 0);
		user-select: none;
	}
}
</style>