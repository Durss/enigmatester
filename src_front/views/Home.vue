<template>
	<div class="home">
		<div class="header">
			<h1>Connexion</h1>
			<p class="infos">Set your name and choose a room name to join or create.</p>
		</div>

		<form class="form" @submit.prevent="onSubmitForm()">

			<div class="line">
				<transition name="fade">
					<label for="nameField" v-if="name.length > 0">Name</label>
				</transition>
				<input type="text" id="nameField" placeholder="name..." class="input dark" v-model="name" @keyup.esc="name=''" >
			</div>

			<div class="line">
				<transition name="fade">
					<label for="roomField" v-if="room.length > 0">Room</label>
				</transition>
				<input type="text" id="roomField" placeholder="room..." class="input dark" v-model="room" @keyup.esc="room=''">
			</div>

			<Button title="Start" type="submit" class="submit" :disabled="!room || room.length < 3 || !name || name.length < 3" :loading="loading" />

		</form>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Button from '../components/Button.vue';
import Api from '../utils/Api';

@Component({
	components: {
		Button
	}
})
export default class Home extends Vue {

	public name:string = "";
	public room:string = "";
	public loading:boolean = false;

	public mounted():void {
		
	}

	public beforeDestroy():void {
		
	}

	public async onSubmitForm():Promise<void> {
		this.loading = true;
		try {
			let res = await Api.post("room/join", {name:this.name, room:this.room});
			this.$store.dispatch("joinRoom", {room:res.room, me:res.me});
			this.$router.push({name:"play"});
		}catch(error) {
			this.$store.state.alert = error.message;
		}
		this.loading = false;
	}

}
</script>

<style scoped lang="less">
@import (reference) '../less/_includes.less';
.home{
	.form {
		text-align: center;
		display: flex;
		flex-direction: column;
		align-items: center;
		.line {
			margin-bottom: 10px;
			background-color: @mainColor_light;
			border-radius: 30px;
			label {
				width: 100px;
				overflow: hidden;
				display: inline-block;
				vertical-align: middle;
				&.fade-enter-active, &.fade-leave-active {
					transition: all .5s;
				}
				&.fade-enter, &.fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
					opacity: 0;
					width: 0px;
				}
			}
		}

		.submit {
			margin-top: 10px;
			display: block;
			margin: auto;
		}
	}
}
</style>