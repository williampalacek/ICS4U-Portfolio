//boys move around randomly by noise
var Boy = function()
{
    //setting random starting position
    this.position = new PVector(random(width), random(height));
    
    //generating random starting point for noise
    this.tx = random(width);
    this.ty = random(height);
};

//function to make boys move
Boy.prototype.walk = function()
{
    //moving boys
    this.position.x = map(noise(this.tx), 0, 1, -400, width * 2);
    this.position.y = map(noise(this.ty), 0, 1, -400, height * 2);
    
    //increasing noise interval
    this.tx += 0.001;
    this.ty += 0.001;
    
    //returning boy position
    return this.position;
};

//function to display boys
Boy.prototype.display = function()
{
    //setting colours
    stroke(0);
    strokeWeight(2);
    fill(184, 87, 87);
    
    //drawing boys
    image(getImage("creatures/BabyWinston"), this.position.x, this.position.y, 20, 30);
};

//array to store boys
var boys = [];
for (var i = 0; i < 5; i++)
{
    boys[i] = new Boy(); 
}

//bigBoys chase the boys
var bigBoy = function()
{
    //setting random starting position
    this.position = new PVector(random(width), random(height));
    
    //setting velocity and accelaration to 0
    this.velocity = new PVector(0, 0);
    this.acceleration = new PVector(0, 0);
};

//function to move big boys
bigBoy.prototype.update = function(boyPos)
{
    //making big boys accelerate towards boys
    var dir = PVector.sub(boyPos, this.position);
    dir.normalize();
    dir.mult(0.1);
    this.acceleration = dir;
    this.velocity.add(this.acceleration);
    this.velocity.limit(2);
    this.position.add(this.velocity);
};

//function to display big boys
bigBoy.prototype.display = function()
{
    //setting colour
    stroke(0);
    strokeWeight(2);
    fill(64, 117, 173);
    
    //drawing big boys
    image(getImage("avatars/spunky-sam-red"),this.position.x, this.position.y, 45, 45);
};

//array to store big boys
var bigBoys = [];
for (var i = 0; i < 5; i++) {
    bigBoys[i] = new bigBoy(); 
}

//animating boys and big boys
draw = function() {
    background(255, 255, 255);
    
    //loop to run through all boys
    for (var j = 0; j < boys.length; j++)
    {
        boys[j].walk();
        boys[j].display(); 
    }
    
    //loop to run through all big boys
    for (var i = 0; i < bigBoys.length; i++) {
        bigBoys[i].update(boys[i].walk());
        bigBoys[i].display(); 
    }
};
