<template>
	<div class="currentgoal" v-if="enabled">
		<p class="title">Objectif</p>
		<img :src="require('@/assets/icons/elem_'+elem1+'.svg')" class="elem">
		<div class="arrows">
			<div class="arrowR">⟶</div>
			<div class="arrowL" v-if="arrowBackEnabled">⟵</div>
		</div>
		<img :src="require('@/assets/icons/elem_'+elem2+'.svg')" class="elem">
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Config from '../utils/Config';

@Component({
	components:{}
})
export default class CurrentGoal extends Vue {

	public get elem1():string{
		return Config.STEPS[this.$store.state.room.currentStepIndex].elements[0];
	}
	public get elem2():string{
		return Config.STEPS[this.$store.state.room.currentStepIndex].elements[1];
	}

	public get enabled():boolean {
		return this.$store.state.room.currentStepIndex < Config.STEPS.length;
	}

	public get arrowBackEnabled():boolean {
		return Config.STEPS[this.$store.state.room.currentStepIndex].targets[1] != null;
	}

	public mounted():void {
		
	}

	public beforeDestroy():void {
		
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.currentgoal{
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	color: white;
	padding: 5px;
	background-color: @mainColor_dark_light;

	.title {
		font-weight: bold;
		margin-right: 20px;
	}

	.arrows {
		margin: 0 10px;
	}

	.elem {
		width: 30px;
		height: 30px;
		background-color: white;
		border-radius: 50%;
		padding: 2px;
	}
}
</style>