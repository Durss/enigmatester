<template>
	<div :class="classes" v-if="elementIcons">

		<div v-if="data.type==TYPE_ELEMS_TO_CONST" class="content">
			<img :src="elementIcons('./elem_'+data.elem1+'.svg')" class="icon">
			<div class="arrow">→</div>
			<img :src="elementIcons('./elem_'+data.elem2+'.svg')" class="icon">
			<div class="arrow">→</div>
			<div class="constellation">{{data.constellation}}</div>
		</div>

		<div v-if="data.type==TYPE_CONST_TO_STAR" class="content">
			<div class="constellation">{{data.constellation}}</div>
			<div class="arrow">→</div>
			<div class="star">{{data.star}}</div>
		</div>

		<div v-if="data.type==TYPE_CONST_TO_ANGLES" class="content">
			<div class="constellation">{{data.constellation}}</div>
			<div class="arrow">→</div>
			<div class="angle">
				<div class="label">A:</div>
				<div>{{round(data.a)}}</div>
			</div>
			<div class="angle">
				<div class="label">B:</div>
				<div>{{round(data.b)}}</div>
			</div>
		</div>

		<div v-if="data.type==TYPE_SPLITTER" class="content">
			<p class="label">Étape {{data.stepIndex}}</p>
			<div class="line"></div>
		</div>

		<div v-if="data.type==TYPE_HELP" class="content help">
			<p class="label">{{data.message}}</p>
		</div>

		<div class="userName" v-if="data.type!=TYPE_SPLITTER">{{userFrom.name}}</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import ChatMessageData, { MESSAGE_TYPE } from '../vo/ChatMessageData';

@Component({
	components:{}
})
export default class ChatMessage extends Vue {

	@Prop()
	public data:any;

	public elementIcons:__WebpackModuleApi.RequireContext = null;
	public TYPE_ELEMS_TO_CONST:string = MESSAGE_TYPE.ELEMS_TO_CONST;
	public TYPE_CONST_TO_STAR:string = MESSAGE_TYPE.CONST_TO_STAR;
	public TYPE_CONST_TO_ANGLES:string = MESSAGE_TYPE.CONST_TO_ANGLES;
	public TYPE_SPLITTER:string = MESSAGE_TYPE.SPLITTER;
	public TYPE_HELP:string = MESSAGE_TYPE.HELP;

	public get userFrom():string {
		let userList = this.$store.state.room.users;
		for (let i = 0; i < userList.length; i++) {
			if(userList[i].id == this.data.from) return userList[i];
		}
	}

	public get classes():string[] {
		let res = ["chatmessage"];
		if(this.data.type == MESSAGE_TYPE.SPLITTER) {
			res.push("splitter");
		}
		if(this.data.type == MESSAGE_TYPE.HELP) {
			res.push("help");
		}
		if(this.data.from == this.$store.state.me.id) {
			res.push("fromSelf");
		}
		return res;
	}

	public round(v):string {
		let res:number =  Math.round(parseInt(v));
		res = Math.min(Math.max(res, 1), 9);
		return res.toString();
	}

	public mounted():void {
		this.elementIcons = require.context("@/assets/icons");
	}

	public beforeDestroy():void {
		
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.chatmessage{

	background-color: @mainColor_warn_extralight;
	padding: 10px;
	border-radius: 25px;
	max-width: 75%;
	align-self: flex-end;
	position: relative;
	border-bottom-right-radius: 0;
	margin-bottom: 10px;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;

	&.help {
		background-color: @mainColor_light_extralight;
	}

	&.fromSelf {
		align-self: flex-start;
		border-bottom-left-radius: 0;
		border-bottom-right-radius: 25px;
		background-color: @mainColor_highlight_light;
		.userName {
			align-self: flex-start;
		}
	}

	&.splitter {
		background: none;
		width: 100%;
		padding: 0;
		max-width: 100%;
		border-radius: 0;
		background-color: none;
		position: relative;
		.content {
			justify-content: center;
			align-content: center;
			text-align: center;
			.line {
				height: 2px;
				width: 100%;
				position: absolute;
				background-color: @mainColor_normal;
			}
			.label {
				z-index: 1;
				padding: 5px;
				font-weight: bold;
				background-color: @mainColor_light;
			}
		}
	}

	.userName {
		align-self: flex-end;
		font-style: italic;
		opacity: .5;
		font-size: 14px;
		margin-top: 10px;
		text-transform: capitalize;
	}

	.content {
		display: flex;
		flex-direction: row;
		align-items: center;
		flex-wrap: wrap;

		.icon {
			width: 30px;
			padding: 5px;
			border-radius: 50%;
			background-color: white;
		}
		.arrow {
			font-weight: bold;
			margin: 5px;
		}
		.constellation {
			text-transform: capitalize;
			font-weight: bold;
			font-family: "Futura";
			font-size: 18px;
		}

		.angle {
			display: flex;
			flex-direction: row;
			font-family: "Futura";
			font-weight: bold;

			&:not(:last-child) {
				margin-right: 10px;
			}
		}

		.star {
			font-family: "SegoePrint";
			font-weight: bold;
		}
	}
}
</style>