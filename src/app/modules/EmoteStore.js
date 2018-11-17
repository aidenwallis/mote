import keys from 'lodash/keys';

class EmoteStore {
    constructor(channel) {
        this.channelEmotes = {};
        this.globalEmotes = {};
        this.twitchEmotes = {};
    }

    registerTwitchEmote(emoteName, emoteId) {
        if (this.twitchEmotes[emoteName]) {
            return;
        }

        this.twitchEmotes[emoteName] = {
            id: emoteId,
            name: emoteName,
            url: `https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/3.0`,
            provider: 'twitch',
            type: '',
        };
    }

    fetchChannelBTTVEmotes(channel) {
        fetch(`https://api.betterttv.net/2/channels/${channel}`)
            .then(r => r.json())
            .then((data) => {
                for (let i = 0; i < data.emotes.length; i++) {
                    const emote = data.emotes[i];
                    this.channelEmotes[emote.code] = {
                        id: emote.id,
                        name: emote.code,
                        url: data.urlTemplate.replace('{{id}}', emote.id).replace('{{image}}', '3x'),
                        provider: 'bttv',
                        type: 'global',
                    };
                }
            })
            .catch(e => console.error('bttv channel emote err', e));
    }

    fetchChannelFFZEmotes(channel) {
        fetch(`https://api.frankerfacez.com/v1/room/${channel}`)
            .then(r => r.json())
            .then((data) => {
                const set = data.sets[data.room.set];
                if (set.emoticons) {
                    for (let i = 0; i < set.emoticons.length; i++) {
                        const emote = set.emoticons[i];
                        this.channelEmotes[emote.name] = {
                            id: emote.id,
                            name: emote.name,
                            url: emote.urls[Math.max(...keys(emote.urls))],
                            provider: 'ffz',
                            type: 'channel',
                        };
                    }
                }
            })
            .catch(e => console.error('ffz channel emote err', e));
    }

    fetchGlobalFFZEmotes() {
        fetch('https://api.frankerfacez.com/v1/set/global')
            .then(r => r.json())
            .then((data) => {
                for (let i = 0; i < data.default_sets.length; i++) {
                    const set = data.sets[data.default_sets[i]];
                    if (set.emoticons) {
                        for (let j = 0; j < set.emoticons.length; j++) {
                            const emote = set.emoticons[j];
                            this.globalEmotes[emote.name] = {
                                id: emote.id,
                                name: emote.name,
                                url: emote.urls[Math.max(...keys(emote.urls))],
                                provider: 'ffz',
                                type: 'global',
                            };
                        }
                    }
                }
            })
            .catch(e => console.error('ffz global emote err', e));
    }

    fetchGlobalBTTVEmotes() {
        fetch('https://api.betterttv.net/2/emotes')
            .then(r => r.json())
            .then((data) => {
                for (let i = 0; i < data.emotes.length; i++) {
                    const emote = data.emotes[i];
                    this.globalEmotes[emote.code] = {
                        id: emote.id,
                        name: emote.code,
                        url: data.urlTemplate.replace('{{id}}', emote.id).replace('{{image}}', '3x'),
                        provider: 'bttv',
                        type: 'global',
                    };
                }
            })
            .catch(e => console.error('bttv global emote err', e));
    }

    findEmote(name) {
       return this.twitchEmotes[name] || this.channelEmotes[name] || this.globalEmotes[name];
    }

    findThirdPartyEmote(name) {
        return this.channelEmotes[name] || this.globalEmotes[name];
    }
}

export default EmoteStore;
