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
  }

  destroy() {
    console.log(`${this.widgetName} is being destroyed.`);
    super.destroy();
  }
}
