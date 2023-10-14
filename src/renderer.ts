import System from "./system";
import Vector from "./utils/vector";

export default class Renderer {
    /** The system the renderer is rendering. */
    public system: System;
    /** The canvas the renderer is rendering on. */
    public canvas!: HTMLCanvasElement;
    /** The context of the canvas. */
    public context!: CanvasRenderingContext2D;

    /** Data about framerates. */
    public framerate = {
        /** The list of the last 30 framerates. */
        fpsArr: [] as number[],
        /** The average framerate. */
        fps: 0,
        /** The delta between frames. */
        dt: 0,
        /** The last time the framerate was updated. */
        lastUpdate: 0,
    };

    constructor(system: System, canvas: HTMLCanvasElement) {
        this.system = system;
        this.canvas = canvas;
        
        const ctx = this.canvas.getContext("2d");
        if (!ctx) throw new Error("Could not configure Renderer: Your browser does not support CanvasRenderingContext2D.");
        this.context = ctx;
        
        /** Ensure the canvas stays in bounds. */
        window.addEventListener("resize", () => {
            this.canvas.width = window.innerWidth * window.devicePixelRatio;
            this.canvas.height = window.innerHeight * window.devicePixelRatio;
        });
        window.dispatchEvent(new Event("resize"));

        requestAnimationFrame(this.render.bind(this));
    };

    /** Renders the system. */
    public render() {        
        /** Update framerate information. */
        this.framerate.dt = performance.now() - this.framerate.lastUpdate;
        this.framerate.lastUpdate = performance.now();

        if (this.framerate.fpsArr.length > 30) this.framerate.fpsArr.shift();
        this.framerate.fpsArr.push(this.framerate.dt);

        let avg = 0;
        for (const fps of this.framerate.fpsArr) avg += fps;
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
            if (!entity) continue;

            this.context.save();
            entity.render(this.context);
            this.context.restore();
        };

        /** Render the mouse. */
        // keep in mind the mouse is in world coordinates
        if (this.system.mouse_type != 0)
        {
            this.context.save();
            this.context.strokeStyle = this.system.mouse_type == 1 ? "green" : "red";
            this.context.lineWidth = 6;
            this.context.beginPath();
            this.context.arc(this.system.mouse.x, this.system.mouse.y, this.system.mouse_radius, 0, 2 * Math.PI);
            this.context.stroke();
            this.context.restore();
        };

        this.context.restore();

        // translate mouse position to world coordinates
        requestAnimationFrame(this.render.bind(this));
    };
}