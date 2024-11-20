import '../styles/style.css';

class X {
  constructor() {
    this.widgetsMap = new WeakMap(); // Keeps track of widgets we've initialized
  }

  // Initialize all widgets inside a given root element
  async init(root, callback) {
    const widgets = root.querySelectorAll('[widget]'); // Find all elements with `widget` attribute
    const errors = [];

    for (const widget of widgets) { // Using for...of is considered a generator pattern. Your linter doesn't allow it because regenerator-runtime (required for older browsers) is considered too heavy.

      const widgetPath = widget.getAttribute('widget');
      try {
        // Dynamically import the widget class
        const WidgetClass = await import(`./${widgetPath}.js`);
        const instance = new WidgetClass.default(widget);

        // Save the instance so we can destroy it later
        this.widgetsMap.set(widget, instance);

        // Call the widget's init method
        await instance.init();
      } catch (e) {
        errors.push({ widget, error: e });
      }
    }

    callback(errors.length ? errors : null);
  }

  // Destroy all widgets inside a given root element
  destroy(root) {
    console.log('Destroying widgets...');
  }
}

export default new X(); // Export a single instance of this library
