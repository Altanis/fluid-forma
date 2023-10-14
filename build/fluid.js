/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 296:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Vector = exports.System = exports.Particle = void 0;
const particle_1 = __importDefault(__webpack_require__(217));
exports.Particle = particle_1.default;
const system_1 = __importDefault(__webpack_require__(320));
exports.System = system_1.default;
const vector_1 = __importDefault(__webpack_require__(561));
exports.Vector = vector_1.default;
if (typeof window !== 'undefined') {
    /** @ts-ignore */
    window.FluidJS =
        {
            Particle: particle_1.default,
            System: system_1.default,
            Vector: vector_1.default
        };
}
;


/***/ }),

/***/ 217:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const vector_1 = __importDefault(__webpack_require__(561));
var MouseType;
(function (MouseType) {
    MouseType[MouseType["REPEL"] = -1] = "REPEL";
    MouseType[MouseType["NONE"] = 0] = "NONE";
    MouseType[MouseType["ATTRACT"] = 1] = "ATTRACT";
})(MouseType || (MouseType = {}));
;
class Particle {
    get pressure() { return this.system.stiffness * (this.density - this.system.rest_density); }
    ;
    constructor(position, velocity, system) {
        this.color = "#ffffff";
        this.mass = 1;
        this.density = 0;
        this.id = -1;
        this.position = position;
        this.velocity = velocity;
        this.radius = system.particle_radius;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
        this.system = system;
        this.compute_density();
    }
    ;
    compute_density() {
        this.density = 0;
        for (const particle of this.system.particles) {
            const distance = this.position.distance(particle.position);
            const influence = this.system.physics.smoothing_kernel(distance, this.system.smoothing_radius);
            this.density += particle.mass * influence;
        }
        ;
    }
    ;
    compute_pressure_force() {
        const pressure_force = new vector_1.default(0, 0);
        for (const particle of this.system.particles) {
            const distance = this.position.distance(particle.position);
            const influence = this.system.physics.smoothing_kernel_derivative(distance, this.system.smoothing_radius);
            const direction = this.position.direction(particle.position);
            const shared_pressure = (this.pressure + particle.pressure) / 2;
            pressure_force.add(direction.scale(shared_pressure / particle.density * influence));
        }
        ;
        return pressure_force;
    }
    ;
    oob() {
        const halfWidth = this.system.width / 2;
        const halfHeight = this.system.height / 2;
        if (this.position.x - this.radius < -halfWidth) {
            this.position.x = -halfWidth + this.radius;
            this.velocity.x *= -this.system.restitution;
        }
        else if (this.position.x + this.radius > halfWidth) {
            this.position.x = halfWidth - this.radius;
            this.velocity.x *= -this.system.restitution;
        }
        if (this.position.y - this.radius < -halfHeight) {
            this.position.y = -halfHeight + this.radius;
            this.velocity.y *= -this.system.restitution;
        }
        else if (this.position.y + this.radius > halfHeight) {
            this.position.y = halfHeight - this.radius;
            this.velocity.y *= -this.system.restitution;
        }
        ;
    }
    ;
    apply_forces() {
        // Gravity
        this.velocity.y += this.system.gravity;
        // Mouse
        if (this.system.mouse_type != MouseType.NONE) {
            // attract/repel particles without using influence, purely mouse_strength
            const distance = this.position.distance(this.system.mouse);
            if (distance < this.system.mouse_radius) {
                const direction = this.position.direction(this.system.mouse);
                const strength = this.system.mouse_strength * this.system.mouse_type * -1;
                const influence = strength / distance;
                this.velocity.add(direction.scale(influence));
            }
        }
        ;
    }
    ;
    update() {
        this.oob();
        this.compute_density();
        const pressure = this.compute_pressure_force();
        this.velocity.add(pressure).scale(0.25);
        this.apply_forces();
        this.position.add(this.velocity);
    }
    ;
    render(context) {
        const red = [255, 0, 0]; // RGB values for red
        const blue = [0, 0, 255]; // RGB values for blue
        const colorInterpolation = (factor) => {
            const result = [];
            for (let i = 0; i < 3; i++) {
                result[i] = Math.round(blue[i] + factor * (red[i] - blue[i]));
            }
            return result;
        };
        const colorFactor = this.density * 1000;
        const interpolatedColor = colorInterpolation(colorFactor);
        context.fillStyle = `rgb(${interpolatedColor[0]}, ${interpolatedColor[1]}, ${interpolatedColor[2]})`;
        context.beginPath();
        context.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
        context.fill();
        context.closePath();
    }
    ;
}
exports["default"] = Particle;
;


/***/ }),

/***/ 357:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Physics {
    constructor(system) {
        this.system = system;
    }
    ;
    smoothing_kernel(distance, radius) {
        if (distance >= radius)
            return 0;
        const v = (Math.PI * (Math.pow(radius, 4))) / 6;
        return Math.pow((radius - distance), 2) / v;
    }
    ;
    smoothing_kernel_derivative(distance, radius) {
        if (distance >= radius)
            return 0;
        const v = 12 / (Math.PI * (Math.pow(radius, 4)));
        return (distance - radius) * v;
    }
    ;
    viscosity_kernel(distance, radius) {
        if (distance >= radius)
            return 0;
        const v = (Math.PI * (Math.pow(radius, 4))) / 6;
        return (radius - distance) * v;
    }
    ;
}
exports["default"] = Physics;
;


/***/ }),

/***/ 419:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
class Renderer {
    constructor(system, canvas) {
        /** Data about framerates. */
        this.framerate = {
            /** The list of the last 30 framerates. */
            fpsArr: [],
            /** The average framerate. */
            fps: 0,
            /** The delta between frames. */
            dt: 0,
            /** The last time the framerate was updated. */
            lastUpdate: 0,
        };
        this.system = system;
        this.canvas = canvas;
        const ctx = this.canvas.getContext("2d");
        if (!ctx)
            throw new Error("Could not configure Renderer: Your browser does not support CanvasRenderingContext2D.");
        this.context = ctx;
        /** Ensure the canvas stays in bounds. */
        window.addEventListener("resize", () => {
            this.canvas.width = window.innerWidth * window.devicePixelRatio;
            this.canvas.height = window.innerHeight * window.devicePixelRatio;
        });
        window.dispatchEvent(new Event("resize"));
        requestAnimationFrame(this.render.bind(this));
    }
    ;
    /** Renders the system. */
    render() {
        /** Update framerate information. */
        this.framerate.dt = performance.now() - this.framerate.lastUpdate;
        this.framerate.lastUpdate = performance.now();
        if (this.framerate.fpsArr.length > 30)
            this.framerate.fpsArr.shift();
        this.framerate.fpsArr.push(this.framerate.dt);
        let avg = 0;
        for (const fps of this.framerate.fpsArr)
            avg += fps;
        this.framerate.fps = Math.round(1000 / (avg / this.framerate.fpsArr.length));
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.save();
        /** Render the background, boundaries, and grid. */
        this.context.fillStyle = "black";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.context.strokeStyle = "yellow";
        this.context.lineWidth = 1;
        /** Render the rectangle representing system boundaries. */
        this.context.beginPath();
        this.context.rect(this.canvas.width / 2 - this.system.width / 2, this.canvas.height / 2 - this.system.height / 2, this.system.width, this.system.height);
        this.context.stroke();
        /** Render the entities. */
        this.context.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.context.scale(this.system.zoom, this.system.zoom);
        for (const entity of this.system.particles) {
            if (!entity)
                continue;
            this.context.save();
            entity.render(this.context);
            this.context.restore();
        }
        ;
        /** Render the mouse. */
        // keep in mind the mouse is in world coordinates
        if (this.system.mouse_type != 0) {
            this.context.save();
            this.context.strokeStyle = this.system.mouse_type == 1 ? "green" : "red";
            this.context.lineWidth = 6;
            this.context.beginPath();
            this.context.arc(this.system.mouse.x, this.system.mouse.y, this.system.mouse_radius, 0, 2 * Math.PI);
            this.context.stroke();
            this.context.restore();
        }
        ;
        this.context.restore();
        // translate mouse position to world coordinates
        requestAnimationFrame(this.render.bind(this));
    }
    ;
}
exports["default"] = Renderer;


/***/ }),

/***/ 320:
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const vector_1 = __importDefault(__webpack_require__(561));
const particle_1 = __importDefault(__webpack_require__(217));
const renderer_1 = __importDefault(__webpack_require__(419));
const physics_1 = __importDefault(__webpack_require__(357));
class System {
    constructor(width, height, stiffness, viscosity, surface_tension, gravity, particle_count, canvas) {
        this.particles = [];
        this.mouse = new vector_1.default(0, 0);
        this.mouse_type = 0;
        this.mouse_radius = 200;
        this.mouse_strength = 1000;
        this.particle_radius = 15;
        this.restitution = 0.5;
        this.smoothing_radius = 100;
        this.rest_density = 4;
        this.zoom = 1;
        this.world_performance = 0;
        this.width = width;
        this.height = height;
        this.surface_tension = surface_tension;
        this.stiffness = stiffness;
        this.viscosity = viscosity;
        this.gravity = gravity;
        this.physics = new physics_1.default(this);
        // uniform grid of particles (column and row)
        const columns = Math.floor(Math.sqrt(particle_count));
        const rows = Math.floor(particle_count / columns);
        const spacing = this.particle_radius * 2;
        for (let i = 0; i < columns; ++i) {
            for (let j = 0; j < rows; ++j) {
                const x = (i * spacing) - (columns * spacing / 2);
                const y = (j * spacing) - (rows * spacing / 2);
                this.add_particle(new vector_1.default(x, y), new vector_1.default(0, 0));
            }
            ;
        }
        ;
        if (canvas)
            this.renderer = new renderer_1.default(this, canvas);
    }
    ;
    add_particle(position, velocity) {
        this.particles.push(new particle_1.default(position, velocity, this));
        this.particles[this.particles.length - 1].id = this.particles.length - 1;
    }
    ;
    update() {
        let time = performance.now();
        for (const particle of this.particles) {
            particle.update();
        }
        ;
        time = performance.now() - time;
        this.world_performance = time;
        // console.log(this.dt);
    }
    ;
}
exports["default"] = System;
;


/***/ }),

/***/ 561:
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
/** A vector in 2D space, represents a direction and magnitude simultaneously. */
class Vector {
    constructor(x, y) {
        /** The coordinates of the vector. */
        this.x = 0;
        this.y = 0;
        this.x = x;
        this.y = y;
    }
    /** Converts polar coordinates to Cartesian coordinates. */
    static toCartesian(r, theta) {
        return new Vector(r * Math.cos(theta), r * Math.sin(theta));
    }
    /** Adds to a vector. */
    add(vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }
    /** Subtracts from a vector. */
    subtract(vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    }
    addNotEq(vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    }
    ;
    subtractNotEq(vector) {
        return new Vector(this.x - vector.x, this.y - vector.y);
    }
    ;
    /** Scales from a vector. */
    scale(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }
    /** Normalizes the vector. */
    normalize() {
        const magnitude = this.magnitude;
        if (magnitude === 0)
            this.x = this.y = 0;
        else {
            this.x /= magnitude;
            this.y /= magnitude;
        }
        return this;
    }
    /** Gets the distance from another vector. */
    distance(vector) {
        return this.clone.subtract(vector).magnitude;
    }
    /** Gets the direction from another vector. */
    direction(vector) {
        return this.clone.subtract(vector).normalize();
    }
    ;
    /** Gets the dot product of two vectors. */
    dot(vector) {
        return this.x * vector.x + this.y * vector.y;
    }
    /** Gets the cross product of two vectors. */
    cross(vector) {
        return this.x * vector.y - this.y * vector.x;
    }
    /** Gets the projection of the current vector onto another vector. */
    project(vector) {
        if (vector.x === 0 && vector.y === 0)
            return new Vector(0, 0);
        return vector.clone.scale(this.dot(vector) / vector.magnitudeSq);
    }
    ;
    /** Creates a vector directionally orthogonal to the current vector. */
    get orthogonal() {
        return new Vector(-this.y, this.x);
    }
    /** Gets the angle of the vector from a reference point. */
    angle(reference = { x: 0, y: 0 }) {
        return Math.atan2(this.y - reference.y, this.x - reference.x);
    }
    /** Rotates the angle to a new angle. */
    rotate(angle) {
        const magnitude = this.magnitude;
        this.x = magnitude * Math.cos(angle);
        this.y = magnitude * Math.sin(angle);
        return this;
    }
    /** Gets the magnitude (length) of the vector. */
    get magnitude() {
        return Math.sqrt(this.magnitudeSq);
    }
    ;
    /** Sets the magnitude (length) of the vector. */
    set magnitude(magnitude) {
        const angle = this.angle();
        this.x = magnitude * Math.cos(angle);
        this.y = magnitude * Math.sin(angle);
    }
    ;
    /** Gets the squared magnitude of the vector. */
    get magnitudeSq() {
        return this.x * this.x + this.y * this.y;
    }
    ;
    /** Clones the vector. */
    get clone() {
        return new Vector(this.x, this.y);
    }
}
exports["default"] = Vector;
;


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(296);
/******/ 	
/******/ })()
;