export class Component {
  $target;
  props;
  state;

  constructor($target, props) {
    this.$target = $target;
    this.props = props;
    this.setup();
    this.render();
    this.setEvent();
  }

  setup() {}

  template() {
    return "";
  }

  render() {
    this.$target.insertAdjacentHTML("beforeend", this.template());
    this.mounted();
  }

  mounted() {}

  setEvent() {}

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.update();
  }

  update() {
    this.willUpdate();
    this.render();
    this.didUpdate();
  }

  willUpdate() {}

  didUpdate() {}

  addEvent(eventType, selector, callback) {
    this.$target.addEventListener(eventType, (event) => {
      if (!event.target.closest(selector)) return false;
      callback(event);
    });
  }
}
