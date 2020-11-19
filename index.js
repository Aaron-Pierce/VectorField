let canvasWidth;
let canvasHeight;

let vmin = Math.min(innerWidth / 100, innerHeight / 100);
function setup() {
    canvasWidth = innerWidth;
    canvasHeight = innerHeight;
    createCanvas(canvasWidth, canvasHeight);
}

// https://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}


let memo = {

}



function vectorFunction(vec) {
    let x = vec[0];
    let y = vec[1];
    // if(memo[x + "," + y]) return memo[x + "," + y];
    //x |-> sin(x) + y
    //y |-> sin(y) + x

    // let calcX = Math.sin(x) * y;
    // let calcY = Math.sin(y) * x;
    // memo[x + "," + y] = [calcX, calcY]
    // return [calcX, calcY];
    return [y * Math.cos(y), Math.cos(x*y)]
    return [Math.sin(x) + y, Math.sin(y) + x]
    // return [15 * x, 15 * y];
}

function length(vec) {
    return Math.sqrt(vec[0] ** 2 + vec[1] ** 2);
}

function normalize(vec) {
    let len = length(vec);
    return [vec[0] / len, vec[1] / len];
}

function colorFromLength(length) {
    // blue -> green -> red

    //an arbitrary value for what we consider long.
    const LONG_LENGTH = 9;

    return HSVtoRGB((230 / 360) - (Math.min(length / LONG_LENGTH, 1) * (230 / 360)), 250 / 360, 360 / 360);
}


let backgroundCanvas = new p5((sketch) => {
    sketch.setup = () => {
        sketch.createCanvas(innerWidth, innerHeight);
    }

    sketch.draw = () => {
        if (sketch.frameCount === 1) {
            if (DRAW_COORDINATE_PLANE) {
                //draw coordinate plane
                for (let i = 0; i <= NUM_SQUARES; i++) {
                    let screenX = i * WIDTH_OF_SQUARE + horizOffset;
                    let cartesianX = i - Math.floor(NUM_SQUARES / 2);
                    push();
                    if (cartesianX === 0) strokeWeight(3);
                    else stroke(255, 255, 255, 100)
                    line(screenX, vertOffset, screenX, vertOffset + NUM_SQUARES * WIDTH_OF_SQUARE);
                    pop();
                }

                for (let j = 0; j <= NUM_SQUARES; j++) {
                    let screenY = j * WIDTH_OF_SQUARE + vertOffset;
                    let cartesianY = j - Math.floor(NUM_SQUARES / 2);
                    push();
                    if (cartesianY === 0) strokeWeight(3);
                    line(horizOffset, screenY, horizOffset + NUM_SQUARES * WIDTH_OF_SQUARE, screenY);
                    pop();
                }
            }

            for (let i = 0; i < NUM_SQUARES; i++) {
                for (let j = 0; j < NUM_SQUARES; j++) {
                    let screenX = i * WIDTH_OF_SQUARE + horizOffset;
                    let screenY = j * WIDTH_OF_SQUARE + vertOffset;
                    let cartesianX = i - Math.floor(NUM_SQUARES / 2);
                    let cartesianY = j - Math.floor(NUM_SQUARES / 2);
                    cartesianY *= -1;
                    // text(`${cartesianX}, ${cartesianY}`, screenX, screenY, 50, 50)

                    let vec = vectorFunction([cartesianX, cartesianY]);
                    drawVector([screenX, screenY], vec, sketch)
                }
            }
        }
    }
}, document.getElementById("background"))

function drawVector(startPoint, vector, sketch) {

    // sketch.ellipse(50, 50, 50)

    let direction = normalize(vector);
    let len = length(vector);
    let color = colorFromLength(len);
    const SIZE = 15;
    let toDraw = [SIZE * direction[0], SIZE * direction[1]];
    sketch.push();
    sketch.stroke(...color)
    sketch.translate(...startPoint)
    // sketch.ellipse(0, 0, 50)

    //have to flip the y to convert from computer graphics to cartesian
    let angle = Math.atan2(-toDraw[1], toDraw[0]);

    sketch.rotate(angle)
    sketch.line(0, 0, SIZE, 0);
    sketch.line(SIZE, 0, 2 * SIZE / 3, -SIZE / 4)
    sketch.line(SIZE, 0, 2 * SIZE / 3, SIZE / 4)

    sketch.pop();
}


function cartesianToScreen([cartX, cartY]) {
    if (cartX < INTERVAL[0] || cartX > INTERVAL[1] || cartY < INTERVAL[0] || cartY > INTERVAL[1]) {
        return [-Infinity, -Infinity]
    }
    let positionAlongIntervalX = (cartX + Math.abs(INTERVAL[0])) / NUM_SQUARES;
    let positionAlongIntervalY = (cartY + Math.abs(INTERVAL[0])) / NUM_SQUARES;

    let screenX = horizOffset + Math.abs(positionAlongIntervalX * WIDTH_OF_SQUARE * NUM_SQUARES);
    let screenY = vertOffset + Math.abs(positionAlongIntervalY * WIDTH_OF_SQUARE * NUM_SQUARES);
    return [screenX, screenY]
}


const INTERVAL = [-8, 8];
const NUM_SQUARES = INTERVAL[1] - INTERVAL[0];
const WIDTH_OF_SQUARE = 80 * vmin / NUM_SQUARES;
const vertOffset = (window.innerHeight - (WIDTH_OF_SQUARE * NUM_SQUARES)) / 2
const horizOffset = (window.innerWidth - (WIDTH_OF_SQUARE * NUM_SQUARES)) / 2


const DRAW_COORDINATE_PLANE = false;

let boids = [];
const NUM_BOIDS = NUM_SQUARES;
for (let i = 0; i < NUM_BOIDS; i++) {
    for (let j = 0; j < NUM_BOIDS; j++) {
        let cartesianX = ((i / NUM_BOIDS) * NUM_SQUARES) - Math.abs(INTERVAL[0])
        let cartesianY = ((j / NUM_BOIDS) * NUM_SQUARES) - Math.abs(INTERVAL[0])

        boids.push({
            x: cartesianX,
            y: cartesianY,
            lastPos: [-Infinity, -Infinity],
            dead: false,
        })
    }
}


function draw() {
    background(33, 33, 33, 50);
    stroke(255);
    frameRate(60)
    fill(255);

    for (let boid of boids) {
        let pos = cartesianToScreen([boid.x, boid.y]);
        let vecAtPos = vectorFunction([boid.x, boid.y])

        if (pos[0] < horizOffset || pos[1] < vertOffset || pos[0] > horizOffset + NUM_SQUARES * WIDTH_OF_SQUARE || pos[1] > vertOffset + NUM_SQUARES * WIDTH_OF_SQUARE) {
                boid.x = Math.random() * NUM_SQUARES - Math.abs(INTERVAL[0]),
                boid.y = Math.random() * NUM_SQUARES - Math.abs(INTERVAL[0])
            continue;
        }
        boid.x -= vecAtPos[0] / 200;
        boid.y -= vecAtPos[1] / 200;

        push();
        strokeWeight(0.25)
        ellipse(...pos, 3)
        pop();
    }
}


function computeCurl(cartesianX, cartesianY){
    const NUDGE_SIZE = 0.001;
    let valueJustToLeft = vectorFunction([cartesianX - NUDGE_SIZE, cartesianY]);
    let valueJustToRight = vectorFunction([cartesianX + NUDGE_SIZE, cartesianY]);
    let valueJustAbove = vectorFunction([cartesianX, cartesianY + NUDGE_SIZE]);
    let valueJustBelow = vectorFunction([cartesianX, cartesianY - NUDGE_SIZE]);
    console.log(valueJustToRight[1] - valueJustToLeft[1]);

    let ypartialX = (valueJustToRight[1] - valueJustToLeft[1]) / (2*NUDGE_SIZE);
    let xpartialY = (valueJustAbove[0] - valueJustBelow[0]) / (2*NUDGE_SIZE);

    let curl = ypartialX - xpartialY;
    return curl;
}

function mousePressed(evt) {
    let cartesianX = (((evt.clientX - horizOffset) / (NUM_SQUARES * WIDTH_OF_SQUARE)) * NUM_SQUARES - Math.abs(INTERVAL[0]));
    let cartesianY = -1 * (((evt.clientY - vertOffset) / (NUM_SQUARES * WIDTH_OF_SQUARE)) * NUM_SQUARES - Math.abs(INTERVAL[0]));

    console.log(cartesianX, cartesianY, vectorFunction([cartesianX, cartesianY]));


    let xpartialX = (valueJustToRight[0] - valueJustToLeft[0]) / (NUDGE_SIZE * 2);
    let ypartialY = (valueJustAbove[1] - valueJustBelow[1]) / (NUDGE_SIZE * 2);

    let divergence = xpartialX + ypartialY;

    let curl = computeCurl(cartesianX, cartesianY)

    alert("Local Divergence: " + divergence + "\n" + "Local Curl: " + curl);
}