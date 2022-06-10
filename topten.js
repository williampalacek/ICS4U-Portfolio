
const colorMap = [
  '#1abc9c',
  '#3498db',
  '#9b59b6'
];

class Mover {
  color = color(random(colorMap));
  maxSpeed = 6;
  rotation: number;

  constructor(
    public position: p5.Vector = createVector(0, 0),
    public velocity: p5.Vector = createVector(0, 0),
    public acceleration: p5.Vector =  createVector(0, 0)
  ) {}

  update() {
    const mouse = createVector(mouseX, mouseY);

    this.acceleration = p5.Vector.sub(mouse, this.position);
    this.acceleration.setMag(0.2);

    this.velocity.add(this.acceleration);
    this.velocity.limit(this.maxSpeed);
    this.position.add(this.velocity);

    const vd = p5.Vector.sub(mouse, this.position);

    this.rotation = atan2(vd.y, vd.x);
  }

  draw() {
    push();
      translate(this.position.x, this.position.y);
      rotate(this.rotation);
      noStroke();
      rect(-20, -5, 20, 5);
      fill(this.color);
      rect(0, -5, 5, 5);
    pop();
  }
}

let movers: Mover[] = [];

function setup() {
  const { innerWidth, innerHeight } = window;

  createCanvas(innerWidth, innerHeight);
  
  for (let i = 0; i < 20; i += 1) {
    movers.push(new Mover(
      new p5.Vector(random(0, width), random(0, height))
    ));
  }
}

function draw() {
  background(33);

  movers.forEach((mover) => {
    mover.update();
    mover.draw();
  });
}

function windowResized() {
  const { innerWidth, innerHeight } = window;

  resizeCanvas(innerWidth, innerHeight);
}
