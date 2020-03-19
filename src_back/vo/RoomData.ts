import UserData from "./UserData";

export default interface RoomData {
    name:string;
    id:string;
    users:UserData[];
}