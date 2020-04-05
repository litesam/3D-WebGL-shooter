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
uniform mat4 u_texture;

varying vec2 v_texCoord;
varying float v_dist;

void main() {
	v_texCoord = (u_texture * vec4(a_pos, 1.0)).xy;
	vec4 pos = u_view * u_camera * u_transform * vec4(a_pos, 1.0);
	v_dist = pos.z / 1.5;
	gl_Position = pos;
}
`.slice(1);
export const fsCode = `
precision highp float;

uniform vec4 u_color;
uniform sampler2D uSampler;

varying vec2 v_texCoord;
varying float v_dist;

void main() {
	vec4 col = texture2D(uSampler, v_texCoord);
	if (col.a > 0.0) {
		float fog = 1.0 - v_dist;
		fog = fog * fog * fog;
		if (col.xyz != vec3(1.0, 0.0, 1.0))
			gl_FragColor = vec4((col * u_color).xyz * fog * vec3(0.8, 0.8, 0.8), 1.0);
			// gl_FragColor = col * u_color;
		else
			discard;
	} else {
		discard;
	}
}
`.slice(1);