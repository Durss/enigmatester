<template>
	<div class="game">
		<div class="wait" v-if="!ready">
			<h1>{{$store.state.room.name}}</h1>
			<ul class="users">
				<li v-for="u in users" :key="u.id" class="user">
					<div class="index">
						{{u.index+1}}
						<!-- <img :src="require('@/assets/icons/elem_'+(ELEMENTS[u.index])+'.svg')" alt=""> -->
					</div>
					<div>{{u.name}}</div>
				</li>
			</ul>
			<p>En attente de joueurs.</p>
			<p>La partie commencera lorsque 3 joueurs seront dans la salle.</p>
			<img src="@/assets/loader/loader_white.svg" class="loader">
		</div>

		<div v-if="ready && !showGame">
			<Persona @complete="showGame = true;" />
		</div>

		<div class="content" v-if="ready && showGame">
			<Reticle @updateCenterPos="setReticlePos" />
			<Box3D :playerIndex="playerIndex" class="content" @updateCubeFace="updateCubeFace" />
			<FileSelector :playerIndex="playerIndex" class="content" />
			<ChatView class="chat" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Box3D from '../components/Box3D.vue';
import FileSelector from '../components/FileSelector.vue';
import UserData from '../vo/UserData';
import Reticle from '../components/Reticle.vue';
import ChatView from '../components/ChatView.vue';
import FormView from '../components/FormView.vue';
import Config from '../utils/Config';
import Persona from './Persona.vue';
import SockController, { SOCK_ACTIONS } from '../controller/SockController';
import Api from '../utils/Api';
import SocketEvent from '../vo/SocketEvent';

@Component({
	components:{
		Persona,
		Box3D,
		Reticle,
		ChatView,
		FileSelector,
	}
})
export default class Game extends Vue {

	public playerReady:boolean = false;
	public playerIndex:number = 0;
	public showGame:boolean = false;
	public reticleTarget:{x:number, y:number} = null;
	public faceIndex:number = 0;
	public readyStateDelay:number = 0;
	public nextStepHandler:any;

	public ELEMENTS:string[] = Config.ELEMENTS;

	public get ready():boolean {
		return this.$store.state.room.users.length == 3;
	}

	public get users():UserData[] {
		let users:UserData[] = this.$store.state.room.users.concat();
		users.sort((a,b)=> {
			if(a.index < b.index) return -1;
			if(a.index > b.index) return 1;
			return 0;
		})
		return users;
	}

	public mounted():void {
		this.playerIndex = (<UserData>this.$store.state.me).index;
		this.nextStepHandler = (e:SocketEvent) => this.onNextStep(e);
		// SockController.instance.addEventListener(SOCK_ACTIONS.NEXT_STEP, this.nextStepHandler);
	}

	public beforeDestroy():void {
		// SockController.instance.removeEventListener(SOCK_ACTIONS.NEXT_STEP, this.nextStepHandler);
	}

	public setReticlePos(pos:DOMRect):void {
		// console.log("Reticle pos : ", pos.x, pos.y);
		this.reticleTarget = pos;
		this.checkComplete();
	}

	public updateCubeFace(faceIndex:number):void {
		// console.log("Cube Face "+faceIndex)
		this.faceIndex = faceIndex;
		this.checkComplete();
	}

	private checkComplete():void {
		if(!this.reticleTarget) return;
		let step = Config.STEPS[this.$store.state.room.currentStepIndex];
		for (let i = 0; i < step.elements.length; i++) {
			const element = step.elements[i];
			if(step.elements[i] == Config.ELEMENTS[this.playerIndex]) {
				// console.log("My goal is index ", i)
				// console.log(step.angles[i]);
				// console.log(step.targets[i]);
				// console.log(step.faceIndex[i]);
				let retiCleDist = Math.sqrt(Math.pow(this.reticleTarget.x - step.targets[i].x,2) + Math.pow(this.reticleTarget.y - step.targets[i].y,2))
				let isReady = false;
				if(retiCleDist < 15 && this.faceIndex == step.faceIndex[i]) {
					//Reticle targeting appropriate place and cube properly oriented
					isReady = true;
				}
				this.sendReadyState(isReady)
			}
		}
	}

	private async sendReadyState(isReady:boolean, force:boolean = false):Promise<void> {
		clearTimeout(this.readyStateDelay);
		if(isReady && !force) {
			//Wait a second before sending a ready state so it's not too easy to find the right
			//reticle's spot by just dragging it over the box
			this.readyStateDelay = setTimeout(_=> this.sendReadyState(isReady, true), 1000);
			return;
		}
		
		if(this.playerReady == isReady) return;//State didn't change, ignore it

		this.playerReady = isReady;

		try {
			let res = await Api.post("user/ready", {state:isReady, uid:this.$store.state.me.id, room:this.$store.state.room.name});
			if(res.success) {
				//all good
				SockController.instance.sendMessage({action:SOCK_ACTIONS.USER_READY, includeSelf:true, data:{user:this.$store.state.me.id, ready:isReady}});
			}else{
				this.$store.state.alert = "Unable to update your current state :(<br />"+res.message;
			}
		}catch(error) {
			this.$store.state.alert = "Unable to update your current state :(";
		}
	}
	
	@Watch("$store.state.room.currentStepIndex")
	public onNextStep(e:SocketEvent):void {
		console.log("STEP CHANGE")
		this.showGame = false;
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.game{
	@chatSize:400px;
	.wait {
		position: absolute;
		.center();
		background-color: @mainColor_light;
		padding: 25px;
		border-radius: 20px;
		text-align: center;

		h1 {
			text-transform: capitalize;
		}

		.loader {
			margin-top: 20px;
		}

		.users {
			display: flex;
			flex-direction: row;
			flex-wrap: wrap;
			justify-content: center;
			margin-bottom: 20px;
			.user {
				font-size: 12px;
				padding: 5px 10px;
				padding-left: 0px;
				border-radius: 15px;
				background-color: @mainColor_warn;
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
					background-color: @mainColor_warn_light;
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

	.chat {
		width: @chatSize;
	}

	.content {
		width: calc(100% - @chatSize);
	}

}
</style>