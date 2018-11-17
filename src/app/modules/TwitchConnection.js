import { parse as parseIRCMessage } from 'irc-message';

const address = 'wss://irc-ws.chat.twitch.tv/';
const rx = /\r?\n/g;
const rx2 = /\s/g;

class TwitchConnection {
  constructor(channel, callback) {
    this.connected = false;
    this.channel = channel;
    this.client = null;
    this.interval = null;
    this.callback = callback;

    console.log(channel, callback);
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.connected) {
        return resolve(true);
      }
      this.client = new WebSocket(address);
      this.client.onopen = () => {
        this.connected = true;
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }
        this.client.send('CAP REQ :twitch.tv/tags twitch.tv/commands');
        this.client.send('PASS oauth:123123');
        this.client.send('NICK justinfan123');
        this.client.send('USER justinfan123 8 * :justinfan123');
        this.client.send(`JOIN #${this.channel}`);
        console.log('Websocket established');
        resolve();
      };
      this.registerEvents();
    });
  }

  registerEvents() {
    if (!this.client) {
      throw new Error('Tried to bind events to a non existent client!');
    }
    this.client.onmessage = (e) => {
      // console.log(e.data);
      e.data.split(rx).forEach((line) => {
        // console.log(line);
        if (line.replace(rx2, '') === '') {
          return;
        }
        const parsed = parseIRCMessage(line);

        if (parsed.command === 'PING') {
            this.client.send(parsed.raw.replace('PING', 'PONG'));
            return;
        }

        if (parsed.command !== 'PRIVMSG') {
            return;
        }

        parsed.param = parsed.params[0];
        parsed.trailing = parsed.params[1];

        this.callback(parsed);
      });
    };
    this.client.onerror = (e) => {
      if (e.code === 'ECONNREFUSED' && !this.interval) {
        this.connected = false;
        this.interval = setInterval(() => this.connect(), 2000);
      }
    };
  }
}

export default TwitchConnection;
