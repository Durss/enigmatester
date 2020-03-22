<template>
	<div class="elemtoconst">
		<div class="elementList element1">
			<div :data-selected="elem1 == 'water'" @click="elem1 = 'water'">
				<img src="@/assets/icons/elem_water.svg">
			</div>
			<div :data-selected="elem1 == 'fire'" @click="elem1 = 'fire'">
				<img src="@/assets/icons/elem_fire.svg">
			</div>
			<div :data-selected="elem1 == 'earth'" @click="elem1 = 'earth'">
				<img src="@/assets/icons/elem_earth.svg">
			</div>
			<div :data-selected="elem1 == 'air'" @click="elem1 = 'air'">
				<img src="@/assets/icons/elem_air.svg">
			</div>
		</div>
		<div class="arrow">→</div>
		<div class="elementList element2">
			<div :data-selected="elem2 == 'water'" @click="elem2 = 'water'">
				<img src="@/assets/icons/elem_water.svg">
			</div>
			<div :data-selected="elem2 == 'fire'" @click="elem2 = 'fire'">
				<img src="@/assets/icons/elem_fire.svg">
			</div>
			<div :data-selected="elem2 == 'earth'" @click="elem2 = 'earth'">
				<img src="@/assets/icons/elem_earth.svg">
			</div>
			<div :data-selected="elem2 == 'air'" @click="elem2 = 'air'">
				<img src="@/assets/icons/elem_air.svg">
			</div>
		</div>
		<div class="arrow">→</div>
		<select class="constellation" v-model="constellation">
			<option v-for="c in constList" :value="c" :key="c">{{c}}</option>
		</select>
		<Button title="Envoyer" class="submit" @click="submit()" />
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Config from '../../utils/Config';
import Button from '../Button.vue';
import SockController, { SOCK_ACTIONS } from '../../controller/SockController';
import { MESSAGE_TYPE } from '../../vo/ChatMessageData';

@Component({
	components:{
		Button
	}
})
export default class ElemToConst extends Vue {

	public elem1:string = "water";
	public elem2:string = "water";
	public constellation:string = "aquila";

	public get constList():string[] {
		return Config.CONSTELLATION_LIST.sort();
	}

	public mounted():void {
		
	}

	public beforeDestroy():void {
		
	}

	public submit():void {
		let data = {
			type:MESSAGE_TYPE.ELEMS_TO_CONST,
			elem1:this.elem1,
			elem2:this.elem2,
			constellation:this.constellation,
			from:this.$store.state.me.id,
		}
		SockController.instance.sendMessage({action:SOCK_ACTIONS.SEND_MESSAGE, includeSelf:true, data});
	}

}
</script>

<style scoped lang="less">
@import (reference) '../../less/_includes.less';
.elemtoconst{
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	justify-content: center;
	flex-wrap: wrap;
	.arrow {
		margin-top: 15px;
		margin-right: 10px;
	}
	.elementList {
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-right: 10px;
		div {
			width: 40px;
			height: 40px;
			padding: 5px;
			cursor: pointer;
			border-radius: 50%;
			// transition: transform .2s;
			background-color: white;
			&:hover {
				transform: scale(1.1);
				z-index: 1;
			}
			&[data-selected='true'] {
				background-color: @mainColor_highlight;
				width: 50px;
				height: 50px;
				img {
					filter: brightness(800%);
				}
			}
			img {
				// filter: saturate(800%);
			}
		}
	}
	.constellation {
		margin-top: 5px;
		text-transform: capitalize;
		option {
			text-transform: capitalize;
		}
	}

	.submit {
		width: 100%;
		margin-top: 20px;
		justify-self: center;
	}
}
</style>