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
		chatMessages:[],
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
		
		async joinRoom(state, payload) {
			state.loggedin = true;
			state.me = payload.me;
			state.room = payload.room;
			//TODO enable this back
			// localStorage.setItem("me", JSON.stringify(state.me));
			// localStorage.setItem("room", JSON.stringify(state.room));
			SockController.instance.user = state.me;
			try {
				let res = await Api.get("room/messages", {room:payload.room.name});
				if(res.messages)
				if(res.success) {
					state.chatMessages = res.messages;
				}else{
					state.alert = "Unable to load chat messages<br />"+res.message;
				}
			}catch(error) {
				state.alert = "Unable to load chat messages";
			}
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
		},

		onChatMessage(state, payload) {
			state.chatMessages.push(payload);
			if(state.chatMessages.length > 100) state.chatMessages.shift();
		},

		onUserReadyStateChange(state, payload) {
			for (let i = 0; i < state.room.users.length; i++) {
				const u:UserData = state.room.users[i];
				if(u.id == payload.user) {
					u.currentStepDone = payload.ready;
				}
			}
		},

		onNextStep(state, payload) {
			let room = <RoomData>state.room;
			//Reset users state
			for (let i = 0; i < room.users.length; i++) {
				room.users[i].currentStepDone = false;
			}
			room.currentStepIndex ++;
		}

	},






	actions: {
		async startApp({ commit, state, dispatch }, payload) {
			//Security to make sure startApp isn't executed twice if changing URL while loading
			if (startPromise && payload.force !== true) return startPromise;
			
			state.initComplete = false;
				
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
						await Api.post("room/messages", {room:res.room.name});
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

		onChatMessage({commit}, payload) { commit("onChatMessage", payload); },

		onUserReadyStateChange({commit}, payload) { commit("onUserReadyStateChange", payload); },

		onNextStep({commit}, payload) { commit("onNextStep", payload); },
	}
})
