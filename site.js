const BASE = {
  sideScheme: {
    threat: 3,
    counter: 0,
  },
  minion: {
    health: 3,
    tough: false,
    tough2: false,
    stunned: false,
    stunned2: false,
    confused: false,
    confused2: false,
    counter: 0,
  },
  ally: {
    health: 3,
    tough: false,
    tough2: false,
    stunned: false,
    stunned2: false,
    confused: false,
    confused2: false,
    counter: 0,
  },
  card: {
    counter: 3,
  },
  hero: {
    health: 10,
    tough: false,
    tough2: false,
    stunned: false,
    stunned2: false,
    confused: false,
    confused2: false,
    minions: [],
    allies: [],
    cards: [],
    counter: 0,
  },
  state: {
    villain: {
      health: 30,
      tough: false,
      tough2: false,
      stunned: false,
      stunned2: false,
      confused: false,
      confused2: false,
      minions: [],
      counter: 0,
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

document.addEventListener('alpine:init', () => {
  const editModalRef = new bootstrap.Modal('#editModal');

  const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

  Alpine.data('mct', function () {
    return {
      // Constants
      maxHeroes: 4,

      // Data
      state: this.$persist(deepCopy(BASE.state)),
      edited: {},
      selector: null,
      selectorIndex: null,
      actionPrompted: false,

      // Computed
      isSolo() {
        return this.state.heroes.length === 1;
      },

      // Methods
      initHeroes(count) {
        for (let i = 0; i < count; i++) {
          this.state.heroes.push(deepCopy(BASE.hero));
        }
        this.state.firstPlayer = Math.floor(Math.random() * count);
      },
      addVillain() {
        this.state.villain.minions.push(deepCopy(BASE.minion));
        this.edit((s) => s.villain.minions, this.state.villain.minions.length - 1);
      },
      addSideScheme() {
        this.state.sideSchemes.push(deepCopy(BASE.sideScheme));
        this.edit((s) => s.sideSchemes, this.state.sideSchemes.length - 1);
      },
      addMinion(heroIndex) {
        const list = this.state.heroes[heroIndex].minions;
        list.push(deepCopy(BASE.minion));
        this.edit((s) => s.heroes[heroIndex].minions, list.length - 1);
      },
      addAlly(heroIndex) {
        const list = this.state.heroes[heroIndex].allies;
        list.push(deepCopy(BASE.ally));
        this.edit((s) => s.heroes[heroIndex].allies, list.length - 1);
      },
      addCard(heroIndex) {
        const list = this.state.heroes[heroIndex].cards;
        list.push(deepCopy(BASE.card));
        this.edit((s) => s.heroes[heroIndex].cards, list.length - 1);
      },
      edit(selector, selectorIndex = null) {
        this.selector = selector;
        this.selectorIndex = selectorIndex;
        this.rebindEdited();
        this.actionPrompted = false;
        editModalRef.show();
      },
      editDecrease(prop) {
        if (!(prop in this.edited)) return;
        this.edited[prop] = Math.max(0, this.edited[prop] - 1);
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
        if (this.selectorIndex === null) return;
        if (!this.actionPrompted) {
          this.actionPrompted = true;
          return;
        }
        this.selector(this.state).splice(this.selectorIndex, 1);
        editModalRef.hide();
      },
      rebindEdited() {
        let edited = this.selector ? this.selector(this.state) : null;
        edited = edited && this.selectorIndex !== null ? edited[this.selectorIndex] : edited;
        this.edited = edited || {};
      },
      cycle() {
        this.state.firstPlayer = (this.state.firstPlayer + 1) % this.state.heroes.length;
      },
      reset() {
        const response = prompt('Reset game? Type "y" to continue.') || '';
        if (response.trim().toLowerCase() !== 'y') return;
        this.state = deepCopy(BASE.state);
        this.edited = {};
        this.selector = null;
        this.selectorIndex = null;
      },
      statusActive(item) {
        return item.tough || item.tough2 || item.stunned || item.stunned2 || item.confused || item.confused2;
      },

      // Initialization
      init() {
        const ps = new PubSub({
          host: 'wss://pubsub.h.kvn.pt',
          appKey: 'champions',
          getData: () => this.state,
          setData: (data) => {
            this.state = data;
            this.rebindEdited();
          },
        });
        this.$watch('state', ps.pub);
      },
    };
  });
});
