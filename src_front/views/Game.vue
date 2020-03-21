<template>
	<div class="game">
		<div class="header">
			<h1>{{$store.state.room.name}}</h1>
		</div>
		<UserList />
		<Reticle />
		<Box3D :playerIndex="playerIndex" />
		<FileSelector :playerIndex="playerIndex" />
		<ChatView />
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

@Component({
	components:{
		Box3D,
		Reticle,
		UserList,
		ChatView,
		FileSelector,
	}
})
export default class Game extends Vue {

	public playerIndex:number = 0;

	public mounted():void {
		this.playerIndex = (<UserData>this.$store.state.me).index;
	}

	public beforeDestroy():void {
		
	}

}
</script>

<style scoped lang="less">
.game{
	.header {
		position: absolute;
		z-index: 1;
	}
	
}
</style>