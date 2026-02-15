import { Scene } from "phaser";

export class MainMenu extends Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.add.image(0, 0, "background").setOrigin(0, 0);

    // === TITLE ===
    this.add
      .text(centerX, centerY - 200, "Scranton Agent", {
        fontSize: "48px",
        fontFamily: "Arial",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    // === USER ID LABEL ===
    this.add
      .text(centerX - 150, centerY - 80, "User ID:", {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5);

    this.userInput = this.add.dom(centerX + 40, centerY - 80, "input", {
      type: "text",
      fontSize: "18px",
      width: "200px",
      padding: "8px",
    });

    // === SESSION ID LABEL ===
    this.add
      .text(centerX - 150, centerY - 20, "Session ID:", {
        fontSize: "22px",
        color: "#ffffff",
      })
      .setOrigin(0, 0.5);

    this.sessionInput = this.add.dom(centerX + 40, centerY - 20, "input", {
      type: "text",
      fontSize: "18px",
      width: "200px",
      padding: "8px",
    });

    // === START BUTTON ===
    const startButton = this.add
      .text(centerX, centerY + 100, "Start Game", {
        fontSize: "32px",
        backgroundColor: "#ffffff",
        color: "#000000",
        padding: { x: 20, y: 10 },
      })
      .setOrigin(0.5)
      .setInteractive();

    startButton.on("pointerdown", () => {
      this.initializeIdentity();
    });
  }

  initializeIdentity() {
    const userId =
      this.userInput?.node?.value?.trim() || "guest";
    const sessionId =
      this.sessionInput?.node?.value?.trim() || "1";

    window.APP_IDENTITY = {
      user_id: userId,
      session_id: sessionId,
    };

    this.scene.start("Game");
  }
}
