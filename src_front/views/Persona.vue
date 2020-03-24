<template>
	<div class="persona">
		<div class="dialogue" v-show="message" ref="dialogue">
			<div v-html="message" class="message"></div>
			<div class="tip"></div>
			<button v-if="pause" class="pause">suite &gt;</button>
		</div>
		<img src="@/assets/persona.png" ref="perso" class="perso">
		
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import UserData from '../vo/UserData';
import gsap from 'gsap';
import RoomData from '../vo/RoomData';
import Config from '../utils/Config';

@Component({
	components:{}
})
export default class Persona extends Vue {

	public message:string = "";
	
	private nextHandler:any;
	private pause:boolean = false;
	private complete:boolean = false;
	private disposed:boolean = false;
	private dialIndex:number = 0;
	private charIndex:number = 0;
	private frameStep:number = 1;
	private frameWait:number = 0;
	private frameIndex:number = 0;
	private dialogues:string[] = [
		`Bonjour {pseudo},
		J'ai grand besoin de ton aide et de celle de tes ami.e.s.`,
		
		`L'équilibre des 4 éléments est en péril, nous devons le rétablir à tout prix.`,
		
		`Chacun d'entre nous possède un élément. Vous possédez le ^feu¤, ^l'eau¤ et la ^terre¤. Je possède ^l'air¤.`,
		
		`Nous devons les lier entre eux puis les lier tous au 5ème élément à tout prix.`,
		
		`Commençons par les lier entre eux 2 à 2.
		Pour cela vous allez devoir utiliser un réticule articulé.`,
		
		`Placez ce réticule sur votre élément au bon endroit et en l'orientant correctement pour activer le pont de liaison.`,
		
		`Le pont de liaison doit être activé sur les deux éléments pour qu'ils soient liés.`,
		
		`Toutes les informations pour y parvenir ont été réparties entre vous trois dans des documents.
		A vous de trouver les informations utiles aux autres et à les leur partager.`,
		
		`Commençons par lier le feu et l'air.
		Je m'occupe d'activer mon pont de liaison vers le feu, faites en sorte que le feu se lie à moi.`,
		
		null,
		
		`Excellent travail !
		Vous avez compris comment procéder, maintenant passons à la seconde étape.
		Liez la ^terre¤ et l'^eau¤ entre eux.`,
		
		null,
		
		`Très bien !
		Lions maintenant l'^eau¤ à l'^air¤.
		Je m'occupe de me lier à l'eau, faites en sorte qu'il se lie à moi.`,
		
		null,
		
		`Parfait !
		Dernière étape, il ne vous reste qu'à lier le ^feu¤ à la ^terre¤.`,
		
		null,
		
		`Bravo !
		Les 4 éléments sont maintenant liés entre eux !
		Il ne reste qu'à tous les lier au 5ème élément pour accomplir notre mission`,

		`Allez c'est bon panique pas j'ai méga la flemme de coder cette logique.
		C'est donc terminé !`,
		
		`❤ Merslip pour le test bébé ❤`,
		`Arrête de cliquer c'est fini j'ai dit`,
		`...`,
		`😒`,
		`😒🖕`,
		`🖕😒🖕`,
		`😠`,
		`🖕🖕🖕😠🖕🖕🖕

		T'ARRÊTE J'AI DIT !`,
	]

	public mounted():void {
		
		gsap.from(this.$refs.perso, {duration:1, opacity:0, ease:"sine.easein", onComplete:_=> {
			let stepIndex = (<RoomData>this.$store.state.room).currentStepIndex;
			if(stepIndex > 0) {
				let nullCount = 0;
				for (let i = 0; i < this.dialogues.length; i++) {
					const d = this.dialogues[i];
					if(d == null) nullCount ++;
					if(nullCount == stepIndex) {
						this.dialIndex = i + 1;
						break;
					}
				}
			}
			this.charIndex = 0;
			// this.message = this.dialogues[this.dialIndex].replace(/\r|\n/gi, '<br />').replace(/\{pseudo\}/gi, this.$store.state.me.name);
			gsap.from(this.$refs.dialogue, {opacity:0, duration:1});
			this.enterFrame();
		}})

		this.nextHandler = (event:any) => this.onNext(event);
		(<HTMLDivElement>this.$refs.dialogue).addEventListener("mouseup", this.nextHandler);
		document.addEventListener("keyup", this.nextHandler);
		// this.enterFrame();
	}

	public beforeDestroy():void {
		this.disposed = true;
		(<HTMLDivElement>this.$refs.dialogue).removeEventListener("mouseup", this.nextHandler);
		document.removeEventListener("keyup", this.nextHandler);
	}

	private onNext(e:any):void {
		if(this.complete) return;

		if(e.keyCode == 27 && this.$store.state.room.currentStepIndex < Config.STEPS.length) {
			this.$emit("complete");
			return;
		}
		if(this.charIndex < this.dialogues[this.dialIndex].length * .2) return;
		this.dialIndex ++;
		this.charIndex = 0;
		
		if(this.dialIndex == this.dialogues.length || this.dialogues[this.dialIndex] == null) {
			this.pause = true;
			this.message = null;
			gsap.to(this.$refs.perso, {duration:1, opacity:0, ease:"sine.easein", onComplete:_=> {
				this.$emit("complete");
			}});
		}else{
			this.pause = false;
			this.enterFrame();
		}
	}

	private enterFrame():void {
		if(this.disposed || this.pause || this.complete) return;

		requestAnimationFrame(()=> this.enterFrame());
		
		if(++this.frameIndex%this.frameStep != 0) return;
		
		this.charIndex +=1;
		let mess = this.dialogues[this.dialIndex];
		mess = mess.replace(/\{pseudo\}/gi, this.$store.state.me.name);
		
		if(this.charIndex > mess.length) {
			if(this.dialIndex == this.dialogues.length-1) {
				this.complete = true;
			}else{
				this.pause = true;
			}
			return;
		}

		mess = mess.substring(0,this.charIndex);

		for (let i = 0; i < this.$store.state.room.users.length; i++) {
			const u:UserData = this.$store.state.room.users[i];
			mess = mess.replace(new RegExp("("+u.name+")", "gi"), "<strong>$1</strong>");
		}


		if(this.charIndex < this.dialogues[this.dialIndex].length-1) {
			let lastletter = mess.substr(mess.length-1, 1);
			mess = mess.substring(0, mess.length-1) + "<strong class='big'>"+lastletter+"</strong>";
		}
		mess = mess.replace(/\r|\n/gi, "<br/>");
		mess = mess.replace(/\^/gi, "<strong>");
		mess = mess.replace(/\¤/gi, "</strong>");

		this.message = mess;
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.persona {
	position: relative;
	width: 100vw;
	height: 100vh;
	z-index: 1000;

	.perso {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translate(-50%, 0);
	}

	.dialogue {
		position: absolute;
		background-color: @mainColor_light;
		padding: 20px;
		font-size: 25px;
		border-radius: 20px;
		bottom: 0;
		left: 50%;
		max-width: 450px;
		transform: translate(-50%, -500px);
		cursor: pointer;

		.message {
			position: relative;
			// max-width: 400px;
		}

		.tip {
			border-left: 10px solid transparent;
			border-right: 10px solid transparent;
			border-top: 22px solid @mainColor_light;
			bottom: -22px;
			position: absolute;
			width: 0;
			left:50%;
			transform: translate(-50%, 0);
		}

		.pause {
			position: absolute;
			right: 10px;
			bottom: 5px;
			padding: 0;
			background: transparent;
			color: @mainColor_normal;
			font-weight: normal;
			opacity: .75;
			font-family: "FuturaLight";
		}
	}
}
</style>
<style lang="less">
.persona {
	.dialogue {
		.message {
			.big {
				font-size: 35px;
				line-height: 18px;
			}
		}
	}
}
</style>