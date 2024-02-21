// importing sound effects
const introMusic = new Audio ("./Music/introSong.mp3");
const shootingSound = new Audio ("./Music/shoooting.mp3");
const killEnemySound = new Audio ("./Music/killEnemy.mp3");
const gameOverSound = new Audio ("./Music/gameOver.mp3");
const heavyWeaponSound = new Audio ("./Music/heavyWeapon.mp3");
const hugeWeaponSound = new Audio ("./Music/hugeWeapon.mp3");

introMusic.play();
// Basic Environment setup
const canvas = document.createElement("canvas");
document.querySelector(".myGame").appendChild(canvas);
canvas.width=innerWidth;
canvas.height=innerHeight;
const context = canvas.getContext("2d");
const lightweaponDamage = 10;
const heavyweaponDamage = 20;
let difficulty = 2;
const form = document.querySelector("form");
const scoreBoard = document.querySelector(".scoreBoard"); 
let playerscore = 0;

// Basic Functions

// Event Listener for Difficulty form
document.querySelector("input").addEventListener("click",(e)=>{
e.preventDefault();

// stoping intro music
introMusic.pause();

// Making form invisible
form.style.display = "none";
// Making ScoreBoard visible
scoreBoard.style.display = "block";

// getting difficulty selected by user
const userValue = document.getElementById("difficulty").value;

if(userValue === "Easy"){
    setInterval(spawnEnemy, 2000);
    return (difficulty = 5);
}
if(userValue === "Medium"){
    setInterval(spawnEnemy, 1400);
    return (difficulty = 8);
}
if(userValue === "Hard"){
    setInterval(spawnEnemy, 1000);
    return (difficulty = 10);
}
if(userValue === "Insane"){
    setInterval(spawnEnemy, 700);
    return (difficulty = 12);
  }
}); 

// Endgame

const gameoverLoader =() =>{

// creating endscreen div and play again button and high score element
const gameOverBanner = document.createElement("div");    
const gameOverBtn = document.createElement("button");    
const highscore = document.createElement("div");   

highscore.innerHTML = `High Score : ${
    localStorage.getItem("highScore") 
    ? localStorage.getItem("highScore")
    : playerscore
}`;

const oldHighScore = localStorage.getItem("highScore") && localStorage.getItem("highScore");

if(oldHighScore < playerscore){
    localStorage.setItem("highScore", playerscore);

    // updating high score html
    highscore.innerHTML = `High Score: ${playerscore}`;
}

// adding text to playagain button 
gameOverBtn.innerHTML = "Play Again";

gameOverBanner.appendChild(highscore);

gameOverBanner.appendChild(gameOverBtn);

// Making reload on clicking playagain button
gameOverBtn.onclick = () =>{
    window.location.reload();
};

gameOverBanner.classList.add("gameover");

document.querySelector("body").appendChild(gameOverBanner);
};


// ---------------------- Creating player, enemy, weapon, etc. classes ---------------------------------

// Setting player position to center

playerPosition = {
    x:canvas.width / 2, 
    y:canvas.height / 2,
}

// creating player class

class Player{
    constructor(x,y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color
    }
    draw() {
        context.beginPath();
        context.arc(
            this.x,
            this.y,
            this.radius,
            (Math.PI / 180) * 0,
            (Math.PI / 180) * 360,
            false
        );
        context.fillStyle = this.color;

        context.fill();
    }
}

// creating weapon class

class Weapon{
    constructor(x,y, radius, color, velocity, damage){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.damage = damage;
    }
    draw() {
        context.beginPath();
        context.arc(
            this.x,
            this.y,
            this.radius,
            (Math.PI / 180) * 0,
            (Math.PI / 180) * 360,
            false
        );
        context.fillStyle = this.color;
        context.fill();
    }
    update(){
        this.draw();
        this.x+=this.velocity.x;
        this.y+=this.velocity.y;
    }
}

// creating  hugeweapon class

class HugeWeapon{
    constructor(x,y){
        this.x = x;
        this.y = y;
        this.color = `rgba(47, 255, 0, 1)`;
    }
    draw() {
        context.beginPath();
        context.fillStyle = this.color;
        context.fillRect(this.x,this.y,200, canvas.height);
        context.fill();
    }
    update(){
        this.draw();
        this.x+= 20;
    }
}

// creating enemy class

class Enemy{
    constructor(x,y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity
    }
    draw() {
        context.beginPath();
        context.arc(
            this.x,
            this.y,
            this.radius,
            (Math.PI / 180) * 0,
            (Math.PI / 180) * 360,
            false
        );
        context.fillStyle = this.color;
        context.fill();
    }
    update(){
        this.draw();
       (this.x+=this.velocity.x),(this.y+=this.velocity.y)
    }
}


// creating particle class

const fraction = 0.98;
class Particle{
    constructor(x,y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1;
    }
    draw() {

        context.save();

        context.globalAlpha = this.alpha;
        context.beginPath();
        context.arc(
            this.x,
            this.y,
            this.radius,
            (Math.PI / 180) * 0,
            (Math.PI / 180) * 360,
            false
        );
        context.fillStyle = this.color;
        context.fill();
        context.restore();
    }
    update(){
        this.draw();
        this.velocity.x *= fraction;
        this.velocity.y *= fraction;

        this.x += this.velocity.x;
        this.y+=this.velocity.y;
        this.alpha -= 0.01;
        
    }
}

// ------------------------Main logic start here ----------------

// creating player object, weapon array, enemy array, etc array

const abhi = new Player( playerPosition.x, playerPosition.y, 15, "white");

const weapons = [];
const enemies = [];
const hugeweapon = [];
const particles = [];

// -------------------Function to spawn enemy at random location -----------------

const spawnEnemy = () =>{

    // generating random size for enemy 
    const enemySize = Math.random() * (40-5) + 5;

    // generating random color for enemy
    const enemyColor = `hsl(${Math.floor(Math.random()*360)}, 100%, 50%)`;

    // random enemy spawn position 
    let random;

// Making enemy location random but only from outside of screen    
if(Math.random() < 0.5){

    // Making X equal to very left off of screen or very right off of screen and setting Y to any where vertically
    random = {
    x: Math.random()< 0.5? canvas.width+enemySize: 0-enemySize,
    y: Math.random() * canvas.height
};
} else {
    // Making Y equal to very up off of screen or very right off of screen and setting X to any where horizontally
    random = {
        x: Math.random() * canvas.width,
        y: Math.random()< 0.5? canvas.height+enemySize: 0-enemySize,
    };
}


// Finding angle between center (means player position) and enemy position 
const myAngle = Math.atan2(
    canvas.height/2 - random.y,
    canvas.width/2 - random.x
    );

// Making velocity or speed of enemy by multipling chosen difficulty to radian 
const velocity={
    x: Math.cos(myAngle) * difficulty,
    y: Math.sin(myAngle) * difficulty,
    };

// Adding enemy to enemies array
    enemies.push(new Enemy(random.x, random.y, enemySize, enemyColor, velocity))
}


// ------------------------ Creating  Animation Function -----------------------

let animationId;
function animation (){
    // Making recursion 
    animationId = requestAnimationFrame(animation);

    // updating player score in score board in html
    scoreBoard.innerHTML = `score : ${playerscore}`;

    // Clearing canvas on each frame
    context.fillStyle = `rgba(49, 49, 49, 0.2)`;
    context.fillRect(0, 0, canvas.width, canvas.height)
    
    // Drawing player
    abhi.draw();


    // generating particles
    particles.forEach((particle, particleIndex)  =>{
        if(particle.alpha <= 0){
            particles.splice(particleIndex, 1)
        } else{
            particle.update();
        }
        particle.update();
    });

    // generating huge weapon
    hugeweapon.forEach((hugeweapons, hugeweaponIndex) =>{
        if(hugeweapons.x > canvas.width){
            hugeweapon.splice(hugeweaponIndex, 1)
        }
        else{
            hugeweapons.update();
        }
    })
    

    // Generation Bullets
    weapons.forEach((weapon, weaponIndex) => {
        weapon.update();

    // removing weapons if they are off screen
    if(weapon.x + weapon.radius < 1 ||
       weapon.y + weapon.radius < 1 ||
       weapon.x - weapon.radius > canvas.width || 
       weapon.y - weapon.radius > canvas.height){
        weapons.splice(weaponIndex, 1);
        }
    }); 


    // Genrating enemies
    enemies.forEach((enemy, enemyIndex) => {
        enemy.update();

        // finding distance betweeen player and enemy
        const distanceBetweenPlayerAndEnemy = Math.hypot(
            abhi.x - enemy.x,
            abhi.y-enemy.y
        ); 

        // stoping game if enemy hit player
        if(distanceBetweenPlayerAndEnemy - abhi.radius - enemy.radius < 1){
            cancelAnimationFrame(animationId);
            gameOverSound.play();
            hugeWeaponSound.pause();
            shootingSound.pause();
            heavyWeaponSound.pause();
            killEnemySound.pause();
            return gameoverLoader();
        }

        hugeweapon.forEach((hugeweapon)=>{

            // finding distance between huge weapon and enemy 

            const distanceBetweenhugeweaponandenemy = hugeweapon.x - enemy.x;

            if(
               distanceBetweenhugeweaponandenemy <= 200 &&
               distanceBetweenhugeweaponandenemy >= -200
              ) {
                // increasing player score when killing one enemy
                playerscore += 10;
                setTimeout(() => {
                   hugeWeaponSound.play();
                    enemies.splice(enemyIndex, 1);  
                  }, 0);
            }
        });
      
        weapons.forEach((weapon, weaponIndex)=>{

            // finding distance between weapon and enemy
            const distanceBetweenWeaponAndEnemy = Math.hypot(
                weapon.x - enemy.x,
                weapon.y-enemy.y
            );

    if(distanceBetweenWeaponAndEnemy - weapon.radius - enemy.radius < 1) {


               // reducing size of enemy on hit
                if(enemy.radius > weapon.damage + 5){
                 gsap.to(enemy,{
                    radius: enemy.radius - weapon.damage,   
                 })
                 weapons.splice(weaponIndex, 1);
                 setTimeout(() => {
                    weapons.splice(weaponIndex, 1);  
                  }, 0);
                }
                
                // removing enemy on hit if they are below 18
                else{
                     for (let i = 0; i < enemy.radius * 2; i++){
                        particles.push(
                            new Particle(weapon.x, weapon.y, Math.random() * 2, enemy.color,{
                            x:(Math.random() - 0.5) * (Math.random() * 7),
                            y:(Math.random() - 0.5) * (Math.random() * 7),
                        })
                       );    
                     }         
                    
                     // increasing player score when killing one enemy
                    playerscore += 10;
                    
                    // rendering player score in scoreboard html element
                    scoreBoard.innerHTML = `Score : ${[playerscore]}`;
                    
                    setTimeout(() => {
                      killEnemySound.play();
                      enemies.splice(enemyIndex, 1);
                      weapons.splice(weaponIndex, 1);  
                    }, 0);
                }
            }
        });
    });
}

// ---------------------Adding Event Listeners --------------------------

// event listener for light weapon aka left click
canvas.addEventListener("click", (e)=>{

    shootingSound.play();

    // finding angle between player position(center) and click co-ordinates
    const myAngle = Math.atan2(
        e.clientY-canvas.height/2,
        e.clientX-canvas.width/2
    );
    
    // Making const speed for light weapon
    const velocity={
        x: Math.cos(myAngle) * 6,
        y: Math.sin(myAngle) * 6,
    };

    // Adding light weapon in weapons array
    weapons.push(
        new Weapon(
        canvas.width/2, 
        canvas.height/2,
        6, 
        "white",
        velocity,
        lightweaponDamage)
        );   
});


// event listener for heavy weapon aka right click

canvas.addEventListener("contextmenu", (e)=>{
    e.preventDefault();

    

    if(playerscore <= 0) return;
    heavyWeaponSound.play();

    // decreasing player score for using heavy weapon
    playerscore -= 2;
    // updating player score in score board in html
    scoreBoard.innerHTML = `score : ${playerscore}`;

    // finding angle between player position(center) and click co-ordinates
    const myAngle = Math.atan2(
        e.clientY-canvas.height/2,
        e.clientX-canvas.width/2
    );
    
    // Making const speed for light weapon
    const velocity={
        x: Math.cos(myAngle) * 3,
        y: Math.sin(myAngle) * 3,
    };

    // Adding light weapon in weapons array
    weapons.push(
        new Weapon(
        canvas.width/2, 
        canvas.height/2,
        30, 
        "cyan",
        velocity,
        heavyweaponDamage)
    );   
});

addEventListener("keypress",(e)=>{
    if(e.key===" "){

        if(playerscore < 20) return;
        // decreasing player score for using huge weapon
        playerscore -= 20;
        // updating player score in score board in html
        scoreBoard.innerHTML = `score : ${playerscore}`;
        hugeWeaponSound.play();
        hugeweapon.push(
            new HugeWeapon(
            0,0,)
        );  
    }
});

addEventListener("contextmenu",(e)=>{
   e.preventDefault()
});

addEventListener("resize",()=>{
    window.location.reload();
})

animation();
