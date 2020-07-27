<template>
	<div :class="classes">
		<span class="hidden">{{letter}}</span>
		<span ref="tmp" class="tmp">{{letter.toUpperCase()}}</span>
		<span ref="good" class="good">{{letter}}</span>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import gsap from 'gsap';
import { RoughEase, random, SlowMo, SteppedEase } from 'gsap/all';

@Component({
	components:{}
})
export default class AlienMessageLetter extends Vue {

	@Prop()
	public value:string;
	@Prop()
	public delay:number;

	public letter:string = "";

	private offset:number = 0;
	private disposed:boolean = false;

	public get classes():string[] {
		let res = ["alienmessageletter"];
		if(this.value == "\n") res.push("break");
		return res;
	}

	public mounted():void {
		this.letter = this.value;
		let duration:number = 2;
		let delay = this.delay * .06;
		let conf = {template: "none.in", points:10, strength:2, clamp:false, randomize:true};
		gsap.set(this.$el, {opacity:0});
		gsap.to(this.$el, 0, {opacity:1, delay:delay});
		gsap.to(this.$refs["tmp"], duration, {opacity:0, ease:RoughEase.ease.config(conf), delay:delay, onStart:()=> {
			this.$emit("start");
		}});
		gsap.from(this.$refs["good"], duration, {opacity:0, ease:RoughEase.ease.config(conf), delay:delay, onComplete:()=> {
			this.$emit("complete");
		}});

		if(this.value == this.value.toUpperCase()) {
			//Do not cycle letters if it's not a latin one
			return;
		}

		let code = this.letter.charCodeAt(0);
		if((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
			//If it's a latin letter, cycle through other letters
			this.offset = Math.random() * 20;
			let d = Math.random() + 1;
			if(this.value == "z") console.log("::", d);
			gsap.to(this, d, {offset:0, ease:"steps("+this.offset*2+")", delay:delay, onUpdate:()=>this.loopLetters()});
		}
	}

	public beforeDestroy():void {
		this.disposed = true;
	}

	public loopLetters():void {
		let origin = this.value.toUpperCase() == this.value? 65 : 97;
		let letterCode = (this.value.charCodeAt(0) - origin + this.offset) % 25 + origin;
		this.letter = String.fromCharCode(Math.round(letterCode));
		// if(this.value == "z") console.log("TEST", this.letter);
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.alienmessageletter{
	display: inline;
	position: relative;
	.hidden {
		opacity: 0;
	}
	.tmp {
		position: absolute;
		transform: rotate(90deg);
		left: 0;
		top: 0;
	}
	.good {
		// transform: scale(.8, .8);
		// display: block;
		position: absolute;
		left: 0;
		top: 0;
	}

	&.break {
		display: block;
		height: 0px;
		&::before {
			content: "\A";
			white-space: pre;
		}
	}
	&.break + .break {
		height: auto;
	}
}
</style>