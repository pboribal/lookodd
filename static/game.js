let [stageWidth, stageHeight] = [800, 600];

function World(worldData) {
  this.data = worldData;
  let {
    tadpole: { head, tailPieces },
  } = worldData;
  this.view = new createjs.Container();
  this.tailPieces = [];
  this.tadpole = new createjs.Shape();
  this.view.addChild(this.tadpole);
  const radius = 30;
  let { x, y } = this.data.tadpole.head;
  console.log(this.tadpole);
  this.tadpole.graphics.beginFill("red").drawCircle(x, y, radius);
  for (let direction of this.data.tadpole.tailPieces) {
    let [dx, dy] = [
      2 * radius * Math.cos(direction),
      2 * radius * Math.sin(direction),
    ];
    x += dx;
    y += dy;
    this.tadpole.graphics.beginFill("red").drawCircle(x, y, radius);
  }
  this.update();
}

World.prototype.updateLogic = function () {
  // game logic
  let {
    tadpole: { direction },
  } = this.data;
  let [dx, dy] = [Math.cos(direction), Math.sin(direction)];
  this.data.tadpole.head.x += dx;
  this.data.tadpole.head.y += dy;
};

World.prototype.updateView = function () {
  // view logic
  this.tadpole.x = this.data.tadpole.head.x;
  this.tadpole.y = this.data.tadpole.head.y;
  this.data.tadpole.direction += this.data.tadpole.dd;
};

World.prototype.update = function () {
  this.updateLogic();
  this.updateView();
};

World.prototype.heroInputHandler = function () {
  return (evt) => {
    let [mouseX, mouseY] = [evt.stageX, evt.stageY]; // always in bounds
    let mouseRX = mouseX / (1.0 * stageWidth);
    if (mouseRX > 2 / 3.0) {
      this.data.tadpole.dd = Math.PI / 180;
    } else if (mouseRX < 1 / 3.0) {
      this.data.tadpole.dd = -Math.PI / 180;
    } else {
      this.data.tadpole.dd = 0;
    }
    console.log(this.data.tadpole.direction);
  };
};

window.onload = () => {
  const stage = new createjs.Stage("demoCanvas");
  const world = new World({
    tadpole: {
      head: { x: 50, y: 50 },
      direction: 0,
      dd: 0,
      tailPieces: [
        Math.PI,
        Math.PI,
        Math.PI / 2,
        Math.PI / 2,
        (3 * Math.PI) / 4,
        (3 * Math.PI) / 4,
      ],
    },
  });
  stage.addChild(world.view);
  stage.on("stagemousemove", world.heroInputHandler());

  setInterval(() => {
    world.update();
    stage.update();
  }, 16);
};
