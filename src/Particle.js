const PIXI = require('PIXI');
const Sprite = PIXI.Sprite;

class Particle {
  
  constructor (_pos, _texture, options) {
    
    this.pos = _pos;
    
    this.texture = _texture;
    
    this.sprite = Sprite(_texture);
    
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
    
    this.sprite.x = _pos.x;
    this.sprite.y = _pos.y;
    
    this.lifeTime = (options.hasOwnProperty('lifeTime')) ? options.lifeTime : 5;
    this.fadeTime = (options.hasOwnProperty('fadeTime')) ? options.fadeTime : 5;
    this.velocity = (options.hasOwnProperty('velocity')) ? options.velocity : {x: Math.random() * 10 - 5, y: Math.random() * 10 - 5};
    
    this.alpha = 1;
    this.life = 0;
    
    this.alive = true;
  }
  
  update (_dT) {
    this.sprite.x += this.velocity.x * _dT;
    this.sprite.y += this.velocity.y * _dT;
    
    this.alpha -= Math.max(0, _dT / this.fadeTime);
    this.life += _dT;
    
    if (this.life >= this.lifeTime) {
      this.alive = false;
    }
  }
  
}

module.exports = Particle;