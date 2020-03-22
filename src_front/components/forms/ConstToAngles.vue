<template>
	<div class="consttoangles">
		<select class="item list" v-model="constellation">
			<option v-for="c in constList" :value="c" :key="c">{{c}}</option>
		</select>
		<div class="arrow">→</div>
		<div class="item">
			<label for="va">A :</label>
			<input type="number" min="1" max="9" step="1" v-model="va" id="va">
		</div>
		<div class="spacer"></div>
		<div class="item">
			<label for="vb">B :</label>
			<input type="number" min="1" max="9" step="1" v-model="vb" id="vb">
		</div>
		<Button title="Envoyer" class="submit" @click="submit()" />
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Button from '../Button.vue';
import Config from '../../utils/Config';
import { MESSAGE_TYPE } from '../../vo/ChatMessageData';
import SockController, { SOCK_ACTIONS } from '../../controller/SockController';

@Component({
	components:{
		Button
	}
})
export default class ConstToAngles extends Vue {

	public constellation:string = "aquila";
	public va:number = 1;
	public vb:number = 1;

	public get constList():string[] {
		return Config.CONSTELLATION_LIST.sort();
	}

	public mounted():void {
		
	}

	public beforeDestroy():void {
		
	}

	public submit():void {
		let data = {
			type:MESSAGE_TYPE.CONST_TO_ANGLES,
			a:this.va,
			b:this.vb,
			constellation:this.constellation,
			from:this.$store.state.me.id,
		}
		SockController.instance.sendMessage({action:SOCK_ACTIONS.SEND_MESSAGE, includeSelf:true, data});
	}

}
</script>

<style scoped lang="less">
.consttoangles{
	
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	
	.arrow {
		margin-right: 10px;
	}

	.item {
		margin-right: 10px;

		label {
			font-weight: bold;
			font-family: "Futura";
			margin-right: 10px;
		}

		input {
			width: 60px;
		}
	}

	.list {
		text-transform: capitalize;
		height: 50px;
		border-radius: 50px;
		text-align: center;
		
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