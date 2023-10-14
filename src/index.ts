import Particle from "./particle";
import System from "./system";
import Vector from "./utils/vector";

export { Particle, System, Vector };

if (typeof window !== 'undefined')
{
    /** @ts-ignore */
    window.FluidJS =
    {
        Particle,
        System,
        Vector
    };
};