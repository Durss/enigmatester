<template>
	<div class="alientfonttest">
		<form @submit.prevent="onSubmit" class="form">
			<textarea cols="30" rows="10" v-model="src"></textarea>
		</form>
		<AlienMessage :message="src" class="message" />
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

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.alientfonttest{
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
}
</style>