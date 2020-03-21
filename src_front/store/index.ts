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
			SockController.instance.user = state.me;
		},

		userJoined(state, payload) {
			console.log("User joined me ", payload.name)
			let room = state.room;
			for (let i = 0; i < room.users.length; i++) {
				const u:UserData = room.users[i];
				if(u.id == payload.id) return;
			}
			room.users.push(payload);
		},

		userLeft(state, payload) {
			console.log("User left ", payload.name)
			let room = state.room;
			for (let i = 0; i < room.users.length; i++) {
				const u:UserData = room.users[i];
				if(u.id == payload.id) {
					room.users.splice(i, 1);
				}
			}
		}

	},






	actions: {
		async startApp({ commit, state, dispatch }, payload) {
			//Security to make sure startApp isn't executed twice if changing URL while loading
			if (startPromise && payload.force !== true) return startPromise;
			
			state.initComplete = false;
				
			//From there we're sure the user has access wether because s-he's inside the
			//local network of the company or because s-he logged in.
			SockController.instance.connect();
			
			try {
				let me:any = localStorage.getItem("me");
				let room:any = localStorage.getItem("room");
				if(me && room) {
					me = JSON.parse(me);
					room = JSON.parse(room);
					let res = await Api.get("room/valid", {uid:(<UserData>me).id, name:(<RoomData>room).name});
					if(res.valid) {
						//Room exists and we're part of it, authenticate the user
						await Api.post("room/join", {uid:me.id, room:res.room.name});
						this.commit("joinRoom", {me, room:res.room});
					}
				}
			}catch(error) {
				//Data probably corrupted, clear it to avoid crash
				state.loggedin = false;
				state.me = null;
				state.room = null;
				localStorage.clear();
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

		userJoined({commit}, payload) { commit("userJoined", payload); },

		userLeft({commit}, payload) { commit("userLeft", payload); },
	}
})
