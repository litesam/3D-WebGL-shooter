import { Shader, vsCode, fsCode } from './shader.js';

let gl;

class Quad {
	constructor(shader) {
		this.shader = shader;
		// Attribute Location
		this.posLocation = gl.getAttribLocation(this.shader.program, 'a_pos');
		// Uniform Location
		this.cameraLocation = gl.getUniformLocation(this.shader.program, 'u_camera');
		this.transformLocation = gl.getUniformLocation(this.shader.program, 'u_transform');
		this.viewLocation = gl.getUniformLocation(this.shader.program, 'u_view');
		this.colorLocation = gl.getUniformLocation(this.shader.program, 'u_color');

		const vertexData = new Float32Array(12);
		vertexData.set([0.0, 0.0, 0.0], 0);
		vertexData.set([0.0, 1.0, 0.0], 3);
		vertexData.set([1.0, 1.0, 0.0], 6);
		vertexData.set([1.0, 0.0, 0.0], 9);

		const indexData = new Int16Array(6);
		indexData.set([0, 1, 2, 0, 2, 3], 0);

		gl.useProgram(this.shader.program);
		gl.enableVertexAttribArray(this.posLocation);

		const vertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertexData, gl.STATIC_DRAW);
		gl.vertexAttribPointer(this.posLocation, 3, gl.FLOAT, false, 0, 0);

		const indexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW);
	}

	setCamera = (viewMatrix, cameraMatrix) => {
		gl.uniformMatrix4fv(this.cameraLocation, false, cameraMatrix);
		gl.uniformMatrix4fv(this.viewLocation, false, viewMatrix);
	}

	render = (pos, w, h, uo, vo, color) => {
		this.transformMatrix = glMatrix.mat4.create();

		gl.uniformMatrix4fv(this.transformLocation, false, this.transformMatrix);
		gl.uniform4fv(this.colorLocation, color);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	}

	renderColors = (pos, w, h, uo, vo, color) => {
		this.objectMatrix = glMatrix.mat4.create();

		glMatrix.mat4.translate(this.objectMatrix, this.objectMatrix, [pos[0], pos[1], pos[2]]);
		glMatrix.mat4.scale(this.objectMatrix, this.objectMatrix, glMatrix.vec3.clone([2 * 1.0, 3 * 1.0, 0.0]));

		gl.uniformMatrix4fv(this.transformLocation, false, this.objectMatrix);
		gl.uniform4fv(this.colorLocation, color);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	}

}

class Game {
	fov = 70;
	playerPos = glMatrix.vec3.clone([0.0, 0.0, 0.0]);
	whiteColor = glMatrix.vec4.clone([1.0, 1.0, 1.0, 1.0]);
	start = () => {
		this.canvas = document.querySelector('#game');
		gl = this.canvas.getContext('webgl2');
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LESS);
		this.quad = new Quad(new Shader(vsCode, fsCode));
		window.requestAnimationFrame(this.render);
	}

	render = (time) => {
		const pixelScale = 2.0;
		gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		const scale = pixelScale * 2.0 / this.canvas.height;

		const viewMatrix = glMatrix.mat4.create();
		glMatrix.mat4.perspective(viewMatrix, this.fov * Math.PI / 180, 1.0, 0.01, 1000.0);

		const cameraMatrix = glMatrix.mat4.create();
		// Camera Matrix to project Player to the screen
		{
			glMatrix.mat4.translate(cameraMatrix, cameraMatrix, [this.playerPos[0], this.playerPos[1], -20.0-this.playerPos[2]]);
		}
		this.quad.setCamera(viewMatrix, cameraMatrix);
		// glMatrix.vec3.add(this.playerPos, this.playerPos, [Math.random(), Math.random(), Math.random()])
		
		this.quad.renderColors(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), this.playerPos, cameraMatrix), 14, 14, 0.0, 0, this.whiteColor);
		this.quad.renderColors(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [1.0 * 3, 0.0, 0.0], cameraMatrix), 14, 14, 0.0, 0, [Math.random(), Math.random(), Math.random(), Math.random()]);
		this.quad.renderColors(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [2.0 * 3, 0.0, 0.0], cameraMatrix), 14, 14, 0.0, 0, [Math.random(), Math.random(), Math.random(), Math.random()]);
		this.quad.renderColors(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [3.0 * 3, 0.0, 0.0], cameraMatrix), 14, 14, 0.0, 0, [Math.random(), Math.random(), Math.random(), Math.random()]);
		this.quad.renderColors(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [4.0 * 3, 0.0, 0.0], cameraMatrix), 14, 14, 0.0, 0, [Math.random(), Math.random(), Math.random(), Math.random()]);
		this.quad.renderColors(glMatrix.vec3.transformMat4(glMatrix.vec3.create(), [5.0 * 3, 0.0, 0.0], cameraMatrix), 14, 14, 0.0, 0, [Math.random(), Math.random(), Math.random(), Math.random()]);
		window.requestAnimationFrame(this.render);
	}
}

const game = new Game();
game.start();

export { gl };