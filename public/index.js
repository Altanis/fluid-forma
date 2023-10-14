const { System, Particle, Vector, SpatialHashGrid } = window.FluidJS;
const _dat = window.dat.gui;

var gui = new _dat.GUI();

// Set default values
var defaultWidth = window.innerWidth * 2;
var defaultHeight = window.innerHeight * 2;
var defaultPressureConstant = 3000;
var defaultParticleRadius = 15;
var defaultNumParticles = 484;
var defaultGravity = 3;
var defaultRestitution = 0.5;
var defaultSmoothingRadius = 100;
var defaultRestDensity = 4;

var config = {
  width: defaultWidth,
  height: defaultHeight,
  pressureConstant: defaultPressureConstant,
  particleRadius: defaultParticleRadius,
  numParticles: defaultNumParticles,
  gravity: defaultGravity,
  restitution: defaultRestitution,
  smoothingRadius: defaultSmoothingRadius,
  restDensity: defaultRestDensity
};

gui.add(config, 'width', 0, window.innerWidth * 4).name('Width');
gui.add(config, 'height', 0, window.innerHeight * 4).name('Height');
gui.add(config, 'pressureConstant', 0, 5000).name('Pressure Constant');
gui.add(config, 'particleRadius', 1, 50).name('Particle Radius');
gui.add(config, 'numParticles', 100, 1000).name('# of Particles');
gui.add(config, 'gravity', 0, 10).name('Gravity');
gui.add(config, 'restitution', 0, 1).name('Restitution');
gui.add(config, 'smoothingRadius', 1, 200).name('Smoothing Radius');
gui.add(config, 'restDensity', 1, 10).name('Rest Density');

const WIDTH = window.innerWidth * 2;
const HEIGHT = window.innerHeight * 2;
const SURFACE_TENSION = -1;
const STIFFNESS = 3000;
const VISCOSITY = -1;
const PARTICLE_COUNT = 500;
const GRAVITY = 3;

const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth * window.devicePixelRatio;
canvas.height = window.innerHeight * window.devicePixelRatio;

const fps = document.getElementById('fps');
const worldUpdateRate = document.getElementById('tickRate');

const system = window.system = new System(WIDTH, HEIGHT, STIFFNESS, VISCOSITY, SURFACE_TENSION, GRAVITY, PARTICLE_COUNT, canvas);

function update() {
    system.update();
    fps.innerHTML = system.renderer.framerate.fps.toFixed(2);
    worldUpdateRate.innerHTML = `${(1000 / system.world_performance).toFixed(0)}Hz (${system.world_performance.toFixed(2)} ms)`;
    requestAnimationFrame(update.bind(system));
};
requestAnimationFrame(update.bind(system));

function update_config(config)
{
    system.width = config.width;
    system.height = config.height;
    system.stiffness = config.pressureConstant;
    
    if (system.particle_radius != config.particleRadius)
    {
        system.particle_radius = config.particleRadius;
        system.particles.forEach(particle => {
            particle.radius = config.particleRadius;
        });
    };
    
    if (config.numParticles != system.particles.length)
    {
        console.log(system.particles.length);
        const diff = config.numParticles - system.particles.length;
        if (diff > 0)
        {
            for (let i = 0; i < diff; i++)
            {
                system.add_particle(new Vector(0, 0), new Vector(0, 0));
            }
        }
        else
        {
            for (let i = 0; i < Math.abs(diff); i++)
            {
                system.particles.pop();
            }
        }  
    };

    system.gravity = config.gravity;
    system.restitution = config.restitution;
    system.smoothing_radius = config.smoothingRadius;
    system.rest_density = config.restDensity;
};

window.addEventListener("mousemove", (e) => {
    system.mouse = new Vector(
        (e.clientX * window.devicePixelRatio) - (canvas.width / 2) / system.zoom,
        (e.clientY * window.devicePixelRatio) - (canvas.height / 2) / system.zoom
    );
});

canvas.addEventListener('contextmenu', event => event.preventDefault());

window.addEventListener("mousedown", (e) => {
    // left click = attract, right click = repel
    system.mouse_type = e.button === 0 ? 1 : -1;
});

window.addEventListener("mouseup", (e) => {
    system.mouse_type = 0;
});

gui.__controllers.forEach(controller => {
    controller.onChange(() => {
      update_config(config);
    });
});