<template>
	<div class="currentgoal">
		<p class="title">Objectif</p>
		<img :src="require('@/assets/icons/elem_'+elem1+'.svg')" class="elem">
		<div class="arrow">⟷</div>
		<img :src="require('@/assets/icons/elem_'+elem2+'.svg')" class="elem">
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";

@Component({
	components:{}
})
export default class CurrentGoal extends Vue {

	public elem1:string = "fire";
	public elem2:string = "water";

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

	.arrow {
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