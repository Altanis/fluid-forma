import Vector from "./utils/vector";
import Particle from "./particle";
import Renderer from "./renderer";
import Physics from "./physics";

export default class System
{
    public particles: Particle[] = [];
    
    public width: number;
    public height: number;
    public viscosity: number;
    public surface_tension: number;
    public stiffness: number;
    public gravity: number;
    
    public mouse: Vector = new Vector(0, 0);
    public mouse_type: number = 0;
    public mouse_radius: number = 200;
    public mouse_strength: number = 1000;

    public particle_radius: number = 15;
    public restitution: number = 0.5;
    public smoothing_radius: number = 100;

    public rest_density: number = 4;

    public physics: Physics;

    public steps: number = 1;
    public renderer: Renderer | undefined;
    public zoom = 1;

    public world_performance: number = 0;

    constructor(
        width: number,
        height: number,
        stiffness: number,
        viscosity: number, 
        surface_tension: number,
        gravity: number,
        particle_count: number,
        steps: number,
        canvas?: HTMLCanvasElement
    )
    {
        this.width = width;
        this.height = height;
        this.surface_tension = surface_tension;
        this.stiffness = stiffness;
        this.viscosity = viscosity;
        this.gravity = gravity;
        this.steps = steps;

        this.physics = new Physics(this);

        // uniform grid of particles (column and row)
        const columns = Math.floor(Math.sqrt(particle_count));
        const rows = Math.floor(particle_count / columns);
        const spacing = this.particle_radius * 2;

        for (let i = 0; i < columns; ++i)
        {
            for (let j = 0; j < rows; ++j)
            {
                const x = (i * spacing) - (columns * spacing / 2);
                const y = (j * spacing) - (rows * spacing / 2);
                this.add_particle(new Vector(x, y), new Vector(0, 0));
            };
        };

        if (canvas) this.renderer = new Renderer(this, canvas);
    };

    public add_particle(position: Vector, velocity: Vector)
    {
        this.particles.push(new Particle(position, velocity, this));
        this.particles[this.particles.length - 1].id = this.particles.length - 1;
    };

    public update()
    {
        let time = performance.now();

        for (let i = 0; i < this.steps; ++i)
        {
            for (const particle of this.particles)
            {
                particle.update();
            };
        };

        time = performance.now() - time;
        this.world_performance = time;
    };
};