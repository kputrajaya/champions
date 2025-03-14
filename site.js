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
      selector: () => ({}),
      selectorIndex: null,
      actionPrompted: false,
      lastJson: null,

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
      addSideScheme() {
        const sideScheme = deepCopy(BASE.sideScheme);
        this.state.sideSchemes.push(sideScheme);
        this.edit((s) => s.sideSchemes, this.state.sideSchemes.length - 1);
      },
      addVillain() {
        const minion = deepCopy(BASE.minion);
        this.state.villain.minions.push(minion);
        this.edit((s) => s.villain.minions, this.state.villain.minions.length - 1);
      },
      addMinion(heroIndex) {
        const hero = this.state.heroes[heroIndex];
        const minion = deepCopy(BASE.minion);
        hero.minions.push(minion);
        this.edit((s) => s.heroes[heroIndex].minions, hero.minions.length - 1);
      },
      addAlly(heroIndex) {
        const hero = this.state.heroes[heroIndex];
        const ally = deepCopy(BASE.ally);
        hero.allies.push(ally);
        this.edit((s) => s.heroes[heroIndex].allies, hero.allies.length - 1);
      },
      addCard(heroIndex) {
        const hero = this.state.heroes[heroIndex];
        const card = deepCopy(BASE.card);
        hero.cards.push(card);
        this.edit((s) => s.heroes[heroIndex].cards, hero.cards.length - 1);
      },
      edit(selector, selectorIndex = null) {
        this.selector = selector;
        this.selectorIndex = selectorIndex;
        this.editRebind();
        this.actionPrompted = false;
        editModalRef.show();
      },
      editRebind() {
        const selected = this.selector(this.state);
        this.edited = this.selectorIndex !== null ? selected[this.selectorIndex] : selected;
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
      cycle() {
        this.state.firstPlayer = (this.state.firstPlayer + 1) % this.state.heroes.length;
      },
      reset() {
        const response = prompt('Reset game? Type "y" to continue.') || '';
        if (response.trim().toLowerCase() !== 'y') return;
        this.state = deepCopy(BASE.state);
      },
      statusActive(item) {
        return item.tough || item.tough2 || item.stunned || item.stunned2 || item.confused || item.confused2;
      },

      // Initialization
      init() {
        const ps = new PubSub({
          host: 'pubsub.h.kvn.pt',
          appKey: 'champions',
          getData: () => this.state,
          setData: (data) => {
            this.state = data;
            this.editRebind();
          },
        });
        this.$watch('state', ps.pub);
      },
    };
  });
});
