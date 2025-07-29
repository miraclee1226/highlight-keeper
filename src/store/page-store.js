import { store } from "./store.js";

export const pageState = {
  set(pageInfo) {
    const currentState = store.getState("page");

    if (
      currentState?.url !== pageInfo.url ||
      currentState?.title !== pageInfo.title
    ) {
      store.setState("page", {
        url: pageInfo.url,
        title: pageInfo.title,
        updatedAt: Date.now(),
      });
    }
  },
  get() {
    const state = store.getState("page");
    return state || { url: null, title: null };
  },
  subscribe(callback) {
    return store.subscribe("page", (newState, prevState) => {
      callback(newState, prevState);
    });
  },
};
