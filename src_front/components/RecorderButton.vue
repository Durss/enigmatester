<template>
	<div class="recorderbutton">
		<canvas ref="canvas"></canvas>
		<img src="@/assets/audioplayer/reccord_button.svg" alt="reccord" class="buttonSkin" ref="bt" :style="btStyles">
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";

@Component({
	components:{}
})
export default class RecorderButton extends Vue {

	@Prop()
	public replayPercent:number;

	@Prop()
	public recording:boolean;

	private history:number[] = [];
	private cnv:HTMLCanvasElement;
	private ctx:CanvasRenderingContext2D;
	private disposed:boolean;
	private inc1:number = 0;
	private inc2:number = 0;
	private btScaleX:number = 1;
	private btScaleY:number = 1;

	private refLength:number = 0;
	private maxHistoryLength:number = 360;
	private growPercents = [];
	private curlDirections = [];
	private curlCoefficients = [];

	public get btStyles():any {
		return {
			transform: "translate(-50%, 0) scale("+this.btScaleX+", "+this.btScaleY+")"
		}
	}

	public async mounted():Promise<void> {
		this.cnv = <HTMLCanvasElement>this.$refs.canvas;
		this.ctx = this.cnv.getContext("2d", { alpha: false });
		await this.$nextTick();
		let bounds = this.cnv.getBoundingClientRect();
		this.cnv.width = bounds.width;
		this.cnv.height = bounds.height;
		this.doRender();
	}

	public beforeDestroy():void {
		this.disposed = true;
	}

	public reset():void {
		this.refLength = 0;
		this.history = [];
		this.growPercents = [];
		this.curlDirections = [];
		this.curlCoefficients = [];
	}

	@Watch('replayPercent')
	private onPercentChange():void {
		if(this.refLength == 0) this.refLength = this.history.length;
		let items = Math.round(this.refLength * this.replayPercent);

		this.history = this.history.splice(0, items);
		this.growPercents = this.growPercents.splice(0, items);
		this.curlDirections = this.curlDirections.splice(0, items);
		this.curlCoefficients = this.curlCoefficients.splice(0, items);
	}

	public addData(value:number):void {
		this.history.push(value);
		this.growPercents.push(0);
		this.curlDirections.push( (Math.random()-Math.random()) * .25 );
		this.curlCoefficients.push( Math.random() * .51 + 1 );
		
		// if(this.history.length >= this.maxHistoryLength) {
		// 	this.history.shift();
		// 	this.growPercents.shift();
		// 	this.curlDirections.shift();
		// 	this.curlCoefficients.shift();
		// }
	}

	public doRender():void {
		if(this.disposed) return;
		requestAnimationFrame(_=>this.doRender());

		this.inc1 += .05 * (this.recording? 4 : 1);
		this.inc2 += .11 * (this.recording? 4 : 1);
		let bt = <HTMLImageElement>this.$refs.bt;
		this.btScaleX = Math.sin(this.inc1)*(this.recording? .02 : .01) + .5;
		this.btScaleY = Math.sin(this.inc2)*(this.recording? .02 : .01) + .5;
		
		let w = this.cnv.width;
		let h = this.cnv.height;
		let cx = w/2;
		let cy = h/2;
		let r = w/2 * .5;
		let angle = 0;
			
		this.ctx.clearRect(0,0,w,h);

		let length = Math.max(0, this.history.length - this.maxHistoryLength);
		for (let i = this.history.length-1; i > length; i--) {
			const el = this.history[i];
			if(this.growPercents[i] < 1) {
				this.growPercents[i] += .05;
			}

			let px = cx + (w*this.btScaleX*.5 - 1)*Math.cos(angle);
			let py = cy + (h*this.btScaleY*.5 - 1)*Math.sin(angle);
			let curl = this.curlDirections[i];
			let curlCoeff = this.curlCoefficients[i]
			let chunks = Math.max(2, Math.min(10, this.history[i] * 100) * this.growPercents[i]);

			this.ctx.beginPath();
			this.ctx.strokeStyle = "#FFEEDA";
			this.ctx.lineJoin = 'miter';
			this.ctx.lineCap = 'round';
			let a = angle;
			for (let j = 0; j < chunks; j++) {
				this.ctx.moveTo(px, py);
				let size = (chunks-j)*1.5;
				curl *= curlCoeff;
				a += curl;
				px += size * Math.cos(a);
				py += size * Math.sin(a);
				this.ctx.lineWidth = .5;//(chunks-j)/chunks * (this.history[i] * 5) + .5;
				this.ctx.lineTo(px, py);
				this.ctx.stroke();
			}
			this.ctx.closePath();

			angle += Math.PI*2 / Math.min(this.history.length, this.maxHistoryLength);
		}
	}

}
</script>

<style scoped lang="less">
.recorderbutton{
	position: relative;
	canvas {
		width: 90vw;
		height: 90vw;
		margin: auto;
		display: block;
	}
	.buttonSkin {
		position: absolute;
		top: 0;
		left: 50%;
		width: 90vw;
		height: 90vw;
		// opacity: .15;
		transform: translate(-50%, 0) scale(.65, .65);
	}
}
</style>