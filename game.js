import { Shader, vsCode, fsCode } from './shader.js';
import { Texture } from './texture.js';
import { Quad } from './quad.js';

window.onload = function () {
	if (!window.location.hash) {
		window.location = window.location + '#loaded';
		window.location.reload();
	}
}

const STATE_TITLE_SCREEN = 0;
const STATE_PLAY_GAME = 1;
const STATE_WIN_GAME = 2;
const STATE_LOSE_GAME = 3;

let gl;
let referenceStr = `ABCDEFGHIJKLMNOPQRSTUVWXYZ     
0123456789`;

class Game {
	npc = []
	grasses = []
	keysdown = new Array(256).fill(false)
	fov = 70
	playerPos = [0, -2.0, -0.7]
	whiteColor = glMatrix.vec4.clone([1.0, 1.0, 1.0, 1.0])
	z = -3.0
	gun = [45.5, 42, 0, 31.5]
	npcsAnim = [14.5, 15.5, 0, 90]
	bigNpc = [14.5, 15.5, 32, 0]
	zScroll = this.z
	GAME_ENDS = -530
	gameState = STATE_TITLE_SCREEN
	start = () => {
		this.canvas = document.querySelector('#game');
		gl = this.canvas.getContext('webgl');
		this.sheetTexture = Texture.load('res/sheet.png', 256, 256);
		this.groundTexture = Texture.load('res/ground.png', 256, 256);
		this.miscTexture = Texture.load('res/misc.png', 256, 256);
		this.quad = new Quad(new Shader(vsCode, fsCode));

		for (let i = 0; i < 100; i++) {
			let x = (Math.random()*126);
			x = (parseInt(x) % 2 == 0) ? x * -1.0 : x * 1.0;
			this.npc.push([x, -3.0, (Math.random() * this.GAME_ENDS)]);
		}
		for (let i = 0; i < 100; i++) glMatrix.vec3.add(this.npc[i], this.npc[i], [-2.8, 0.0, -30.0]);
		for (let i = 0; i < 1000; i++) {
			let x = (Math.random()*126);
			x = (parseInt(x) % 2 == 0) ? x * -1.0 : x * 1.0;	
			this.grasses.push([x, 12.0, (Math.random() * this.GAME_ENDS)]);
		}

		window.addEventListener('keydown', this.onKeydown);
		window.addEventListener('keyup', this.onKeyup);

		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LESS);
		window.requestAnimationFrame(this.animate);
	}

	onKeydown = (e) => {
		this.keysdown[e.keyCode] = true;
	}

	onKeyup = (e) => {
		this.keysdown[e.keyCode] = false;
	}

	lastTime = Date.now();
	unprocessedFrames = 0.0
	animate = (time = 0) => {
		let now = Date.now();
		this.unprocessedFrames += (now - this.lastTime) * 60.0 / 1000.0;
		if (this.unprocessedFrames > 10.0) this.unprocessedFrames = 10.0;
		this.lastTime = now;
		while (this.unprocessedFrames > 1.0) {
			this.tick(time);
			this.unprocessedFrames -= 1.0;
		}
			this.render(this.unprocessedFrames);
		window.requestAnimationFrame(this.animate);
	}

	tc = 0

	tickPlayGame = () => {
		this.tc++;
		let animFrame = (parseInt(this.tc / 30)) % 2;
		this.npcsAnim[2] = 16 * animFrame;
		let speed = 0.6;
		this.playerPos[2] += speed;
		this.z -= speed;
		if (this.keysdown[32]) {
			this.gun = [45.5, 42, 45, 31.5];
		}
		if (this.z > -3.0 || this.playerPos[2] < -0.7) {
			this.z = -3.0;
			this.playerPos[2] = -0.7;
		}
		if (this.playerPos[1] > -2.0) this.playerPos[1] = 0.0;
		if (!this.keysdown[32]) 
			this.gun = [45.5, 42, 0, 31.5];
		if (this.z <= this.GAME_ENDS - 20) {
			this.z = this.GAME_ENDS - 20;
			this.playerPos[2] = -this.GAME_ENDS + 20;
		}
		for (let i = 0; i < 100; i++) {
			if (this.npc[i][0] > -10 && this.npc[i][0] < 7) {
				if (this.z < this.npc[i][2]) {
					this.gameState = STATE_LOSE_GAME;
					this.playerPos = [0, 2.0, -0.7];
				}
			}
		}
	}

	tickTitleScreen = () => {
		if (this.keysdown[65]) {
			this.gameState = STATE_PLAY_GAME;
		}
	}

	tickLoseGame = () => {
		if (this.keysdown[83]) {
			this.playerPos = [0.0, -2.0, -0.7];
			this.gameState = STATE_TITLE_SCREEN;
			this.z = -3.0;
		}
	}

	tick = (time) => {
		if (this.gameState === STATE_PLAY_GAME) this.tickPlayGame();		
		if (this.gameState === STATE_TITLE_SCREEN) this.tickTitleScreen();
		if (this.gameState === STATE_LOSE_GAME) this.tickLoseGame();
	}

	drawString = (str, cameraMatrix, color, x, y, z) => {
		str = str.toUpperCase();
		for (let i = 0; i < str.length; i++) {
			let index = referenceStr.indexOf(str.charAt(i));
			let uo = index % 32;
			let vo = 24;
			if (index > 25) {
				vo = vo + 8.1;
				// uo -= 8;
			}
			this.quad.renderString(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [x * (i + 1) / 1.6, y, z], cameraMatrix), 8, 8, 8 * uo, vo, color);
		}
	}

	drawStringRights = (str, cameraMatrix, color, x, y, z) => {
		str = str.toUpperCase();
		for (let i = 0; i < str.length; i++) {
			let index = referenceStr.indexOf(str.charAt(i));
			let uo = index % 32;
			let vo = 24;
			if (index > 25) {
				vo = vo + 8.1;
			}
			this.quad.renderStringCopyrights(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [x * (i + 1) / 1.6, y, z], cameraMatrix), 8, 8, 8 * uo, vo, color);
		}
	}

	render = (time = 0) => {
		if (!this.sheetTexture.img) return;
		this.whiteColor = [1.0, 1.0, 1.0, 1.0];
		this.pixelScale = 2.0;
		this.scale = this.pixelScale * 2.0 / this.canvas.height;
		gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		if (this.gameState === STATE_TITLE_SCREEN) this.renderTitleScreen();
		if (this.gameState === STATE_PLAY_GAME) this.renderPlaygame();
		if (this.gameState === STATE_LOSE_GAME) this.renderLoseGame();
	}

	renderLoseGame = () => {
		const viewMatrix = glMatrix.mat4.create();
		glMatrix.mat4.perspective(viewMatrix, this.fov * Math.PI / 180, this.canvas.width / this.canvas.height, 0.01, 2.0);

		const cameraMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(cameraMatrix, cameraMatrix, [-this.playerPos[0]*0.5, 3.0-this.playerPos[1]*0.5, -7+this.playerPos[2]]);

		const screenMatrix = glMatrix.mat4.create();
		glMatrix.mat4.scale(screenMatrix, screenMatrix, [this.scale, -this.scale, this.scale]);

		this.quad.setCamera(viewMatrix, screenMatrix);
		this.quad.setTexture(this.sheetTexture);
		
		this.quad.render(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [-10.0, -8.5, -5.0], cameraMatrix), 14.5, 15.5, 32, 0, this.whiteColor);
		this.quad.setTexture(this.miscTexture);
		this.drawString('YOU', cameraMatrix, [80.8, 80.8, 80.8, 0.1], 3, -7.5, -3.0);
		this.drawString('DEAD', cameraMatrix, [80.8, 80.8, 80.8, 0.1], 3, -4.5, -3.0);
		this.drawString('STAY', cameraMatrix, [80.8, 80.8, 80.8, 0.1], 3, -1.5, -3.0);
		this.drawString('HOME', cameraMatrix, [80.8, 80.8, 80.8, 0.1], 3, 1.5, -3.0);
		this.drawStringRights('PRESS S TO PLAY AGAIN', cameraMatrix, this.whiteColor, 0.5, 4.2, -3.0);	
	}

	renderTitleScreen = () => {
		const viewMatrix = glMatrix.mat4.create();
		glMatrix.mat4.perspective(viewMatrix, this.fov * Math.PI / 180, this.canvas.width / this.canvas.height, 0.01, 2.0);

		const cameraMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(cameraMatrix, cameraMatrix, [-this.playerPos[0]*0.5, 3.0-this.playerPos[1]*0.5, -7+this.playerPos[2]]);

		const screenMatrix = glMatrix.mat4.create();
		glMatrix.mat4.scale(screenMatrix, screenMatrix, [this.scale, -this.scale, this.scale]);

		this.quad.setCamera(viewMatrix, screenMatrix);
		this.quad.setTexture(this.miscTexture);
		this.quad.render(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [0.0, -38.5, -12.0], cameraMatrix), 64, 64, 0, 47, this.whiteColor);
		this.drawString('DEAD', cameraMatrix, [80.8, 80.8, 80.8, 0.1], 3, -10.5, -3.0);
		this.drawString('HUNGER', cameraMatrix, [80.8, 80.8, 80.8, 0.1], 3, -7.5, -3.0);
		this.drawString('PRESS', cameraMatrix, [80.8, 80.8, 80.8, 0.1], 3, -4.5, -3.0);
		this.drawString('A', cameraMatrix, [2.8, 2.8, 2.8, 0.1], 3, -1.5, -3.0);
		this.drawString('TO PLAY', cameraMatrix, [80.8, 80.8, 80.8, 0.1], 2.6, 1, -3.0);
		this.drawStringRights('DONT GO OUT', cameraMatrix, this.whiteColor, 0.5, 3.1, -3.0);

		this.quad.setTexture(this.sheetTexture);
		this.quad.render(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [-18.0, -2.5, -10.0], cameraMatrix), 14.5, 15.5, 32, 0, this.whiteColor);
	}

	renderPlaygame = ()  => {
		const viewMatrix = glMatrix.mat4.create();
		glMatrix.mat4.perspective(viewMatrix, this.fov * Math.PI / 180, this.canvas.width / this.canvas.height, 0.01, 2.0);

		const cameraMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(cameraMatrix, cameraMatrix, [-this.playerPos[0]*0.5, 3.0-this.playerPos[1]*0.5, -7+this.playerPos[2]]);

		const floorCameraMatrix = glMatrix.mat4.create();
		glMatrix.mat4.rotateX(floorCameraMatrix, floorCameraMatrix, Math.PI / 2.0);

		const screenMatrix = glMatrix.mat4.create();
		glMatrix.mat4.scale(screenMatrix, screenMatrix, [this.scale, -this.scale, this.scale]);

		this.quad.setCamera(viewMatrix, glMatrix.mat4.mul(glMatrix.mat4.create(), glMatrix.mat4.mul(glMatrix.mat4.create(), screenMatrix, cameraMatrix), floorCameraMatrix));
		this.quad.setTexture(this.groundTexture);
		this.quad.render(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [-100.0, -15.0, 256.0], floorCameraMatrix), 256, 256, 0, 0, this.whiteColor);
		this.quad.render(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [-100.0, -15.0, 256.0 * 2], floorCameraMatrix), 256, 256, 0, 0, this.whiteColor);
		this.quad.render(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [-100.0, -15.0, 256.0 * 3], floorCameraMatrix), 256, 256, 0, 0, this.whiteColor);

		this.quad.setCamera(viewMatrix, screenMatrix);
		this.quad.setTexture(this.sheetTexture);
		for (let i = 0; i < 100; i++) {
			if (this.npc[i][0] > -10 && this.npc[i][0] < 10) {
				this.quad.render(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), this.npc[i], cameraMatrix), this.npcsAnim[0], this.npcsAnim[1], 32, 0, this.whiteColor);
			} else {
				this.quad.render(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), this.npc[i], cameraMatrix), this.npcsAnim[0], this.npcsAnim[1], this.npcsAnim[2], this.npcsAnim[3], this.whiteColor);
			}
		}
		this.quad.renderPlayer(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [0, 1.0*0.5, this.z], cameraMatrix), this.gun[0], this.gun[1], this.gun[2], this.gun[3], this.whiteColor);
		for (let i = 0; i < 1000; i++) {
			this.quad.renderPlayer(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), this.grasses[i], cameraMatrix), 13.5, 12.5, 45, 0, this.whiteColor);
		}
	}
}

window.game = new Game();
game.start();

export { gl };