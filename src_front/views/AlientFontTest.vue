<template>
	<div class="alientfonttest">
		<AlienMessage :message="src" class="message" />
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import AlienMessage from '../components/AlienMessage.vue';

@Component({
	components:{
		AlienMessage,
	}
})
export default class AlientFontTest extends Vue {

	// public text:string = "";
	// private src:string = "CHRIS / MR PUZZLE...";
	private src:string = "I MAY CONSENT GIVING YOU MY SECRETS if yOu find mY name...";
// 	private src:string = `yOu hAve proVen worthy...
// my sEcrEts yOu shall nOw discovEr...`;
// 	private src:string = `i sEE you overcamE my
// challEngE Chris...`;
// 	private src:string = `or, DiD you...?
// i stiLL havE onE
// specifiC purposE you
// hAven'T figurEd oUt,chris...`;
	// private indices:number[] = [];
	private disposed:boolean = false;

	public mounted():void {
		// this.indices = new Array(this.src.length);
		// for (let i = 0; i < this.indices.length; i++) {
		// 	let code = this.src.charCodeAt(i);
		// 	if((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
		// 		let offset = this.src.charAt(i) == this.src.charAt(i).toUpperCase()? 65 : 97;
		// 		this.indices[i] = offset + 25;
		// 	}else{
		// 		this.indices[i] = this.src.charCodeAt(i);
		// 	}
		// }

		// this.loopLetters();
	}

	public beforeDestroy():void {
		this.disposed = true;
	}

	// public loopLetters():void {
	// 	let res = "";
	// 	for (let i = 0; i < this.indices.length; i++) {
	// 		let char = this.src.charCodeAt(i);
	// 		res += String.fromCharCode( Math.round(this.indices[i]));
	// 		this.indices[i] += (char - this.indices[i]) * .05;
	// 	}
	// 	this.text = res.replace(/#/gi, "<br />");
	// 	if(!this.disposed) {
	// 		setTimeout(_=> this.loopLetters(), 35);
	// 	}

	// }

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.alientfonttest{
	.message {
		width: 100%;
		position: absolute;
		.center();
		max-width: 650px;
	}
}
</style>