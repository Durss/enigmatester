<template>
	<div :class="classes">
		<span ref="tmp">{{letter.toUpperCase()}}</span>
		<span ref="good" class="good">{{letter}}</span>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import gsap from 'gsap';
import { RoughEase, random } from 'gsap/all';

@Component({
	components:{}
})
export default class AlienMessageLetter extends Vue {

	@Prop()
	public value:string;

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
		gsap.to(this.$refs["tmp"], duration, {opacity:0, ease:RoughEase.ease.config({points:duration * 3, strength:duration * 2, clamp:true})});
		gsap.from(this.$refs["good"], duration, {opacity:0, ease:RoughEase.ease.config({points:duration * 3, strength:duration * 2, clamp:true}), onComplete:()=> {
			this.$emit("complete");
		}});

		if(this.value == this.value.toUpperCase()) {
			//Do not cycle letters if it's an alien one
			return;
		}

		let code = this.letter.charCodeAt(0);
		if((code >= 65 && code <= 90) || (code >= 97 && code <= 122)) {
			//If it's a latin letter, cycle through other letters
			this.offset = Math.random() * 10;
			gsap.to(this, duration, {offset:0, ease:RoughEase.ease.config({points:duration * 1, strength:duration, clamp:true})});
			this.loopLetters();
		}
	}

	public beforeDestroy():void {
		this.disposed = true;
	}

	public loopLetters():void {
		let origin = this.value.toUpperCase() == this.value? 65 : 97;
		let letterCode = (this.value.charCodeAt(0) - origin + this.offset) % 25 + origin;
		if(this.value==" ") console.log(this.value.charCodeAt(0))
		this.letter = String.fromCharCode(Math.round(letterCode));
		if(!this.disposed) {
			setTimeout(_=> this.loopLetters(), 35);
		}
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.alienmessageletter{
	display: inline;
	position: relative;
	span.good {
		// display: block;
		position: absolute;
		left: 0;
		top: 0;
	}

	&.break {
		display: block;
	}
}
</style>