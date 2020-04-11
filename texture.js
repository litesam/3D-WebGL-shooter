import { gl } from './game.js';

class Texture {
	constructor() {
		this.img = null;
		this.width = 1;
		this.height = 1;
		this.texture = null;
		this.loaded = false;
	}

	static load = (url) => {
		const tex = new Texture();
		tex.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex.texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tex.width, tex.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, tex.img);	
		tex.img = new Image();
		tex.img.addEventListener('load', () => {
			tex.width = tex.img.width;
			tex.height = tex.img.height;
			gl.bindTexture(gl.TEXTURE_2D, tex.texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, tex.width, tex.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, tex.img);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			tex.loaded = true;
		});
		tex.img.src = url;
		return tex;
	}
}

export { Texture };