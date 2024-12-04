import BaseWidget from '../BaseWidget';

export default class WidgetC extends BaseWidget {
  constructor(target) {
    super(target);
    this.widgetName = 'WidgetC';
  }

  async init() {
    console.log(`${this.widgetName} is initializing.`);
    this.target.innerHTML += `<div class="content">Content added by ${this.widgetName}</div>`;
    await super.init();
    // We can remove the await super.init() if we are sure that parent class' init is empty or irrevelant to the child's behavior
  }

  destroy() {
    super.destroy();
  }
}
