<template>
	<div class="chatview">
		<div class="history">
			<ChatMessage :data="m" v-for="m in messages" :key="m.id" />
			{{$store.state.room.users}}
		</div>
		<div class="form">
			<Button title="Send info" class="submit" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Button from './Button.vue';
import ChatMessage from './ChatMessage.vue';
import SockController from '../controller/SockController';
import SocketEvent from '../vo/SocketEvent';

@Component({
	components:{
		Button,
		ChatMessage
	}
})
export default class ChatView extends Vue {

	public messages:any[] = [];

	private messageHandler:any;

	public mounted():void {
		this.messageHandler = (e:SocketEvent)=>this.onMessage(e);
		SockController.instance.addEventListener(SocketEvent.USER_MESSAGE, this.messageHandler);
		SockController.instance.addEventListener(SocketEvent.JOIN_ROOM, this.messageHandler);
		SockController.instance.addEventListener(SocketEvent.LEAVE_ROOM, this.messageHandler);
	}

	public beforeDestroy():void {
		
	}

	public onMessage(event:SocketEvent):void {
		console.log("Socket event", event.getType());
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.chatview{
	position: absolute;
	right: 0;
	top: 0;
	height: 100%;
	width: 300px;
	z-index: 1;
	background: @mainColor_light;
	display: flex;
	flex-direction: column;

	.history {
		flex-grow: 1;
		padding: 5px;
	}

	.form {
		padding: 5px;
		display: flex;
		flex-direction: column;
		border-top: 1px solid @mainColor_dark;
	}
}
</style>