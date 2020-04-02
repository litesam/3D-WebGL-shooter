import { gl } from './game.js';

export class Shader {
	constructor(vsCode, fsCode) {
		this.vsCode = vsCode;
		this.fsCode = fsCode;
		this.vShader = this.compile(this.vsCode, gl.VERTEX_SHADER);
		this.fShader = this.compile(this.fsCode, gl.FRAGMENT_SHADER);
		this.linkProgram(this.vShader, this.fShader);
	}

	compile = (code, type) => {
		const shader = gl.createShader(type);
		gl.shaderSource(shader, code);
		gl.compileShader(shader);

		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
		return shader;
	}

	linkProgram = (vShader, fShader) => {
		this.program = gl.createProgram();
		gl.attachShader(this.program, this.vShader);
		gl.attachShader(this.program, this.fShader);
		gl.linkProgram(this.program);

		if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) throw new Error(gl.getPrgramInfoLog(this.program));
	}
}

export const vsCode = `
precision highp float;

attribute vec3 a_pos;

uniform mat4 u_transform;
uniform mat4 u_camera;
uniform mat4 u_view;

void main() {
	gl_Position = u_view * u_camera * u_transform * vec4(a_pos, 1.0);
	// gl_Position = u_transform * vec4(a_pos, 1.0);
}
`.slice(1);
export const fsCode = `
precision highp float;

uniform vec4 u_color;

void main() {
	gl_FragColor = vec4(u_color.xyz, 1.0);
}
`.slice(1);