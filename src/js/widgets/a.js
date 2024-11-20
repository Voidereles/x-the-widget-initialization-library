import BaseWidget from '../BaseWidget';

export default class WidgetA extends BaseWidget {
  constructor(target) {
    super(target);
    this.widgetName = 'WidgetA';
  }

  async init() {
    console.log(`${this.widgetName} is initializing.`);

    // Ensure there is a dedicated container for WidgetA content
    let container = this.target.querySelector('.widget-a-content');

    // Create the container if it doesn't exist
    if (!container) {
      container = document.createElement('div');
      container.className = 'widget-a-content';
    }

    // Insert the container before any existing child nodes (e.g., WidgetB)
    const { firstChild } = this.target; // Get the first child (WidgetB in this case)
    this.target.insertBefore(container, firstChild);

    // Add content to the dedicated container
    container.textContent = `Content added by ${this.widgetName}`;

    // Call BaseWidget's init() for additional processing
    await super.init();
  }

  destroy() {
    console.log(`${this.widgetName} is being destroyed.`);
    super.destroy();
  }
}
