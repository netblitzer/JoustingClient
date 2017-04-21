const Particle = require('./Particle.js');

const PIXI = require('pixi.js');
const ParticleContainer = PIXI.particles.ParticleContainer;
const loader = PIXI.loader;
const TextureCache = PIXI.utils.TextureCache;

class Emitter {
  
  constructor (_count, _pos, _texture, _options) {
    
    this.count = _count;
    this.texture = _texture;
    this.alive = _count;
    this.running = false;
    
    this.container = new ParticleContainer(_count, {scale: true, position: true, rotation: false, uvs: false, alpha: true}, _count);
    this.container.alpha = 1;
    
    this.container.interactive = false;
    this.container.interactiveChildren = false;
    
    this.particles = [ ];
    
    this.pos = _pos;
    
    const options = (_options) ? _options : { };
    
    this.lifeTime = (options.hasOwnProperty('lifeTime')) ? options.lifeTime : 5;
    this.fadeTime = (options.hasOwnProperty('fadeTime')) ? options.fadeTime : 5;
    this.lifeFudge = (options.hasOwnProperty('lifeFudge')) ? options.lifeFudge : 1;
    this.fadeFudge = (options.hasOwnProperty('fadeFudge')) ? options.fadeFudge : 1;
    this.velocity = (options.hasOwnProperty('emitterVel')) ? options.emitterVel : {x: 0, y: 0};
    this.particleVelocity = (options.hasOwnProperty('particleVelocity')) ? options.particleVelocity : {x: 0, y: 0};
    this.particlePosFudge = (options.hasOwnProperty('particlePosFudge')) ? options.particlePosFudge : {x: 2, y: 2};
    this.particleVelocityFudge = (options.hasOwnProperty('particleVelocityFudge')) ? options.particleVelocityFudge : {x: 5, y: 5};
    this.repeat = (options.hasOwnProperty('repeat')) ? options.repeat : false;
    
    this.createParticles();
  };
  
  createParticles () {
    
    for (let i = 0; i < this.count; i++) {
      
      const p = new Particle( {
        x: this.pos.x + (Math.random() - 0.5) * 2 * this.particlePosFudge.x,
        y: this.pos.y + (Math.random() - 0.5) * 2 * this.particlePosFudge.y,
      }, this.texture, {
        lifeTime: this.lifeTime + Math.random() * this.lifeFudge,
        fadeTime: this.fadeTime + Math.random() * this.fadeFudge,
        velocity: {
          x: this.particleVelocity.x + (Math.random() - 0.5) * 2 * this.particleVelocityFudge.x,
          y: this.particleVelocity.y + (Math.random() - 0.5) * 2 * this.particleVelocityFudge.y,
        },
      });
      
      this.particles[i] = p;
      
      this.container.addChild(p.sprite);
    }
  };
  
  update (_dT) {
    this.alive = this.count;
    
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update(_dT);
      if (!this.particles[i].alive) {
        this.alive--;
      }
    }
    
    if (this.alive <= 0) {
      this.running = true;
    }
    
    this.pos.x += this.velocity.x * _dT;
    this.pos.y += this.velocity.y * _dT;
  }
}

module.exports = Emitter;