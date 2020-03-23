<template>
	<div class="reticle">
		<div ref="start" :style="styleStart" class="part">
			<img src="@/assets/reticle/1.svg">
			<div class="pivot pivot1" ref="pivotStart1"></div>
			<div class="pivot pivot2" ref="pivotStart2"></div>
		</div>
		<div ref="middle" :style="styleMiddle" class="part">
			<img src="@/assets/reticle/2.svg">
			<div class="pivot pivot1" ref="pivotMiddle1"></div>
			<div class="pivot pivot2" ref="pivotMiddle2"></div>
		</div>
		<div ref="end" :style="styleEnd" class="part">
			<img src="@/assets/reticle/3.svg">
			<div class="pivot pivot1" ref="pivotEnd1"></div>
			<div class="pivot pivot2" ref="pivotEnd2"></div>
		</div>
		<img src="@/assets/icons/move.svg" class="move" ref="move" :style="styleMove">
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Config from '../utils/Config';
import gsap from 'gsap';

@Component({
	components:{}
})
export default class Reticle extends Vue {

	public get styleMove():any {
		return {
			left: this.posMove.x+"px",
			top: this.posMove.y+"px",
		}
	}

	public get styleStart():any {
		return {
			left: this.posAll.x+"px",
			top: this.posAll.y+"px",
			transform: "rotate("+this.angleAll+"rad)",
		}
	}

	public get styleMiddle():any {
		return {
			left: this.posMiddle.x+"px",
			top: this.posMiddle.y+"px",
			transform: "rotate("+this.angleA+"rad)",
		}
	}

	public get styleEnd():any {
		return {
			left: this.posEnd.x+"px",
			top: this.posEnd.y+"px",
			transform: "rotate("+this.angleB+"rad)",
		}
	}
	
	public disposed:boolean = false;
	
	private dragging:boolean = false;
	private rotateA:boolean = false;
	private rotateB:boolean = false;
	private rotateAll:boolean = false;
	private posMiddle:{x:number, y:number} = {x:0, y:0};
	private posEnd:{x:number, y:number} = {x:0, y:0};
	private posMove:{x:number, y:number} = {x:0, y:0};
	private posAll:{x:number, y:number} = {x:100, y:document.body.clientHeight/2 + 200};
	private dragOffset:{x:number, y:number} = {x:0, y:0};
	private angleA:number = Math.PI/2;
	private valueA:number = 0;
	private angleAOffset:number = 0;
	private angleB:number = Math.PI/2;
	private valueB:number = 0;
	private angleBOffset:number = 0;
	private angleAll:number = Math.PI/2;
	
	private _mouseDownHandler:any;
	private _mouseUpHandler:any;
	private _mouseMoveHandler:any;

	public mounted():void {

		this.placeItems();

		this._mouseDownHandler = (e:MouseEvent) => this.onMouseDown(e);
		this._mouseUpHandler = (e:MouseEvent) => this.onMouseUp(e);
		this._mouseMoveHandler = (e:MouseEvent) => this.onMouseMove(e);
		this.$el.addEventListener("mousedown", this._mouseDownHandler);
		document.addEventListener("mouseup", this._mouseUpHandler);
		document.addEventListener("mousemove", this._mouseMoveHandler);

		if(Config.ENABLE_INTRO_ANIMATIONS) {
			gsap.from(this.$el, {duration:1, opacity:0, delay:5});
			gsap.from(this, {duration:1, angleA:Math.PI, angleB:Math.PI*2, delay:5, onUpdate:_=> this.placeItems()});
		}
		
	}

	public beforeDestroy():void {
		this.disposed = true;
		this.$el.removeEventListener("mousedown", this._mouseDownHandler);
		document.removeEventListener("mouseup", this._mouseUpHandler);
		document.removeEventListener("mousemove", this._mouseMoveHandler);
	}

	/**
	 * Start dragging carousel
	 */
	private onMouseDown(event:MouseEvent):void {
		if(event.target == this.$refs.middle) {
			this.rotateA = true;
			this.angleAOffset = this.getMouseAngleA(event.clientX, event.clientY);
		}else 
		if(event.target == this.$refs.move) {
			this.dragging = true;
			this.dragOffset.x = event.clientX;
			this.dragOffset.y = event.clientY;
		}else 
		if(event.target == this.$refs.start) {
			this.rotateAll = true;
		}else 
		if(event.target == this.$refs.end) {
			this.rotateB = true;
			this.angleAOffset = this.getMouseAngleB(event.clientX, event.clientY);
		}
		this.onMouseMove(event);
		event.preventDefault();
	}

	/**
	 * Stop dragging carousel
	 */
	private onMouseUp(event:MouseEvent):void {
		this.rotateA = false;
		this.rotateB = false;
		this.rotateAll = false;
		this.dragging = false;
		event.preventDefault();
	}

	public getMouseAngleA(px, py):number {
		let bounds = (<HTMLDivElement>this.$refs.pivotStart2).getBoundingClientRect();
		let bounds2 = (<HTMLDivElement>this.$el).getBoundingClientRect();
		return Math.atan2(bounds.top - py, bounds.left - px);
	}

	public getMouseAngleB(px, py):number {
		let bounds = (<HTMLDivElement>this.$refs.pivotEnd1).getBoundingClientRect();
		let bounds2 = (<HTMLDivElement>this.$el).getBoundingClientRect();
		return Math.atan2(bounds.top - py, bounds.left - px);
	}

	/**
	 * Dragging carousel
	 */
	private async onMouseMove(event:MouseEvent):Promise<void> {
		if(!this.dragging && !this.rotateA && !this.rotateB && !this.rotateAll) return;
		
		let px:number = event.clientX;
		let py:number = event.clientY;
		
		if(this.dragging) {
			let bounds = this.$el.getBoundingClientRect();
			let px = event.clientX;
			let py = event.clientY;
			
			this.posAll.x += (px-this.dragOffset.x);
			this.posAll.y += (py-this.dragOffset.y);

			let margin = 100;
			let w = 224;
			let h = 40;
			let sw = document.body.clientWidth;
			let sh = document.body.clientHeight;
			if(this.posAll.x < margin - w) this.posAll.x = margin - w;
			if(this.posAll.y < margin/2 - h) this.posAll.y = margin/2 - h;
			if(this.posAll.x > sw - margin/2 - w) this.posAll.x = sw - margin/2 - w;
			if(this.posAll.y > sh - margin - h) this.posAll.y = sh - margin - h;

			this.dragOffset.x = px;
			this.dragOffset.y = py;
		}

		let angleStep = 2*Math.PI/16;
		if(this.rotateA) {
			let before = this.angleA;
			let a = this.getMouseAngleA(px, py);
			this.angleA = Math.round(((a - this.angleAll))/angleStep)*angleStep + this.angleAll;
			this.valueA = 10 - (Math.round((this.angleA-this.angleAll) * 180/Math.PI / 360 * 16) + 5);
			if(this.valueA<0) this.valueA += 16;
			if(this.valueA>9) this.valueA -= 16;
			this.valueA = Math.min(Math.max(1, this.valueA), 9);
			this.angleB -= before - this.angleA;
		}
		
		if(this.rotateB) {
			let a = this.getMouseAngleB(px, py);
			this.angleB = Math.round((a - this.angleAll)/angleStep)*angleStep + this.angleAll;
			this.valueB = 10 - (Math.round((this.angleB - this.angleA) * 180/Math.PI / 360 * 16) + 5);
			if(this.valueB<0) this.valueB += 16;
			if(this.valueB>9) this.valueB -= 16;
			this.valueB = Math.min(Math.max(1, this.valueB), 9);
		}
		

		if(this.rotateAll) {
			let before = this.angleAll;
			let bounds1 = (<HTMLDivElement>this.$refs.start).getBoundingClientRect();
			let pivot = (<HTMLDivElement>this.$refs.pivotStart1).getBoundingClientRect();
			let a = Math.atan2(pivot.top - py, pivot.left - px);
			this.angleAll = a;
			this.angleA -= before - a;
			this.angleB -= before - a;
		}

		this.placeItems();
	}

	public async placeItems():Promise<void> {

		await this.$nextTick();
		let pivot1 = (<HTMLDivElement>this.$refs.pivotStart2).getBoundingClientRect();
		let pivot2 = (<HTMLDivElement>this.$refs.pivotMiddle1).getBoundingClientRect();
		this.posMiddle.x = pivot1.x - 126;
		this.posMiddle.y = pivot1.y - 28;

		await this.$nextTick();
		let middle = (<HTMLDivElement>this.$refs.middle).getBoundingClientRect();
		pivot1 = (<HTMLDivElement>this.$refs.pivotMiddle2).getBoundingClientRect();
		pivot2 = (<HTMLDivElement>this.$refs.pivotEnd1).getBoundingClientRect();
		this.posEnd.x = pivot1.x - 197.8;
		this.posEnd.y = pivot1.y - 56.7;

		let move = <HTMLImageElement>this.$refs.move;
		let pivot = (<HTMLDivElement>this.$refs.pivotStart1).getBoundingClientRect();
		this.posMove.x = pivot.x + Math.cos(this.angleAll) * 50;
		this.posMove.y = pivot.y + Math.sin(this.angleAll) * 50;
		
		let target = (<HTMLDivElement>this.$refs.pivotEnd2).getBoundingClientRect();
		this.$emit("updateCenterPos", target);
	}

}
</script>

<style scoped lang="less">
.reticle{
	position: absolute;
	left: 0;
	top: 0;
	z-index: 2;
	user-select: none;

	.move {
		position: absolute;
		z-index: 3;
		width: 20px;
		height: 20px;
		padding: 10px;
		cursor: pointer;
		background-color: rgba(255, 255, 255, .5);
		border-radius: 50%;
		transform: translate(-50%, -50%);
		transition: width .25s, height .25s, padding .25s;
		&:hover {
			width: 30px;
			height: 30px;
			// transform: translate(-50%, -50%) scale(1.25);
			padding: 5px;
		}
	}

	//Only used for debugging
	.pivot {
		position: absolute;
		z-index: 1000;
		background-color: red;
		border-radius: 50%;
		width: 0px;
		height: 0px;
		transform: translate(-50%, -50%);
		&.pivot1 {
			background-color: green;
		}
	}

	.part {
		position: absolute;
		left: 0;
		top: 0;
		transition: filter .3s;
		transform-origin: top left;
		&>* {
			pointer-events: none;
		}
		cursor: grab;
		&:active {
			cursor: grabbing;
		}
		&:hover {
			filter: brightness(130%);
		}

		&:nth-child(1) {
			width: 223.3px;
			height: 113.5px;
			left: 265px;
			transform-origin: 195px 56.5px;
			.pivot1 {
				left: 195px;
				top: 56px;
			}
			.pivot2 {
				left: 29px;
				top: 56px;
			}
		}
		&:nth-child(2) {
			width: 157.3px;
			height: 56.7px;
			left: 167px;
			top: 28px;
			z-index: 1;
			transform-origin: 126.6px 28.3px;
			.pivot1 {
				left: 127px;
				top: 29px;
			}
			.pivot2 {
				left: 31px;
				top: 29px;
			}
		}
		&:nth-child(3) {
			width: 226.2px;
			height: 113.4px;
			transform-origin: 198px 56.5px;
			.pivot1 {
				left: 197px;
				top: 56px;
			}
			.pivot2 {
				left: 56px;
				top: 56px;
			}
		}
	}
}
</style>