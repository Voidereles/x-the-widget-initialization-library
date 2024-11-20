import X from './X';

class BaseWidget {
  constructor(target) {
    this.target = target; // The DOM element associated with this widget
    console.log(`Widget target set to:`, this.target); // Debugging line
    this.handlersBound = false; // Flag to track whether handlers are already bound
  }

  // The init method is called when a widget is initialized
  async init() {
    // Ensure that handlers are bound
    if (!this.handlersBound) {
      this.bindHandlerMethods();
    }

    // Notify that the widget's initialization is starting
    this.signalWidgetStart();
    await this.signalInitStart(); // Optionally overridden by the widget class

    // Initialize any child widgets (subtree)
    await this.initSubtree();

    // Complete the widget's initialization
    await this.signalInitComplete(); // Optionally overridden by the widget class
    this.signalWidgetComplete();
  }

  // A method to check for and bind handler methods (methods ending in 'Handler')
  bindHandlerMethods() {
    // Loop over all methods on this widget instance
    Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach((key) => {
      // If the method name ends with 'Handler', bind it to 'this'
      if (key.endsWith('Handler') && typeof this[key] === 'function') {
        this[key] = this[key].bind(this);
      }
    });
    this.handlersBound = true; // Mark that handlers have been bound
  }

  // These are lifecycle hooks to be used by the widget:
  // signalInitStart is called before the widget's subtree is initialized
  async signalInitStart() {
    // Custom logic for initialization start (optional to override)
    console.log(`${this.constructor.name} is starting initialization.`);
  }

  // signalInitComplete is called after the widget's subtree is initialized
  async signalInitComplete() {
    // Custom logic for initialization completion (optional to override)
    console.log(`${this.constructor.name} has completed initialization.`);
  }

  // This method signals to the X library that widget initialization has started
  signalWidgetStart() {
    X.signalWidgetStart(this);
  }

  // This method signals to the X library that widget initialization is complete
  signalWidgetComplete() {
    X.signalWidgetComplete(this);
  }

  // Example of initializing child widgets within this widget
  async initSubtree() {
    // Traverse and initialize any child widgets, if necessary
    // This could involve calling X.init for child widgets or doing other custom logic
    if (this.target) {
      console.log(`Initializing subtree for ${this.target}`);
    }
  }

  // The destroy method is called when the widget is destroyed
  destroy() {
    // Custom destruction logic here (optional to override)
    console.log(`Destroying widget: ${this.constructor.name}`);
  }
}

export default BaseWidget;
