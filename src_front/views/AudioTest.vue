<template>
	<div class="audiotest">
		<canvas ref="render" class="canvas"></canvas>
		<div class="reverse" @click="reverse = !reverse">
			<Button type="checkbox" v-model="reverse" id="reverse" />
			<label for="reverse">Reverse</label>
		</div>
		<Button @click="startRecording" title="🔴" v-if="!recording" />
		<Button @click="stopRecording" title="⬜" v-if="recording" />
		<!-- <Button @click="saveRecording" title="SAVE" />
		<Button @click="clearRecording" title="CLEAR" />
		<Button @click="getBuffers" title="GET BUFFERS" /> -->
		<audio :src="audioBlob" v-if="audioBlob" controls autoplay></audio>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Button from '../components/Button.vue';
import Recorder from '../utils/Recorder';
// import MediaRecorder from "dom-mediacapture-record";

@Component({
	components:{
		Button,
	}
})

export default class AudioTest extends Vue {

	public audioBlob:string = null;
	public canvas:HTMLCanvasElement = null;
	public history:number[] = [];
	public ctx2D:CanvasRenderingContext2D = null;
	public canvasDrawIndex:number = 0;
	public canvasScrollIndex:number = 0;
	public reverse:boolean = false;
	public recording:boolean = false;

	private stream:MediaStream;
	private audioRecorder:Recorder;
	private audioContext:AudioContext;
	private FFT_SIZE = 2048;
	private disposed = false;
	private audioInput:MediaStreamAudioSourceNode;
	private inputPoint:GainNode;
	private analyserNode:AnalyserNode;


	public mounted():void {
		this.canvas = <HTMLCanvasElement>this.$refs.render;
		let bounds = this.canvas.getBoundingClientRect();
		this.canvas.width = bounds.width;
		this.canvas.height = bounds.height;
		this.ctx2D = this.canvas.getContext("2d");
	}

	public beforeDestroy():void {
		this.clearRecording();
		this.disposed = true;
	}

	public startRecording():void {
		if(!this.audioContext) {
			this.initAudio();
		}else{
			this.recording = true;
			this.audioRecorder.start();
		}
	}

	public stopRecording():void {
		this.recording = false;
		this.audioRecorder.stop();
		this.saveRecording();
	}

	public saveRecording():void {
		this.audioRecorder.exportWAV((blob) => {
			let url = (window.URL || window.webkitURL).createObjectURL(blob);
			this.audioBlob = url;
			// let audio = new Audio(url);
			// audio.play();
			this.clearRecording();
		}, "audio/wav", true, this.reverse, 1);
	}

	public getBuffers():void {
		this.audioRecorder.getBuffers((blob) => {
			console.log("get buffers COMPLETE !");
			console.log(blob);
		});
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
		this.doRender();
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

	public clearRecording():void {
		if(this.audioContext) {
			this.history = [];
			this.audioContext.close().then(_=> {
				// this.inputPoint.disconnect( this.analyserNode );
				// this.audioInput.disconnect( this.inputPoint );
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

	private doRender():void {
		if(this.disposed) return;

		requestAnimationFrame(_=> this.doRender());
		
		if(!this.audioRecorder || !this.audioRecorder.isRecording) return;

        var freqByteData = new Uint8Array(this.analyserNode.frequencyBinCount);
		this.analyserNode.getByteTimeDomainData(freqByteData);
		let max = 0, size_buffer = freqByteData.length;
		for (let i = 0; i < freqByteData.length; i++) {
			max = Math.max(max, freqByteData[i]);
		}
		this.history.push(max/128 - 1);
		if(this.history.length > this.canvas.width) this.history.shift();

		this.ctx2D.clearRect(0,0,this.canvas.width,this.canvas.height);

		for (let i = 0; i < this.history.length; i++) {
			const v = Math.max(1,this.history[i] * 150);
			this.ctx2D.beginPath();
			this.ctx2D.moveTo(i, Math.round(150/2 - v/2));
			this.ctx2D.strokeStyle = "#0f0";
			this.ctx2D.lineTo(i, Math.round(150/2 + v/2));
			this.ctx2D.closePath();
			this.ctx2D.stroke();
		}
	}
}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.audiotest{
	padding: 20px;
	display: flex;
	flex-direction: column;
	align-items: center;
	.canvas {
		background-color: @mainColor_normal;
		width: 600px;
		max-width: 90vw;
		height: 150px;
		margin-bottom: 15px;
	}

	.reverse {
		display: flex;
		flex-direction: row;
		align-items: center;
		margin-bottom: 10px;
		background-color: @mainColor_light;
		padding: 5px;
		border-radius: 7px;
		cursor: pointer;
		*> {
			pointer-events: none;
		}
		label {
			margin-left: 10px;
			margin-bottom: 0;
		}
	}
}
</style>