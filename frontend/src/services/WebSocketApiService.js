class WebSocketApiService {

  constructor() {
    this.socket = null;
    this.connected = false;
    this.callbacks = {};
    this.baseUrl = this.getBaseUrl();
  }

  getBaseUrl() {
    const protocol =
      window.location.protocol === "https:"
        ? "wss:"
        : "ws:";
    return `${protocol}//localhost:8000/chat/ws`;
  }

  connect() {
    return new Promise((resolve, reject) => {

      this.socket = new WebSocket(this.baseUrl);

      this.socket.onopen = () => {
        this.connected = true;
        resolve();
      };

      this.socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "token") {
          this.callbacks.onToken?.(data.content);
        }

        if (data.type === "done") {
          this.callbacks.onDone?.();
        }

        if (data.type === "error") {
          console.error(data.message);
        }
      };

      this.socket.onerror = (err) => {
        reject(err);
      };

      this.socket.onclose = () => {
        this.connected = false;
      };
    });
  }

  async sendMessage(payload, callbacks = {}) {

    if (!this.connected) {
      await this.connect();
    }

    this.callbacks = callbacks;

    this.socket.send(JSON.stringify(payload));
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.connected = false;
    }
  }
}

export default new WebSocketApiService();
