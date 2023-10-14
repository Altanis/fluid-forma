import Particle from "./particle";
import System from "./system";
import Vector from "./utils/vector";

export default class Physics
{
    public system: System;

    constructor(system: System)
    {
        this.system = system;
    };

    public smoothing_kernel(distance: number, radius: number) {
        if (distance >= radius) return 0;

        const v = (Math.PI * (radius ** 4)) / 6;
        return (radius - distance) ** 2 / v;
    };

    public smoothing_kernel_derivative(distance: number, radius: number) {
        if (distance >= radius) return 0;

        const v = 12 / (Math.PI * (radius ** 4));
        return (distance - radius) * v;
    };

    public viscosity_kernel(distance: number, radius: number) {
        if (distance >= radius) return 0;

        const v = (Math.PI * (radius ** 4)) / 6;
        return (radius - distance) * v;
    };

    // public smoothing_kernel(distance: number, radius: number) {
    //     const q = distance / radius;
    
    //     if (q >= 0 && q <= 1) {
    //         return (2 / 3) * (1 - 1.5 * q ** 2 + 0.75 * q ** 3) * 2;
    //     } else if (q > 1 && q <= 2) {
    //         return (1 / 6) * (2 - q) ** 3 * 2;
    //     } else {
    //         return 0;
    //     }
    // };

    
    // public smoothing_kernel(distance: number, radius: number) {
    //     const v = Math.PI * (radius ** 8) / 4;
    //     const e = Math.max(0, radius * radius - distance * distance);
    //     return e * e * e / v;
    // };
};