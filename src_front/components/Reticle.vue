<template>
	<div class="reticle" :style="style">
		<img src="@/assets/reticle/1.svg" class="part" draggable="false" ref="start">
		<img src="@/assets/reticle/2.svg" class="part" draggable="false" ref="middle">
		<img src="@/assets/reticle/3.svg" class="part" draggable="false" ref="end">
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
		}
	}
	
	public disposed:boolean = false;
	
	private dragging:boolean = false;
	private pos:{x:number, y:number} = {x:0, y:0};
	private dragOffset:{x:number, y:number} = {x:0, y:0};
	
	private _mouseDownHandler:any;
	private _mouseUpHandler:any;
	private _mouseMoveHandler:any;

	public mounted():void {
		this._mouseDownHandler = (e:MouseEvent) => this.onMouseDown(e);
		this._mouseUpHandler = (e:MouseEvent) => this.onMouseUp(e);
		this._mouseMoveHandler = (e:MouseEvent) => this.onMouseMove(e);
		this.$el.addEventListener("mousedown", this._mouseDownHandler);
		document.addEventListener("mouseup", this._mouseUpHandler);
		this.$el.addEventListener("mousemove", this._mouseMoveHandler);
		
	}

	public beforeDestroy():void {
		this.disposed = true;
		this.$el.removeEventListener("mousedown", this._mouseDownHandler);
		document.removeEventListener("mouseUp", this._mouseUpHandler);
		this.$el.removeEventListener("mouseMove", this._mouseMoveHandler);
	}

	/**
	 * Start dragging carousel
	 */
	private onMouseDown(event:MouseEvent):void {
		let bounds = this.$el.getBoundingClientRect();
		this.dragOffset.x = event.clientX - bounds.left;
		this.dragOffset.y = event.clientY - bounds.top;
		if(event.target == this.$refs.middle) {
			this.dragging = true;
		}
	}

	/**
	 * Stop dragging carousel
	 */
	private onMouseUp(event:MouseEvent):void {
		this.dragging = false;
	}

	/**
	 * Dragging carousel
	 */
	private onMouseMove(event:MouseEvent):void {
		if(!this.dragging) return;
		
		this.pos.x = event.clientX - this.dragOffset.x;
		this.pos.y = event.clientY - this.dragOffset.y;
		// this.pos.x += (px-this.dragOffset.x);
		// this.pos.y += (py-this.dragOffset.y);

		// this.dragOffset.x = px;
		// this.dragOffset.y = py;
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
	.part {
		position: absolute;
		left: 0;
		top: 0;
		transform: scale(1);
		&:nth-child(1) {
			width: 223px;
			left: 265px;
		}
		&:nth-child(2) {
			width: 157px;
			left: 167px;
			top: 28px;
			z-index: 1;
			cursor: grab;
			&:active {
				cursor: grabbing;
			}
		}
		&:nth-child(3) {
			width: 226px;
		}
	}
}
</style>