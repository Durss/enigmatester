<template>
	<div class="reticle" :style="style">
		<div ref="start" :style="styleStart" class="part">
			<img src="@/assets/reticle/1.svg" draggable="false">
			<div class="pivot" ref="pivot1"></div>
			<div class="pivot pivot2" ref="pivot2"></div>
		</div>
		<div ref="middle" class="part">
			<img src="@/assets/reticle/2.svg" draggable="false">
		</div>
		<div ref="end" :style="styleEnd" class="part">
			<img src="@/assets/reticle/3.svg" draggable="false">
			<div class="pivot pivot3" ref="pivot3"></div>
		</div>
		<div ref="mark" class="mark"></div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";

@Component({
	components:{}
})
export default class Reticle extends Vue {

	public get style():any {
		return {
			left: this.pos.x+"px",
			top: this.pos.y+"px",
			transform: "rotate("+this.angleAll+"rad)",
			// transformOrigin: this.pivotAll.x+"px "+this.pivotAll.y+"px",
		}
	}

	public get styleStart():any {
		return {
			transform: "rotate("+this.angleA+"rad)",
			transformOrigin: this.pivotA.x+"px "+this.pivotA.y+"px",
		}
	}

	public get styleEnd():any {
		return {
			transform: "rotate("+this.angleB+"rad)",
			transformOrigin: this.pivotB.x+"px "+this.pivotB.y+"px",
		}
	}
	
	public disposed:boolean = false;
	
	private dragging:boolean = false;
	private rotateA:boolean = false;
	private rotateB:boolean = false;
	private rotateAll:boolean = false;
	private pos:{x:number, y:number} = {x:900, y:600};
	private dragOffset:{x:number, y:number} = {x:0, y:0};
	private pivotA:{x:number, y:number} = {x:28.3, y:56.7};
	private pivotB:{x:number, y:number} = {x:197.8, y:56.7};
	private pivotAll:{x:number, y:number} = {x:0, y:0};
	private angleA:number = 0;
	private angleB:number = 0;
	private angleAll:number = Math.PI*0;
	
	private _mouseDownHandler:any;
	private _mouseUpHandler:any;
	private _mouseMoveHandler:any;

	public mounted():void {

		this._mouseDownHandler = (e:MouseEvent) => this.onMouseDown(e);
		this._mouseUpHandler = (e:MouseEvent) => this.onMouseUp(e);
		this._mouseMoveHandler = (e:MouseEvent) => this.onMouseMove(e);
		this.$el.addEventListener("mousedown", this._mouseDownHandler);
		document.addEventListener("mouseup", this._mouseUpHandler);
		document.addEventListener("mousemove", this._mouseMoveHandler);
		
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
		let bounds = this.$el.getBoundingClientRect();
		this.dragOffset.x = event.clientX - bounds.left;
		this.dragOffset.y = event.clientY - bounds.top;
		if(event.target == this.$refs.middle) {
			if(event.buttons == 2) {
				this.rotateAll = true;
			}else{
				this.dragging = true;
				let bounds = this.$el.getBoundingClientRect();
				this.dragOffset.x = event.clientX;
				this.dragOffset.y = event.clientY;
			}
		}
		if(event.target == this.$refs.start) {
			this.rotateA = true;
		}
		if(event.target == this.$refs.end) {
			this.rotateB = true;
		}
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

	/**
	 * Dragging carousel
	 */
	private onMouseMove(event:MouseEvent):void {
		let px:number = event.clientX;
		let py:number = event.clientY;
		
		this.pivotAll.x = 0;
		if(this.$refs.middle) {
			let mark = <HTMLDivElement>this.$refs.mark;
			let pivot = <HTMLDivElement>this.$refs.pivot2;
			let bounds = pivot.getBoundingClientRect();
			let boundsPivot = this.$el.getBoundingClientRect();
			this.pivotAll.x = bounds.left - boundsPivot.left;
			this.pivotAll.y = bounds.top - boundsPivot.top;
			mark.style.left = this.pivotAll.x+"px";
			mark.style.top = this.pivotAll.y+"px";
		}
		
		if(this.dragging) {
			let bounds = this.$el.getBoundingClientRect();
			let px = event.clientX;
			let py = event.clientY;
			
			this.pos.x += (px-this.dragOffset.x);
			this.pos.y += (py-this.dragOffset.y);

			this.dragOffset.x = px;
			this.dragOffset.y = py;
		}
		
		let angleStep = 2*Math.PI/16;
		if(this.rotateA) {
			let bounds = (<HTMLImageElement>this.$refs.pivot2).getBoundingClientRect();
			let bounds2 = (<HTMLImageElement>this.$el).getBoundingClientRect();
			let a = Math.atan2(py - bounds.top, px - bounds.left) + this.angleAll;
			let a2 = Math.atan2(bounds2.top - bounds.top, bounds2.left - bounds.left);// + this.angleAll;
			this.angleA = a - a2;//Math.min(Math.max(-Math.PI/2, a), Math.PI/2);
			// this.angleA = Math.round(this.angleA/angleStep)*angleStep;
		}
		if(this.rotateB) {
			let bounds = (<HTMLImageElement>this.$refs.pivot3).getBoundingClientRect();
			let bounds2 = (<HTMLImageElement>this.$el).getBoundingClientRect();
			let a = Math.atan2(py - bounds.top, px - bounds.left) + this.angleAll;
			let a2 = Math.atan2(bounds2.top - bounds.top, bounds2.left - bounds.left);// + this.angleAll;
			this.angleB = a - a2;//Math.min(Math.max(-Math.PI/2, a), Math.PI/2);
			// this.angleB = Math.round(this.angleB/angleStep)*angleStep;
		}
		if(this.rotateAll) {
			let bounds = (<HTMLImageElement>this.$el).getBoundingClientRect();
			let a = Math.atan2((bounds.top + bounds.height/2) - py, (bounds.left + 30.4) - px);
			// this.angleAll = Math.min(Math.max(-Math.PI/2, a), Math.PI/2);
		}
	}

}
</script>

<style scoped lang="less">
.reticle{
	.mark, .pivot {
		position: absolute;
		z-index: 1000;
		background-color: red;
		border-radius: 50%;
		width: 7px;
		height: 7px;
		transform: translate(-50%, -50%);
		&.pivot {
			left: 195px;
			top: 56.5px;
			width: 5px;
			height: 5px;
			background-color: green;
			&.pivot2 {
				left: 28.3px;
				top: 56.5px;
			}
			&.pivot3 {
				left: 198px;
				top: 56.5px;
			}
		}
	}
	position: absolute;
	left: 0;
	top: 0;
	z-index: 2;
	user-select: none;
	.part {
		position: absolute;
		left: 0;
		top: 0;
		transform: scale(1);
		transition: filter .3s;
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
		}
		&:nth-child(2) {
			width: 157.3px;
			height: 56.7px;
			left: 167px;
			top: 28px;
			z-index: 1;
		}
		&:nth-child(3) {
			width: 226.2px;
			height: 113.4px;
		}
	}
}
</style>