<template>
	<div class="alientfonttest">
		<form @submit.prevent="onSubmit" class="form">
			<textarea cols="30" rows="10" v-model="src"></textarea>
		</form>
		<AlienMessage :message="src" class="message" @onLetter="onLetter()" ref="messageComp" />

		<div class="uploadForm">
			<div class="title">Upload sounds</div>
			<input type="file" accept="audio/*" multiple @change="onFiles" ref="fileInput">
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import AlienMessage from '../components/AlienMessage.vue';
import Button from '../components/Button.vue';

@Component({
	components:{
		Button,
		AlienMessage,
	}
})
export default class AlientFontTest extends Vue {

	public audios:HTMLAudioElement[] = [];
	public inputValue:string = "";
// 	private src:string =  `CHris...
// MR PUzzle...`;
	private src:string = "I MAY CONSENT GIVING YOU MY SECRETS if yOu find mY name...";
// 	private src:string = `yOu hAve proVen worthy...
// my sEcrEts yOu shall nOw discovEr...`;
// 	private src:string = `i sEE you overcamE my
// challEngE Chris...`;
// 	private src:string = `or, DiD you...?
// i stiLL havE onE
// specifiC purposE you
// hAven'T figurEd oUt,chris...`;
	private disposed:boolean = false;

	public mounted():void {
	}

	public beforeDestroy():void {
		this.disposed = true;
	}

	public onFiles(e):void {
		let input:HTMLInputElement = <HTMLInputElement>this.$refs.fileInput;

		this.audios = [];
		for (let i = 0; i < input.files.length; i++) {
			var reader = new FileReader();
			reader.onload = (e) => {
				let a = new Audio(<string>e.target.result);
				this.audios.push(a);
			};
			reader.readAsDataURL(input.files[i]);
		}
		(<AlienMessage>this.$refs.messageComp).restart();
	}

	public onLetter():void {
		if(this.audios.length == 0) return;

		var item = this.audios[Math.floor(Math.random() * this.audios.length)];
		item.play();
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.alientfonttest{
	width: 100%;
	.message {
		width: 100%;
		margin: auto;
		margin-top: 50px;
		// position: absolute;
		// .center();
		max-width: 650px;
	}

	.form {
		margin: auto;
		margin-top: 20px;
		display: flex;
		flex-direction: column;
		width: 400px;
	}

	.uploadForm {
		text-align: center;
		margin-top: 50px;
		padding: 15px;
		border-radius: 15px;
		left: 50%;
		position: relative;
		transform: translate(-50%, 0);
		display: inline-block;
		background-color: @mainColor_light;

		.title {
			font-size: 20px;
			font-weight: bold;
			margin-bottom: 10px;
		}
	}
}
</style>