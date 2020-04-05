import { Shader, vsCode, fsCode } from './shader.js';
import { Texture } from './texture.js';
import { Quad } from './quad.js';

let gl;

class Game {
	npc = [];
	keysdown = new Array(256).fill(false);
	fov = 70;
	playerPos = [0, -2.0, -0.7];
	whiteColor = glMatrix.vec4.clone([1.0, 1.0, 1.0, 1.0]);
	z = -3.0;
	gun = [45.5, 42, 0, 31.5];
	start = () => {
		this.canvas = document.querySelector('#game');
		gl = this.canvas.getContext('webgl');
		this.sheetTexture = Texture.load('res/sheet.png', 256, 256);
		this.quad = new Quad(new Shader(vsCode, fsCode));

		for (let i = 0; i < 100; i++) {
			let x = (Math.random()*126);
			x = (parseInt(x) % 2 == 0) ? x * -1.0 : x * 1.0;
			this.npc.push([x, -3.0, (Math.random() * -512)]);
		}
		for (let i = 0; i < 100; i++) glMatrix.vec3.add(this.npc[i], this.npc[i], [-2.8, 0.0, -30.0]);

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
	unprocessedFrames = 0.0;
	animate = (time = 0) => {
		if (!this.sheetTexture.img) return;
		let now = Date.now();
		this.unprocessedFrames += (now - this.lastTime) * 60.0 / 1000.0;
		if (this.unprocessedFrames > 10.0) this.unprocessedFrames = 10.0;
		while (this.unprocessedFrames > 1.0) {
			this.tick(time);
			this.unprocessedFrames -= 1.0;
		}
		this.render(time);
		window.requestAnimationFrame(this.animate);
	}

	tick = () => {
		let speed = 0.06;
		if (this.keysdown[87]) {
			this.playerPos[2] += speed;
			this.z -= speed;
		}
		if (this.keysdown[83]) {
			this.z += speed;
			this.playerPos[2] -= speed;
		}
		if (this.keysdown[32]) {
			this.gun = [45.5, 42, 45, 31.5];
		}
		if (this.playerPos[1] > -2.0) this.playerPos[1] = 0.0;
		if (!this.keysdown[32]) 
			this.gun = [45.5, 42, 0, 31.5];
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

		this.quad.setCamera(viewMatrix, screenMatrix);
		this.quad.setTexture(this.sheetTexture);
		for (let i = 0; i < 100; i++) {
			this.quad.render(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), this.npc[i], cameraMatrix), 14.5, 15.5, 16, 0, whiteColor);
		}
		this.quad.renderPlayer(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [0, 1.0*0.5, this.z], cameraMatrix), this.gun[0], this.gun[1], this.gun[2], this.gun[3], whiteColor);
	}
}

window.game = new Game();
game.start();

export { gl };