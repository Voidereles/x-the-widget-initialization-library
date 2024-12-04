TODO:
- Unit tests


# Widget Management System

This is a widget management system that supports dynamic widget initialization, widget dependency management, and lifecycle handling. It ensures that widgets are initialized in the correct order, handles widget dependencies (e.g., waiting for parent widgets to be initialized), and provides lifecycle hooks for custom initialization and destruction logic.

## Features

- **Dynamic Widget Initialization**: Widgets are dynamically resolved and initialized based on the widget's attributes.
- **Parent-Child Widget Dependency**: The system ensures that child widgets are initialized only after their parent widgets have completed initialization.
- **Lifecycle Hooks**: Widgets can define lifecycle hooks such as `signalInitStart`, `signalInitComplete`, and `destroy` for custom initialization and cleanup.
- **Promise-Based Initialization**: The initialization process is promise-based, ensuring that widgets are fully initialized before performing any actions on them.
- **Widget Destruction**: The system supports widget destruction, where widgets can clean up resources and perform necessary cleanup when removed from the DOM.
- **Widget State Management**: The system tracks widget initialization state to prevent redundant initializations and handle failure retries.

---

## Architecture Overview

The widget system is composed of two main components:

1. **Widget Class (`BaseWidget`)**: The base class for all widgets. This class provides lifecycle hooks and manages the widget's internal state.
2. **Widget Manager (`X`)**: The manager responsible for resolving, initializing, tracking, and destroying widgets. It handles the initialization process, manages widget state, and ensures widgets are initialized in the correct order.

---

## Installation

To set up the widget system, follow these steps:

### 1. Clone the repository

```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install dependencies

```bash
npm install
```

### 3. Build the project

If you're using a build tool like Webpack, Vite, or Rollup, ensure the project is properly built so that `import.meta.glob` works for dynamically importing widget modules.

```bash
npm run build
```

### 4. Run the application

```bash
npm start
```

The system will automatically initialize widgets found in the DOM.

---

## Usage

### 1. Creating a Custom Widget

To create a custom widget, extend the `BaseWidget` class and implement any necessary lifecycle methods such as `signalInitStart` and `signalInitComplete`.

Example:

```js
import BaseWidget from './BaseWidget';

class MyCustomWidget extends BaseWidget {
  async signalInitStart() {
    console.log('MyCustomWidget initialization started');
    // Custom initialization logic
  }

  async signalInitComplete() {
    console.log('MyCustomWidget initialization complete');
    // Custom logic after initialization
  }

  destroy() {
    console.log('Destroying MyCustomWidget');
    // Custom destruction logic
  }
}

export default MyCustomWidget;
```

### 2. Adding a Widget to the DOM

Add widgets to the DOM using a custom `widget` attribute:

```html
<div widget="my-custom-widget"></div>
```

### 3. Initializing Widgets

The widgets will be automatically initialized when the `X.init()` method is called. This method initializes all widgets found in the DOM.

Example usage:

```js
import X from './X';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root'); // Root DOM element containing widgets
  X.init(root, (errors) => {
    if (errors) {
      console.error('Widget initialization errors:', errors);
    } else {
      console.log('All widgets initialized successfully!');
    }
  });
});
```

### 4. Widget Initialization Lifecycle

- **`signalInitStart()`**: Called when a widget’s initialization begins. This method is intended for widget-specific startup logic.
- **`signalInitComplete()`**: Called after the widget’s subtree (child widgets) has been initialized. This method is useful for performing final setup steps.
- **`destroy()`**: Called when a widget is destroyed. This method allows the widget to clean up resources before being removed.

### 5. Destroying Widgets

To destroy all widgets in a container, use the `X.destroy()` method. It will cleanly destroy the widgets and release resources.

Example:

```js
X.destroy(root); // Destroys all widgets within the root element
```

---

## Widget Initialization Flow

1. **Widget Initialization Start**: 
   - When a widget is added to the DOM with the `widget` attribute, the `X.init()` method will detect it.
   - If the widget has any parent widgets, the system will ensure that the parent is fully initialized before proceeding with the child widget.
   - `signalWidgetStart()` is called to notify the system that widget initialization is starting.
   - `signalInitStart()` is called to allow the widget to perform custom initialization.

2. **Widget Initialization Completion**:
   - Once the widget is initialized, `signalInitComplete()` is invoked.
   - `signalWidgetComplete()` is then called to notify the system that the widget has completed initialization.

3. **Handling Errors**:
   - If a widget fails to initialize (e.g., due to missing dependencies or failed initialization), it is retried after the parent widget completes initialization.
   - Initialization errors are tracked and returned by the `X.init()` method.

4. **Widget Destruction**:
   - Widgets can be destroyed at any time, and their `destroy()` method is invoked to clean up resources.

---

## Widget Manager (`X`)

The `X` class is responsible for managing widget initialization, tracking widget state, and resolving widget modules.

- **Widgets Map (`widgetsMap`)**: Tracks the widget instances to ensure they are managed by the system.
- **Active Initializations (`activeInitializations`)**: Tracks ongoing widget initialization processes to prevent redundant initializations.
- **Resolver (`resolver`)**: Dynamically loads widget modules using `import.meta.glob`.
- **Parent Dependency Management**: Ensures that widgets are initialized in the correct order, respecting parent-child dependencies.

---

## Key Methods

### `X.init(root, callback)`

- **Description**: Initializes all widgets inside the given `root` element.
- **Parameters**:
  - `root` (Element): The DOM element containing the widgets to initialize.
  - `callback` (Function): A callback function that will be called once all widgets are processed. It receives an array of errors (if any).
  
### `X.destroy(root)`

- **Description**: Destroys all widgets inside the given `root` element. Calls each widget’s `destroy()` method.
- **Parameters**:
  - `root` (Element): The DOM element containing the widgets to destroy.

### `X.signalWidgetStart(widgetInstance)`

- **Description**: Signals that widget initialization has started. This method is invoked when a widget starts its initialization process.
- **Parameters**:
  - `widgetInstance` (BaseWidget): The widget instance that is being initialized.

### `X.signalWidgetComplete(widgetInstance)`

- **Description**: Signals that widget initialization is complete.
- **Parameters**:
  - `widgetInstance` (BaseWidget): The widget instance that has completed its initialization.

---

## Error Handling

If a widget fails to initialize (e.g., due to missing dependencies or an error in initialization), the `X.init()` method will retry initializing the widget after its parent widget has completed initialization.

- **Failed Widgets**: Widgets that fail to initialize are collected in a separate list and retried once their parent widgets are ready.
- **Initialization Promise**: Each widget initialization is tracked using promises to ensure the correct order and completion.

---

## Future Enhancements

- **Lazy Loading**: Widgets can be lazily loaded based on visibility (e.g., only load when a widget comes into view).
- **Error Logging**: Implement advanced error logging and reporting to track issues during widget initialization.
- **Caching**: Implement caching of widget initialization results to prevent unnecessary re-initializations.

---

## License

This project is licensed under the MIT License.
