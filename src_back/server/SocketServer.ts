import * as sockjs from "sockjs";
import {Connection, ServerOptions} from "sockjs";
import Logger, { LogStyle } from "../utils/Logger";
import UserData from "../vo/UserData";
import Config from "../utils/Config";
/**
 * Created by FDursus on 28/03/2019
 */

export default class SocketServer {

	private static _instance: SocketServer;
	private _DISABLED: boolean = false;
	private _sockjs: any;
	private _connections:Connection[];
	private _uidToConnection:{ [id: string] : Connection[]; };

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
					for (let j = 0; j < this._uidToConnection[uid].length; j++) {
						if(this._uidToConnection[uid][j] == this._connections[i]) {
							allow = false;
						}
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
		let conns = this._uidToConnection[user.id.toString()];
		console.log("send to ", user.name);
		if(!conns) return;
		for (let i = 0; i < conns.length; i++) {
			conns[i].write(JSON.stringify(msg));
		}
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
	}

	private onConnect(conn:Connection):void {
		if(this._DISABLED) return;
		this._connections.push(conn);

		// Logger.info("Socket connexion opened : "+LogStyle.Reset+conn.id);
		conn.on("data", (message) => {
			let json:any = JSON.parse(message);

			if(json.action == SOCK_ACTIONS.PING) {
				//Don't care, just sent to check if connection's style alive
				return;
			}else
			if(json.action == SOCK_ACTIONS.DISCONNECT) {
				this.onClose(conn);
				return;
			}else
			if(json.action == SOCK_ACTIONS.LOGIN) {
				if(!this._uidToConnection[json.data]) this._uidToConnection[json.data] = [];
				this._uidToConnection[json.data].push(conn);
				return;
			}else{
				if(this._DISABLED) return;
				Logger.info("Socket message : "+LogStyle.Reset+json.action);
				this.broadcast(json);
			}
		});
		conn.on("close", () => {
			this.onClose(conn);
		});
	}

	private onClose(conn:Connection):void {
		if(this._DISABLED) return;
		// Logger.info("Socket connexion closed : "+LogStyle.Reset+conn.id);
		let idx = this._connections.indexOf(conn);
		this._connections.splice(idx, 1);
		for(let uid in this._uidToConnection) {
			if(!this._uidToConnection[uid] || this._uidToConnection[uid].length == 0) continue;

			for(let i:number = 0; i < this._uidToConnection[uid].length; i++) {
				if (this._uidToConnection[uid][i] == conn) {
					this._uidToConnection[uid].splice(i, 1);
					break;
				}
			}
		}
	}
}

export enum SOCK_ACTIONS {
	DISCONNECT="DISCONNECT",
	LOGIN="LOGIN",
	PING="PING",
	JOIN_ROOM="JOIN_ROOM",
};