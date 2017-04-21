const PIXI = require('pixi.js');
const Sprite = PIXI.Sprite;
const resources = PIXI.loader.resources;

class Particle {
  
  constructor (_pos, _texture, options) {
    
    this.pos = _pos;
    
    this.texture = _texture;
    
    this.sprite = new Sprite(resources[_texture].texture);
    
    this.sprite.anchor.x = 0.5;
    this.sprite.anchor.y = 0.5;
    
    this.sprite.x = _pos.x;
    this.sprite.y = _pos.y;
    
    this.lifeTime = (options.hasOwnProperty('lifeTime')) ? options.lifeTime : 5;
    this.fade = (options.hasOwnProperty('fade')) ? options.fade : true;
    this.velocity = (options.hasOwnProperty('velocity')) ? options.velocity : {x: Math.random() * 5 - 10, y: Math.random() * 5 - 10};
    
    this.alpha = 1;
    this.life = 0;
    
    this.alive = true;
  }
  
  update (_dT) {
    if (this.alive) {
      this.sprite.x += this.velocity.x * _dT;
      this.sprite.y += this.velocity.y * _dT;
      
      this.alpha -= Math.max(0, _dT / this.lifeTime);

      if (this.fade) {
        this.sprite.alpha = this.alpha;
      }
      
      this.sprite.scale.x = this.alpha;
      this.sprite.scale.y = this.alpha;
      
      this.life += _dT;
    }
    
    if (this.life >= this.lifeTime) {
      this.alive = false;
    }
  }
  
}

module.exports = Particle;