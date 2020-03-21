import { Event } from '@/utils/EventDispatcher';

export default class SocketEvent  extends Event {
	
	public static USER_MESSAGE:string = "USER_MESSAGE";
	public static JOIN_ROOM="JOIN_ROOM";
	public static LEAVE_ROOM="LEAVE_ROOM";
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