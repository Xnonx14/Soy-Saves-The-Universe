var game = new Phaser.Game(800, 800, Phaser.AUTO, '', { preload: preload, create: create, update: update });
var music;

var titleScreen;
var gameStarted;
var score;
var scoreText;
var healthBack;
var healthFore;
var mrBeanGoLeft;
var promptVisible;
var emitter;
var isGGPrompted;
var ggPrompt;
var isRestart;
var animInProgress;

var ship;

var fireRate;
var nextFireTime;
var projectiles;
var shipProjectiles;
var soyBottles;
var soyMilks;
var soyBeans;
var isDead;
var pelletPtr;
var finalBoss;
var bossCount;

var enemies;
var enemySpawnTimer;
var enemyCount;
var enemyProjectiles

var cursors;
var spaceKey;

var bosses;
var bossSpawnTimer;
var bossProjectiles;
var bosstype;

var healthDrops;
var burpSound;
var guntype;
var powerups;

function preload() {
    game.load.spritesheet('ship', 'assets/Ship.png', 64, 64);
    game.load.image('sky', 'assets/space_background.png');
    game.load.image('soybean', 'assets/soybean.png');
    //game.load.image('soymilk', 'assets/sky.png');
	game.load.image('colShip', 'assets/collisionShip.png');
    game.load.image('soybottle', 'assets/Ship_Projectile.png');
    game.load.audio('soy_song', 'assets/soy_sonata.wav');
	game.load.audio('burp', 'assets/BURP.wav');
	
	game.load.image('health_fore', 'assets/Health_Foreground.png');
    game.load.image('health_back', 'assets/Health_Background.png');
    game.load.image('mana_fore', 'assets/ManaFront.png');
    game.load.image('mana_back', 'assets/ManaBack.png');

    game.load.image('burger', 'assets/Burger_Enemy.png');
	game.load.image('burger_projectile', 'assets/Burger_Projectile.png');

    game.load.image('fries_projectile','assets/fries_projectile.png')
    game.load.image('fry_boss','assets/fry_boss.png')
	
	game.load.image('hotdog', 'assets/HotDog.png');
	game.load.image('hotdog_projectile', 'assets/HotDog_Projectile.png');

	
    game.load.spritesheet('mrbean', 'assets/mrbeansprite.png', 200, 221);
    game.load.image('titlescreen', 'assets/title_screen.png');
    game.load.image('soylent', 'assets/soylent.png');
	
	game.load.image('health', 'assets/Item_Health.png');

	game.load.spritesheet('boss_1', 'assets/BOSS.png', 130, 183);
    game.load.spritesheet('boss_2', 'assets/Wendy_Boss.png', 256, 256);
	game.load.image('boss_3', 'assets/salt_bae.png');

	game.load.image('tripleshot', 'assets/TripleGunDrop.png');
	
	game.load.image('salt','assets/salt.png')

	game.load.image('gg', 'assets/game_over.png');
}

function create(){
    //initialize variables
    gameStarted = false;
	isDead = false;
    fireRate = 100;
    nextFireTime = 0;
    enemyCount = 0;
	score = 0;
    promptVisible = true;
	isGGPrompted = false;
	isRestart = false;
	animInProgress = false;
	finalBoss = false;
	bossCount = 0;
	bosstype = 0;
	guntype = 0;

    //add music
    music = game.add.audio('soy_song');
    music.loop = true;
    music.play();

	burpSound = game.add.audio('burp');
    //enable physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //add background
     background = game.add.sprite(0, 0, 'sky');
     background.scale.setTo(2, 2);

    //add player controlled ship
    ship = game.add.sprite(32, game.world.height - 150, 'ship');
	ship.health = 512;
	ship.firedelay = 8;
    ship.animations.add('death', [1, 2, 3], 5, true);
	ship.animations.add('injured', [4,5], 5, true);
    collisionShip = game.add.sprite(ship.x + 21,game.world.height - 140, 'colShip');
    game.physics.arcade.enable(collisionShip);
    collisionShip.visible = true;
    //enable physics on ship
    game.physics.arcade.enable(ship);
    
    //ship physics properties
    ship.body.collideWorldBounds = true;
    collisionShip.body.collideWorldBounds = true;

    //ship animations

    makeProjectiles();

    makeKeys();

    makeInitEnemies();

    makeEnemyTimer();
	
	makeScoreLabel();

    makeHealthBar();

    makeTitleScreen();

    makeItRainSoy();

    game.state.add();
}

function makeItRainSoy(){
    emitter = game.add.emitter(game.world.centerX, 0, 400);
    emitter.width = game.world.width;
    emitter.makeParticles('soybean');

    emitter.minParticleScale = 0.1;
	emitter.maxParticleScale = 0.5;

	emitter.setYSpeed(300, 500);
	emitter.setXSpeed(-5, 5);

	emitter.minRotation = 0;
	emitter.maxRotation = 0;

	emitter.start(false, 1600, 5, 0);
}

function makeTitleScreen(){
    titleElements = game.add.group();
    titleScreen = titleElements.create(0, 0, 'titlescreen');
    mrBean = titleElements.create(game.world.width-200, game.world.height-221, 'mrbean');
    mrBean.animations.add('idle', [0,1], 10, true);
    game.physics.arcade.enable(mrBean);
    mrBeanGoLeft = true;
    soylent = titleElements.create(game.world.width-300, game.world.height-205, 'soylent');
    game.physics.arcade.enable(soylent);

    playPrompt = game.add.text(game.world.width/2 - 150, game.world.height/2, 'SPACEBAR TO PLAY', { fontSize: '32px', fill: '#FFF' });
    promptTimer = game.time.create(false);
    titleElements.add(playPrompt);

    promptTimer.loop(600, blinkText, this);

    promptTimer.start();
}

function blinkText(){
    if(promptVisible === true){
        promptVisible = false;
        playPrompt.visible = false;
    }
    else{
        promptVisible = true;
        playPrompt.visible = true;
    }
}

function makeHealthBar(){
    healthBack = game.add.sprite(0, game.world.height-32, 'health_back');
    healthFore = game.add.sprite(0, game.world.height-32, 'health_fore');
	//healthBack.width = game.width;
	//healthFore.width = game.width;
    manaBack = game.add.sprite(game.width-32, game.world.height-256-32, 'mana_back');
    manaFore = game.add.sprite(game.width-32, game.world.height-256-32, 'mana_fore');
    manaFore.y += 256;
    manaFore.height = 0;

}

function makeScoreLabel(){
    scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#FFF' });
}

function makeInitEnemies(){
    enemies = game.add.group();
    enemies.enableBody = true;
	bosses = game.add.group();
	healthDrops = game.add.group();
	healthDrops.enableBody = true;
	healthDrops.physicsBodyType = Phaser.Physics.ARCADE;

    for(var i = 0; i < 5; i++){
        var baddie = enemies.create(i*160, 0, 'burger');
		baddie.type = 0; // 0 is burger, 1 is hotdog, can be expanded
		baddie.move = 0;
		baddie.health = 5;
		baddie.shoot = 200;
		game.physics.arcade.enable(baddie);
        enemyCount++;
    }
}

function makeEnemyTimer(){
    enemySpawnTimer = game.time.create(false);

    enemySpawnTimer.loop(2000, spawnEnemy, this);

    enemySpawnTimer.start();
	
	bossSpawnTimer = game.time.create(false);
	
	bossSpawnTimer.loop(2000, spawnBoss, this);
	
	bossSpawnTimer.start();
	
}

function spawnEnemy(){
	if (bosses.length===1){
		boss = bosses.getTop();
		if (boss.keyWord=='boss1' && boss.frame != 0){
			var baddie = enemies.create(boss.body.x + boss.body.width/3,boss.body.y + boss.body.height,'burger');
			baddie.type = 2;
			baddie.move = 0;
			baddie.health = 5;
			baddie.shoot = 50;
			game.physics.arcade.enable(baddie);
		} else if (boss.keyWord == 'boss2' && boss.frame != 0){
			var baddie = enemies.create(boss.body.x + boss.body.width/2,boss.body.y + boss.body.height,'fry_boss');
			baddie.type = 5;
			baddie.move = 0;
			baddie.health = 5;
			baddie.shoot = 50;
			game.physics.arcade.enable(baddie);
		} else if(boss.keyWord == 'boss3'){
			var baddie = enemies.create(boss.body.x + boss.body.width/4,boss.body.y + boss.body.height/2,'salt');
			baddie.type = 6;
			baddie.move = 0;
			baddie.health = 5;
			baddie.shoot = 3;
			game.physics.arcade.enable(baddie);
		}
	}
	if(gameStarted && enemyCount < 10){
		var rand = Math.floor(Math.random()*3)
		if (rand==0){
			var baddie = enemies.create( (Math.random() *5) *160, 0, 'burger');
			baddie.type = 0;
		} else if (score>=2000 && rand==1){
			var baddie = enemies.create( (Math.random() *5) *160, 0, 'hotdog'); 
			baddie.type = 1;
		} else if (score >=3000 && rand == 2){
			var baddie = enemies.create( (Math.random() *5) *160, 250, 'fry_boss'); 
			baddie.type = 4;
		} else {
			var baddie = enemies.create( (Math.random() *5) *160, 0, 'burger');
			baddie.type = 0;
		}
		baddie.move = 0;
		baddie.health = 5;
		baddie.shoot = 50;
        enemyCount++;
		game.physics.arcade.enable(baddie);
    }
}

function spawnBoss(){
	if (bosstype === 4){
	} else if (score >= 800 && bossCount<1 && bosses.length===0){
		bosstype = 1;
	} else if(score>=1000 && bossCount<2 && bosses.length == 0){
        bosstype = 2;
    } else if(score >= 3600 && bossCount<3 &&bossCount != 1 && bosses.length == 0){
		bosstype = 3;
		enemies.removeAll();
		finalBoss = true;
	}
	if (gameStarted && bosstype===1){
		var boss = bosses.create( (Math.random() *5) *160, 0, 'boss_1',0);
		bossCount++;
		boss.health = 100;
		boss.shoot = 30;
		game.physics.arcade.enable(boss);
		boss.body.velocity.x = 200;
		boss.animations.add('boss1',[0,1,2], 0.5, true);
        boss.keyWord = 'boss1';
		bosstype = 0;
	}else if(gameStarted && bosstype==2){
		bossCount++;
        var boss = bosses.create( (Math.random() *5) *160, 0, 'boss_2',0);
		boss.health = 100;
		boss.shoot = 30;
		game.physics.arcade.enable(boss);
		boss.body.velocity.x = 200;
		boss.animations.add('boss2',[0,1,2], 0.5, true);
        boss.keyWord = 'boss2';
		bosstype = 0;
    }else if(gameStarted && bosstype==3){
		bossCount++;
        var boss = bosses.create( (Math.random() *5) *160, 0, 'boss_3',0);
		boss.health = 250;
		boss.shoot = 3;
		game.physics.arcade.enable(boss);
		boss.body.velocity.x = 300;
        boss.keyWord = 'boss3';
		bosstype = 4;
    }

}

function makeProjectiles(){
	
	enemyProjectiles = game.add.group();
	enemyProjectiles.enableBody = true;
	enemyProjectiles.physicsBodyType = Phaser.Physics.ARCADE;
	
	powerups = game.add.group();
	powerups.enableBody = true;
	powerups.physicsBodyType = Phaser.Physics.ARCADE;
	
	var gun = powerups.create(500,0,'tripleshot');
	gun.body.velocity.y = 100;
	
	enemyProjectiles.createMultiple(10,'burger_projectile');
	enemyProjectiles.createMultiple(10,'hotdog_projectile');
	enemyProjectiles.setAll('checkWorldBounds',true);
	enemyProjectiles.setAll('outOfBoundsKill',true);

    soyBottles = game.add.group();
    soyBottles.enableBody = true;
    soyBottles.physicsBodyType = Phaser.Physics.ARCADE;

    soyBottles.createMultiple(10, 'soybottle');
    soyBottles.setAll('checkWorldBounds', true);
    soyBottles.setAll('outOfBoundsKill', true);

    pelletPtr = soyBottles;
}

function makeKeys(){
    // cursor controls
    cursors = game.input.keyboard.createCursorKeys();

    //spacebar
    spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    //initialize to start game
    spaceKey.onDown.add(startGame, this);
}

function startGame(){
    gameStarted = true;
    game.input.onDown.remove(startGame, spaceKey);
    titleElements.removeAll();
    emitter.removeAll();
}


function update(){
    game.physics.arcade.overlap(soyBottles, enemies, damageEnemy,null,this);
	game.physics.arcade.overlap(soyBottles, bosses, damageBoss,null,this);
    //game.physics.arcade.collide(collisionShip,enemies);
    //damagePlayer(collisionShip,enemies);
    if(!isDead){
		game.physics.arcade.overlap(collisionShip, healthDrops, healPlayer, null, this);
        game.physics.arcade.overlap(collisionShip, enemies, damagePlayer,null,this);
        game.physics.arcade.overlap(collisionShip, enemyProjectiles, damagePlayer, null, this);
		game.physics.arcade.overlap(collisionShip, powerups, buffPlayer ,null, this);
        collisionShip.x = ship.x+21;
        collisionShip.y = ship.y+10;
    }else{
        ship.animations.play('death');
		if(!isGGPrompted)
			promptGG();
		if(spaceKey.isDown && isRestart){
			ship.frame = 0;
			guntype = 0;
			restart();
		}
    }
    
    if(gameStarted){
        gameplay();
    }
    else{
        mrBean.animations.play('idle');
        if(mrBeanGoLeft === true){
            mrBean.body.velocity.x = -150;
            soylent.body.velocity.x = -150;
            if(mrBean.body.x == 100)
                mrBeanGoLeft = false;
        }
        else{
            mrBean.body.velocity.x = 150;
            soylent.body.velocity.x = 150;
            if(mrBean.body.x == game.world.width - 200)
                mrBeanGoLeft = true;
        }
    }
}

function promptGG(){
	ggPrompt = game.add.sprite(game.world.centerX-200, game.world.centerY-40, 'gg');
	ggPrompt.scale.setTo(0.5, 0.5);
	isGGPrompted = true;

	restartTimer = game.time.create(false);
	restartTimer.loop(2000, toggleIsRestart, this);
	restartTimer.start();
}

function toggleIsRestart(){
	if(!isRestart)
		isRestart = true;
}

function restart(){
	music.stop();
    game.state.start(game.state.current);
}

function buffPlayer(collisionShip, powerup){
	powerup.kill();
	powerups.remove(powerup);
	guntype = 1;
}
function healPlayer(collisionShip, health){
	health.kill();
	healthDrops.remove(health);
	ship.health = 512;
	healthFore.width = game.width *(ship.health / 512);
}
function damagePlayer(collisionShip,enemy){
    ship.health = ship.health - (512/5)
	healthFore.width = game.width *(ship.health / 512);
    enemy.kill();
	ship.animations.play("injured");
	animInProgress = true;
	
	animBufferTimer = game.time.create(false);
	
	animBufferTimer.loop(2000, bufferAnim, this);
	
	animBufferTimer.start();

    if(ship.health <= 3){
        collisionShip.kill();
		isDead = true;
    }
}

function bufferAnim(){
	animInProgress = false;
}

function damageBoss(soyBottle, boss){
	soyBottle.kill();
	boss.health--;
	if (boss.health==0){
		boss.type
		if (boss.keyWord == 'boss2'){
//			bosstype = 4;
			var gun = powerups.create(boss.body.x,boss.body.y,'tripleshot');
			gun.body.velocity.y = 100;
		}else if(boss.keyWord == 'boss3'){
			if(boss.length != 1){
				finalBoss = false;
			}
		}
		burpSound.play();
		bosses.remove(boss);
		score+=500;
		scoreText.text = 'Score: ' + score;
	}
}
function damageEnemy(soyBottle,enemy){
    manaFore.height += 10; 
    manaFore.y -=10;
    soyBottle.kill();
    if(manaFore.height >= 256){
        manaFore.y += manaFore.height;
        manaFore.height = 0;
        var minifood = soyBottles.create(soyBottle.body.x,soyBottle.body.y,'soybottle');
		minifood.body.velocity.x = 0;
		minifood.body.velocity.y = 400;
		var minifood = soyBottles.create(soyBottle.body.x,soyBottle.body.y,'soybottle');
		minifood.body.velocity.x = 0;
		minifood.body.velocity.y = -400;
		var minifood = soyBottles.create(soyBottle.body.x,soyBottle.body.y,'soybottle');
		minifood.body.velocity.x = 400;
		minifood.body.velocity.y = 0;
        var minifood = soyBottles.create(soyBottle.body.x,soyBottle.body.y,'soybottle');
		minifood.body.velocity.x = -400;
		minifood.body.velocity.y = 0;
		var minifood = soyBottles.create(soyBottle.body.x,soyBottle.body.y,'soybottle');
		minifood.body.velocity.x = 400;
		minifood.body.velocity.y = -400;
		var minifood = soyBottles.create(soyBottle.body.x,soyBottle.body.y,'soybottle');
		minifood.body.velocity.x = -400;
		minifood.body.velocity.y = 400;
        var minifood = soyBottles.create(soyBottle.body.x,soyBottle.body.y,'soybottle');
		minifood.body.velocity.x = 400;
		minifood.body.velocity.y = 400;
        var minifood = soyBottles.create(soyBottle.body.x,soyBottle.body.y,'soybottle');
		minifood.body.velocity.x = -400;
		minifood.body.velocity.y = -400;
        
        
    }
    enemy.health -= 1;
    if(enemy.health == 0){
		if (enemy.type == 4 || enemy.type == 5){
			 var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'fries_projectile');
			minifood.body.velocity.x = 0;
			minifood.body.velocity.y = 300;
			var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'fries_projectile');
			minifood.body.velocity.x = 300;
			minifood.body.velocity.y = 300;
			var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'fries_projectile');
			minifood.body.velocity.x = -300;
			minifood.body.velocity.y = 300; 
			var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'fries_projectile');
			minifood.body.velocity.x = 0;
			minifood.body.velocity.y = -300;
			var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'fries_projectile');
			minifood.body.velocity.x = 300;
			minifood.body.velocity.y = -300;
			var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'fries_projectile');
			minifood.body.velocity.x = -300;
			minifood.body.velocity.y = -300;
		}
        enemy.kill();
		enemies.remove(enemy);
		score += 100;
        scoreText.text = 'Score: ' + score;
		if (enemy.type==0 || enemy.type == 1 || enemy.type == 4){
			enemyCount--;
		}
		if (Math.random()>.90){
			var health = healthDrops.create(enemy.body.x, enemy.body.y, 'health');
			health.body.velocity.y = 100;
		}
    }
    
}


function gameplay(){
    ship.body.velocity.x = 0;
    ship.body.velocity.y = 0;

    controlHandler();

    enemyMovementHandler();
	
	bossMovementHandler();
	
	cleanBullets();
}

function cleanBullets(){
	enemyProjectiles.setAll('checkWorldBounds',true);
	enemyProjectiles.setAll('outOfBoundsKill',true);
	enemies.setAll('checkWorldBounds',true);
	enemies.setAll('outOfBoundsKill',true);
	soyBottles.setAll('checkWorldBounds',true);
	soyBottles.setAll('outOfBoundsKill',true);
	enemyProjectiles.forEachDead(function(projectile){
		enemyProjectiles.remove(projectile);
	}, this);
	enemies.forEachDead(function(enemy){
		enemies.remove(enemy);
	}, this);
	soyBottles.forEachDead(function(bottle){
		soyBottles.remove(bottle);
	},this);
}
function enemyMovementHandler(){
    enemies.forEach(function(enemy){
		if(enemy.move!==0){
			enemy.move--;
			if (enemy.body.x<100){
				enemy.body.velocity.x = Math.random()*100;
			} else if (enemy.body.x>700){
				enemy.body.velocity.x = Math.random()*-100;
			}
			if (enemy.body.y<100){
				enemy.body.velocity.y = Math.random()*100;
			} else if (enemy.body.y>300){
				enemy.body.velocity.y = Math.random()*-100;
			}
		} else {
			if (enemy.type===2){
				if (enemy.body.velocity.x === 0){
					enemy.body.velocity.x = Math.random()*200-100;
				}
				enemy.body.velocity.y = 200;
			} else if (enemy.type===4){
				if (enemy.body.velocity.x === 0){
					enemy.body.velocity.x = 100;
				}
				if (enemy.body.x < 100){
					enemy.body.velocity.x = 100;
				} else if (enemy.body.x > 600){
					enemy.body.velocity.x = -100;
				}
			} else if (enemy.type===5){
				if (enemy.body.velocity.x ===0){
					enemy.body.velocity.x = Math.random()*200-100;
				}
				enemy.body.velocity.y = 200;
			}else if(enemy.type == 6){
				if (enemy.body.velocity.x ===0){
					enemy.body.velocity.x = Math.random()*200-100;
				}
				enemy.body.velocity.y = 200;
			} else {
				enemy.body.velocity.x = Math.random()*200-100;
				enemy.body.velocity.y = Math.random()*200-100;
				enemy.move = Math.floor(Math.random()*50+20);
			}
		}
		enemy.shoot--;
		if (enemy.shoot==0){
			enemyfire(enemy);
			enemy.shoot = 250;
		}
    }, this);
}
function bossMovementHandler(){
    speed = 200;
	bosses.forEach(function(boss){
        if(boss.keyWord == 'boss2'){
            speed = 300;
        }else if(boss.keyWord == 'boss3'){
			speed = 350;
		}
		if(boss.keyWord!='boss3'){
			boss.animations.play(boss.keyWord);
		}
		var rand = Math.floor(Math.random()*20)
		if(rand == 3){
			boss.body.velocity.x = -1* speed;
		}
		if (boss.body.x<100){
			boss.body.velocity.x = speed;
		}else if (boss.body.x > 600) {
			boss.body.velocity.x = -1 * speed;
		}
	}, this);
}
function controlHandler(){
	if(isDead){
        return;
    }
	if(spaceKey.isDown){
		if(!isDead){
			fire();
		}
		if (guntype===1){
			ship.frame = 8;
		} else {
			ship.frame = 6;
		}
    }else{
		if (guntype===1){
			ship.frame = 8;
		} else{
			 ship.frame = 0;
		}
    }
    //remove this comment after adding animations
    if(cursors.left.isDown){
        ship.body.velocity.x = -300;
    }
    if(cursors.right.isDown){
        ship.body.velocity.x = 300;
    }
    if(cursors.up.isDown){
        ship.body.velocity.y = -300;
    }
    if(cursors.down.isDown){
        ship.body.velocity.y = 300;
	}
}

function fire(){
	if(ship.firedelay==0 && guntype===0){
		var pellet = soyBottles.create(ship.x+16.5,ship.y,'soybottle');
		pellet.body.velocity.y = -350;
		ship.firedelay = 8;
	} else if (ship.firedelay==0 && guntype===1){
		var pellet = soyBottles.create(ship.x+16.5,ship.y,'soybottle');
		pellet.body.velocity.x = 0;
		pellet.body.velocity.y = -350;
		var pellet = soyBottles.create(ship.x+20.5,ship.y,'soybottle');
		pellet.body.velocity.x = 60;
		pellet.body.velocity.y = -350;
		var pellet = soyBottles.create(ship.x+12.5,ship.y,'soybottle');
		pellet.body.velocity.x = -60;
		pellet.body.velocity.y = -350;
		ship.firedelay = 14;
	}
	ship.firedelay--;
}

function enemyfire(enemy){
	if (enemy.type === 0 || enemy.type === 2){
		var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'burger_projectile');
		minifood.body.velocity.y = 100;
	} else if (enemy.type === 1){
		var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'hotdog_projectile');
		minifood.body.velocity.x = (collisionShip.x-enemy.body.x)*.9;
		minifood.body.velocity.y = (collisionShip.y-enemy.body.y)*.9;
	} else if(enemy.type == 4 || enemy.type == 5){
        var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'fries_projectile');
		minifood.body.velocity.x = 0;
		minifood.body.velocity.y = 400;
		var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'fries_projectile');
		minifood.body.velocity.x = 60;
		minifood.body.velocity.y = 400;
		var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'fries_projectile');
		minifood.body.velocity.x = -60;
		minifood.body.velocity.y = 400;
	} else if(enemy.type == 6){
		var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'salt');
		minifood.body.velocity.x = 20;
		minifood.body.velocity.y = 30;
		var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'salt');
		minifood.body.velocity.x = -10;
		minifood.body.velocity.y = 30;
		var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'salt');
		minifood.body.velocity.x = +10;
		minifood.body.velocity.y = 30;
		var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'salt');
		minifood.body.velocity.x = -20;
		minifood.body.velocity.y = 30;
		var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'salt');
		minifood.body.velocity.x = +25;
		minifood.body.velocity.y = 30;
		var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'salt');
		minifood.body.velocity.x = -25;
		minifood.body.velocity.y = 30;
	}else {
		var minifood = enemyProjectiles.create(enemy.body.x,enemy.body.y,'burger_projectile');
		minifood.body.velocity.y = 100;
	}
}