import * as sockjs from "sockjs";
import {Connection, ServerOptions} from "sockjs";
import Logger, { LogStyle } from "../utils/Logger";
import UserData from "../vo/UserData";
import Config from "../utils/Config";
/**
 * Created by FDursus on 28/03/2019
 */

export default class SocketServer {

	public onDeleteUser:Function;
	public onMessage:Function;

	private static _instance: SocketServer;
	private _DISABLED: boolean = false;
	private _sockjs: any;
	private _connections:Connection[];
	private _connectionToUid:{ [id: string] : string; };
	private _uidToConnection:{ [id: string] : Connection; };
	private _groupIdToUsers:{[id:string]:UserData[]} = {};
	private _userIdToGroupId:{[id:string]:string} = {};

	constructor() {
		this.initialize();
	}

	/********************
	 * GETTER / SETTERS *
	 ********************/
	static get instance(): SocketServer {
		if (!SocketServer._instance) SocketServer._instance = new SocketServer();
		return SocketServer._instance;
	}


	/******************
	 * PUBLIC METHODS *
	 ******************/

	public connect() {
		if(this._DISABLED) return;
		this._sockjs = sockjs.createServer({log: (severity, message)=> {
			if(severity == "debug") {
				Logger.success(message+" on port "+Config.SOCKET_SERVER_PORT);
				return;
			}
		}});
		this._sockjs.on("connection", (conn:Connection)=> this.onConnect(conn));
	}

	/**
	 * Broadcast a message to all pears
	 * @param msg
	 */
	public broadcast(msg:{action:string, data?:any}, exceptUsers?:UserData[]) {
		if(this._DISABLED) return;
		let exceptUids:string[] = exceptUsers? exceptUsers.map((v)=> v.id.toString()) : [];
		// Logger.info("BROADCAST to "+this._connections.length+" users : ", msg.action);
		for (let i = 0; i < this._connections.length; ++i) {
			let allow = true;
			if(exceptUids && exceptUids.length > 0)  {
				for (let k = 0; k < exceptUids.length; k++) {
					const uid = exceptUids[k];
					if(!this._uidToConnection[uid]) continue;
					if(this._uidToConnection[uid] == this._connections[i]) {
						allow = false;
					}
				}
			}
			if(allow) {
				this._connections[i].write(JSON.stringify(msg));
			}
		}
	}

	/**
	 * Sends a message to one specific user
	 */
	public sendTo(user:UserData, msg:{action:string, data?:any}):void {
		let conn = this._uidToConnection[user.id.toString()];
		// console.log("send to ", user.name);
		if(!conn) return;
		conn.write(JSON.stringify(msg));
	}

	/**
	 * Sends a message to a specific users list
	 */
	public sendToUserList(users:UserData[], msg:{action:string, data?:any}):void {
		for (let i = 0; i < users.length; i++) {
			this.sendTo(users[0], msg);
		}
	}

	/**
	 * Connects express to socket
	 * @param server
	 * @param scope
	 */
	public installHandler(server, scope : ServerOptions) {
		if(this._DISABLED) return;
		this.connect();
		this._sockjs.installHandlers(server, scope);
	}

	/**
	 * Updates a users' group
	 */
	public addToGroup(id:string, user:UserData):void {
		// console.log("Add user "+user.name+" to group "+id);
		if(!this._groupIdToUsers[id]) {
			this._groupIdToUsers[id] = [];
		}
		this._groupIdToUsers[id].push(user);
		let users = this._groupIdToUsers[id];
		for (let i = 0; i < users.length; i++) {
			this._userIdToGroupId[users[i].id] = id;
		}
	}

	/**
	 * Sends a message to a specific users group
	 */
	public sendToGroup(groupId:string, msg:{action:string, data?:any}, exceptUserID?:string):void {
		Logger.info("Send to group ", groupId, msg.action);
		let users = this._groupIdToUsers[groupId];
		if(!users) return;
		for (let i = 0; i < users.length; i++) {
			if(exceptUserID && users[i].id == exceptUserID) continue;
			this.sendTo(users[i], msg);
		}
	}


	/*******************
	 * PRIVATE METHODS *
	 *******************/
	/**
	 * Initializes the class
	 */
	private initialize(): void {
		if(this._DISABLED) return;
		this._connections = [];
		this._uidToConnection = {};
		this._connectionToUid = {};
	}

	private onConnect(conn:Connection):void {
		if(this._DISABLED) return;
		this._connections.push(conn);

		// Logger.info("Socket connexion opened : "+LogStyle.Reset+conn.id);
		conn.on("data", (message) => {
			let json:{action:string, data:any, includeSelf?:boolean, from?:string} = JSON.parse(message);
			if(json.action == SOCK_ACTIONS.PING) {
				//Don't care, just sent to check if connection's style alive
				return;
			}else if(json.action == SOCK_ACTIONS.DEFINE_UID) {
				this._uidToConnection[json.data.id] = conn;
				this._connectionToUid[conn.id] = json.data.id;
				return;
			}else{
				if(this._DISABLED) return;
				Logger.info("Socket message : "+LogStyle.Reset+json.action);
				let uid = this._connectionToUid[ conn.id ];
				let group = this._userIdToGroupId[ uid ];
				if(uid && group) {
					Logger.simpleLog("uid:"+uid+"    group:"+group);
					let exclude = uid;
					if(json.includeSelf === true) exclude = null;
					json.from = uid;
					this.sendToGroup(group, json, exclude);
				}
				if(json.action == SOCK_ACTIONS.LEAVE_ROOM) {
					Logger.simpleLog("Force socket close");
					this.onClose(conn);
					this.removeUserFromGroup(uid);
				}
				if(json.action == SOCK_ACTIONS.SEND_MESSAGE) {
					if(this.onMessage) this.onMessage(group, json.data);
				}
				// this.broadcast(json);
			}
		});
		conn.on("close", (p) => {
			this.onClose(conn);
			let uid = this._connectionToUid[ conn.id ];
			if(uid) {
				this.removeUserFromGroup(uid);
			}
		});
	}

	private onClose(conn:Connection):void {
		if(this._DISABLED) return;
		conn.close();
		// Logger.info("Socket connexion closed : "+LogStyle.Reset+conn.id);
		//Cleanup user's connection from memory
		let idx = this._connections.indexOf(conn);
		if(idx) {
			delete this._connectionToUid[conn.id];
			this._connections.splice(idx, 1);
		}
	}

	private removeUserFromGroup(uid:string):void {
		delete this._uidToConnection[uid];
		let groupId = this._userIdToGroupId[uid];
		let users = this._groupIdToUsers[groupId];
		if(users) {
			let user:UserData;
			for (let i = 0; i < users.length; i++) {
				if(users[i].id == uid) {
					user = users[i]
					users.splice(i, 1);
					this.onDeleteUser(groupId, user);
				}
			}
			if(user) {
				this.sendToGroup(this._userIdToGroupId[uid], {action:SOCK_ACTIONS.LEAVE_ROOM, data:user}, user.id);
			}
		}
	}
	}
}

export enum SOCK_ACTIONS {
	PING="PING",
	DEFINE_UID="DEFINE_UID",
	JOIN_ROOM="JOIN_ROOM",
	LEAVE_ROOM="LEAVE_ROOM",
	SEND_MESSAGE="SEND_MESSAGE",
};