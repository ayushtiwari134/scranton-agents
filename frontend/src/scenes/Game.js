import { Scene } from 'phaser';
import Character from '../classes/Character';
import DialogueBox from '../classes/DialogueBox';
import DialogueManager from '../classes/DialogueManager';

export class Game extends Scene {

    constructor() {
        super('Game');

        this.player = null;
        this.characters = [];
        this.dialogueBox = null;
        this.dialogueManager = null;
        this.spaceKey = null;
        this.keys = null;
    }

    create() {
        const map = this.make.tilemap({ key: "map" });
        const tilesets = this.addTileset(map);
        const layers = this.createLayers(map, tilesets);

        this.createCharacters(map, layers);
        this.setupPlayer(layers.worldLayer);
        this.setupCamera();
        this.setupControls();
        this.setupDialogueSystem();
    }

    createLayers(map, tilesets) {
        const belowLayer = map.createLayer("Below Player", tilesets, 0, 0);
        const worldLayer = map.createLayer("World", tilesets, 0, 0);
        const aboveLayer = map.createLayer("Above Player", tilesets, 0, 0);

        worldLayer.setCollisionByProperty({ collides: true });
        aboveLayer.setDepth(10);

        return { belowLayer, worldLayer, aboveLayer };
    }

    addTileset(map) {
        const tuxmonTileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tuxmon-tiles");
        const greeceTileset = map.addTilesetImage("ancient_greece_tileset", "greece-tiles");
        const plantTileset = map.addTilesetImage("plant", "plant-tiles");

        return [tuxmonTileset, greeceTileset, plantTileset];
    }

    createCharacters(map, layers) {
        const configs = [
            { id: "socrates", name: "Michael", persona: "michael" },
            { id: "plato", name: "Jim", persona: "jim" },
            { id: "aristotle", name: "Dwight", persona: "dwight" },
            {
                id: "miguel",
                name: "Ayush",
                persona: null,
                defaultMessage: "Hey, I'm Ayush. I'm currently building multi-agent systems and shipping AI infrastructure."
            }
        ];

        this.characters = [];

        configs.forEach((config, index) => {

            const spawnPoint = {
                x: 350 + (index * 200),
                y: 350
            };

            const character = new Character(this, {
                id: config.id,
                name: config.name,
                spawnPoint: spawnPoint,
                atlas: config.id,
                worldLayer: layers.worldLayer,
                defaultMessage: config.defaultMessage,
                roamRadius: 400
            });

            character.persona = config.persona;
            this.characters.push(character);
        });
    }


    setupPlayer(worldLayer) {
        const firstCharacter = this.characters[0];

        const spawnX = firstCharacter.sprite.x;
        const spawnY = firstCharacter.sprite.y + 150;

        this.player = this.physics.add
            .sprite(spawnX, spawnY, "sophia", "sophia-front")
            .setSize(30, 40)
            .setOffset(0, 6);

        this.physics.add.collider(this.player, worldLayer);

        this.characters.forEach(character => {
            this.physics.add.collider(this.player, character.sprite);
        });

        this.createPlayerAnimations();

        this.physics.world.setBounds(0, 0, 1200, 800);
    }

    /**
     * Registers player animations.
     */
    createPlayerAnimations() {
        const anims = this.anims;

        const configs = [
            { key: "sophia-left-walk", prefix: "sophia-left-walk-" },
            { key: "sophia-right-walk", prefix: "sophia-right-walk-" },
            { key: "sophia-front-walk", prefix: "sophia-front-walk-" },
            { key: "sophia-back-walk", prefix: "sophia-back-walk-" }
        ];

        configs.forEach(config => {
            if (!anims.exists(config.key)) {
                anims.create({
                    key: config.key,
                    frames: anims.generateFrameNames("sophia", {
                        prefix: config.prefix,
                        start: 0,
                        end: 8,
                        zeroPad: 4
                    }),
                    frameRate: 10,
                    repeat: -1
                });
            }
        });
    }

    setupCamera() {
        const camera = this.cameras.main;
        camera.startFollow(this.player);
        camera.setBounds(0, 0, 1200, 800);
    }

    setupControls() {
        this.keys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.spaceKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.SPACE
        );
    }

    setupDialogueSystem() {
        this.dialogueBox = new DialogueBox(this);
        this.dialogueManager = new DialogueManager(this);
        this.dialogueManager.initialize(this.dialogueBox);
    }

    checkCharacterInteraction() {
        let nearbyCharacter = null;

        for (const character of this.characters) {
            if (character.isPlayerNearby(this.player)) {
                nearbyCharacter = character;
                break;
            }
        }

        if (nearbyCharacter) {
            if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {

                if (!nearbyCharacter.persona) {
                    if (!this.dialogueBox.isVisible()) {
                        this.dialogueBox.show(
                            nearbyCharacter.defaultMessage,
                            false
                        );
                    } else {
                        this.dialogueBox.hide();
                    }
                    return;
                }

                if (!this.dialogueBox.isVisible()) {
                    this.dialogueManager.startDialogue(nearbyCharacter);
                } else if (!this.dialogueManager.isTyping) {
                    this.dialogueManager.continueDialogue();
                }
            }

            if (this.dialogueBox.isVisible()) {
                nearbyCharacter.facePlayer(this.player);
            }

        } else if (this.dialogueBox.isVisible()) {
            this.dialogueManager.closeDialogue();
        }
    }

    updatePlayerMovement() {
        const speed = 175;
        this.player.body.setVelocity(0);

        let moving = false;

        if (this.keys.left.isDown) {
            this.player.body.setVelocityX(-speed);
            this.player.anims.play("sophia-left-walk", true);
            moving = true;
        } else if (this.keys.right.isDown) {
            this.player.body.setVelocityX(speed);
            this.player.anims.play("sophia-right-walk", true);
            moving = true;
        }

        if (this.keys.up.isDown) {
            this.player.body.setVelocityY(-speed);
            this.player.anims.play("sophia-back-walk", true);
            moving = true;
        } else if (this.keys.down.isDown) {
            this.player.body.setVelocityY(speed);
            this.player.anims.play("sophia-front-walk", true);
            moving = true;
        }

        this.player.body.velocity.normalize().scale(speed);

        if (!moving) {
            this.player.anims.stop();
        }
    }

    update(time, delta) {
        const isInDialogue = this.dialogueBox.isVisible();

        if (!isInDialogue) {
            this.updatePlayerMovement();
        }

        this.checkCharacterInteraction();

        this.characters.forEach(character => {
            character.update(this.player, isInDialogue);
        });
    }
}
