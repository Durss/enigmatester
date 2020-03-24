<template>
	<div class="formview">
		<Button :icon="require('@/assets/icons/cross_white.svg')" @click="$emit('close')" class="back" />

		<div class="menu" v-if="formIndex == -1">
			<div class="title">Choisis le type d'information à partager</div>
			<button @click="formIndex = 0">
				<img src="@/assets/icons/element_to_constellation.svg"> Constellation
			</button>
			<button @click="formIndex = 1">Constellation → Étoile</button>
			<button @click="formIndex = 2">Constellation → A B</button>
		</div>

		<div v-if="formIndex != -1" class="content">
			<div v-if="formIndex==0">
				<ElemToConst />
			</div>
			<div v-if="formIndex==1">
				<ConstToStar />
			</div>
			<div v-if="formIndex==2">
				<ConstToAngles />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Button from './Button.vue';
import ElemToConst from './forms/ElemToConst.vue';
import ConstToStar from './forms/ConstToStar.vue';
import ConstToAngles from './forms/ConstToAngles.vue';

@Component({
	components:{
		Button,
		ElemToConst,
		ConstToStar,
		ConstToAngles,
	}
})
export default class FormView extends Vue {

	private formIndex:number = -1;

	public mounted():void {
		
	}

	public beforeDestroy():void {
		
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.formview{
	position: relative;
	z-index: 100;
	width: 100%;
	background-color: @mainColor_light_light;
	width: 100%;
	padding: 10px;
	box-sizing: border-box;

	.menu {
		display: flex;
		flex-direction: column;

		.title {
			font-weight: bold;
			font-size: 20px;
			text-align: center;
		}

		button {
			display: flex;
			align-items: center;
			flex-direction: row;
			justify-content: center;
			border-radius: 30px;
			margin-top: 10px;

			img {
				height: 30px;
				margin-right: 10px;
			}
		}
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