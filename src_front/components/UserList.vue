<template>
	<div class="userlist">
		<div v-for="user in users" :key="user.id" class="user">{{user.name}}</div>
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import UserData from '../vo/UserData';

@Component({
	components:{}
})
export default class UserList extends Vue {

	public get users():UserData[] {
		return this.$store.state.room.users;
	}

	public mounted():void {
		
	}

	public beforeDestroy():void {
		
	}

}
</script>

<style scoped lang="less">
.userlist{
	
}
</style>