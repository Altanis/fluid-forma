import System from "./system";
import Vector from "./utils/vector";

enum MouseType
{
    REPEL = -1,
    NONE = 0,
    ATTRACT = 1
};

export default class Particle
{
    public position: Vector;
    public velocity: Vector;
    public color: string = "#ffffff";

    public mass: number = 1;
    public radius: number;
    public width: number;
    public height: number;

    public density: number = 0;
    public get pressure(): number { return this.system.stiffness * (this.density - this.system.rest_density); };

    public id: number = -1;

    public system: System;

    constructor(position: Vector, velocity: Vector, system: System)
    {
        this.position = position;
        this.velocity = velocity;
        this.radius = system.particle_radius;
        this.width = this.radius * 2;
        this.height = this.radius * 2;
    
        this.system = system;
        this.compute_density();
    };

    private compute_density()
    {
        this.density = 0;

        for (const particle of this.system.particles)
        {
            const distance = this.position.distance(particle.position);
            const influence = this.system.physics.smoothing_kernel(distance, this.system.smoothing_radius);
            this.density += particle.mass * influence;
        };
    };

    private compute_pressure_force()
    {
        const pressure_force = new Vector(0, 0);

        for (const particle of this.system.particles)
        {
            const distance = this.position.distance(particle.position);
            const influence = this.system.physics.smoothing_kernel_derivative(distance, this.system.smoothing_radius);
            const direction = this.position.direction(particle.position);

            const shared_pressure = (this.pressure + particle.pressure) / 2;
            pressure_force.add(direction.scale(shared_pressure / particle.density * influence));
        };

        return pressure_force;
    };

    private oob()
    {
        const halfWidth = this.system.width / 2;
        const halfHeight = this.system.height / 2;
    
        if (this.position.x - this.radius < -halfWidth)
        {
            this.position.x = -halfWidth + this.radius;
            this.velocity.x *= -this.system.restitution;
        }
        else if (this.position.x + this.radius > halfWidth)
        {
            this.position.x = halfWidth - this.radius;
            this.velocity.x *= -this.system.restitution;
        }
    
        if (this.position.y - this.radius < -halfHeight)
        {
            this.position.y = -halfHeight + this.radius;
            this.velocity.y *= -this.system.restitution;
        }
        else if (this.position.y + this.radius > halfHeight)
        {
            this.position.y = halfHeight - this.radius;
            this.velocity.y *= -this.system.restitution;
        };
    };    

    private apply_forces()
    {
        // Gravity
        this.velocity.y += this.system.gravity;

        // Mouse
        if (this.system.mouse_type != MouseType.NONE)
        {
            // attract/repel particles without using influence, purely mouse_strength
            const distance = this.position.distance(this.system.mouse);
            if (distance < this.system.mouse_radius)
            {
                const direction = this.position.direction(this.system.mouse);
                const strength = this.system.mouse_strength * this.system.mouse_type * -1;
                const influence = strength / distance;
                this.velocity.add(direction.scale(influence));
            }
        };
    };

    public update()
    {
        this.oob();

        this.compute_density();
        const pressure = this.compute_pressure_force();

        this.velocity.add(pressure).scale(0.25);
        this.apply_forces();

        this.position.add(this.velocity);
    };

    public render(context: CanvasRenderingContext2D)
    {
        const red = [255, 0, 0];  // RGB values for red
        const blue = [0, 0, 255];  // RGB values for blue
        
        const colorInterpolation = (factor: number) => {
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
    };
};