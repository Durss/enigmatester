import { EventDispatcher } from '@/utils/EventDispatcher';
import * as SockJS from "sockjs-client";
import Config from "../utils/Config";
import SocketEvent from "../vo/SocketEvent";
import store from '@/store';

/**
 * Created by FDursus on 28/03/2019
 */

export default class SockController extends EventDispatcher {

	private static _instance: SockController;

	private _uid: string;
	private _sockjs: any;
	private _timeout: number;
	private _pingInterval: number;
	private _attempts: number;
	private _connected : boolean = false;

	constructor() {
		super();
		this.initialize();
	}

	/********************
	 * GETTER / SETTERS *
	 ********************/
	static get instance(): SockController {
		if (!SockController._instance) SockController._instance = new SockController();
		return SockController._instance;
	}

	public set uid(value:string) {
		this._uid = value;
		if(this._connected) {
			this.sendMessage({action:SOCK_ACTIONS.LOGIN, data:value});
		}
	}


	/******************
	 * PUBLIC METHODS *
	 ******************/

	public connect() {
		// if(this._sockjs) return;

		//@ts-ignore
		this._sockjs = new SockJS(Config.SOCKET_PATH);
		this._sockjs.onclose = ()=> this.onClose();
		this._sockjs.onmessage = (message:string)=> this.onMessage(message);
		this._sockjs.onopen = ()=> this.onConnect();

		window.addEventListener('beforeunload', _=> this.disconnect());
	}

	public disconnect() {
		if(this._connected) {
			try {
				this._sockjs.send(JSON.stringify({action:SOCK_ACTIONS.DISCONNECT}));
			}catch(e) {
				//Ignore..
			}
		}
		this._connected = false;
		clearTimeout(this._timeout);
		this._timeout = <any>setTimeout(_=> this._sockjs.close(), 500);
	}

	public sendMessage(data:{action:string, data:any}):void {
		this._sockjs.send(JSON.stringify(data));
	}


	/*******************
	 * PRIVATE METHODS *
	 *******************/
	/**
	 * Initializes the class
	 */
	private initialize(): void {
	}

	private onConnect():void {
		this._connected = true;
		this._attempts = 0;
		
		clearInterval(<any>this._pingInterval);
		this._pingInterval = <any>setInterval(_=>this.ping(), 30000);
		if(this._uid) {
			this.sendMessage({action:SOCK_ACTIONS.LOGIN, data:this._uid});
		}
	}

	private ping():void {
		this._sockjs.send(JSON.stringify({action:SOCK_ACTIONS.PING}));
	}

	private onClose():void {
		this._connected = false;
		clearInterval(<any>this._pingInterval);
		if(++this._attempts == 10) return;
		this._timeout = <any>setTimeout(_=> this.connect(), 10000);
	}

	private onMessage(message:any):void {
		let json:any = JSON.parse(message.data);
		console.log("Sock message");
		console.log(json);
		switch(json.action) {
			case SocketEvent.USER_CONNECT:
				store.dispatch("addUser", json.data)
				break;
		}
		this.dispatchEvent(new SocketEvent(json.action, json.data));
	}
}

export enum SOCK_ACTIONS {
	DISCONNECT="DISCONNECT",
	LOGIN="LOGIN",
	PING="PING",
	JOIN_ROOM="JOIN_ROOM",
};