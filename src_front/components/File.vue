<template>
	<div class="file">
		<img :src="path" class="image" :style="style">
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";

@Component({
	components:{}
})
export default class File extends Vue {

	@Prop()
	public path:string;

	public get style():any {
		return {
			left: this.pos.x+"px",
			top: this.pos.y+"px",
			transform: "translate(-50%, -50%) scale("+this.zoom+")"
		}
	}
	
	public zoom:number = 1;
	public dragging:boolean = false
	public disposed:boolean = false
	public dragStart:{x:number, y:number} = {x:0, y:0};
	public dragOffset:{x:number, y:number} = {x:0, y:0};
	public pos:{x:number, y:number} = {x:0, y:0};
	public center:{x:number, y:number} = {x:0, y:0};
	public timeoutWheel:number = 0;

	private _mouseDownHandler:any;
	private _mouseUpHandler:any;
	private _mouseMoveHandler:any;
	private _mouseWheelHandler:any;

	public mounted():void {
		this.center.x = this.pos.x = (<HTMLDivElement>this.$el).getBoundingClientRect().width * .5;
		this.center.y = this.pos.y = document.body.clientHeight * .5;

		this._mouseDownHandler = (e:MouseEvent) => this.onMouseDown(e);
		this._mouseUpHandler = (e:MouseEvent) => this.onMouseUp(e);
		this._mouseMoveHandler = (e:MouseEvent) => this.onMouseMove(e);
		this._mouseWheelHandler = (e:MouseWheelEvent) => this.onMouseWheel(e);
		this.$el.addEventListener("mousedown", this._mouseDownHandler);
		document.addEventListener("mouseup", this._mouseUpHandler);
		document.addEventListener("mousemove", this._mouseMoveHandler);
		this.$el.addEventListener("wheel", this._mouseWheelHandler);
	}

	public beforeDestroy():void {
		this.disposed = true;
		this.$el.removeEventListener("mousedown", this._mouseDownHandler);
		document.removeEventListener("mouseup", this._mouseUpHandler);
		document.removeEventListener("mousemove", this._mouseMoveHandler);
		this.$el.removeEventListener("wheel", this._mouseWheelHandler);
	}

	/**
	 * Zoom file
	 */
	private onMouseWheel(event:MouseWheelEvent, force:boolean = false):void {
		clearTimeout(this.timeoutWheel);
		if(!force) {
			this.timeoutWheel = setTimeout(()=> {
				this.onMouseWheel(event, true);
			}, 10);
			return;
		}
		let speed = 1;
		if(event.ctrlKey) speed *= 5;
		if(event.shiftKey) speed /= 10;
		this.zoom -= Math.abs(event.deltaY)/event.deltaY * .1 * speed;
		this.zoom = Math.min(Math.max(.2, this.zoom),1);
		// event.preventDefault();
	}

	/**
	 * Start dragging file
	 */
	private onMouseDown(event:MouseEvent):void {
		let bounds = this.$el.getBoundingClientRect();
		this.dragOffset.x = this.dragStart.x = event.clientX - bounds.left;
		this.dragOffset.y = this.dragStart.y = event.clientY - bounds.top;
		this.dragging = true;
		event.preventDefault();
	}

	/**
	 * Stop dragging file
	 */
	private onMouseUp(event:MouseEvent):void {
		if(!this.dragging) return;
		this.dragging = false;
		let dragDist = Math.sqrt(Math.pow(this.dragStart.x - this.dragOffset.x, 2) + Math.pow(this.dragStart.y - this.dragOffset.y, 2));
		if(dragDist < 1) {
			this.$emit("unselect");
		}
	}

	/**
	 * Dragging file
	 */
	private onMouseMove(event:MouseEvent):void {
		if(!this.dragging) return;
		let bounds = this.$el.getBoundingClientRect();
		let px = event.clientX - bounds.left;
		let py = event.clientY - bounds.top;
		
		this.pos.x += (px-this.dragOffset.x);
		this.pos.y += (py-this.dragOffset.y);

		this.dragOffset.x = px;
		this.dragOffset.y = py;
	}

}
</script>

<style scoped lang="less">
.file{
	.image {
		position: absolute;
		z-index: 100;
		transform: translate(-50%, -50%);
		// opacity: .8;
		transition: transform .2s;
	}
}
</style>