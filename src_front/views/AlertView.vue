<template>
	<div class="alert" v-if="message && message.length > 0" @click="close()">
		<p v-html="message" class="label"></p>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from 'vue-property-decorator'
import gsap from 'gsap';

@Component
export default class AlertView extends Vue {

	public message:string = "";

	public mounted():void {
		
	}

	@Watch("$store.state.alert")
	public onWatchAlert():void {
		let mess = this.$store.state.alert;
		if(mess && mess.length > 0) {
			this.message = mess;
			this.$nextTick().then(_=> {
				this.$el.removeAttribute("style");
				gsap.from(this.$el, {duration:.3, height:0, paddingTop:0, paddingBottom:0, ease:"back.out"});
				setTimeout(_=> this.close(), 6000);
			});
		}else{
			this.$nextTick().then(_=> {
				gsap.to(this.$el, {duration:.3, height:0, paddingTop:0, paddingBottom:0, ease:"back.in", onComplete:()=> {
					this.message = null;
				}});
			});
		}
	}

	public close():void {
		this.$store.state.alert = null;
	}
}
</script>

<style lang="less">
@import (reference) '../less/_includes.less';
.alert {
	background-color: #c00;
	color: #fff;
	padding: 20px 0;
	width: 100%;
	position: absolute;
	overflow: hidden;
	z-index: 1;
	position: fixed;
	top: 0;
	cursor: pointer;

	.label {
		max-width: 600px;
		margin: auto;
		padding: 0 30px 0 10px;
		text-align: center;
		&::after {
			content: "X";
			color: #fff;
			position: absolute;
			top: 16px;
			right: 10px;
			padding-left: 20px;
			font-size: 20px;
		}
	}
}
</style>