import BaseWidget from '../BaseWidget';

export default class WidgetA extends BaseWidget {
  constructor(target) {
    super(target);
    this.widgetName = 'WidgetA';
  }

  async init() {
    const container = document.createElement('div');
    container.className = 'content';
    container.textContent += `Content added by ${this.widgetName}`;

    const { firstChild } = this.target;
    this.target.insertBefore(container, firstChild);
    await super.init();
    // We can remove the await super.init() if we are sure that parent class' init is empty or irrevelant to the child's behavior
  }

  destroy() {
    super.destroy();
  }
}
