import Vue from 'vue';
import Vuex from 'vuex';
import SockController from '@/controller/SockController';
import RoomData from '@/vo/RoomData';
import Api from '@/utils/Api';
import UserData from '@/vo/UserData';
import router from '@/router';

Vue.use(Vuex)

let startPromise: Promise<any>;

export default new Vuex.Store({
	state: {
		initComplete: false,
		loggedin:false,
		tooltip: null,
		alert: null,
		me:null,
		room:null,
		confirm:{
		  title:null,
		  description:null,
		  confirmCallback:null,
		  cancelCallback:null,
		},
	},






	mutations: {

		initComplete(state) { state.initComplete = true; },

		openTooltip(state, payload) { state.tooltip = payload; },
		
		closeTooltip(state) { state.tooltip = null; },

		confirm(state, payload) { state.confirm = payload; },
		
		joinRoom(state, payload) {
			state.loggedin = true;
			state.me = payload.me;
			state.room = payload.room;
			localStorage.setItem("me", JSON.stringify(state.me));
			localStorage.setItem("room", JSON.stringify(state.room));
		},

	},






	actions: {
		async startApp({ commit, state, dispatch }, payload) {
			//Security to make sure startApp isn't executed twice if changing URL while loading
			if (startPromise && payload.force !== true) return startPromise;
			
			state.initComplete = false;
				
			//From there we're sure the user has access wether because s-he's inside the
			//local network of the company or because s-he logged in.
			SockController.instance.connect();
			
			let me:any = localStorage.getItem("me");
			let room:any = localStorage.getItem("room");
			if(me && room) {
				me = JSON.parse(me);
				room = JSON.parse(room);
				let res = await Api.get("room/valid", {uid:(<UserData>me).id, name:(<RoomData>room).name});
				if(res.valid) {
					//Room exists and we're part of it, authenticate the user
					this.commit("joinRoom", {me, room});
				}
			}

			startPromise = new Promise(async (resolve, reject) => {
				commit("initComplete", true);
				resolve();
			});

			return startPromise;
		},

		openTooltip({commit}, payload) { commit("openTooltip", payload); },
		
		closeTooltip({commit}) { commit("closeTooltip", null); },

		confirm({commit}, payload) { commit("confirm", payload); },

		joinRoom({commit}, payload) { commit("joinRoom", payload); },
	}
})
