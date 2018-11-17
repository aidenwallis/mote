import EmoteStore from './modules/EmoteStore';
import TwitchConnection from './modules/TwitchConnection';
import EmoteCounter from './modules/EmoteCounter';
import EmoteNode from './modules/EmoteNode';

const rx = /[?/]/g;
const rx2 = /\s/g;

class App {
    constructor() {
        const channelName = window.location.pathname.substring(1).split(rx)[0];
        this.channelName = channelName;
        this.emoteStore = new EmoteStore();
        this.emoteNodes = [];
        this.emoteCounter = new EmoteCounter(() => this.render());
        this.connection = new TwitchConnection(channelName, m => this.newMessage(m));
    }

    start() {
        this.connection.connect();
        this.emoteStore.fetchGlobalBTTVEmotes();
        this.emoteStore.fetchGlobalFFZEmotes();
        this.emoteStore.fetchChannelBTTVEmotes(this.channelName);
        this.emoteStore.fetchChannelFFZEmotes(this.channelName);
    }

    newMessage(parsed) {
        if (typeof parsed.tags.emotes === 'string') {
            this.parseTwitchEmotes(parsed);
        }
        this.parseThirdPartyEmotes(parsed.trailing);
    }

    parseThirdPartyEmotes(msg) {
        const split = msg.split(' ');
        const countedEmotes = {};
        for (let i = 0; i < split.length; i++) {
            const item = split[i];
            const foundEmote = this.emoteStore.findThirdPartyEmote(item);
            if (!foundEmote) {
                continue;
            }
            countedEmotes[item] = (countedEmotes[item] || 0) + 1;
        }
        for (let name in countedEmotes) {
            this.emoteCounter.countEmote(name, countedEmotes[name]);
        }
    }

    parseTwitchEmotes(parsed) {
        const emotes = parsed.tags.emotes.split('/');
        for (let i = 0; i < emotes.length; i++) {
            const [emoteid, positionStr] = emotes[i].split(':');
            const positions = positionStr.split(',');
            if (positions.length === 0) {
                continue;
            }
            const [start, end] = positions[0].split('-');
            const emoteName = parsed.trailing.slice(start, parseInt(end) + 1);
            this.emoteStore.registerTwitchEmote(emoteName, emoteid);
            this.emoteCounter.countEmote(emoteName, positions.length);
        }
    }

    render() {
        for (let i = 0; i < this.emoteCounter.topEmotesArr.length; i++) {
            const payload = this.emoteCounter.topEmotesArr[i];
            let emoteNode = this.emoteNodes[i];
            if (!emoteNode) {
                emoteNode = new EmoteNode(payload, this.emoteStore.findEmote(payload.name), i === 0);
                this.emoteNodes.push(emoteNode);
            }
            if (payload.name !== emoteNode.emoteData.name) {
                emoteNode.update(payload, this.emoteStore.findEmote(payload.name))
            }
            emoteNode.render(payload);
        }
    }
}

export default App;
