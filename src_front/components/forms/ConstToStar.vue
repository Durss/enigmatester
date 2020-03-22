<template>
	<div class="consttostar">
		<select class="list" v-model="constellation">
			<option v-for="c in constList" :value="c" :key="c">{{c}}</option>
		</select>
		<div class="arrow">→</div>
		<select class="list star" v-model="star">
			<option v-for="c in starList" :value="c" :key="c">{{c}}</option>
		</select>
		<Button title="Envoyer" class="submit" @click="submit()" />
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Config from '../../utils/Config';
import Button from '../Button.vue';
import { MESSAGE_TYPE } from '../../vo/ChatMessageData';
import SockController, { SOCK_ACTIONS } from '../../controller/SockController';

@Component({
	components:{
		Button,
	}
})
export default class ConstToStar extends Vue {

	public constellation:string = "aquila";
	public star:string = "α";

	public get constList():string[] {
		return Config.CONSTELLATION_LIST.sort();
	}

	public get starList():string[] {
		return Config.STAR_NAME_LIST;//.sort();
	}

	public mounted():void {
		
	}

	public beforeDestroy():void {
		
	}

	public submit():void {
		let data = {
			type:MESSAGE_TYPE.CONST_TO_STAR,
			star:this.star,
			constellation:this.constellation,
			from:this.$store.state.me.id,
		}
		SockController.instance.sendMessage({action:SOCK_ACTIONS.SEND_MESSAGE, includeSelf:true, data});
	}

}
</script>

<style scoped lang="less">
.consttostar{
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	flex-wrap: wrap;
	
	.arrow {
		margin-right: 10px;
	}

	.list {
		margin-right: 10px;
		text-transform: capitalize;
		height: 50px;
		border-radius: 50px;
		text-align: center;
		option {
			text-transform: capitalize;
		}

		&.star {
			font-family: "SegoePrint";
			text-transform: lowercase;
			vertical-align: text-top;
			option {
				text-transform: lowercase;
			}
		}
	}

	.submit {
		width: 100%;
		margin-top: 20px;
		justify-self: center;
	}
}
</style>