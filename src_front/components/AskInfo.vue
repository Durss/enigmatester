<template>
	<div class="askinfo">
		<Button :icon="require('@/assets/icons/cross_white.svg')" @click="$emit('close')" class="back" />
		<div class="title">Clique sur un bouton pour dire le type d'information dont tu as besoin.</div>
		<Button :loading="isLoading" @click="sendMessage(0)" title="Nom de la constellation" />
		<Button :loading="isLoading" @click="sendMessage(1)" title="Nom de l'étoile" />
		<Button :loading="isLoading" @click="sendMessage(2)" title="Valeurs A &amp; B" />
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Button from './Button.vue';
import { MESSAGE_TYPE } from '../vo/ChatMessageData';
import SockController, { SOCK_ACTIONS } from '../controller/SockController';

@Component({
	components:{
		Button,
	}
})
export default class AskInfo extends Vue {

	public isLoading:boolean = false;

	public mounted():void {
		
	}

	public beforeDestroy():void {
		
	}

	public sendMessage(index:number):void {
		this.isLoading = true;

		let messages = [
			"J'ai besoin du nom de la constellation",
			"J'ai besoin du nom de l'étoile",
			"J'ai besoin des valeurs A et B",
		];
		let data = {
			type:MESSAGE_TYPE.HELP,
			message:messages[index],
			from:this.$store.state.me.id,
		}
		SockController.instance.sendMessage({action:SOCK_ACTIONS.SEND_MESSAGE, includeSelf:true, data});
		
		setTimeout(_=> {
			this.isLoading = false;
		}, 150);
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.askinfo{
	position: relative;
	z-index: 100;
	width: 100%;
	background-color: @mainColor_light_light;
	width: 100%;
	padding: 10px;
	box-sizing: border-box;

	.title {
		font-weight: bold;
		font-size: 20px;
		text-align: center;
	}

	button {
		margin-top: 10px;
	}

	.back {
		position: absolute;
		top: 0px;
		left: 50%;
		transform: translate(-50%, -100%);
		width: 40px;
		height: 40px;
		border-radius: 0;
		border-top-right-radius: 50%;
		border-top-left-radius: 50%;
	}

}
</style>