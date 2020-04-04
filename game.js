import { Shader, vsCode, fsCode } from './shader.js';
import { Texture } from './texture.js';
import { Quad } from './quad.js';

let gl;

class Game {
	npc = [];
	keysdown = new Array(256).fill(false);
	fov = 70;
	playerPos = glMatrix.vec3.clone([0, -2.0, 0.0]);
	whiteColor = glMatrix.vec4.clone([1.0, 1.0, 1.0, 1.0]);
	z = 0; // Debugging purposes
	start = () => {
		this.canvas = document.querySelector('#game');
		gl = this.canvas.getContext('webgl');
		this.sheetTexture = Texture.load('res/sheet.png', 256, 256);
		this.quad = new Quad(new Shader(vsCode, fsCode));

		for (let i = 0; i < 100; i++) {
			let x = (Math.random()*16);
			x = (parseInt(x) % 2 == 0) ? x * -1.0 : x * 1.0;
			this.npc.push([x, -4.0, (Math.random() * -82)]) // -16 on z-axis
		}
		for (let i = 0; i < 100; i++) glMatrix.vec3.add(this.npc[i], this.npc[i], [-1.8, 0.0, 0.0]);

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

	animate = (time = 0) => {
		this.tick();
		this.render(time);
		window.requestAnimationFrame(this.animate);
	}

	tick = () => {
		if (this.keysdown[87]) {
			this.playerPos[2] += 0.2;
		}
		if (this.keysdown[83]) {
			this.playerPos[2] -= 0.2;
		}
		// if (this.playerPos[2] < 0) {
		// 	this.playerPos[2] = 0;
		// }
	}

	render = (time = 0) => {
		if (!this.sheetTexture.img) return;
		const whiteColor = [1.0, 1.0, 1.0, 1.0];
		const pixelScale = 2.0;
		const scale = pixelScale * 2.0 / this.canvas.height;
		gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);


		const viewMatrix = glMatrix.mat4.create();
		glMatrix.mat4.perspective(viewMatrix, this.fov * Math.PI / 180, this.canvas.width / this.canvas.height, 0.01, 2.0);

		this.cameraMatrix = glMatrix.mat4.create();
		glMatrix.mat4.translate(this.cameraMatrix, this.cameraMatrix, [this.playerPos[0], 3.0-this.playerPos[1]*0.5, -7+this.playerPos[2]]);

		const floorCameraMatrix = glMatrix.mat4.create();
		glMatrix.mat4.rotateX(floorCameraMatrix, floorCameraMatrix, Math.PI / 2.0);
		
		const screenMatrix = glMatrix.mat4.create();
		glMatrix.mat4.scale(screenMatrix, screenMatrix, [scale, -scale, scale]);

		this.val = glMatrix.vec3.create();
		glMatrix.vec3.transformMat4(this.val, this.val, this.cameraMatrix);
		
		this.quad.setCamera(viewMatrix, screenMatrix);
		this.quad.setTexture(this.sheetTexture);
		for (let i = 0; i < 100; i++) {
			this.quad.renderPlayer(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), this.npc[i], this.cameraMatrix), 14.5, 15.5, 16, 0, whiteColor);
		}
		this.quad.renderPlayer(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), this.playerPos, this.cameraMatrix), 15, 15, 0, 0, whiteColor);
	}
}

window.game = new Game();
window.game.start();

export { gl };