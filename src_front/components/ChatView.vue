<template>
	<div class="chatview">
		<div class="users">
			<h1 class="roomName">{{$store.state.room.name}}</h1>
			<ul>
				<li v-for="u in users" :key="u.id" class="user">
					<div class="index">{{u.index+1}}</div>
					<div>{{u.name}}</div>
				</li>
			</ul>
		</div>
		<div class="history">
			<ChatMessage :data="m" v-for="m in messages" :key="m.id" />
			couille
		</div>
		<div class="form">
			<Button title="Send info" class="submit" @click="sendInfos()" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Button from './Button.vue';
import ChatMessage from './ChatMessage.vue';
import SockController, { SOCK_ACTIONS } from '../controller/SockController';
import SocketEvent from '../vo/SocketEvent';
import UserData from '../vo/UserData';

@Component({
	components:{
		Button,
		ChatMessage
	}
})
export default class ChatView extends Vue {

	public messages:any[] = [];

	private messageHandler:any;

	public get users():UserData[] {
		let users:UserData[] = this.$store.state.room.users
		users.sort((a,b)=> {
			if(a.index < b.index) return -1;
			if(a.index > b.index) return 1;
			return 0;
		})
		return users;
	}

	public mounted():void {
		this.messageHandler = (e:SocketEvent)=>this.onMessage(e);
		SockController.instance.addEventListener(SOCK_ACTIONS.SEND_MESSAGE, this.messageHandler);
	}

	public beforeDestroy():void {
		
	}

	public onMessage(event:SocketEvent):void {
		console.log("Socket event", event.data);
	}

	public sendInfos():void {
		this.$emit("sendinfo");
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

	.users {
		.roomName {
			text-transform: capitalize;
			padding: 10px;
		}
		ul {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			.user {
				font-size: 12px;
				padding: 5px 10px;
				padding-left: 0px;
				border-radius: 15px;
				background-color: @mainColor_highlight;
				display: flex;
				margin-right: 0;
				flex-direction: row;
				align-items: center;
				text-transform: capitalize;
				&:not(:last-child) {
					margin-right: 5px;
				}

				.index {
					font-size: 12px;
					font-weight: bold;
					color: #fff;
					margin-right: 10px;
					height: calc(100% + 10px);
					padding: 0 5px;
					display: flex;
					align-items: center;
					border-top-left-radius: 15px;
					border-bottom-left-radius: 15px;
					background-color: @mainColor_highlight_light;
				}
			}
		}
	}

	.history {
		flex-grow: 1;
		padding: 5px;
		overflow-y: auto;
		overflow-x: none;
		// min-height: 100%;
	}

	.form {
		padding: 5px;
		display: flex;
		flex-direction: column;
		border-top: 1px solid @mainColor_dark;
	}
}
</style>