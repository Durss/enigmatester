<template>
	<div class="alien">
		<div class="stock" ref="stock">
			<AlienLetter v-for="v in numbers" :key="v" :value="v" class="letter" ref="number" />
		</div>

		<div class="target" ref="target">
			<div class="slot" ref="slot1" @click="clearSlot(1)">
				<AlienLetter :value="n1" class="letter" isSlot="true" ref="slotLetter1" />
			</div>
			<div class="slot" ref="slot2" @click="clearSlot(2)">
				<AlienLetter :value="n2" class="letter" isSlot="true" ref="slotLetter2" />
			</div>
			<div class="slot" ref="slot3" @click="clearSlot(3)" v-show="step > 0">
				<AlienLetter :value="n3" class="letter" isSlot="true" ref="slotLetter3" />
			</div>
		</div>

		<div class="result" ref="result">
			<AlienLetter v-for="v in result" :key="v+rand" isSlot="true" :value="v" class="letter" />
		</div>

		<div class="congrats" v-if="complete">🥳 CHAMPION 🥳</div>

		<div class="objective" ref="objective">
			<AlienLetter v-for="v in objective" :key="v+rand" isSlot="true" :value="v" color="" class="letter" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import AlienLetter from '../components/AlienLetter.vue';
import gsap, { Draggable, TweenLite } from 'gsap/all';

@Component({
	components:{
		AlienLetter,
	}
})
export default class Alien extends Vue {

	public objective:number[]= [1,6];
	public numbers:number[]= [0,1,2,3,4,5,6,7,8,9];
	public n1:number|null = null;
	public n2:number|null = null;
	public n3:number|null = null;
	public step:number = 0;
	public complete:boolean = false

	public get rand():number { return Math.random(); }

	public get result():number[] {
		if(this.n1==null && this.n2==null && this.n3==null) return [];
		
		let v = (this.n1 + this.n2) * (this.n3 || 1);
		let chunks = v.toString().split("");
		let res = [];
		for (let i = 0; i < chunks.length; i++) {
			res.push(parseInt(chunks[i]));
		}
		return res;
	}

	public mounted():void {
		let slot1 = <HTMLDivElement>this.$refs.slot1;
		let slot2 = <HTMLDivElement>this.$refs.slot2;
		let slot3 = <HTMLDivElement>this.$refs.slot3;
		
		for (let i = 0; i < (<Vue[]>this.$refs.number).length; i++) {
			const element = this.$refs.number[i];
			let d:Draggable = Draggable.create(element.$el, {type:"x,y",
				onDragEnd: (e)=> {
					let hits:boolean = false;
					if(d.hitTest(slot1, "50%")) {
						hits = true;
						this.n1 = (<AlienLetter>element).value;
						this.checkComplete();
					}else if(d.hitTest(slot2, "50%")) {
						hits = true;
						this.n2 = (<AlienLetter>element).value;
						this.checkComplete();
					}else if(slot3 && d.hitTest(slot3, "50%")) {
						hits = true;
						this.n3 = (<AlienLetter>element).value;
						this.checkComplete();
					}
					if(hits) {
						gsap.set(element.$el, {scale:0, x:0, y:0});
						gsap.to(element.$el, {duration:1, scale:1, ease:"elastic.out(1, .4)"});
					}else{
						gsap.to(element.$el, {duration:1, x:0, y:0, ease:"elastic.out(1, .4)"});
					}
				}
			})[0];
		}
	}

	public beforeDestroy():void {
		
	}

	private checkComplete():void {
		if(this.result[0] == this.objective[0] && this.result[1] == this.objective[1] && this.step == 0) {
			let targets = [this.$refs.target, this.$refs.result, this.$refs.objective];
			gsap.to(targets, {opacity:0, duration:1, onComplete:_=>{
				this.step ++;
				this.objective = [1,2,8];
				this.n1 = null;
				this.n2 = null;
				gsap.to(targets, {opacity:1, duration:1, delay:.25});
			}});
		}else
		if(this.result[0] == this.objective[0] && this.result[1] == this.objective[1] && this.result[2] == this.objective[2] && this.step == 1) {
			this.complete = true;
		}
	}

	public clearSlot(v):void {
		switch(v) {
			case 1:
				this.n1 = null;
				break;
			case 2:
				this.n2 = null;
				break;
			case 3:
				this.n3 = null;
				break;
		}
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.alien{
	padding: 10px;
	box-sizing: border-box;
	max-width: 500px;
	widows: 100%;
	margin: auto;
	.stock {
		display: block;
		margin: auto;
		margin-bottom: 20px;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		justify-content: center;
		.letter {
			width: 85px;
			height: 85px;
			margin: 5px;
		}
	}

	.target {
		display: flex;
		flex-direction: row;
		margin: auto;
		justify-content: center;
		-webkit-tap-highlight-color: transparent;

		.slot {
			margin: 0 5px;
			width: 104px;
			height: 112px;
			background-image: url("../assets/numbers/slot.svg");

			.letter {
				border: none;
				width: 100%;
				height: 90%;
				/deep/ svg {
					opacity: .75;
				}
			}
		}
	}

	.congrats {
		font-weight: bold;
		background-color: @mainColor_highlight;
		color: white;
		padding: 10px;
		text-align: center;
		border-radius: 100px;
		margin-bottom: 10px;
	}

	.result, .objective {
		display: flex;
		flex-direction: row;
		margin: auto;
		justify-content: center;
		-webkit-tap-highlight-color: transparent;
		background-color: @mainColor_warn;
		border-radius: 100px;
		margin-bottom: 10px;
		height: 110px;
		&.result {
			background-color: #FFEEDA;
		}
		&.objective {
			.letter {
				::v-deep svg {
					fill: @mainColor_warn;
				}
			}
		}

		.letter {
			border: none;
			margin: 5px;
			width: 100px;
			height: 100px;
			background-color: black;
			border-radius: 50%;
		}
	}
}
@media only screen and (max-width: 500px) {
	.alien{	
		@ratio: .7;
		
		.stock {
			margin-bottom: 20px;
			.letter {
				width: 65px;
				height: 65px;
				margin: 5px;
			}
		}

		.target {
			.slot {
				margin: 0 5px;
				width: calc(104px * @ratio);
				height: calc(112px * @ratio);
			}
		}

		.congrats {
			font-weight: bold;
			background-color: @mainColor_highlight;
			color: white;
			padding: 10px;
			text-align: center;
			border-radius: calc(100px * @ratio);
			margin-bottom: 10px;
		}

		.result, .objective {
			height: calc(110px * @ratio);
			.letter {
				border: none;
				margin: 5px;
				width: calc(100px * @ratio);
				height: calc(100px * @ratio);
				background-color: black;
				border-radius: 50%;
			}
		}
	}

}
</style>