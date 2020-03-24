export default interface ChatMessageData {
    elem1?:string;
    elem2?:string;
    constellation?:string;
    starName?:string;
    angleA?:number;
    angleB?:number;
    from?:string;
}

export enum MESSAGE_TYPE {
	ELEMS_TO_CONST="ELEMS_TO_CONST",
	CONST_TO_STAR="CONST_TO_STAR",
	CONST_TO_ANGLES="CONST_TO_ANGLES",
	SPLITTER="SPLITTER",
};