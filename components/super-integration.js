// Super-Integration Component
// Handles event emission for grabbable and stretchable entities
// Works with handy-controls and super-hands

AFRAME.registerComponent('super-integration', {
    schema: {
        rightRay: { type: 'selector' },
        leftRay: { type: 'selector' },
        debug: { type: 'boolean', default: true }
    },

    init: function () {
        this.rightRay = this.data.rightRay;
        this.leftRay = this.data.leftRay;

        // Track stretch state
        this.stretchState = {
            leftHandIntersecting: false,
            rightHandIntersecting: false,
            isStretching: false,
            activeStretchEntity: null
        };

        this.log('Super-integration component initialized');

        // Wait for DOM to be ready then set up
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setup());
        } else {
            this.setup();
        }
    },

    setup: function () {
        this.setupGrabbableEntities();
        this.setupStretchableEntities();
        this.log('Setup complete - monitoring grabbable and stretchable entities');
    },

    setupGrabbableEntities: function () {
        const grabbableEntities = document.querySelectorAll('.grabbable');
        this.log(`Found ${grabbableEntities.length} grabbable entities`);

        grabbableEntities.forEach(entity => {
            this.setupGrabEvents(entity);
        });
    },

    setupGrabEvents: function (entity) {
        const self = this;

        // Mouse down - trigger grab-start
        entity.addEventListener('mousedown', function (event) {
            const activeHand = self.findIntersectingHand(entity);

            if (activeHand) {
                entity.emit('grab-start', {
                    hand: activeHand,
                    buttonEvent: event
                });

                self.log(`Grab-start emitted for ${entity.id} by ${activeHand.id}`);
            }
        });

        // Mouse up - trigger grab-end
        entity.addEventListener('mouseup', function (event) {
            const grabbableComponent = entity.components.grabbable;
            let activeHand = null;

            // Try to get hand from grabbable component, fallback to intersection check
            if (grabbableComponent && grabbableComponent.grabbers && grabbableComponent.grabbers.length > 0) {
                activeHand = grabbableComponent.grabbers[0];
            } else {
                activeHand = self.findIntersectingHand(entity);
            }

            if (activeHand) {
                entity.emit('grab-end', {
                    hand: activeHand,
                    buttonEvent: event
                });

                self.log(`Grab-end emitted for ${entity.id} by ${activeHand.id}`);
            }
        });

        this.log(`Grab events set up for: ${entity.id}`);
    },

    setupStretchableEntities: function () {
        const stretchableEntities = document.querySelectorAll('.stretchable');
        this.log(`Found ${stretchableEntities.length} stretchable entities`);

        stretchableEntities.forEach(entity => {
            this.setupStretchEvents(entity);
        });
    },

    setupStretchEvents: function (entity) {
        const self = this;

        // Mouse down - trigger stretch-start
        entity.addEventListener('mousedown', function (event) {
            self.updateIntersectionState(entity);

            const activeHand = self.findIntersectingHand(entity);

            if (activeHand && !self.stretchState.isStretching) {
                self.stretchState.isStretching = true;
                self.stretchState.activeStretchEntity = entity;

                entity.emit('stretch-start', {
                    hand: activeHand,
                    secondHand: activeHand === self.rightRay ? self.leftRay : self.rightRay,
                    buttonEvent: event
                });

                self.log(`Stretch-start emitted for ${entity.id} by ${activeHand.id}`);
            }
        });

        // Mouse up - trigger stretch-end
        entity.addEventListener('mouseup', function (event) {
            if (self.stretchState.isStretching && self.stretchState.activeStretchEntity === entity) {
                self.stretchState.isStretching = false;
                self.stretchState.activeStretchEntity = null;

                const activeHand = self.findIntersectingHand(entity);

                entity.emit('stretch-end', {
                    hand: activeHand || self.rightRay,
                    buttonEvent: event
                });

                self.log(`Stretch-end emitted for ${entity.id}`);
            }
        });

        this.log(`Stretch events set up for: ${entity.id}`);
    },

    findIntersectingHand: function (entity) {
        // Check right hand first
        if (this.rightRay && this.rightRay.components.raycaster) {
            if (this.rightRay.components.raycaster.intersectedEls.includes(entity)) {
                return this.rightRay;
            }
        }

        // Check left hand
        if (this.leftRay && this.leftRay.components.raycaster) {
            if (this.leftRay.components.raycaster.intersectedEls.includes(entity)) {
                return this.leftRay;
            }
        }

        // Fallback to right hand
        return this.rightRay;
    },

    updateIntersectionState: function (entity) {
        if (this.rightRay && this.rightRay.components.raycaster) {
            this.stretchState.rightHandIntersecting =
                this.rightRay.components.raycaster.intersectedEls.includes(entity);
        }

        if (this.leftRay && this.leftRay.components.raycaster) {
            this.stretchState.leftHandIntersecting =
                this.leftRay.components.raycaster.intersectedEls.includes(entity);
        }
    },

    log: function (message) {
        if (this.data.debug) {
            console.log('🔗 SUPER-INTEGRATION:', message);
            if (window.addDebugMessage) {
                window.addDebugMessage('🔗 ' + message);
            }
        }
    },

    // Method to add new grabbable entities dynamically
    addGrabbableEntity: function (entity) {
        if (entity.classList.contains('grabbable')) {
            this.setupGrabEvents(entity);
            this.log(`Dynamically added grabbable: ${entity.id}`);
        }
    },

    // Method to add new stretchable entities dynamically
    addStretchableEntity: function (entity) {
        if (entity.classList.contains('stretchable')) {
            this.setupStretchEvents(entity);
            this.log(`Dynamically added stretchable: ${entity.id}`);
        }
    }
});

console.log('🔗 Super-integration component loaded!'); 