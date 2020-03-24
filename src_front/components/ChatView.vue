<template>
	<div class="chatview">
		<div class="users">
			<h1 class="roomName">{{$store.state.room.name}}</h1>
			<ul>
				<li v-for="u in users" :key="u.id" class="user" :data-self="u.id == $store.state.me.id" :data-ready="u.currentStepDone">
					<div class="index">
						<img :src="require('@/assets/icons/elem_'+(ELEMENTS[u.index])+'.svg')" alt="">
					</div>
					<div>{{u.name}}</div>
				</li>
			</ul>
		</div>

		<CurrentGoal class="goal" />
		
		<div class="messageList" ref="messageList">
			<ChatMessage :data="m" v-for="m in messageList" :key="m.id" class="message" />
		</div>
		
		<FormView v-if="showForm && showSend" class="form" @close="closeForm()" />
		<AskInfo v-if="showForm && showAsk" class="form" @close="closeForm()" />

		<div class="form" v-if="!showForm">
			<Button title="📢 Envoyer une info" class="submit" @click="sendInfos()" />
			<Button title="🙋 Demander une info" class="submit" @click="askInfo()" />
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
import Config from '../utils/Config';
import FormView from './FormView.vue';
import CurrentGoal from './CurrentGoal.vue';
import AskInfo from './AskInfo.vue';

@Component({
	components:{
		Button,
		AskInfo,
		FormView,
		CurrentGoal,
		ChatMessage
	}
})
export default class ChatView extends Vue {

	private showForm:boolean = false;
	private showAsk:boolean = false;
	private showSend:boolean = false;

	public ELEMENTS:string[] = Config.ELEMENTS;

	public get users():UserData[] {
		let users:UserData[] = this.$store.state.room.users
		users.sort((a,b)=> {
			if(a.index < b.index) return -1;
			if(a.index > b.index) return 1;
			return 0;
		})
		return users;
	}

	public get messageList():any[] {
		return this.$store.state.chatMessages;
	}

	public mounted():void {
	}

	public beforeDestroy():void {
	}

	@Watch("$store.state.chatMessages")
	public async onMessage(event:SocketEvent):Promise<void> {
		await this.$nextTick();
			this.scrollToBottom()
		setTimeout(_=> {
			this.scrollToBottom()
		},30)

	}

	private scrollToBottom():void {
		let div = <HTMLDivElement>this.$refs.messageList;
		div.scrollTop = div.scrollHeight;
	}

	public sendInfos():void {
		this.showForm = true;
		this.showSend = true;
	}

	public askInfo():void {
		this.showForm = true;
		this.showAsk = true;
	}

	public closeForm():void {
		this.showForm = false;
		this.showAsk = false;
		this.showSend =false;
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
	// width: 340px;
	z-index: 1;
	background: @mainColor_light;
	display: flex;
	flex-direction: column;

	.users {
		margin-bottom: 10px;
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
				opacity: .8;
				// color: darken(@mainColor_warn, 10%);
				&:not(:last-child) {
					margin-right: 5px;
				}

				&[data-self='true'] {
					opacity: 1;
					// color: @mainColor_normal;
					// border: 1px solid white;
				}

				&[data-ready='true'] {
					opacity: 1;
					background-color: @mainColor_warn;
					.index {
						background-color: @mainColor_warn_light;
					}
					animation: blinker 1s linear infinite;
					@keyframes blinker {
					50% {
						filter: brightness(120%) saturate(50%);
						box-shadow: 0px 0px 10px 0px rgba(255,255,255,1);
					}
					}
					// border: 1px solid white;
				}

				.index {
					display: flex;
					// display: none;
					font-size: 12px;
					font-weight: bold;
					color: #fff;
					margin-right: 10px;
					height: calc(100% + 10px);
					padding: 0 5px;
					align-items: center;
					border-top-left-radius: 15px;
					border-bottom-left-radius: 15px;
					background-color: @mainColor_highlight_light;
					&>img {
						width: 20px;
						height: 20px;
						background-color: white;
						border-radius: 500px;
						padding: 2px;
						overflow: hidden;
					}
				}
			}
		}
	}

	.messageList {
		flex-grow: 1;
		padding: 5px;
		overflow-y: auto;
		overflow-x: none;
		display: flex;
		flex-direction: column;
	}

	.form {
		display: flex;
		flex-direction: column;
		border-top: 1px solid @mainColor_dark;
		* {
			margin: 10px;
			&:last-child {
				margin-top: 0;
			}
		}
	}
}
</style>