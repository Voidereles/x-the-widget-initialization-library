class X {
    constructor(resolver = (widgetPath) => import(`./${widgetPath}.js`)) {
      this.widgetsMap = new WeakMap();
      // Tracks widget instances. In comparison to Map,
      // key types are objects only, for example dom elements,
      //  you cannot iterate over them, unreachable keys are
      // automatically removed, no one can access widgetsMap
      // weakMap prevents duplicate instances for the same DOM node.
      this.resolver = resolver; // Allow a custom resolver
    }
  
    async init(root, callback) {
      const widgets = root.querySelectorAll('[widget]'); // 1. X looks for the widget attribute recursively (top to bottom) starting from the root node.
      const initializedWidgets = new Set(); // Tracks successful initializations
  
      const widgetPromises = Array.from(widgets).map(async (widget) => {
        const parent = widget.parentElement.closest('[widget]');
        if (parent && !initializedWidgets.has(parent)) {
          // Skip if the parent widget failed
          return { widget, error: new Error('Parent widget failed') };
        }
  
        // create array, because NodeList (querySelectorAll) cannot use map
        const widgetPath = widget.getAttribute('widget');
        try {
          const WidgetClass = await this.resolver(widgetPath); // Use resolver here
          // 2. If a widget with the given path was not loaded yet, it loads the widget.
  
          const instance = new WidgetClass(widget); // 3. It instantiates the widget
          this.widgetsMap.set(widget, instance);
          await instance.init(); // 3. and calls its init method with the given target.
  
          return null;
        } catch (e) {
          return { widget, error: e }; // Return error if initialization fails
        }
      });
  
      // Wait for all widget promises to resolve
      const results = await Promise.all(widgetPromises);
  
      // Separate errors and successful initializations
      const errors = results.filter(Boolean); // Contains error objects for failed widgets
  
      // If there are any errors, pass them to the callback
      if (errors.length) {
        callback(errors);
      } else {
        callback(null); // Pass null if there were no errors
      }
    }
  
    destroy(root) {
      const widgets = [...root.querySelectorAll('[widget]')].reverse(); // Bottom-to-top order
      widgets.forEach((widget) => {
        const instance = this.widgetsMap.get(widget);
        if (instance) {
          // Check if the widget has a destroy method
          if (typeof instance.destroy !== 'function') {
            console.warn(`Widget at ${widget} does not have a destroy method.`);
          } else {
            try {
              instance.destroy(); // Call the widget's destroy method
            } catch (error) {
              console.error(`Error while destroying widget at ${widget}:`, error);
            }
          }
  
          // Remove the widget instance from the map
          this.widgetsMap.delete(widget); // weakMap.delete() ensures instances are only removed once
        }
      });
    }
  }
  
  export default new X();
  