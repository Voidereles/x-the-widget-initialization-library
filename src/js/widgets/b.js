import BaseWidget from '../BaseWidget';

export default class WidgetB extends BaseWidget {
  constructor(target) {
    super(target);
    this.widgetName = 'WidgetB';
  }

  async init() {
    console.log(`${this.widgetName} is initializing.`);
    console.log('WidgetB target:', this.target); // Check target DOM element

    if (this.target) {
      const container = document.createElement('div');
      container.className = 'content';
      container.textContent += `Content added by ${this.widgetName}`;
      this.target.appendChild(container); // Add content as a new child element
    } else {
      console.error('WidgetB target is missing!');
    }

    await super.init();
    // We can remove the await super.init() if we are sure that parent class' init is empty or irrevelant to the child's behavior
  }

  destroy() {
    console.log(`${this.widgetName} is being destroyed.`);
    console.log('asdasd');
    super.destroy();
  }
}
