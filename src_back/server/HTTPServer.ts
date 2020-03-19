import * as express from "express";
import { NextFunction, Request, Response, Express } from "express-serve-static-core";
import * as http from "http";
import Config from '../utils/Config';
import Logger from '../utils/Logger';
import * as historyApiFallback from 'connect-history-api-fallback';
import * as bodyParser from "body-parser";
import RoomData from "../vo/RoomData";
import UserData from "../vo/UserData";
import { v4 as uuidv4 } from 'uuid';
import SocketServer, { SOCK_ACTIONS } from "./SocketServer";

export default class HTTPServer {

	private app:Express;

	private _rooms:{[id:string]:RoomData} = {};

	constructor(public port:number) {
		this.app = <Express>express();
		let server = http.createServer(<any>this.app);
		
		SocketServer.instance.installHandler(server, {prefix:"/sock"});
		server.listen(Config.SOCKET_SERVER_PORT, '0.0.0.0');

		this.app.use(historyApiFallback({
			index:'/'+Config.SERVER_NAME+"/index.html",
			publicPath: Config.PUBLIC_PATH,
			// verbose:true,
			rewrites: [
				{
					//Avoiding rewrites for API calls and socket
					from: /.*\/(api|sock)\/?.*$/,
					to: function(context) {
						return context.parsedUrl.pathname;
					}
				}
			],
		}));
		
		this.doPrepareApp();
	}

	protected initError(error: any): void {
		Logger.error("Error happened !", error);
	}

	protected doPrepareApp(): void {
		let server = new http.Server(<any>this.app);
		server.listen(this.port, "localhost", null, ()=> {
			Logger.success("Server ready on port " + Config.SERVER_PORT + " :: server name \"" + Config.SERVER_NAME + "\"");
		});

		this.app.use(<any>bodyParser.urlencoded({ extended: true }));
		this.app.use(<any>bodyParser.json({limit: '10mb'}));

		this.app.all(Config.SERVER_NAME+"/*", (req:Request, res:Response, next:NextFunction) => {
			// Set CORS headers
			res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,PATCH,DELETE,OPTIONS');
			res.header('Access-Control-Allow-Headers', 'Content-type,Accept,X-Access-Token,X-Key,X-AUTH-TOKEN');
			res.header("Access-Control-Allow-Origin", "*");
			if (req.method == 'OPTIONS') {
				res.status(200).end();
				return;
			}
			
			next();
		});
		
		this.app.get("/api", (req, res) => {
			Logger.info("GET test");
			res.status(200).send(JSON.stringify({success:true}));
		});
		
		/**
		 * CHECK IF A ROOM EXISTS AND IF THE USER IS PART OF IT
		 */
		this.app.get("/api/room/valid", (req, res) => {
			let room = this._rooms[(<string>req.query.name).toLowerCase()];
			let valid = room != undefined;
			if(valid) {
				//Room exists, check if the user is part of it
				let found = false;
				for (let i = 0; i < room.users.length; i++) {
					if(room.users[i].id == req.query.uid) {
						found = true;
						break;
					}
				}
				if(!found) valid = false;
			}
			res.status(200).send(JSON.stringify({success:true, valid}));
		});
		
		/**
		 * JOIN/CREATE ROOM
		 */
		this.app.post("/api/room/join", (req, res) => {
			let userName = req.body.name;
			let roomName = req.body.room;
			let user:UserData = {
				id:uuidv4(),
				name:userName,
			};
			let room = this._rooms[roomName.toLowerCase()];
			let created = false;
			//Create room
			if(!room) {
				created = true;
				this._rooms[roomName.toLowerCase()] = room = {
					id:uuidv4(),
					name:roomName,
					users:[user]
				}
			}else if(room.users.length < 3) {
				room.users.push(user);
			}else{
				res.status(301).send(JSON.stringify({success:false, code:"ROOM_FULL", message:"Room is already full"}));
				return;
			}
			res.status(200).send(JSON.stringify({success:true, room:this._rooms[roomName.toLowerCase()], me:user, created}));
			SocketServer.instance.sendToUserList(room.users, {action:SOCK_ACTIONS.JOIN_ROOM});
		});

		/**
		 * SERVE PUBLIC
		 */
		let publicFolder = Config.PUBLIC_PATH;
		this.app.use(Config.SERVER_NAME+"/", express.static(publicFolder));//static files
		
		this.app.use((error : any, request : Request, result : Response, next : NextFunction) => {
			this.errorHandler(error , request, result, next)
		});
	}


	protected errorHandler(error: any, req: Request, res: Response, next: NextFunction): any {
		Logger.error("Express error");
		console.log(error)
	}

	private onReady(): void {
		
	}
}