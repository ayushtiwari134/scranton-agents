import WebSocketApiService from '../services/WebSocketApiService';

class DialogueManager {

  /**
   * Manages dialogue lifecycle, streaming,
   * persona routing, and keyboard interaction.
   */
  constructor(scene) {
    this.scene = scene;

    this.dialogueBox = null;
    this.activeCharacter = null;
    this.activePersona = null;

    this.userId = null;
    this.sessionId = null;

    this.isTyping = false;
    this.isStreaming = false;

    this.currentMessage = '';
    this.streamingText = '';

    this.cursorBlinkEvent = null;
    this.cursorVisible = true;

    this.listenersAttached = false;
  }

  /**
   * Initializes dialogue manager and loads identity.
   */
  initialize(dialogueBox) {
    this.dialogueBox = dialogueBox;
    this.loadIdentity();

    if (!this.listenersAttached) {
      this.attachKeyboardListeners();
      this.listenersAttached = true;
    }
  }

  /**
   * Loads identity from global state.
   */
  loadIdentity() {
    const identity = window.APP_IDENTITY || {
      user_id: "guest",
      session_id: "1"
    };

    this.userId = identity.user_id;
    this.sessionId = identity.session_id;
  }

  /**
   * Registers keyboard input handlers.
   */
  attachKeyboardListeners() {
    this.scene.input.keyboard.on('keydown', async (event) => {

      if (event.key === 'Escape') {
        this.closeDialogue();
        return;
      }

      if (!this.isTyping) {
        if (this.isStreaming && (event.key === ' ' || event.key === 'Space')) {
          this.skipStreaming();
        }
        return;
      }

      await this.handleTypingInput(event);
    });
  }

  /**
   * Starts dialogue session for AI character.
   */
  startDialogue(character) {
    if (!character.persona) {
      return;
    }

    this.activeCharacter = character;
    this.activePersona = character.persona;

    this.isTyping = true;
    this.currentMessage = '';
    this.cursorVisible = true;

    this.dialogueBox.show('|', true);
    this.startCursorBlink();
  }

  /**
   * Continues dialogue after streaming.
   */
  continueDialogue() {
    if (this.isStreaming) {
      this.skipStreaming();
      return;
    }

    if (!this.isTyping) {
      this.restartTyping();
    }
  }

  /**
   * Handles keyboard typing.
   */
  async handleTypingInput(event) {
    if (event.key === 'Enter') {
      await this.submitMessage();
    }
    else if (event.key === 'Backspace') {
      this.currentMessage = this.currentMessage.slice(0, -1);
      this.updateInputDisplay();
    }
    else if (event.key.length === 1) {
      this.currentMessage += event.key;
      this.updateInputDisplay();
    }
  }

  /**
   * Sends message to backend.
   */
  async submitMessage() {
    if (!this.currentMessage.trim()) {
      return;
    }

    this.dialogueBox.show('...', true);
    this.stopCursorBlink();
    this.isTyping = false;

    await this.streamResponse();

    this.currentMessage = '';
  }

  /**
   * Streams backend response via WebSocket.
   */
  async streamResponse() {

    this.isStreaming = true;
    this.streamingText = '';

    await WebSocketApiService.sendMessage(
      {
        user_id: this.userId,
        session_id: this.sessionId,
        persona: this.activePersona,
        message: this.currentMessage
      },
      {
        onToken: (chunk) => {
          this.streamingText += chunk;
          this.dialogueBox.show(this.streamingText, true);
        },
        onDone: () => {
          this.isStreaming = false;
        }
      }
    );

    while (this.isStreaming) {
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    this.finishStreaming();
  }

  /**
   * Finalizes streaming cycle.
   */
  finishStreaming() {
    this.dialogueBox.show(this.streamingText, true);
    this.isTyping = false;
  }

  /**
   * Resets typing state.
   */
  restartTyping() {
    this.isTyping = true;
    this.currentMessage = '';
    this.cursorVisible = true;

    this.startCursorBlink();
    this.updateInputDisplay();
  }

  /**
   * Updates input line with blinking cursor.
   */
  updateInputDisplay() {
    const text = this.currentMessage + (this.cursorVisible ? '|' : '');
    this.dialogueBox.show(text, true);
  }

  /**
   * Starts blinking cursor.
   */
  startCursorBlink() {
    this.cursorBlinkEvent = this.scene.time.addEvent({
      delay: 400,
      callback: () => {
        if (this.isTyping) {
          this.cursorVisible = !this.cursorVisible;
          this.updateInputDisplay();
        }
      },
      loop: true
    });
  }

  /**
   * Stops blinking cursor.
   */
  stopCursorBlink() {
    if (this.cursorBlinkEvent) {
      this.cursorBlinkEvent.remove();
      this.cursorBlinkEvent = null;
    }
  }

  /**
   * Skips streaming animation.
   */
  skipStreaming() {
    this.isStreaming = false;
  }

  /**
   * Closes dialogue session.
   */
  closeDialogue() {
    this.dialogueBox.hide();
    this.isTyping = false;
    this.currentMessage = '';
    this.stopCursorBlink();
  }
}

export default DialogueManager;
