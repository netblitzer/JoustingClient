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
    this.startAlpha = (options.hasOwnProperty('startAlpha')) ? options.startAlpha : 1;
    
    this.alpha = this.startAlpha;
    this.life = 0;
    this.alphaMod = this.startAlpha / this.lifeTime;
    
    this.alive = true;
  };
  
  update (_dT, _pos) {
    if (this.alive) {
      this.pos.x += this.velocity.x * _dT;
      this.pos.y += this.velocity.y * _dT;
      
      this.sprite.x = this.pos.x + _pos.x;
      this.sprite.y = this.pos.y + _pos.y;
      
      this.alpha -= Math.max(0, _dT * this.alphaMod);

      if (this.fade) {
        this.sprite.alpha = this.alpha;
      }
      
      this.sprite.scale.x = this.alpha;
      this.sprite.scale.y = this.alpha;
      
      this.life += _dT;
    
      if (this.life >= this.lifeTime) {
        this.alive = false;
      }
    }
    
    return this.alive;
  };
  
};

module.exports = Particle;