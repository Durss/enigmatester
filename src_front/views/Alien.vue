<template>
	<div class="alien">
		<div class="stock" ref="stock">
			<AlienLetter v-for="v in numbers" :key="v" :value="v" class="letter" ref="number" />
		</div>

		<div class="target" ref="target">

		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import AlienLetter from '../components/AlienLetter.vue';
import { Draggable, TweenLite } from 'gsap/all';

@Component({
	components:{
		AlienLetter,
	}
})
export default class Alien extends Vue {

	public numbers:number[]= [0,1,2,3,4,5,6,7,8,9];

	public mounted():void {
		let target = <HTMLDivElement>this.$refs.target;
		
		for (let i = 0; i < (<Vue[]>this.$refs.number).length; i++) {
			const element = this.$refs.number[i];
			let d:Draggable = Draggable.create(element.$el, {type:"x,y",
				onDragEnd: (e)=> {
					if(d.hitTest(target)) {
						TweenLite.to(element.$el, {duration:1, x:0, y:target.offsetTop, ease:"elastic.out(1, .8)"});
					}else{
						TweenLite.to(element.$el, {duration:1, x:0, y:0, ease:"elastic.out(1, .8)"});
					}
				}
			})[0];
		}
	}

	public beforeDestroy():void {
		
	}

}
</script>

<style scoped lang="less">
.alien{
	.stock {
		display: block;
		margin: auto;
		width: 400px;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
	}

	.target {
		display: block;
		margin: auto;
		margin-top: 50px;
		width: 400px;
		height: 400px;
		border-radius: 50%;
		border: 1px solid #FFEEDA;
	}
}
</style>