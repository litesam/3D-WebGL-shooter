import { gl } from './game.js';

class Texture {
	static load = (url, width, height) => {
		const img = new Image();
		const texture = gl.createTexture();
		img.addEventListener('load', function (e) {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		});
		img.src = url;
		return { img, width: img.width, height: img.height, texture };
	}
}

export { Texture };