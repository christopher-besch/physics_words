"use strict";

let text = [{{ text }}];
let game_pieces = [];


function getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let idx = 0; idx < 6; idx++)
        color += letters[Math.floor(Math.random() * 10) + 3];
    return color;
}


// containing everything on canvas level
const GameArea = {
    // size
    width : window.innerWidth,
    height : window.innerHeight,
    // create canvas
    canvas : document.createElement("canvas"),

    // creating objects
    start : function(speed) {
        this.speed = speed;
        // size parameters
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        // set cursor to a cross hair
        this.canvas.style.cursor = "crosshair";

        this.context = this.canvas.getContext("2d");
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
        // set refresh rate and define callback
        this.interval = setInterval(updateGameArea, 1000 / 60);
        // add event listener to catch mouse presses
        this.canvas.addEventListener('mousedown', function (e) { clicked(e) });
        // same, just with for touchscreens
        this.canvas.addEventListener('touchstart', function (e) { clicked(e) });

        // debug
        console.log("canvas width: " + this.width);
        console.log("canvas height: " + this.height);
    },

    // clear screen
    clear : function(){
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};


function start_game() {
    let url_params = new URLSearchParams(window.location.search);

    let width;
    let height;
    let x_padding;
    let y_padding;
    let speed;

    // get parameters
    if (url_params.has("width"))
        width = Number(url_params.get("width"));
    else
        width = {{ default_cube_width }};

    if (url_params.has("height"))
        height = Number(url_params.get("height"));
    else
        height = {{ default_cube_height }};

    if (url_params.has("x_padding"))
        x_padding = Number(url_params.get("x_padding"));
    else
        x_padding = {{ default_x_padding }};

    if (url_params.has("y_padding"))
        y_padding = Number(url_params.get("y_padding"));
    else
        y_padding = {{ default_y_padding }};
    if (url_params.has("speed")) {
        speed = Number(url_params.get("speed"));
    }
    else
        speed = {{ default_speed }};

    // sum up heights of blocks + heights of separators between them
    let text_height = height * text.length + x_padding * (text.length - 1);
    
    // calculating the middle of the canvas minus half the text
    let start_y = (GameArea.height / 2) - (text_height / 2);
    
    // place blocks
    let idx = 0;
    for (let y = 0; y < text.length; y++) {
        for (let x = 0; x < text[y].length; x++) {
            if (text[y][x] === "#") {
                // the width might change from line to line
                let total_width = width * text[y].length + y_padding * (text[y].length - 1);
                let start_x = (GameArea.width / 2) - (total_width / 2);

                let posX = start_x + x * (width + x_padding);
                let posY = start_y + y * (height + y_padding);
                // funny block you can move around
                game_pieces[idx] = new Component(width, height, getRandomColor(), posX, posY);
                idx++;
            }
        }
    }

    console.log("text height: " + text_height);
    console.log("y start pos: " + start_y);
    console.log("speed: " + speed);

    // initiating start
    GameArea.start(speed);
}


function clicked(event) {
    let url_params = new URLSearchParams(window.location.search);
    
    console.log("click: " + event.pageX + "/" + event.pageY)


    // change speed of objects
    for (let idx = 0; idx < game_pieces.length; idx++) {
        // pythagoras FTW
        let distance = Math.abs(((game_pieces[idx].x - event.pageX) ** 2 + (game_pieces[idx].y - event.pageY) ** 2) ** 0.5);

        game_pieces[idx].speedX += GameArea.speed * 0.03125 * (game_pieces[idx].x - event.pageX) / distance;
        game_pieces[idx].speedY += GameArea.speed * 0.03125 * (game_pieces[idx].y - event.pageY) / distance;
    }
}


// function to create objects
function Component(width, height, color, x, y) {
    // size
    this.width = width;
    this.height = height;
    // speed
    this.speedX = 0;
    this.speedY = 0;
    // current position
    this.x = x;
    this.y = y;

    // update position
    this.update = function() {
        let context = GameArea.context;

        // set color
        context.fillStyle = color;

        // todo: better friction system
        // adding friction
        if (this.speedX > 0)
            this.speedX -= Math.abs(this.speedX / 100);
        else
            this.speedX += Math.abs(this.speedX / 100);

        if (this.speedY > 0)
            this.speedY -= Math.abs(this.speedY / 100);
        else
            this.speedY += Math.abs(this.speedY / 100);

        // calculating border coordinates
        let rightBorder = this.x + (this.width / 2);
        let leftBorder  = this.x - (this.width / 2);
        let bottom      = this.y + (this.height / 2);
        let top         = this.y - (this.height / 2);

        // todo: do this better somehow
        // when touching the right border
        if (rightBorder >= GameArea.width) {
            this.speedX = - this.speedX;
            this.x = GameArea.width - (this.width / 2);
        }
        // left border
        if (leftBorder <= 0) {
            this.speedX = - this.speedX;
            this.x = this.width / 2;
        }
        // bottom border
        if (bottom >= GameArea.height) {
            this.speedY = - this.speedY;
            this.y = GameArea.height - (this.height / 2);
        }
        // top border
        if (top <= 0) {
            this.speedY = - this.speedY;
            this.y = this.height / 2;
        }

        // calculate destination
        this.x += this.speedX;
        this.y += this.speedY;

        // draw object at destination
        context.fillRect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
    };
}


// updating the game area every new frame
function updateGameArea() {
    // clearing old objects on area
    GameArea.clear();

    // update all game objects
    for (let idx = 0; idx < game_pieces.length; idx++)
        game_pieces[idx].update();
}
