const Particle = require('./Particle.js');
const PIXI = require('pixi.js');

const ParticleContainer = PIXI.particles.ParticleContainer;

class Emitter {

  constructor(_count, _pos, _texture, _options) {
    this.count = _count;
    this.texture = _texture;
    this.alive = _count;
    this.running = false;

    this.container = new ParticleContainer(_count, {
      scale: true, position: true, rotation: false, uvs: false, alpha: true,
    }, _count);
    this.container.alpha = 1;

    this.container.interactive = false;
    this.container.interactiveChildren = false;

    this.particles = [];

    this.pos = _pos;

    const options = (_options) || { };

    this.lifeTime = (Object.prototype.hasOwnProperty.call(options, 'lifeTime')) ? options.lifeTime : 5;
    this.lifeFudge = (Object.prototype.hasOwnProperty.call(options, 'lifeFudge')) ? options.lifeFudge : 1;
    this.alphaFudge = (Object.prototype.hasOwnProperty.call(options, 'alphaFudge')) ? options.alphaFudge : 0.5;
    this.velocity = (Object.prototype.hasOwnProperty.call(options, 'emitterVel')) ? options.emitterVel : { x: 0, y: 0 };
    this.particleVelocity =
      (Object.prototype.hasOwnProperty.call(options, 'particleVelocity')) ? options.particleVelocity : { x: 0, y: 0 };
    this.particlePosFudge =
      (Object.prototype.hasOwnProperty.call(options, 'particlePosFudge')) ? options.particlePosFudge : { x: 2, y: 2 };
    this.particleVelocityFudge =
      (Object.prototype.hasOwnProperty.call(options, 'particleVelocityFudge')) ? options.particleVelocityFudge : {
        x: 5, y: 5,
      };
    this.fade = (Object.prototype.hasOwnProperty.call(options, 'fade')) ? options.fade : true;

    this.createParticles();
  }

  createParticles() {
    for (let i = 0; i < this.count; i++) {
      const p = new Particle({
        x: (Math.random() - 0.5) * 2 * this.particlePosFudge.x,
        y: (Math.random() - 0.5) * 2 * this.particlePosFudge.y,
      }, this.texture, {
        lifeTime: this.lifeTime + ((Math.random() - 0.5) * 2 * this.lifeFudge),
        fade: this.fade,
        velocity: {
          x: this.particleVelocity.x + ((Math.random() - 0.5) * 2 * this.particleVelocityFudge.x),
          y: this.particleVelocity.y + ((Math.random() - 0.5) * 2 * this.particleVelocityFudge.y),
        },
        startAlpha: 1 - (Math.random() * this.alphaFudge),
      });

      this.particles.push(p);

      this.container.addChild(p.sprite);
    }
  }

  update(_dT) {
    this.alive = this.count;

    this.particles.forEach((_p) => {
      _p.update(_dT, this.pos);
    });

    this.particles = this.particles.filter(_p => _p.alive);

    this.container.children = this.container.children.filter(_s => _s.alpha > 0);

    if (this.alive < 0) {
      this.faded = true;
    }

    this.pos.x += this.velocity.x * _dT;
    this.pos.y += this.velocity.y * _dT;
  }
}

module.exports = Emitter;
