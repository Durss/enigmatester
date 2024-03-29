
/**
 * Created by Durss
 */
export default class Config {

	public static IS_PROD:boolean = /.*\.(com|fr|net|org|ninja)$/gi.test(window.location.hostname) || window.location.hostname.indexOf("192.168") > -1;
	public static ENABLE_INTRO_ANIMATIONS:boolean = false || Config.IS_PROD;
	public static STORAGE_VERSION:number = 1;
	
	private static _ENV_NAME: EnvName;

	public static init():void {
		let prod = document.location.port == "";

		if(prod) this._ENV_NAME = "prod";
		else this._ENV_NAME = "dev";
	}
	
	public static get SERVER_PORT(): number {
		return this.getEnvData({
			dev: 3006,
			prod: document.location.port,
		});
	}
	
	public static get SOCKET_PATH():string{
		if(this.IS_PROD) {
			return "/sock";
		}else{
			return window.location.origin.replace(/(.*):[0-9]+/gi, "$1")+":3006/sock";
		}
	};
	
	public static get API_PATH(): string {
		return this.getEnvData({
			dev: "http://localhost:"+this.SERVER_PORT+"/api",
			prod:"/api",
		});
	}

	public static get CONSTELLATION_LIST():string[] {
		return ["draco", "aquila", "cetus", "lepus", "orion", "gemini", "leo", "virgo", "bootes", "hercules", "lacerta", "ursa major", "crater", "phoenix", "lyra", "ursa minor", "cassiopeia", "cepheus", "cancer", "puppis", "pegasus", "pisces", "scorpius", "perseus"];
	}

	public static get STAR_NAME_LIST():string[] {
		return ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "ο", "π", "ρ", "σ", "τ", "υ", "φ", "Ψ", "Χ", "ω", "v", "α&", "γα", "βα", "μα", "ια", "ζβ", "ξβ", "εβ", "δβ", "ζα", "Χβ", "Χα", "πα", "πβ", "πγ", "πδ", "πε", "πζ", "1", "2", "4", "5", "6", "9", "12", "16"];
	}

	public static get ELEMENTS():string [] { return ["fire", "water", "earth", "air"]; }

	public static BOX_WIDTH:number = 468;
	public static BOX_HEIGHT:number = 672;

	public static get STEPS():{elements:string[], angles:number[][], faceIndex:number[], targets:{x:number, y:number}[]} [] {
		return [
			{
				elements:["fire", "air"],
				angles:[[2,1], null],
				faceIndex:[0, null],
				targets:[{x: 275, y:331}, null],
			},
			{
				elements:["earth", "water"],
				angles:[[9,8],[2,2]],
				faceIndex:[0,2],
				targets:[{x:275, y:331},{x:356, y:248}],
			},
			{
				elements:["water", "air"],
				angles:[[7,9],null],
				faceIndex:[3,null],
				targets:[{x:92, y:189},null],
			},
			{
				elements:["fire", "earth"],
				angles:[[8,4],[1,2]],
				faceIndex:[3,2],
				targets:[{x:92, y:189},{x:353, y:249}],
			}
		];
	}

	

	/**
	 * Extract a data from an hasmap depending on the current environment.
	 * @param map
	 * @returns {any}
	 */
	private static getEnvData(map: any): any {
		//Get the data from hashmap
		if (map[this._ENV_NAME]) return map[this._ENV_NAME];
		return map[Object.keys(map)[0]];
	}
}

type EnvName = "dev" | "preprod" | "prod" | "standalone";