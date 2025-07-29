class Store {
  constructor() {
    this.state = {};
    this.listeners = {};
  }

  getState(key) {
    return this.state[key];
  }

  setState(key, newState) {
    const prevState = this.state[key];

    this.state[key] = {
      ...prevState,
      ...newState,
    };

    this.notify(key, this.state[key], prevState);
  }

  subscribe(key, listener) {
    if (!this.listeners[key]) {
      this.listeners[key] = [];
    }

    this.listeners[key].push(listener);

    return () => this.unsubscribe(key, listener);
  }

  unsubscribe(key, listener) {
    if (this.listeners[key]) {
      const index = this.listeners[key].indexOf(listener);
      if (index !== -1) {
        this.listeners[key].splice(index, 1);
      }
    }
  }

  notify(key, newState, prevState) {
    if (this.listeners[key]) {
      this.listeners[key].forEach((listener) => listener(newState, prevState));
    }
  }
}

export const store = new Store();
