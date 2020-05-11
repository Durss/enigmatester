<template>
	<div class="discstest">
		<div class="discs">
			<img :src="require('@/assets/discs/'+i+'.svg')" ref="disc" v-for="i in 4" :key="i">
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import gsap from 'gsap';
import { Draggable, InertiaPlugin } from 'gsap/all';

@Component({
	components:{}
})
export default class DiscsTest extends Vue {

	public mounted():void {
		let discs = <HTMLImageElement[]>this.$refs.disc;
		for (let i = 0; i < discs.length; i++) {
			gsap.set(discs[i], {rotation:Math.round(Math.random()*4)*90})
			Draggable.create(discs[i], {type:"rotation", resistance: 0.75, inertia:true, snap:(endValue) => {
				return Math.round(endValue / 90) * 90;
			}});
		}
	}

	public beforeDestroy():void {
		
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.discstest{
	.discs {
		position: relative;
		img {
			width: 205px;
			height: 205px;
			position: absolute;
			@offsetX: 163px;
			@offsetY: 130px;
			&:nth-child(2) {
				left: @offsetX;
			}
			&:nth-child(3) {
				top: @offsetY;
			}
			&:nth-child(4) {
				left: @offsetX;
				top: @offsetY;
			}
		}
	}
}
</style>