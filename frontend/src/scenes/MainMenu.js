import { Scene } from "phaser";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    this.createScaledBackground();

    this.activeField = null;
    this.userIdValue = "";
    this.sessionIdValue = "";
    this.cursorVisible = true;

    this.createInputSection();
    this.createStartButton();
    this.setupKeyboardInput();
    this.startCursorBlink();
  }

  createScaledBackground() {
    const { width, height } = this.scale;

    this.background = this.add.image(width / 2, height / 2, "background");

    const scaleX = width / this.background.width;
    const scaleY = height / this.background.height;
    const scale = Math.max(scaleX, scaleY);

    this.background.setScale(scale);

    this.scale.on("resize", (gameSize) => {
      const { width, height } = gameSize;

      this.background.setPosition(width / 2, height / 2);

      const newScaleX = width / this.background.width;
      const newScaleY = height / this.background.height;
      const newScale = Math.max(newScaleX, newScaleY);

      this.background.setScale(newScale);
    });
  }

  createInputSection() {
    const centerX = this.cameras.main.width / 2;
    const startY = 420;

    this.add.text(centerX, startY, "User ID", {
      fontSize: "22px",
      color: "#000000",
      fontFamily: "Arial",
    }).setOrigin(0.5);

    this.userBox = this.createInputBox(centerX, startY + 40);
    this.userText = this.add.text(centerX - 130, startY + 25, "", {
      fontSize: "22px",
      color: "#000000",
      fontFamily: "Arial",
    });

    this.add.text(centerX, startY + 110, "Session ID", {
      fontSize: "22px",
      color: "#000000",
      fontFamily: "Arial",
    }).setOrigin(0.5);

    this.sessionBox = this.createInputBox(centerX, startY + 150);
    this.sessionText = this.add.text(centerX - 130, startY + 135, "", {
      fontSize: "22px",
      color: "#000000",
      fontFamily: "Arial",
    });
  }

  createInputBox(centerX, y) {
    const box = this.add.graphics();
    box.fillStyle(0xffffff, 1);
    box.fillRoundedRect(centerX - 150, y - 25, 300, 50, 12);

    box.setInteractive(
      new Phaser.Geom.Rectangle(centerX - 150, y - 25, 300, 50),
      Phaser.Geom.Rectangle.Contains
    );

    box.on("pointerdown", () => {
      if (box === this.userBox) {
        this.activeField = "user";
      } else {
        this.activeField = "session";
      }
      this.updateBoxStyles();
    });

    return box;
  }

  updateBoxStyles() {
    const centerX = this.cameras.main.width / 2;

    const redraw = (box, y, isActive) => {
      box.clear();
      box.fillStyle(0xffffff, 1);
      box.fillRoundedRect(centerX - 150, y - 25, 300, 50, 12);

      if (isActive) {
        box.lineStyle(3, 0x87ceeb, 1);
        box.strokeRoundedRect(centerX - 150, y - 25, 300, 50, 12);
      }
    };

    redraw(this.userBox, 460, this.activeField === "user");
    redraw(this.sessionBox, 570, this.activeField === "session");
  }

  createStartButton() {
    const centerX = this.cameras.main.width / 2;

    const button = this.add.graphics();
    button.fillStyle(0x87ceeb, 1);
    button.fillRoundedRect(centerX - 150, 650, 300, 60, 15);

    button.setInteractive(
      new Phaser.Geom.Rectangle(centerX - 150, 650, 300, 60),
      Phaser.Geom.Rectangle.Contains
    );

    this.add.text(centerX, 680, "Start Game", {
      fontSize: "26px",
      fontFamily: "Arial",
      color: "#000000",
      fontStyle: "bold",
    }).setOrigin(0.5);

    button.on("pointerdown", () => {
      this.initializeIdentity();
    });
  }

  setupKeyboardInput() {
    this.input.keyboard.on("keydown", (event) => {
      if (!this.activeField) return;

      if (event.key === "Backspace") {
        if (this.activeField === "user") {
          this.userIdValue = this.userIdValue.slice(0, -1);
        } else {
          this.sessionIdValue = this.sessionIdValue.slice(0, -1);
        }
      } else if (event.key.length === 1) {
        if (this.activeField === "user") {
          this.userIdValue += event.key;
        } else {
          this.sessionIdValue += event.key;
        }
      }

      this.updateInputDisplay();
    });
  }

  updateInputDisplay() {
    const userCursor =
      this.activeField === "user" && this.cursorVisible ? "|" : "";
    const sessionCursor =
      this.activeField === "session" && this.cursorVisible ? "|" : "";

    this.userText.setText(this.userIdValue + userCursor);
    this.sessionText.setText(this.sessionIdValue + sessionCursor);
  }

  startCursorBlink() {
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        this.cursorVisible = !this.cursorVisible;
        this.updateInputDisplay();
      },
    });
  }

  initializeIdentity() {
    const user = this.userIdValue.trim();
    const session = this.sessionIdValue.trim();

    if (!user || !session) return;

    window.APP_IDENTITY = {
      user_id: user,
      session_id: session,
    };

    this.scene.start("Game");
  }
}
