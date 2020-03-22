<template>
	<div class="formview">
		<div class="dimmer" @click="$emit('close')"></div>
		<div class="form">
			<div class="menu" v-if="formIndex == -1">
				<div class="title">Select the kind of info you want to share</div>
				<button @click="formIndex = 0">
					<img src="@/assets/icons/element_to_constellation.svg"> Constellation
				</button>
				<button @click="formIndex = 1">Constellation → Star Name</button>
				<button @click="formIndex = 2">Constellation → A B</button>
			</div>

			<div v-if="formIndex != -1" class="content">
				<Button :icon="require('@/assets/icons/back.svg')" @click="formIndex = -1" class="back" />

				<div v-if="formIndex==0">
					Form 1
				</div>
				<div v-if="formIndex==1">
					Form 2
				</div>
				<div v-if="formIndex==2">
					Form 3
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Button from './Button.vue';

@Component({
	components:{
		Button
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
	position: absolute;
	top: 0;
	left: 0;
	z-index: 100;
	width: 100%;
	height: 100%;
	.dimmer {
		position: absolute;
		top: 0;
		left: 0;
		background-color: @mainColor_dark;
		width: 100%;
		height: 100%;
		opacity: .5;
	}

	.form {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: @mainColor_light;
		padding: 30px;

		.menu {
			display: flex;
			flex-direction: column;

			.title {
				font-weight: bold;
				font-size: 25px;
				margin-bottom: 20px;
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
	}

	.content {
		.back {
			position: absolute;
			top: 20px;
			left: 20px;
		}
	}
}
</style>