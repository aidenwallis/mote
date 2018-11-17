class EmoteCounter {
    constructor(renderCallback) {
        this.emoteCounts = {};
        this.topEmotes = {};
        // { name: 'LUL', count: 2 }
        this.topEmotesArr = [];
        this.leaderboard = [];

        this.renderCallback = renderCallback;
    }

    countEmote(emoteName, incrementBy = 1) {
        this.emoteCounts[emoteName] = (this.emoteCounts[emoteName] || 0) + incrementBy;
        this.calculate(emoteName);
        console.log(this.emoteCounts);
    }

    calculate(name) {
        let isTopEmote = false;
        for (let i = 0; i < this.topEmotesArr.length; i++) {
            if (name === this.topEmotesArr[i].name) {
                isTopEmote = true;
            }
        }
        if (isTopEmote) {
            this.topEmotes[name] = this.emoteCounts[name];
            this.topEmotesArr = this.topEmotesArr.map(e => ({ name: e.name, count: this.emoteCounts[e.name] }));
            this.sortTop();
        } else {
            const payload = { name: name, count: this.emoteCounts[name] };
            if (this.topEmotesArr.length < 5) {
                this.topEmotesArr.push(payload);
                if (this.topEmotesArr.length > 1) {
                    this.sortTop();
                }
            } else {
                this.topEmotesArr.push(payload);
                this.sortTop();
            }
        }
        this.triggerRender();
    }

    sortTop() {
        this.topEmotesArr = this.topEmotesArr.map(e => ({ name: e.name, count: this.emoteCounts[e.name] })).sort((a, b) => b.count - a.count);
        if (this.topEmotesArr.length > 5) {
            this.topEmotesArr = this.topEmotesArr.slice(0, 5);
        }
    }

    triggerRender() {
        this.renderCallback();
    }

}

export default EmoteCounter;
