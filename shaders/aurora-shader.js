Promise.all([
    fetch('shaders/hologram-vertex.glsl').then(res => res.text()),
    fetch('shaders/aurora-fragment.glsl').then(res => res.text())
]).then(([vertexShader, fragmentShader]) => {
    AFRAME.registerShader('aurora-shader', {
        schema: {
            iTime: { type: 'time', is: 'uniform' },
            iResolution: { type: 'vec2', is: 'uniform', default: '512 512' },
            iMouse: { type: 'vec2', is: 'uniform', default: '256 256' }
        },
        vertexShader,
        fragmentShader
    });

    AFRAME.registerComponent('aurora-animator', {
        init: function () {
            this.time = 0;
        },
        tick: function (time, timeDelta) {
            this.time = time / 1000; // Convert to seconds
            const material = this.el.getObject3D('mesh').material;
            if (material && material.uniforms) {
                if (material.uniforms.iTime) {
                    material.uniforms.iTime.value = this.time;
                }
                if (material.uniforms.iResolution) {
                    material.uniforms.iResolution.value.set(512, 512);
                }
                // iMouse is now static, no need to update it
            }
        }
    });
}); 