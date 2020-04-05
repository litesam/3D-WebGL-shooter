import { gl } from './game.js';

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
		this.textureLocation = gl.getUniformLocation(this.shader.program, 'u_texture');

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

	setTexture = (texture) => {
		this.texture = texture;
		gl.bindTexture(gl.TEXTURE_2D, this.texture.texture);
	}

	setCamera = (viewMatrix, cameraMatrix) => {
		gl.uniformMatrix4fv(this.viewLocation, false, viewMatrix);
		gl.uniformMatrix4fv(this.cameraLocation, false, cameraMatrix);
	}

	renderPlayer = (pos, w, h, uo, vo, color) => {
		this.objectMatrix = glMatrix.mat4.create();
		this.textureMatrix = glMatrix.mat4.create();

		glMatrix.mat4.translate(this.objectMatrix, this.objectMatrix, pos);
		glMatrix.mat4.scale(this.objectMatrix, this.objectMatrix, [3 * 1.0, 3 * 1.0, 0.0]);
		gl.uniformMatrix4fv(this.transformLocation, false, this.objectMatrix);

		// console.log(this.texture.width)
		glMatrix.mat4.scale(this.textureMatrix, this.textureMatrix, [1.0 / this.texture.width, 1.0 / this.texture.height, 0.0]);
		glMatrix.mat4.translate(this.textureMatrix, this.textureMatrix, [uo * 1.0, vo * 1.0, 0.0]);
		glMatrix.mat4.scale(this.textureMatrix, this.textureMatrix, [w, h, 0.0]);
		gl.uniformMatrix4fv(this.textureLocation, false, this.textureMatrix);

		gl.uniform4fv(this.colorLocation, color);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	}

	render = (pos, w, h, uo, vo, color) => {
		this.objectMatrix = glMatrix.mat4.create();
		this.textureMatrix = glMatrix.mat4.create();

		glMatrix.mat4.translate(this.objectMatrix, this.objectMatrix, pos);
		glMatrix.mat4.scale(this.objectMatrix, this.objectMatrix, [w * 1.0, h * 1.0, 0.0]);
		gl.uniformMatrix4fv(this.transformLocation, false, this.objectMatrix);

		// console.log(this.texture.width)
		glMatrix.mat4.scale(this.textureMatrix, this.textureMatrix, [1.0 / this.texture.width, 1.0 / this.texture.height, 0.0]);
		glMatrix.mat4.translate(this.textureMatrix, this.textureMatrix, [uo * 1.0, vo * 1.0, 0.0]);
		glMatrix.mat4.scale(this.textureMatrix, this.textureMatrix, [w, h, 0.0]);
		gl.uniformMatrix4fv(this.textureLocation, false, this.textureMatrix);

		gl.uniform4fv(this.colorLocation, color);
		gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
	}

}

export { Quad };