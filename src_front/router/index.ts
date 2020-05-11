import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Game from '../views/Game.vue'
import Alien from '../views/Alien.vue'
import AudioTest from '../views/AudioTest.vue'
import DiscsTest from '../views/DiscsTest.vue'

Vue.use(VueRouter)

const routes = [
	{
		path: '/',
		name: 'home',
		component: Home
	},
	{
		path: '/play',
		name: 'play',
		component: Game,
		meta: {
			needAuth: true,
		}
	},
	{
		path: '/enigma2',
		name: 'enigma2',
		component: Alien,
	},
	{
		path: '/discs',
		name: 'discs',
		component: DiscsTest,
	},
	{
		path: '/audio',
		name: 'audio',
		component: AudioTest,
	},
	{
		path: "*",
		redirect:{name:"home"},
	},
]

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes
})

export default router
