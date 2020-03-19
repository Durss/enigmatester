<template>
	<div class="app">
		<router-view/>
		<Alert />
		<Tooltip />
	</div>
</template>

<script lang="ts">
import { Component, Inject, Model, Prop, Vue, Watch, Provide } from "vue-property-decorator";
import Tooltip from "./components/Tooltip.vue";
import Confirm from "./views/Confirm.vue";
import Alert from "./views/AlertView.vue";

@Component({
	components:{
		Alert,
		Tooltip,
		Confirm,
	}
})
export default class App extends Vue {

	public mounted():void {
		(<HTMLElement>this.$el).addEventListener("wheel", (e:MouseWheelEvent)=> {
			if(e.ctrlKey) e.preventDefault();
		})
	}

	public beforeDestroy():void {
		
	}

}
</script>

<style scoped lang="less">
.app{
	padding-top: 20px;
}
</style>