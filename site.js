document.addEventListener('alpine:init', () => {
  const BASE = {
    sideScheme: {
      threat: 0,
      counter: 0,
    },
    minion: {
      health: 0,
      tough: false,
      stunned: false,
      confused: false,
      counter: 0,
    },
    ally: {
      health: 0,
      tough: false,
      stunned: false,
      confused: false,
      counter: 0,
    },
    card: {
      counter: 0,
    },
    hero: {
      health: 10,
      tough: false,
      stunned: false,
      confused: false,
      minions: [],
      allies: [],
      cards: [],
      counter: 0,
    },
    state: {
      villain: {
        health: 0,
        tough: false,
        stunned: false,
        confused: false,
      },
      mainScheme: {
        threat: 0,
        acceleration: 0,
        counter: 0,
      },
      sideSchemes: [],
      heroes: [],
      firstPlayer: 0,
    },
  };

  const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));
  const getParams = () => {
    const params = {};
    const search = window.location.search;
    if (search) {
      search
        .substring(1)
        .split('&')
        .forEach((param) => {
          const [key, value] = param.split('=');
          params[key] = decodeURIComponent(value).replace(/\+/g, ' ').replace(/\|/g, '\n');
        });
    }
    return params;
  };

  const editModalRef = new bootstrap.Modal('#editModal');

  Alpine.data('mct', function () {
    return {
      // Constants
      maxHeroes: 4,

      // Data
      state: this.$persist(deepCopy(BASE.state)),
      edited: {},
      editedList: null,
      editedIndex: null,
      lastJson: null,

      // Computed
      isSolo() {
        return this.state.heroes.length === 1;
      },

      // Method
      initHeroes(heroCount) {
        for (let i = 0; i < heroCount; i++) {
          this.state.heroes.push(deepCopy(BASE.hero));
        }
        this.state.firstPlayer = Math.floor(Math.random() * heroCount);
      },
      addSideScheme() {
        const sideScheme = deepCopy(BASE.sideScheme);
        this.state.sideSchemes.push(sideScheme);
        this.edit(sideScheme, this.state.sideSchemes, this.state.sideSchemes.length - 1);
      },
      addMinion(hero) {
        const minion = deepCopy(BASE.minion);
        hero.minions.push(minion);
        this.edit(minion, hero.minions, hero.minions.length - 1);
      },
      addAlly(hero) {
        const ally = deepCopy(BASE.ally);
        hero.allies.push(ally);
        this.edit(ally, hero.allies, hero.allies.length - 1);
      },
      addCard(hero) {
        const card = deepCopy(BASE.card);
        hero.cards.push(card);
        this.edit(card, hero.cards, hero.cards.length - 1);
      },
      edit(edited, editedList, editedIndex) {
        this.edited = edited;
        this.editedList = editedList;
        this.editedIndex = editedIndex;
        editModalRef.show();
      },
      editDecrease(prop) {
        if (!(prop in this.edited)) return;
        if (this.edited[prop] > 0) {
          this.edited[prop]--;
        } else {
          this.edited[prop] = 0;
        }
      },
      editIncrease(prop) {
        if (!(prop in this.edited)) return;
        this.edited[prop]++;
      },
      editBlur(prop) {
        const safeValue = Math.max(0, Math.floor(this.edited[prop]) || 0);
        this.edited[prop] = null;
        this.edited[prop] = safeValue;
      },
      editDelete() {
        if (this.editedList === null) return;
        if (!confirm('Delete this item?')) return;
        this.editedList.splice(this.editedIndex, 1);
        editModalRef.hide();
      },
      cycle() {
        this.state.firstPlayer = (this.state.firstPlayer + 1) % this.state.heroes.length;
      },
      reset() {
        const response = prompt('Reset game? Type "y" to continue.') || '';
        if (response.trim().toLowerCase() !== 'y') return;
        this.state = deepCopy(BASE.state);
      },

      // Initialization
      init() {
        const connect = (subKey) => {
          const ws = new WebSocket('wss://pubsub.h.kvn.pt/');
          ws.onmessage = (event) => {
            console.log('Received data');
            this.lastJson = event.data;
            this.state = JSON.parse(event.data);
          };
          ws.onopen = () => {
            console.log('Subscribing to:', subKey);
            ws.send(JSON.stringify({ action: 'sub', key: subKey }));
          };
          ws.onclose = (e) => {
            console.log('Socket closed:', e.reason);
            setTimeout(() => connect(subKey), 1000);
          };
          ws.onerror = function (err) {
            console.error('Socket error:', err.message);
            ws.close();
          };
          this.$watch('state', (value) => {
            if (JSON.stringify(this.state) === this.lastJson) return;
            console.log('Sending data');
            ws.send(JSON.stringify({ action: 'pub', key: subKey, data: value }));
          });
        };

        const params = getParams();
        if (params.k) {
          connect('champions:' + params.k);
        }
      },
    };
  });
});
