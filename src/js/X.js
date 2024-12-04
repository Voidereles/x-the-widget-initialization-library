class X {
  constructor() {
    this.widgetsMap = new WeakMap(); // Tracks widget instances with weak references
    this.activeInitializations = new Map(); // Tracks active initialization processes

    // Use import.meta.glob to pre-register all potential widget modules
    this.widgetModules = import.meta.glob('./widgets/*.js');

    // Resolver that uses the pre-registered modules
    this.resolver = async (widgetPath) => {
      console.log(`Resolving widget: ${widgetPath}`);
      const module = this.widgetModules[`./${widgetPath}.js`]; // Find the matching module

      if (!module) {
        throw new Error(`Widget module not found: ${widgetPath}`);
      }

      const loadedModule = await module(); // Dynamically load the module
      console.log(`Loaded module:`, loadedModule);

      if (!loadedModule.default || typeof loadedModule.default !== 'function') {
        throw new TypeError(
          `Module at ${widgetPath} is not a valid widget class.`,
        );
      }
      return loadedModule.default; // Return the default export (widget class)
    };
  }

  // Tracks the active initialization processes
  signalWidgetStart(widgetInstance) {
    if (!this.widgetsMap.has(widgetInstance.target)) {
      throw new Error('Widget instance is not managed by X.');
    }

    // If the widget is already being initialized, we skip it
    if (this.activeInitializations.has(widgetInstance.target)) {
      console.log(
        `Widget ${widgetInstance.target} is already being initialized.`,
      );
      return;
    }

    // Create a promise that tracks the widget's initialization process
    const initPromise = new Promise((resolve, reject) => {
      (async () => {
        try {
          // Call the widget's signalInitStart method if it exists
          if (typeof widgetInstance.signalInitStart === 'function') {
            await widgetInstance.signalInitStart();
          }
          resolve();
        } catch (error) {
          reject(error);
        }
      })();
    });

    // Store the initialization promise to track the widget's state
    this.activeInitializations.set(widgetInstance.target, initPromise);
  }

  // Called when the widget signals that its initialization is complete
  signalWidgetComplete(widgetInstance, error = null) {
    const widget = widgetInstance.target;

    // Ensure the widget is actively being initialized
    if (!this.activeInitializations.has(widget)) {
      console.warn(
        `Widget ${widget.getAttribute('widget')} completion signal ignored: not actively initializing.`,
      );
      return;
    }

    // Remove widget from active initialization tracking
    this.activeInitializations.delete(widget);

    if (error) {
      console.error(
        `Widget ${widget.getAttribute('widget')} failed with error:`,
        error,
      );
      widget.classList.remove('widget-done');
      widget.classList.add('widget-failed');
    } else {
      // Handle success case
      console.log(
        `Widget ${widget.getAttribute('widget')} successfully completed.`,
      );
      widget.classList.remove('widget-failed');
      widget.classList.add('widget-done');
    }
  }

  async waitForParentInitialization(parent) {
    const checkInterval = 100; // Time to wait between checks in ms

    return new Promise((resolve) => {
      const checkParentInitialization = () => {
        if (this.isWidgetInitialized(parent)) {
          console.log(
            `Parent widget ${parent.getAttribute('widget')} is now initialized.`,
          );
          resolve();
        } else {
          // Keep checking every checkInterval ms until the parent is initialized
          setTimeout(checkParentInitialization, checkInterval);
        }
      };

      // Start the first check
      checkParentInitialization();
    });
  }

  isWidgetInitialized(widget) {
    return this.widgetsMap.has(widget);
  }

  async init(root, callback) {
    const widgets = root.parentElement.querySelectorAll('[widget]');
    console.log(`Widgets found for initialization:`, widgets);

    const initializedWidgets = new Set(); // Tracks widgets that are successfully initialized
    const failedWidgets = []; // Collect widgets that failed due to parent dependency

    const widgetPromises = Array.from(widgets).map(async (widget) => {
      if (this.widgetsMap.has(widget)) {
        console.log(
          `Widget ${widget.getAttribute('widget')} is already initialized. Skipping.`,
        );
        return null; // Ensures only new widgets are initialized and avoids reinitializing widgets unnecessarily.
      }

      console.log(
        `[DEBUG] Processing widget: ${widget.getAttribute('widget')}`,
      );

      const parent = widget.parentElement
        ? widget.parentElement.closest('[widget]')
        : null;

      // Handle parent widget initialization failure
      if (parent && !initializedWidgets.has(parent)) {
        console.log(
          `Parent widget for ${widget.getAttribute('widget')} not initialized, waiting.`,
        );
        // Wait for the parent widget to initialize fully before continuing with this widget
        await this.waitForParentInitialization(parent);
      }

      // Protects against concurrent initialization attempts for the same widget.
      if (this.activeInitializations.has(widget)) {
        console.log(
          `Widget ${widget.getAttribute('widget')} is already being initialized.`,
        );
        return { widget, error: new Error('WidgetAlreadyInitializing') };
      }

      // Mark widget as initializing
      this.activeInitializations.set(widget, true);

      let initPromise = null;

      try {
        const widgetPath = widget.getAttribute('widget');
        console.log(`Resolving widget: ${widgetPath}`);

        const WidgetClass = await this.resolver(widgetPath); // Resolve widget class dynamically
        const instance = new WidgetClass(widget); // Create widget instance

        // Register the widget instance in the widgetsMap immediately
        this.widgetsMap.set(widget, instance);

        // Ensure that init() always returns a promise
        initPromise = instance.init();

        if (!(initPromise instanceof Promise)) {
          // Wrap non-promise init methods in a promise
          initPromise = Promise.resolve(initPromise);
        }

        // Wait for widget initialization to complete
        await initPromise;

        initializedWidgets.add(widget); // Mark the widget as initialized
        return null; // No error
      } catch (e) {
        return { widget, error: e }; // Handle errors during loading or initialization
      } finally {
        // Ensure the widget is cleaned up from activeInitializations
        this.activeInitializations.delete(widget);

        // Ensure initPromise is handled correctly (catch any errors)
        if (initPromise) {
          await initPromise.catch(() => {}); // Safely catch errors if initPromise fails
        }
      }
    });

    // Wait for all widgets to initialize
    const results = await Promise.all(widgetPromises);

    // Filter out errors and pass them to the callback
    const errors = results.filter(Boolean);
    callback(errors.length ? errors : null); // Invoke callback with errors or null

    // After initial processing, try initializing the failed widgets
    const failedWidgetPromises = failedWidgets.map(async (failedWidget) => {
      console.log(
        `Retrying initialization for widget: ${failedWidget.getAttribute('widget')}`,
      );

      try {
        // Wait for the parent widget to be initialized first, if necessary
        const parent = failedWidget.parentElement.closest('[widget]');
        if (parent && !initializedWidgets.has(parent)) {
          console.log(
            `Waiting for parent widget ${parent.getAttribute('widget')} to initialize.`,
          );
          await new Promise((resolve) => {
            const interval = setInterval(() => {
              if (initializedWidgets.has(parent)) {
                clearInterval(interval);
                resolve();
              }
            }, 100); // Check every 100ms
          });
        }

        // Retry initializing the widget
        const widgetPath = failedWidget.getAttribute('widget');
        const WidgetClass = await this.resolver(widgetPath);
        const instance = new WidgetClass(failedWidget);
        await instance.init();

        // Register the widget instance in the widgetsMap
        this.widgetsMap.set(failedWidget, instance);
        initializedWidgets.add(failedWidget); // Mark as successfully initialized
        console.log(
          `${failedWidget.getAttribute('widget')} successfully initialized.`,
        );
      } catch (e) {
        console.error(
          `Failed to initialize widget: ${failedWidget.getAttribute('widget')}`,
          e,
        );
      }
    });

    // Wait for all retry attempts to finish
    await Promise.all(failedWidgetPromises);
  }

  destroy(selectedWidget) {
    if (this.widgetsMap.size === 0) {
      console.warn('No widgets were initialized before calling destroy.');
      return;
    }
    console.log(this.widgetsMap);

    if (this.activeInitializations.has(selectedWidget)) {
      this.activeInitializations.delete(selectedWidget);
    }

    const widgets = selectedWidget && [selectedWidget]; // Only destroy the specific widget passed

    widgets.forEach((widget) => {
      console.log(widget);

      if (this.activeInitializations.has(widget)) {
        console.error(
          `Widget ${widget} is still being initialized, cannot destroy yet.`,
        );
      }

      const instance = this.widgetsMap.get(selectedWidget); // Get widget instance

      try {
        instance.destroy(); // Call widget's destroy method
        selectedWidget.classList.remove(...selectedWidget.classList);
        selectedWidget.querySelectorAll('.content').forEach((widgetContent) => {
          widgetContent.remove();
        });
        this.widgetsMap.delete(selectedWidget);
        selectedWidget.querySelectorAll('[widget]').forEach((childWidget) => {
          this.widgetsMap.delete(childWidget);
        });
        console.log(this.widgetsMap);
      } catch (error) {
        console.error(
          `Error while destroying widget at ${selectedWidget}:`,
          error,
        );
      }
    });
  }
}

export default new X();
