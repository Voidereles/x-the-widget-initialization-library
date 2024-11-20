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
      const contentDiv = document.createElement('div');
      contentDiv.className = 'content';
      contentDiv.innerText += `Content added by ${this.widgetName}`;
      this.target.appendChild(contentDiv); // Add content as a new child element
    } else {
      console.error('WidgetB target is missing!');
    }

    await super.init();
  }

  destroy() {
    console.log(`${this.widgetName} is being destroyed.`);
    super.destroy();
  }
}
