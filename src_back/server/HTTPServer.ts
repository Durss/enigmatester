import * as bodyParser from "body-parser";
import * as historyApiFallback from 'connect-history-api-fallback';
import * as express from "express";
import { Express, NextFunction, Request, Response } from "express-serve-static-core";
import * as http from "http";
import { v4 as uuidv4 } from 'uuid';
import Config from '../utils/Config';
import Logger from '../utils/Logger';
import RoomData from "../vo/RoomData";
import UserData from "../vo/UserData";
import SocketServer, { SOCK_ACTIONS } from "./SocketServer";

export default class HTTPServer {

	private app:Express;

	private _rooms:{[id:string]:RoomData} = {};

	constructor(public port:number) {
		this.app = <Express>express();
		let server = http.createServer(<any>this.app);
		
		SocketServer.instance.onMessage = (roomId:string, message:any) => {
			let room = this._rooms[roomId];
			if(!room.messages) room.messages = [];
			room.messages.push(message);
			if(room.messages.length > 100) {
				room.messages.shift();
			}
		}

		SocketServer.instance.onDeleteUser = (roomId:string, user:UserData) => {
			Logger.log("Remove user", user.name, "from room", roomId)
			if(!this._rooms[roomId]) {
				Logger.error("Room not found")
				return;
			}
			let allOffline = true;
			for (let i = 0; i < this._rooms[roomId].users.length; i++) {
				if(this._rooms[roomId].users[i].id == user.id) {
					this._rooms[roomId].users[i].offline = true;
					// this._rooms[roomId].users.splice(i, 1);
				}
				if(!this._rooms[roomId].users[i].offline) {
					allOffline = false;
				}
			}
			if(this._rooms[roomId].users.length == 0 || allOffline) {
				Logger.log("Room empty, delete it ", roomId);
				delete this._rooms[roomId];
			}
		}
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
			res.status(200).send(JSON.stringify({success:true, valid, room}));
		});
		
		/**
		 * JOIN/CREATE ROOM
		 */
		this.app.post("/api/room/join", (req, res) => {
			let userId = req.body.uid;
			let userName = req.body.name;
			let roomName = req.body.room;
			
			let user:UserData = {
				id:uuidv4(),
				name:userName,
				index:0,
				currentStepDone:false,
			};
			let room = this._rooms[roomName.toLowerCase()];
			let created = false;
			// if(room) console.log(room.users);

			//Create room
			if(!room) {
				created = true;
				this._rooms[roomName.toLowerCase()] = room = {
					id:uuidv4(),
					name:roomName,
					users:[user],
					messages:[],
					currentStepIndex:0,
				}
			}else if(userId) {
				let found = false;
				for (let i = 0; i < room.users.length; i++) {
					if(room.users[i].id == userId) {
						user = room.users[i];
						found = true;
					}
				}
				if(!found) {
					res.status(301).send(JSON.stringify({success:false, code:"SESSION_NOT_FOUND", message:"Unable to restore session !"}));
				}
			}else {
				let reconnectingUser = false;
				for (let i = 0; i < room.users.length; i++) {
					if(room.users[i].name.toLowerCase().trim() == userName.toLowerCase().trim() && room.users[i].offline) {
						user = room.users[i];
						reconnectingUser = true;
					}
				}
				//New user ?
				if(!reconnectingUser) {
					if(room.users.length == 3) {
						res.status(301).send(JSON.stringify({success:false, code:"ROOM_FULL", message:"Room is already full"}));
						return;
					}

					//Place is available, check if user isn't already in (and online)
					for (let i = 0; i < room.users.length; i++) {
						if(room.users[i].name.toLowerCase().trim() == userName.toLowerCase().trim()) {
							res.status(301).send(JSON.stringify({success:false, code:"USERNAME_USED", message:"User name "+userName+" is already used in this room"}));
							return;
						}
					}

					user.index = room.users.length;
					room.users.push(user);
				}
			}
			user.offline = false;
			SocketServer.instance.addToGroup(room.name, user);
			res.status(200).send(JSON.stringify({success:true, room:this._rooms[roomName.toLowerCase()], me:user, created}));
			// SocketServer.instance.sendToGroup(room.id, {action:SOCK_ACTIONS.JOIN_ROOM, data:user});
		});
		
		/**
		 * GET MESSAGES OF A ROOM
		 */
		this.app.get("/api/room/messages", (req, res) => {
			let room = this._rooms[(<string>req.query.room).toLowerCase()];
			if(room) {
				res.status(200).send(JSON.stringify({success:true, messages:room.messages}));
			}else{
				res.status(404).send(JSON.stringify({success:false, code:"ROOM_NOT_FOUND", message:"Room not found, unable to load its chat messages"}));
			}
		});
		
		/**
		 * SET A USER'S STEP STATE
		 */
		this.app.post("/api/user/ready", (req, res) => {
			let state = req.body.state;
			let userId = req.body.uid;
			let roomName = req.body.room;
			let room = this._rooms[roomName];
			
			// ["fire", "water", "earth", "air"];
			let stepToUserStates = [
				[true, false, false],
				[false, true, true],
				[false, true, false],
				[true, false, true],
			]
			if(!room) {
				res.status(404).send(JSON.stringify({success:false, code:"ROOM_NOT_FOUND", message:"Room not found"}));
				return;
			}
			let allGood = true;
			for (let i = 0; i < room.users.length; i++) {
				const u = room.users[i];
				if(u.id == userId) {
					u.currentStepDone = Boolean(state);
				}
				if(u.currentStepDone !== stepToUserStates[room.currentStepIndex][i]) {
					allGood = false;
				}
			}
			res.status(200).send(JSON.stringify({success:true, room}));
			if(allGood) {
				//Broadcast to group that current step is complete
				room.currentStepIndex ++;
				SocketServer.instance.sendToGroup(room.name, {action:SOCK_ACTIONS.NEXT_STEP});
				//Reset players step states
				for (let i = 0; i < room.users.length; i++) {
					room.users[i].currentStepDone = false;
				}
			}else{
				SocketServer.instance.sendToGroup(room.name, {action:SOCK_ACTIONS.USER_READY, data:{user:userId, ready:state}});
			}
		})

		/**
		 * SERVE PUBLIC FILES
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