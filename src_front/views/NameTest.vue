<template>
	<div class="nametest">
		<div v-if="isMobile">
			<div class="syllables">
				<AlienSymbol v-for="i in 9" :key="i" :value="i" isSlot="true" enabled="true" class="letter" @click.native="spell(i)" />
			</div>
			<RecorderButton ref="reccorderButton"
			@touchstart.native="startrecording($event)"
			@touchend.native="stoprecording($event)"
			:replayPercent="replayPercent"
			:recording="recording" />
		</div>
		<div v-if="!isMobile">
			<Button title="Start" class="start" big @click="startAmbient()" />
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import AlienSymbol from '../components/AlienSymbol.vue';
import RecorderButton from '../components/RecorderButton.vue';
import Recorder from '../utils/Recorder';
import Utils from '../utils/Utils';
import Button from '../components/Button.vue';

@Component({
	components:{
		Button,
		AlienSymbol,
		RecorderButton,
	}
})
export default class NameTest extends Vue {
	
	public sounds:__WebpackModuleApi.RequireContext = null;
	public clicks:number[] = [];
	public audios:HTMLAudioElement[] = [];
	public recording:boolean = false;
	public replayPercent:number = 1;

	private answerSound:HTMLAudioElement;
	private playingAudio:HTMLAudioElement;
	private stream:MediaStream;
	private audioRecorder:Recorder;
	private audioContext:AudioContext;
	private FFT_SIZE = 2048;
	private disposed = false;
	private audioInput:MediaStreamAudioSourceNode;
	private inputPoint:GainNode;
	private analyserNode:AnalyserNode;

	public get isMobile():boolean {
		return Utils.isMobile();
	}

	public startAmbient():void {
		let url = this.sounds("./answer_reverse.mp3");
		this.answerSound = new Audio(url);

		url = this.sounds("./ambient.mp3");
		let a = new Audio(url);
		a.loop = true;
		a.play();
		setTimeout(_=> this.playName(), 5000);
	}

	public playName():void {
		this.answerSound.play();
		setTimeout(_=> this.playName(), 5000);
	}

	public mounted():void {
		this.sounds = require.context("@/assets/sounds");
		let keys = this.sounds.keys();
		let spells = ["./chourlih.mp3","./chritah.mp3","./kri.mp3","./krovah.mp3","./lorkah.mp3","./orrlah.mp3","./rrah.mp3","./soumdorh.mp3","./tharki.mp3"];
		for (let i = 0; i < spells.length; i++) {
			const element = spells[i];
			let url = this.sounds(element);
			let a = new Audio(url);
			// a.load(url);
			this.audios.push(a);
		}
	}

	public beforeDestroy():void {
		this.disposed = true;
	}

	public spell(index:number):void {
		this.audios[index-1].play();
		this.clicks.push(index);
		if(this.clicks.length > 4) this.clicks.shift();
		if(this.clicks.join() == [7,3,6,2].join()) {
			for (let i = 0; i < 100; i++) {
				(<RecorderButton>this.$refs.reccorderButton).addData(Math.random());
			}
		}
	}

	public startrecording(e:TouchEvent):void {
		e.preventDefault();
		if(!this.audioContext) {
			this.initAudio();
		}else{
			this.recording = true;
			this.audioRecorder.start();
		}
	}

	public stoprecording(e):void {
		this.recording = false;
		this.audioRecorder.stop();
		this.saverecording();
	}

	public saverecording():void {
		this.audioRecorder.exportWAV((blob) => {
			let url = (window.URL || window.webkitURL).createObjectURL(blob);
			this.playingAudio = new Audio(url);
			// this.playingAudio.volume = 1;
			this.playingAudio.play();
			this.clearrecording();
		}, "audio/wav", true, true, 1);
	}

	private initAudio():void {
		if (!navigator.getUserMedia) {
			//@ts-ignore
			navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia ||navigator.mozGetUserMedia || navigator.msGetUserMedia;
		}

		let constraints:any = {
			"audio": {
				"mandatory": {
				},
				"optional": [
					{"googEchoCancellation": "false"},
					{"googAutoGainControl": "false"},
					{"googNoiseSuppression": "false"},
					{"googHighpassFilter": "false"}
				]
			},
		}
		// constraints = {audio:true, video:false};

		if(navigator.mediaDevices) {
			navigator.mediaDevices.getUserMedia(constraints)
			.then( stream => {
				this.stream = stream;
				this.onStreamReady();
				this.recording = true;
				this.audioRecorder.start();
			})
			.catch(error => {
				alert('Error capturing audio.');
			});
		} else if (!navigator.getUserMedia) {
			navigator.getUserMedia(constraints, 
			(stream) => {
				this.stream = stream;
				this.onStreamReady();
				this.recording = true;
				this.audioRecorder.start();
			},
			(e) => {
				alert('Error capturing audio.');
			});

		} else { alert('getUserMedia not supported in this browser.'); }
	}

	private onStreamReady() {
		
		this.initRecorder();
		this.onStreamData();
	}

	private initRecorder():void {
		//@ts-ignore
		let ac = window.AudioContext || window.webkitAudioContext;//Fuck you apple for still prefixing shits...
		this.audioContext = new ac();
		this.audioInput = this.audioContext.createMediaStreamSource(this.stream);
		this.inputPoint = this.audioContext.createGain();
		this.inputPoint.gain.value = 1;
		this.analyserNode = this.audioContext.createAnalyser();
		this.analyserNode.fftSize = this.FFT_SIZE;
		this.inputPoint.connect( this.analyserNode );
		this.audioInput.connect( this.inputPoint );
		this.audioRecorder = new Recorder( this.inputPoint );
	}

	public clearrecording():void {
		if(this.audioContext) {
			// this.history = [];
			this.audioContext.close().then(_=> {
				this.inputPoint.disconnect();
				this.audioInput.disconnect();
				this.audioRecorder.dispose();
				this.inputPoint = null;
				this.audioInput = null;
				this.audioContext = null;
				this.audioRecorder = null;

				//This is necessary to "free" the mic
				for (let i = 0; i < this.stream.getTracks().length; i++) {
					this.stream.getTracks()[i].stop();
				}
				this.stream = null;
			});
		}
	}

	private onStreamData():void {
		if(this.disposed) return;

		if(this.playingAudio && !this.recording) {
			let p = 1 - this.playingAudio.currentTime/this.playingAudio.duration;
			if(!isNaN(p)) {
				this.replayPercent = p;
			}
			if(p == 0) {
				this.playingAudio = null;
				(<RecorderButton>this.$refs.reccorderButton).reset();
				return;
			}
		}
		requestAnimationFrame(_=> this.onStreamData());
		
		if(!this.audioRecorder || !this.audioRecorder.isRecording) return;

        var freqByteData = new Uint8Array(this.analyserNode.frequencyBinCount);
		this.analyserNode.getByteTimeDomainData(freqByteData);
		let max = 0, size_buffer = freqByteData.length;
		for (let i = 0; i < freqByteData.length; i++) {
			max = Math.max(max, freqByteData[i]);
		}
		(<RecorderButton>this.$refs.reccorderButton).addData(max/128 - 1);
	}


}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.nametest{
	h1 {
		color: @mainColor_skin;
		margin-bottom: 20px;
		margin-top: 20px;
	}
	.syllables {
		justify-content: center;
		display: flex;
		flex-direction: row;
		flex-wrap: wrap;
		width: 210px;
		margin: auto;
		margin-top: 50px;
		.letter {
			width: 60px;
			height: 60px;
			margin: 5px;
			padding: 5px;
		}
	}

	.start {
		position: absolute;
		.center();
	}
}
</style>