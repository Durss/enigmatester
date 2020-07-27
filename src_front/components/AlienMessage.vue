<template>
	<div class="alienmessage">
		<AlienMessageLetter v-for="(l, index) in letters" :key="index" :value="l" @start="onStartLetter(index)" @complete="onLetterComplete(index)" :delay="index" />
		<div v-html="finalMessage" class="finalMessage"></div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import AlienMessageLetter from './AlienMessageLetter.vue';

@Component({
	components:{
		AlienMessageLetter
	}
})
export default class AlienMessage extends Vue {

	@Prop({default:""})
	public message:string;

	private letters:string = "";
	private finalMessage:string = "";
	private timeout:number;
	private disposed:boolean = false;

	public mounted():void {
		this.letters = this.message;
	}

	public beforeDestroy():void {
		
	}

	public restart():void {
		this.onMessageUpdate();
	}


	/**
	 * Called when a letter is starting to be displayed
	 */
	public onStartLetter(index:number):void {
		this.$emit("onLetter");
	}


	/**
	 * When animation completes, replace all divs by actual
	 * letters, to make copy/past working
	 */
	public onLetterComplete(index:number):void {
		if(index == this.message.length-1) {
			this.letters = "";
			this.finalMessage = this.message.replace(/\n/gi, "<br />");
		}
	}

	@Watch("message")
	private onMessageUpdate():void {
		this.letters = "";
		this.finalMessage = "";
		clearTimeout(this.timeout);
		this.letters = this.message;
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.alienmessage{
	font-size: 40px;
	color: @mainColor_skin;
	font-family: "Alien";
	text-align: center;

	.finalMessage {
		word-break: break-all;
	}
}
</style>