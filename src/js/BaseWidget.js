import X from './X';

class BaseWidget {
  constructor(target) {
    this.target = target;
    this.handlersBound = false;
  }

  async init() {
    if (!this.handlersBound) {
      this.bindHandlerMethods();
    }

    this.signalWidgetStart();
    await this.signalInitStart(); // Optionally overridden by the widget class

    // Initialize any child widgets (subtree)
    await this.initSubtree();

    await this.signalInitComplete(); // Optionally overridden by the widget class
    this.signalWidgetComplete();
  }

  // A method to check for and bind handler methods (methods ending in 'Handler')
  bindHandlerMethods() {
    // Loop over all methods on this widget instance
    Object.getOwnPropertyNames(Object.getPrototypeOf(this)).forEach((key) => {
      if (key.endsWith('Handler') && typeof this[key] === 'function') {
        this[key] = this[key].bind(this);
      }
    });
    this.handlersBound = true; // Mark that handlers have been bound
  }

  async signalInitStart() {
    // Custom logic for initialization start (optional to override)
    console.log(`${this.constructor.name} is starting initialization.`);
  }

  async signalInitComplete(error = null) {
    // Custom logic for initialization completion (optional to override)
    if (error) {
      console.error(`${this.constructor.name} failed to initialize:`, error);
      this.target.classList.remove('widget-done');
      this.target.classList.add('widget-failed');
      this.failReason = error;
    } else {
      console.log(`${this.constructor.name} successfully initialized.`);
      this.target.classList.remove('widget-failed');
      this.target.classList.add('widget-done');
    }

    this.signalWidgetComplete(error);
  }

  signalWidgetStart() {
    X.signalWidgetStart(this);
  }

  signalWidgetComplete() {
    X.signalWidgetComplete(this);
  }

  // Example of initializing child widgets within this widget
  async initSubtree() {
    if (this.target) {
      console.log(`Initializing subtree for ${this.target}`);
    }
  }

  finish() {
    if (this.failed) {
      console.warn(
        `Cannot finish widget ${this.target} - it has already failed.`,
      );
      return;
    }
    this.initialized = true;
    X.signalWidgetComplete(this); // Notify X of successful initialization
  }

  fail(error) {
    if (this.initialized) {
      console.warn(
        `Cannot fail widget ${this.target} - it has already succeeded.`,
      );
      return;
    }
    this.failed = true;
    X.signalWidgetComplete(this, error); // Notify X of failed initialization
  }

  destroy() {
    console.log(`Destroying widget: ${this.constructor.name}`);
  }
}

export default BaseWidget;
