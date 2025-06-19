// ************* Texture Emissive component Start *************
AFRAME.registerComponent('custom-emissive-map', {
    schema: {
        src: { type: 'selector' }
    },

    init: function () {
        this.applied = false;
        this.applyEmissiveMap = this.applyEmissiveMap.bind(this);

        // Use a more reliable event combination
        this.el.addEventListener('loaded', this.applyEmissiveMap);
        this.el.addEventListener('object3dset', this.onObject3DSet.bind(this));
    },

    onObject3DSet: function (event) {
        // Only apply if it's the mesh object and we haven't applied yet
        if (event.detail.type === 'mesh' && !this.applied) {
            setTimeout(() => this.applyEmissiveMap(), 100);
        }
    },

    applyEmissiveMap: function () {
        if (this.applied) return;

        const el = this.el;
        const mesh = el.getObject3D('mesh');
        const srcEl = this.data.src;

        if (!mesh || !srcEl) return;

        // Wait a bit more to ensure the main texture is fully configured
        setTimeout(() => {
            try {
                const emissiveTexture = new THREE.TextureLoader().load(srcEl.getAttribute('src'));

                mesh.traverse(node => {
                    if (node.isMesh && node.material) {
                        const material = node.material;

                        // Ensure emissive texture is properly configured for repetition
                        emissiveTexture.wrapS = THREE.RepeatWrapping;
                        emissiveTexture.wrapT = THREE.RepeatWrapping;

                        if (material.map) {
                            // Copy all UV settings from the main texture
                            emissiveTexture.repeat.set(material.map.repeat.x, material.map.repeat.y);
                            emissiveTexture.offset.set(material.map.offset.x, material.map.offset.y);
                            emissiveTexture.wrapS = material.map.wrapS;
                            emissiveTexture.wrapT = material.map.wrapT;
                        } else {
                            // Check if there are repeat settings on the geometry/material attribute
                            const materialComponent = el.getAttribute('material');
                            if (materialComponent && materialComponent.repeat) {
                                const repeatValues = materialComponent.repeat.split(' ');
                                emissiveTexture.repeat.set(
                                    parseFloat(repeatValues[0]) || 1,
                                    parseFloat(repeatValues[1]) || 1
                                );
                            } else {
                                emissiveTexture.repeat.set(1, 1);
                            }
                        }

                        material.emissiveMap = emissiveTexture;
                        material.emissive = new THREE.Color(0xffffff);
                        material.needsUpdate = true;
                    }
                });

                this.applied = true;
            } catch (error) {
            }
        }, 200); // Increased delay to ensure main texture is ready
    },

    remove: function () {
        this.el.removeEventListener('loaded', this.applyEmissiveMap);
        this.el.removeEventListener('object3dset', this.onObject3DSet);
    }
});
// ************* Texture Emissive component End *************

