const appElement = document.getElementById('app');

class EmoteNode {
    constructor(payload, emoteData, first) {
        this.emoteData = emoteData;
        this.currentFormat = '';
        this.currentRender = {
            payload: {},
            emoteData: {},
        };
        this.payload = payload;

        this.wrapper = document.createElement('div');
        this.wrapper.className = `emote-wrapper${first ? ' emote-wrapper-large' : ''}`;
        this.nodes = {};

        this.renderWholeNewElement();
        appElement.appendChild(this.wrapper);

    }

    render(payload) {
        this.payload = payload;
        if (this.emoteData.id !== this.currentRender.emoteData.id) {
            this.renderWholeNewElement();
            return;
        }
        this.changeCount();
    }

    changeCount() {
        const formattedCount = this.formatCount();
        if (formattedCount === this.currentFormat) {
            return;
        }
        this.currentFormat = formattedCount;

        this.nodes.count.textContent = formattedCount;

        this.nodes.count.classList.remove('animated');
        void this.nodes.count.offsetWidth;
        this.nodes.count.classList.add('animated');
    }

    update(payload, emoteData) {
        this.payload = payload;
        this.emoteData = emoteData;
    }

    formatCount() {
        const { count } = this.payload;
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        }
        if (count >= 1000) {
            return (count / 1000).toFixed(1) + 'K';
        }
        return count;
    }

    renderWholeNewElement() {
        while (this.wrapper.firstChild) {
            this.wrapper.removeChild(this.wrapper.firstChild);
        }

        this.currentRender = {
            payload: this.payload,
            emoteData: this.emoteData,
        };

        this.nodes = {
            name: document.createElement('span'),
            count: document.createElement('span'),
            image: document.createElement('img'),
        };

        this.nodes.name.textContent = this.payload.name;
        this.nodes.name.className = 'emote-name';
        this.nodes.count.textContent = this.formatCount();
        this.nodes.count.className = 'emote-counter';
        this.nodes.image.className = 'emote-image';
        this.nodes.image.src = this.emoteData.url;
        this.nodes.image.alt = this.emoteData.name;

        this.wrapper.appendChild(this.nodes.count);
        this.wrapper.appendChild(this.nodes.image);
        this.wrapper.appendChild(this.nodes.name);

        this.wrapper.classList.remove('animated');
        void this.wrapper.offsetWidth;
        this.wrapper.classList.add('animated');
    }
}

export default EmoteNode;
