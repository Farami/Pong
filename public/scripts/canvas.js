$(document).ready(function () {
    var canvas = new Canvas("game");

    var animFrame = window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        null;

    var recursiveAnim = function () {
        canvas.Render();
        animFrame(recursiveAnim);
    }

    animFrame(recursiveAnim);

    $(document).keydown(function (e) {
        switch (e.which) {
            case 38: // up
                canvas.Move(1, -3);
                break;
            case 40: // down
                canvas.Move(1, +3);
                break;
        }
    });
})

class Canvas {
    get ballPosition() {
        return this.ball.position;
    }

    constructor(selector) {
        this.canvas = document.getElementById(selector);
        this.context = this.canvas.getContext("2d");
        this.height = parseInt(this.canvas.height);
        this.width = parseInt(this.canvas.width);

        this.Reset();
    }

    Reset() {
        let playerOne = {
            x: 5,
            y: (this.height / 2) - 15
        };
        let playerTwo = {
            x: this.width - 10,
            y: (this.height / 2) - 15
        };


        this.playerOne = new Player(this.context, this, playerOne.x, playerOne.y, this.width, this.height);
        this.playerTwo = new Player(this.context, this, playerTwo.x, playerTwo.y, this.width, this.height, true);
        this.ball = new Ball(this.context, this.width / 2, this.height / 2, this.width, this.height);
    }

    Render() {
        if (this.CheckForWin() > 0) {
            this.Reset();
        } 

        this.FillBackground("#000000");
        this.playerOne.Render();
        this.playerTwo.Render();
        this.ball.Render(this.playerOne, this.playerTwo);
    }

    CheckForWin() {
        var ballPos = this.ball.position;

        if (ballPos.x <= 5) {
            return 2;
        }

        if (ballPos.x >= this.width - 5) {
            return 1;
        }

        return -1;
    }

    Move(player, offset) {
        switch (player) {
            case 1:
                this.playerOne.Move(offset);
                break;
            case 2:
                this.playerTwo.Move(offset);
                break;
        }
    }

    FillBackground(color) {
        let prevFillStyle = this.context.fillStyle;
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.width, this.height);
        this.context.fillStyle = prevFillStyle;
    }
}

class Player {
    get position() {
        return { x: this.x, y: this.y };
    }

    constructor(context, game, x, y, maxX, maxY, bot) {
        this.x = x;
        this.y = y;
        this.maxX = maxX;
        this.maxY = maxY;
        this.context = context;
        this.bot = bot;
        this.game = game;

        this.width = 3;
        this.height = 30;
    }

    Render() {
        if (this.bot) {
            this.AutoMove();
        }

        let prevFillStyle = this.context.fillStyle;

        this.context.fillStyle = "#FFFFFF";
        this.context.fillRect(this.x, this.y, this.width, this.height);
        this.context.fillStyle = prevFillStyle;
    }

    CheckCollision(rect) {
        var playerRect = { x: this.x, y: this.y, width: this.width, height: this.height };

        if (playerRect.x < rect.x + rect.width &&
            playerRect.x + playerRect.width > rect.x &&
            playerRect.y < rect.y + rect.height &&
            playerRect.height + playerRect.y > rect.y) {
            return true;
        }

        return false;
    }

    AutoMove() {
        let ballPosition = this.game.ballPosition;

        if (this.y + 15 < ballPosition.y) {
            this.Move(2);
        } else if (this.y + 15 > ballPosition.y) {
            this.Move(-2);
        }
    }

    Move(yOffset) {
        if (yOffset > 0 && (this.y + this.height) >= this.maxY) {
            return;
        }

        if (yOffset < 0 && this.y <= 0) {
            return;
        }

        this.y += yOffset;
    }
}

class Ball {
    get position() {
        return { x: this.x, y: this.y }
    }

    constructor(context, x, y, width, height) {
        this.context = context;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.direction = { x: 2, y: 2 };
    }

    Render(playerOne, playerTwo) {
        this.Move(playerOne, playerTwo);

        let prevFillStyle = this.context.fillStyle;
        this.context.fillStyle = "#FFFFFF";
        this.context.fillRect(this.x, this.y, 3, 3);
        this.context.fillStyle = prevFillStyle;
    }

    Move(playerOne, playerTwo) {
        var ballRect = { x: this.x, y: this.y, width: 3, height: 3 };

        this.x += this.direction.x;
        this.y += this.direction.y;
        let playerHit = playerOne.CheckCollision(ballRect) || playerTwo.CheckCollision(ballRect);
        if (this.x >= this.width - 3 || this.x <= 0 || playerHit) {
            this.direction.x = -this.direction.x;
            this.x += this.direction.x * 3;
        }

        if (this.y >= this.height - 3 || this.y <= 0) {
            this.direction.y = -this.direction.y;
        }
    }
}