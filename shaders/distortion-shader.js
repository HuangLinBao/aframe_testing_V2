Promise.all([
    fetch('shaders/hologram-vertex.glsl').then(res => res.text()),
    fetch('shaders/hologram-fragment.glsl').then(res => res.text())
]).then(([vertexShader, fragmentShader]) => {
    AFRAME.registerShader('hologram-shader', {
        schema: {
            iTime: { type: 'time', is: 'uniform' },
            iResolution: { type: 'vec2', is: 'uniform' },
            iChannel0: { type: 'map', is: 'uniform' }
        },
        vertexShader,
        fragmentShader
    });

    // Register a component to handle time animation
    AFRAME.registerComponent('hologram-time-animator', {
        init: function () {
            this.time = 0;
        },
        tick: function (time, timeDelta) {
            this.time = time / 1000; // Convert to seconds
            const material = this.el.getObject3D('mesh').material;
            if (material && material.uniforms && material.uniforms.iTime) {
                material.uniforms.iTime.value = this.time;
            }
        }
    });
});