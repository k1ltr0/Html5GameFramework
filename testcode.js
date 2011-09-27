////utils

LPVector2 = function(x, y) {
	this.X = x;
	this.Y = y;

	this.MultiplyBy = function(vector2) {
		this.X = this.X * vector2.X;
		this.Y = this.Y * vector2.Y;
	};
};

LPVector2.ZERO = new LPVector2(0, 0);

LPLine = function(p1, p2) {
	this.pointA = p1;
	this.pointB = p2;

	this.getLength = function() {
		return Math.abs(Math.sqrt(Math.pow(this.pointB.X - this.pointA.X, 2)
				+ Math.pow(this.pointB.Y - this.pointA.Y, 2)));
	};
};

LPEntity = function(x, y) {
	this.superClass = LPVector2;
	this.superClass(x, y);
	delete this.superClass;

	this.MoveTo = function(entityTo, vectorVel) {

		var line = new LPLine(new LPVector2(this.X, this.Y), entityTo);

		if (line.getLength() != 0) {
			var vectorDirection = new LPVector2(0, 0);

			if (this.X < entityTo.X)
				vectorDirection.X = 1;
			else if (this.X > entityTo.X)
				vectorDirection.X = -1;
			else
				vectorDirection.X = 0;

			if (this.Y < entityTo.Y)
				vectorDirection.Y = 1;
			else if (this.Y > entityTo.Y)
				vectorDirection.Y = -1;
			else
				vectorDirection.Y = 0;

			vectorVel.MultiplyBy(vectorDirection);

			var lenX = Math.abs(entityTo.X - this.X);
			var lenY = Math.abs(entityTo.Y - this.Y);
			var correctionVel = new LPVector2(1, 1);

			if (lenX > lenY) {
				if (lenX != 0) {
					correctionVel.Y = lenY / lenX;
				} else {
					lenX = 0;
				}
			} else {
				if (lenY != 0) {
					correctionVel.X = lenX / lenY;
				} else {
					lenY = 0;
				}
			}

			vectorVel.MultiplyBy(correctionVel);

			this.X += vectorVel.X;
			this.Y += vectorVel.Y;

			if (line.getLength() < vectorVel.X
					|| line.getLength() < vectorVel.Y) {
				this.X = entityTo.X;
				this.Y = entityTo.Y;
			}
		}
	};
};

LPRectangle = function(x, y, width, height) {
	this.superClass = LPEntity;
	this.superClass(x, y);
	delete this.superClass;

	this.width = width;
	this.height = height;
	this.getMidPoint = function() {
		return new LPVector2(this.X + (this.width / 2), this.Y
				+ (this.height / 2));
	};

	this.CollideWith = function(other) {

		var l1 = new LPLine(new LPVector2(this.getMidPoint().X, 0),
				new LPVector2(other.getMidPoint().X, 0));

		if (l1.getLength() < (this.width + other.width) / 2) {

			var l2 = new LPLine(new LPVector2(this.getMidPoint().Y, 0),
					new LPVector2(other.getMidPoint().Y, 0));

			if (l2.getLength() < (this.height + other.height) / 2) {
				return true;
			}
		}

		return false;
	};
};

LPImage = function(imageSrc, x, y, width, height) {
	this.superClass = LPRectangle;
	this.superClass(x, y, width, height);
	delete this.superClass;

	this.Image = new Image();
	this.Image.src = imageSrc;
	this.Image.onload = function ()
	{
		if (undefined == width)
			width = this.width;
		if (undefined == height)
			height = this.height;
	};
};

LPTile = function(id, x, y, width, height) {
	this.superClass = LPRectangle;
	this.superClass(x, y, width, height);
	delete this.superClass;

	this.id = id;
};

LPTileAtlas = function(imageSrc, tileW, tileH, rows, cols) {

	this.tiles = new Array();
	this.maxTiles = 0;
	
	var img = new Image();
	img.src = imageSrc;
	
	this.Image = img;

	for ( var x = 0; x < rows; x++) {
		this.tiles[x] = new Array();
		for ( var y = 0; y < cols; y++) {
			this.tiles[x][y] = new LPTile(this.count, x * tileW, y * tileH,
					tileW, tileH);
			this.maxTiles++;
		}
	}

	this.GetTile = function(index) {
		var cont = 0;
		for ( var x = 0; x < rows; x++) {
			for ( var y = 0; y < cols; y++) {
				if (cont == index)
					return this.tiles[x][y];
				cont++;
			}
		}
	};

};

LPAnimatedSprite = function (tileAtlas, initTile, endTile, time, x, y, width, height)
{
	this.superClass = LPRectangle;
	this.superClass(x, y, width, height);
	delete this.superClass;
	
	var started = false;
	var initTile = parseInt(initTile);
	var endTile = parseInt(endTile);
	var time = parseFloat(time);
	
	var lastActualization = 0;
	
	var currentFrame = initTile;

	this.Image = tileAtlas.Image;
	
	this.GetFrame = function() {
		return tileAtlas.GetTile(currentFrame);
	};

	this.Start = function() {
		lastActualization = gameTime;
		started = true;
	};
	
	this.Stop = function() {
		started = false;
	};
	
	this.OnUpdate = function() {
		if (started)
		{
			if (gameTime - lastActualization >= time)
			{
				if (currentFrame != endTile)
					currentFrame++;
				else
					currentFrame = initTile;
				lastActualization = gameTime;
			}
		}
	};
};

LPBounds = new LPRectangle(0, 0, 200, 200);

LPCanvas = function() {
};
LPCanvas.Clear = function() {
	context.clearRect(0, 0, canvas.width, canvas.height);
};
LPCanvas.drawRectangle = function(lpRectangle, htmlColor, fill) {
	if (LPBounds.CollideWith(lpRectangle)) {

		if (fill) {
			context.fillStyle = "" + htmlColor;
			context.fillRect(lpRectangle.X, lpRectangle.Y, lpRectangle.width,
					lpRectangle.height);
		} else {
			context.strokeStyle = "" + htmlColor;
			context.strokeRect(lpRectangle.X, lpRectangle.Y, lpRectangle.width,
					lpRectangle.height);
		}
	}
};

LPCanvas.drawImage = function(image) {
	// image =new Image();
	// image.src =
	// 'data:image/gif;base64,R0lGODlhCwALAIAAAAAA3pn/ZiH5BAEAAAEALAAAAAALAAsAAAIUhA+hkcuO4lmNVindo7qyrIXiGBYAOw==';
	context.drawImage(image.Image, image.X, image.Y, image.width, image.height);
};

LPCanvas.drawLine = function(line, htmlColor) {
	context.strokeStyle = "" + htmlColor;

	context.beginPath();
	context.moveTo(line.pointA.X, line.pointA.Y);
	context.lineTo(line.pointB.X, line.pointB.Y);
	context.closePath();
	context.stroke();
};

LPCanvas.drawAnimatedSprite = function(animatedSprite)
{
//	context.drawImage(
//			animatedSprite.Image, 
//			animatedSprite.GetFrame().x, 
//			animatedSprite.GetFrame().y, 
//			animatedSprite.GetFrame().width, 
//			animatedSprite.GetFrame().height, 
//			animatedSprite.x, animatedSprite.y, 
//			animatedSprite.width, animatedSprite.height);
	
	var tile = animatedSprite.GetFrame();
	context.drawImage(
			animatedSprite.Image, 
			tile.Y, 
			tile.X,
			92, 
			tile.height, 
			animatedSprite.X,animatedSprite.Y, 
			animatedSprite.width, animatedSprite.height);
};

function LPDebug(debugDivId, htmlContent) {
	document.getElementById(debugDivId).innerHTML = htmlContent;
}
// //////

// /thread code

/**
 * game time, near of miliseconds
 */
var gameTime = 0;

/**
 * this function works in an asynchronous thread to account the game time
 * 
 * @returns null
 */
var timer = function() {
	gameTime++;
	setTimeout(timer, 1);
};

/**
 * this class let you to allow new threads ond the application
 * 
 * @returns null
 */
function LPThread() {
	setTimeout(timer, 1);
}

/**
 * Method to run a new code thread
 * 
 * @param executingObject
 *            allow all the code will be executed in the thread
 * @param sleepTime
 *            time to sleep the thread normaly 33, to 30 fps
 */
LPThread.prototype.Start = function(sleepTime, debugDiv, executingObject) {
	var code = function() {
		executingObject();

		LPDebug(debugDiv, "tiempo segundo : " + gameTime / 100);
		setTimeout(code, sleepTime);
	};
	setTimeout(code, sleepTime);
};

// /Game Code
var canvas = null;
var context = null;

function Game(canvasId) {
	canvas = document.getElementById(canvasId);
	LPBounds = new LPRectangle(0, 0, canvas.width, canvas.height);
	context = canvas.getContext('2d');
	this.updateCode = function() {
	};
	this.drawCode = function() {
	};

	this.LoadContent = function(userContent) {
		userContent();
	};

	this.Update = function(userCode) {
		this.updateCode = userCode;
	};

	this.Draw = function(userCode) {
		this.drawCode = userCode;
	};
}

Game.prototype.Run = function() {
	var thread = new LPThread();
	thread.Start(0, 'debug', this.updateCode);

	thread.Start(0, 'otrodebug', this.drawCode);
};

// /////

var MousePosition = new LPVector2(0, 0);

function mouseMove() {
	MousePosition.X = window.event.clientX;
	MousePosition.Y = window.event.clientY;
}

function main() {
	var block = null;
	var block2 = null;
	var line = null;
	var velocidad = 1;
	var color = "#F00";

	var frames = 0;

	var date = null;
	var initTime = 0;
	var endTime = 0;

	var image = null;
	
	var animatedSprite = null;

	game = new Game('micanvas');

	game.LoadContent(function() {
		animatedSprite = new LPAnimatedSprite(new LPTileAtlas('zombie.png', 368, 92, 1, 4), 0, 3, 15, 0,0,100,100);
		animatedSprite.Start();
		
		block = new LPRectangle(100, 100, 30, 50);
		block2 = new LPRectangle(200, 10, 10, 10);
		line = new LPLine(new LPVector2(0, 0), new LPVector2(0, 0));
		// sprite = new
		// LPSprite(0,0,100,100,'data:image/gif;base64,R0lGODlhCwALAIAAAAAA3pn/ZiH5BAEAAAEALAAAAAALAAsAAAIUhA+hkcuO4lmNVindo7qyrIXiGBYAOw==');
		image = new LPImage('zombie.png', 0, 0);
	});

	game.Update(function() {
		if (frames == 0) {
			date = new Date();
			initTime = (date.getSeconds() * 1000) + date.getMilliseconds();
		}
		
		animatedSprite.OnUpdate();
		animatedSprite.MoveTo(MousePosition, new LPVector2(1, 1));

		block2.MoveTo(MousePosition, new LPVector2(1, 1));
		line.pointA = MousePosition;
		line.pointB = new LPVector2(block2.X, block2.Y);

//		if (block2.CollideWith(sprite))
//			color = "#00F";
//		else
//			color = "#F00";

		if (frames >= 10) {
			frames = -1;
			date = new Date();
			endTime = (date.getSeconds() * 1000) + date.getMilliseconds();
			LPDebug("userDebug", "init : " + initTime + "end : " + endTime
					+ "<br/> " + "FPS : " + 10000 / (endTime - initTime));
		}

		frames++;
	});

	game.Draw(function() {
		LPCanvas.Clear();
		LPCanvas.drawRectangle(block, "#000", true);
		LPCanvas.drawRectangle(block2, color, true);
		LPCanvas.drawLine(line);
		LPCanvas.drawImage(image);
		LPCanvas.drawAnimatedSprite(animatedSprite);
	});

	game.Run();
}