<template>
	<div class="game">
		<div class="header">
			<h1>{{$store.state.room.name}}</h1>
		</div>
		<UserList />
		<Box3D />
		<ConstellationSelector />
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import UserList from '../components/UserList.vue';
import Box3D from '../components/Box3D.vue';
import ConstellationSelector from '../components/ConstellationSelector.vue';

@Component({
	components:{
		Box3D,
		UserList,
		ConstellationSelector,
	}
})
export default class Game extends Vue {

	public mounted():void {
		
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