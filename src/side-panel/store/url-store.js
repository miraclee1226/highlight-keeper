import { store } from "./store.js";

export const urlState = {
  set(url) {
    const currentState = store.getState("url");

    if (currentState?.url !== url) {
      store.setState("url", {
        url,
      });
    }
  },
  get() {
    const state = store.getState("url");

    return state.url;
  },
  subscribe(callback) {
    return store.subscribe("url", (newState, prevState) => {
      callback(newState?.url, prevState?.url);
    });
  },
};
