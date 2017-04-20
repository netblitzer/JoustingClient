const Particle = require('./Particle.js');

const PIXI = require('PIXI');
const ParticleContainer = PIXI.particles.ParticleContainer;
const loader = PIXI.loader;
const TextureCache = PIXI.utils.TextureCache;

class Emitter {
  
  constructor (_count, _pos, _texture, options) {
    
    this.container = new ParticleContainer(_count, {true, true, true, false, true});
    
    this.particles = [ ];
    
    this.pos = _pos;
    
    this.lifeTime = (options.hasOwnProperty('lifeTime')) ? options.lifeTime : 5;
    this.fadeTime = (options.hasOwnProperty('fadeTime')) ? options.fadeTime : 5;
    this.lifeFudge = (options.hasOwnProperty('lifeFudge')) ? options.lifeFudge : 1;
    this.velocity = (options.hasOwnProperty('emitterVel')) ? options.emitterVel : {x: 0, y: 0};
    this.particleVelocity = (options.hasOwnProperty('particleVelocity')) ? options.particleVelocity : {x: 0, y: 0};
    this.particlePosFudge = (options.hasOwnProperty('particlePosFudge')) ? options.particlePosFudge : {x: 2, y: 2};
    this.particleVelocityFudge = (options.hasOwnProperty('particleVelocityFudge')) ? options.particleVelocityFudge : {x: 5, y: 5};
    this.repeat = (options.hasOwnProperty('repeat')) ? options.repeat : false;
    
    
    // check to see if the texture is loaded
      // if it's not, load it in then create the particles
    if (!TextureCache[_texture]) {
      loader.add(_texture)
            .load(createParticles);
    } else {
      createParticles();
    }
  };
  
  createParticles () {
    
  }
  
  update (_dT) {
    
  }
}

module.exports = Emitter;