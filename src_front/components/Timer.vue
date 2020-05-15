<template>
	<div class="timer">
		{{time}}
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Utils from '../utils/Utils';

@Component({
	components:{}
})
export default class Timer extends Vue {

	@Prop()
	private paused:boolean = false;

	private time:string = "";
	private offset:number = 0;
	private startPause:number = 0;
	private disposed:boolean = false;
	private startTime:Date = new Date();

	public mounted():void {
		requestAnimationFrame(_=> this.renderFrame());
	}

	public beforeDestroy():void {
		this.disposed = true;
	}

	private renderFrame():void {
		if(this.disposed) return;
		requestAnimationFrame(_=> this.renderFrame());
		
		if(this.paused) return;

		let res = Utils.secondsToInputValue(new Date().getTime() - this.startTime.getTime() - this.offset);
		this.time = res;
	}

	@Watch("paused")
	private onPauseChange():void {
		if(this.paused) {
			this.startPause = new Date().getTime();
		}else {
			this.offset += new Date().getTime() - this.startPause;
		}
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.timer{
	font-size: 30px;
	// text-align: center;
	color: @mainColor_skin;
}
</style>