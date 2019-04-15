var scene = new cc.Scene();

var root = new cc.Node();
var canvas = root.addComponent(cc.Canvas);
root.parent = scene;

// var node = new cc.Node();
// var label = node.addComponent(cc.Label);
// label.string = "Loading...";
// node.parent = root;

const logo = new cc.Node();
logo.width = 375;
logo.height = 667;
const icon = logo.addComponent(cc.Sprite);
icon.sizeMode = cc.Sprite.SizeMode.CUSTOM;

cc.loader.load('src/9300.jpg', (err, texture) => {
  if (err) {
    console.log(err);
    return;
  }
  icon.spriteFrame = new cc.SpriteFrame(texture);
})
logo.parent = root;

module.exports = scene;