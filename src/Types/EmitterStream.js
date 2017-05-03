const Particle = require('./Particle.js');

const PIXI = require('pixi.js');
const ParticleContainer = PIXI.particles.ParticleContainer;

class EmitterStream {

  constructor(_ratePS, _pos, _texture, _options) {
    this.rate = _ratePS;
    this.texture = _texture;
    this.alive = 0;
    this.faded = false;
    this.running = true;

    this.particles = [];

    this.pos = _pos;

    const options = (_options) || { };

    this.lifeTime = (options.hasOwnProperty('lifeTime')) ? options.lifeTime : 5;
    this.lifeFudge = (options.hasOwnProperty('lifeFudge')) ? options.lifeFudge : 1;
    this.alphaFudge = (options.hasOwnProperty('alphaFudge')) ? options.alphaFudge : 0.5;
    this.velocity = (options.hasOwnProperty('emitterVel')) ? options.emitterVel : { x: 0, y: 0 };
    this.particleVelocity =
      (options.hasOwnProperty('particleVelocity')) ? options.particleVelocity : { x: 0, y: 0 };
    this.particlePosFudge =
      (options.hasOwnProperty('particlePosFudge')) ? options.particlePosFudge : { x: 2, y: 2 };
    this.particleVelocityFudge =
      (options.hasOwnProperty('particleVelocityFudge')) ? options.particleVelocityFudge : {
        x: 5, y: 5,
      };
    this.fade = (options.hasOwnProperty('fade')) ? options.fade : true;


    this.container = new ParticleContainer(_ratePS * this.lifeTime * 2, {
      scale: true, position: true, rotation: false, uvs: false, alpha: true,
    }, _ratePS * this.lifeTime * 2);
    this.container.alpha = 1;

    this.container.interactive = false;
    this.container.interactiveChildren = false;

    this.neededTimeToNext = 1 / this.rate;
    this.timeToNext = 0;
  }

  update(_dT) {
    this.alive = this.count;

    this.timeToNext += _dT;

    if (this.running) {
      while (this.timeToNext >= this.neededTimeToNext) {
        const p = new Particle({
          x: (Math.random() - 0.5) * 2 * this.particlePosFudge.x,
          y: (Math.random() - 0.5) * 2 * this.particlePosFudge.y,
        }, this.texture, {
          lifeTime: this.lifeTime + (Math.random() - 0.5) * 2 * this.lifeFudge,
          fade: this.fade,
          velocity: {
            x: this.particleVelocity.x + (Math.random() - 0.5) * 2 * this.particleVelocityFudge.x,
            y: this.particleVelocity.y + (Math.random() - 0.5) * 2 * this.particleVelocityFudge.y,
          },
          startAlpha: 0.5 + Math.random() * this.alphaFudge,
        });

        this.particles.push(p);

        this.container.addChild(p.sprite);

        this.timeToNext -= this.neededTimeToNext;
      }
    }

    this.particles.forEach((_p) => {
      _p.update(_dT, this.pos);
    });

    this.particles = this.particles.filter((_p) => _p.alive);

    this.container.children = this.container.children.filter((_s) => _s.alpha > 0);

    if (this.alive < 0) {
      this.faded = true;
    }

    this.pos.x += this.velocity.x * _dT;
    this.pos.y += this.velocity.y * _dT;
  }
}

module.exports = EmitterStream;
