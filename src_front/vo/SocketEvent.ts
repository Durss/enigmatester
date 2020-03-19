import { Event } from '@/utils/EventDispatcher';

export default class SocketEvent  extends Event {
	
	public static USER_CONNECT:string = "USER_CONNECT";
	public static USER_DISCONNECT:string = "USER_DISCONNECT";
	public static INFO:string = "INFO";

	private _data:any;

	constructor(type:string, data:any) {
		super(type, null);
		this._data = data;
	}



	/********************
	 * GETTER / SETTERS *
	 ********************/
	public get data():any { return this._data; }



	/******************
	 * PUBLIC METHODS *
	 ******************/



	/*******************
	 * PRIVATE METHODS *
	 *******************/
}