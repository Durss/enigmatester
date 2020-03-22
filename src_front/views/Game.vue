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

		<div class="content" v-if="showGame">
			<UserList />
			<Reticle />
			<Box3D :playerIndex="playerIndex" class="content" />
			<FileSelector :playerIndex="playerIndex" class="content" />
			<ChatView class="chat" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import UserList from '../components/UserList.vue';
import Box3D from '../components/Box3D.vue';
import FileSelector from '../components/FileSelector.vue';
import UserData from '../vo/UserData';
import Reticle from '../components/Reticle.vue';
import ChatView from '../components/ChatView.vue';
import FormView from '../components/FormView.vue';
import Config from '../utils/Config';
import Persona from './Persona.vue';

@Component({
	components:{
		Persona,
		Box3D,
		Reticle,
		UserList,
		ChatView,
		FileSelector,
	}
})
export default class Game extends Vue {

	public playerIndex:number = 0;
	public showGame:boolean = false;

	public ELEMENTS:string[] = Config.ELEMENTS;

	public get ready():boolean {
		return this.$store.state.room.users.length == 3;
	}

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
		this.playerIndex = (<UserData>this.$store.state.me).index;
	}

	public beforeDestroy():void {
		
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