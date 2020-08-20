// Adapted from Flocking Processing example by Daniel Schiffman:
// http://processing.org/learning/topics/flocking.html
function randomColor() {
  return "#" + (0x1000000 + Math.random() * 0xffffff).toString(16).substr(1, 6);
}
var mouseLocation = new Point();
var Boid = Base.extend({
  initialize: function (position, maxSpeed, maxForce) {
    this.acceleration = new Point();
    this.vector = Point.random() * 2 - 1;
    this.position = position.clone();
    this.radius = 5;
    this.maxSpeed = maxSpeed;
    this.maxForce = maxForce;
    this.amount = 10;
    this.count = 0;
    this.color = "#bababa";
    this.score = 0;
    this.createItems();
  },

  run: function (boids, foods) {
    this.lastLoc = this.position.clone();
    this.checkFood(foods);
    this.borders();
    this.update();
    this.calculateTail();
    this.moveHead();
  },

  checkFood: function (foods) {
    for (var i = 0; i < foods.length; i++) {
      var food = foods[i];
      if (food.intersects(this.head)) {
        this.consume(food);
      }
    }
  },

  consume: function (food) {
    this.score += food.score;
    food.position = view.size * Point.random();
    this.repopulatePaths();
  },

  calculateTail: function () {
    var segments = this.path.segments,
      shortSegments = this.shortPath.segments;
    var speed = this.vector.length;
    var pieceLength = 5 + speed / 3;
    var point = this.position;
    segments[0].point = shortSegments[0].point = point;
    // Chain goes the other way than the movement
    var lastVector = -this.vector;
    for (var i = 1; i < this.amount; i++) {
      var vector = segments[i].point - point;
      this.count += speed * 10;
      var wave = Math.sin((this.count + i * 3) / 300);
      var sway = lastVector.rotate(90).normalize(wave);
      point += lastVector.normalize(pieceLength) + sway;
      segments[i].point = point;
      if (i < 3) shortSegments[i].point = point;
      lastVector = vector;
    }
    this.path.smooth();
  },

  createItems: function () {
    this.head = new Shape.Ellipse({
      center: [0, 0],
      size: [20, 12],
      fillColor: this.color,
    });

    this.path = new Path({
      strokeColor: this.color,
      strokeWidth: 6,
      strokeCap: "round",
    });

    this.shortPath = new Path({
      strokeColor: this.color,
      strokeWidth: 8,
      strokeCap: "round",
    });

    this.repopulatePaths();
  },

  repopulatePaths: function () {
    this.amount = Math.floor(10 + 0.2 * this.score);
    var shortAmount = Math.min(3, this.amount);
    if (this.amount < this.path.segments.length)
      this.path.segments.length = this.amount;
    else {
      while (this.amount > this.path.segments.length) {
        this.path.add(new Point());
      }
    }
    if (shortAmount < this.shortPath.segments.length)
      this.shortPath.segments.length = this.amount;
    else {
      while (shortAmount > this.shortPath.segments.length) {
        this.shortPath.add(new Point());
      }
    }
    this.calculateTail();
  },

  moveHead: function () {
    this.head.position = this.position;
    this.head.rotation = this.vector.angle;
    var scale = Math.log(Math.pow(Math.E, 3) + this.score) - 2;
    this.head.scaling = new Point(scale, scale);
  },

  update: function () {
    // Update velocity
    this.vector += this.acceleration;
    // Limit speed (vector#limit?)
    this.vector.length = Math.min(this.maxSpeed, this.vector.length);
    this.position += this.vector;
    // Reset acceleration to 0 each cycle
    this.acceleration = new Point();
  },

  seek: function (target) {
    this.acceleration += this.steer(target, false);
  },

  arrive: function (target) {
    this.acceleration += this.steer(target, true);
  },

  borders: function () {
    var vector = new Point();
    var position = this.position;
    var radius = this.radius;
    var size = view.size;
    if (position.x < -radius) vector.x = radius;
    if (position.y < -radius) vector.y = radius;
    if (position.x > size.width + radius) vector.x = -radius;
    if (position.y > size.height + radius) vector.y = -radius;
    if (!vector.isZero()) {
      this.position += vector;
      if (vector.x !== 0.0) {
        this.vector = new Point(-this.vector.x, this.vector.y);
      }
      if (vector.y !== 0.0) {
        this.vector = new Point(this.vector.x, -this.vector.y);
      }
      var segments = this.path.segments;
      for (var i = 0; i < this.amount; i++) {
        segments[i].point += vector;
      }
    }
  },

  // A method that calculates a steering vector towards a target
  // Takes a second argument, if true, it slows down as it approaches
  // the target
  steer: function (target, slowdown) {
    var steer,
      desired = target - this.position;
    var distance = desired.length;
    // Two options for desired vector magnitude
    // (1 -- based on distance, 2 -- maxSpeed)
    if (slowdown && distance < 100) {
      // This damping is somewhat arbitrary:
      desired.length = this.maxSpeed * (distance / 100);
    } else {
      desired.length = this.maxSpeed;
    }
    steer = desired - this.vector;
    steer.length = Math.min(this.maxForce, steer.length);
    return steer;
  },
});

var boids = [];
var foods = [];
var foodCount = 40;
// Populate Items In Depth Order
for (var i = 0; i < foodCount; i++) {
  var food = new Shape.Circle({
    center: view.size * Point.random(),
    radius: 4,
    fillColor: randomColor(),
    strokeColor: "#bababa",
    strokeWidth: 1,
  });
  food.score = 1;
  foods.push(food);
}
// Add the boids:
for (var i = 0; i < 1; i++) {
  var position = Point.random() * view.size;
  boids.push(new Boid(position, 14, 0.5));
}
var player = boids[0];

// Event Handlers
function onFrame(event) {
  player.seek(mouseLocation);
  player.run(boids, foods);
}

// Reposition the heart path whenever the window is resized:
function onResize(event) {
  // heartPath.fitBounds(view.bounds);
  // heartPath.scale(0.8);
}

function onMouseDown(event) {}

function onKeyDown(event) {
  if (event.key == "space") {
    var layer = project.activeLayer;
    layer.selected = !layer.selected;
    return false;
  }
}

function onMouseMove(event) {
  mouseLocation = new Point(event.event.clientX, event.event.clientY);
}
