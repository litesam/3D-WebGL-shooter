import { Shader, vsCode, fsCode } from './shader.js';
import { Texture } from './texture.js';
import { Quad } from './quad.js';

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
	zScroll = this.z
	GAME_ENDS = -512
	start = () => {
		this.canvas = document.querySelector('#game');
		gl = this.canvas.getContext('webgl');
		this.sheetTexture = Texture.load('res/sheet.png', 256, 256);
		this.groundTexture = Texture.load('res/ground.png', 256, 256);
		this.miscTexture = Texture.load('res/misc.png', 256, 256);
		this.quad = new Quad(new Shader(vsCode, fsCode));

		for (let i = 0; i < 10000; i++) {
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
		if (!this.sheetTexture.img) return;
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
	tick = (time) => {
		this.tc++;
		let animFrame = (parseInt(this.tc / 30)) % 2;
		// console.log(animFrame);
		this.npcsAnim[2] = 16 * animFrame;
		let speed = 0.6;
		// if (this.keysdown[87]) {
			this.playerPos[2] += speed;
			this.z -= speed;
		// }
		if (this.keysdown[83]) {
			this.playerPos[2] -= speed;
			this.z += speed;
		}
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
		
	}

	drawString = (str, cameraMatrix, whiteColor, x, y, z) => {
		str = str.toUpperCase();
		if (x < 0) x *= -1;
		else x *= 1;
		for (let i = 0; i < str.length; i++) {
			let index = referenceStr.indexOf(str.charAt(i));
			let uo = index % 32;
			let vo = 24;
			if (index > 25) {
				vo = vo + 8.1;
				// uo -= 8;
			}
			this.quad.renderString(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [x * (i + 1) / 1.6, y, z], cameraMatrix), 8, 8, 8 * uo, vo, whiteColor);
		}
	}

	render = (time = 0) => {
		const whiteColor = [1.0, 1.0, 1.0, 1.0];
		const pixelScale = 2.0;
		const scale = pixelScale * 2.0 / this.canvas.height;
		gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);


		const viewMatrix = glMatrix.mat4.create();
		glMatrix.mat4.perspective(viewMatrix, this.fov * Math.PI / 180, this.canvas.width / this.canvas.height, 0.01, 2.0);

		const cameraMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(cameraMatrix, cameraMatrix, [-this.playerPos[0]*0.5, 3.0-this.playerPos[1]*0.5, -7+this.playerPos[2]]);

		const floorCameraMatrix = glMatrix.mat4.create();
		glMatrix.mat4.rotateX(floorCameraMatrix, floorCameraMatrix, Math.PI / 2.0);

		const screenMatrix = glMatrix.mat4.create();
		glMatrix.mat4.scale(screenMatrix, screenMatrix, [scale, -scale, scale]);

		this.quad.setCamera(viewMatrix, glMatrix.mat4.mul(glMatrix.mat4.create(), glMatrix.mat4.mul(glMatrix.mat4.create(), screenMatrix, cameraMatrix), floorCameraMatrix));
		this.quad.setTexture(this.groundTexture);
		this.quad.render(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [-100.0, -15.0, 256.0], floorCameraMatrix), 256, 256, 0, 0, whiteColor);
		this.quad.render(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [-100.0, -15.0, 256.0 * 2], floorCameraMatrix), 256, 256, 0, 0, whiteColor);
		this.quad.render(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [-100.0, -15.0, 256.0 * 3], floorCameraMatrix), 256, 256, 0, 0, whiteColor);

		this.quad.setCamera(viewMatrix, screenMatrix);
		this.quad.setTexture(this.sheetTexture);
		for (let i = 0; i < 100; i++) {
			this.quad.render(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), this.npc[i], cameraMatrix), this.npcsAnim[0], this.npcsAnim[1], this.npcsAnim[2], this.npcsAnim[3], whiteColor);
			this.quad.render(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [0.0, -2.5, -30.0], cameraMatrix), this.npcsAnim[0], this.npcsAnim[1], this.npcsAnim[2], this.npcsAnim[3], whiteColor);
		}
		this.quad.renderPlayer(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [0, 1.0*0.5, this.z], cameraMatrix), this.gun[0], this.gun[1], this.gun[2], this.gun[3], whiteColor);
		for (let i = 0; i < 1000; i++) {
			this.quad.renderPlayer(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), this.grasses[i], cameraMatrix), 13.5, 12.5, 45, 0, whiteColor);
		}
		this.quad.setTexture(this.miscTexture);
		this.drawString('DEAD', cameraMatrix, whiteColor, 3, -10.5, this.z);
	}
}

window.game = new Game();
game.start();

export { gl };