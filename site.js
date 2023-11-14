document.addEventListener('alpine:init', () => {
  const BASE = {
    sideScheme: {
      threat: 0,
    },
    minion: {
      damage: 0,
      tough: false,
      stunned: false,
      confused: false,
      counter: 0,
    },
    ally: {
      damage: 0,
      tough: false,
      stunned: false,
      confused: false,
      counter: 0,
    },
    card: {
      counter: 0,
    },
    hero: {
      health: 0,
      tough: false,
      stunned: false,
      confused: false,
      minions: [],
      allies: [],
      cards: [],
    },
    state: {
      enemy: {
        health: 0,
        tough: false,
        stunned: false,
        confused: false,
      },
      mainScheme: {
        threat: 0,
        acceleration: 0,
      },
      sideSchemes: [],
      heroes: [],
    },
  };

  const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

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

      // Method
      initHeroes(heroCount) {
        for (let i = 0; i < heroCount; i++) {
          this.state.heroes.push(deepCopy(BASE.hero));
        }
      },
      addSideScheme() {
        this.state.sideSchemes.push(deepCopy(BASE.sideScheme));
      },
      addMinion(hero) {
        hero.minions.push(deepCopy(BASE.minion));
      },
      addAlly(hero) {
        hero.allies.push(deepCopy(BASE.ally));
      },
      addCard(hero) {
        hero.cards.push(deepCopy(BASE.card));
      },
      edit(edited, editedList, editedIndex) {
        this.edited = edited;
        this.editedList = editedList;
        this.editedIndex = editedIndex;
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
      editDelete() {
        if (this.editedList === null) return;
        if (!confirm('Delete this item?')) return;
        this.editedList.splice(this.editedIndex, 1);
        editModalRef.hide();
      },
      reset() {
        const response = prompt('Reset game? Type "yes" to continue.') || '';
        if (response.toLowerCase() !== 'yes') return;
        this.state = deepCopy(BASE.state);
      },
    };
  });
});
