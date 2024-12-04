/* eslint-disable consistent-return */
/* eslint-disable no-alert */
import '../styles/style.css';
import X from './X';

console.log('x');
X.init(document.getElementById('root'), (errors) => {
  if (errors) {
    console.error('Initialization failed for:', errors);
  } else {
    console.log('All widgets initialized successfully.');
  }
});

const getRelativeSelector = (node, root) => {
  const path = [];
  let currentNode = node; // Separate local variable
  while (currentNode && currentNode !== root) {
    const tagName = currentNode.tagName.toLowerCase();
    const id = currentNode.id ? `#${currentNode.id}` : '';
    const classes = currentNode.className
      ? `.${currentNode.className.split(' ').join('.')}`
      : '';
    const widgetInfo = currentNode.hasAttribute('widget')
      ? `[widget="${currentNode.getAttribute('widget')}"]`
      : '';
    const selector = `${tagName}${id}${classes}${widgetInfo}`;
    path.unshift(selector);
    currentNode = currentNode.parentElement;
  }
  return path.join(' > ');
};

const infoBlock = document.querySelector('#info');
const selectedNodeInfo = infoBlock.querySelector('#selectedNodeInfo');
console.log(infoBlock);

document.body.addEventListener('click', (e) => {
  let selectedNode = null;

  // Case 1: Clicked node is a <div> with the widget attribute
  if (e.target.hasAttribute('widget')) {
    selectedNode = e.target;
  }
  // Case 2: Clicked node is a direct child of a <div> with widget attribute and has .content class
  else if (
    e.target.classList.contains('content') &&
    e.target.parentElement.hasAttribute('widget')
  ) {
    selectedNode = e.target.parentElement;
  }

  // If a node is selected, apply the "selected" class
  if (selectedNode) {
    // Remove 'selected' class from all widget nodes
    document
      .querySelectorAll('.selected')
      .forEach((node) => node.classList.remove('selected'));

    // Add 'selected' class to the determined node
    selectedNode.classList.add('selected');
    selectedNodeInfo.textContent = getRelativeSelector(selectedNode);

    console.log('Selected node:', selectedNode);
  } else {
    console.log('No valid node clicked.');

    document
      .querySelectorAll('.selected')
      .forEach((node) => node.classList.remove('selected'));
  }
});

// Event listeners for buttons
document.querySelector('#init').addEventListener('click', () => {
  const selectedNode = document.querySelector('.selected');
  if (!selectedNode) return alert('No node selected.');

  X.init(selectedNode, (errors) => {
    if (errors) {
      console.error('Initialization errors:', errors);
      alert(
        'Some widgets failed to initialize. Check the console for details.',
      );
    } else {
      alert('Initialization complete.');
    }
  });
});

document.querySelector('#destroy').addEventListener('click', () => {
  const selectedNode = document.querySelector('.selected');
  if (!selectedNode) return alert('No node selected.');

  X.destroy(selectedNode);
  alert('Destroy called for the selected node.');
});

document.querySelector('#done').addEventListener('click', () => {
  const selectedNode = document.querySelector('.selected');
  if (!selectedNode) return alert('No node selected.');

  const widgetInstance = X.widgetsMap.get(selectedNode);
  if (!widgetInstance) return alert('Widget not initialized.');

  widgetInstance.signalInitComplete();
  alert('Widget marked as Done.');
});

document.querySelector('#fail').addEventListener('click', () => {
  const selectedNode = document.querySelector('.selected');
  if (!selectedNode) return alert('No node selected.');

  const widgetInstance = X.widgetsMap.get(selectedNode);
  if (!widgetInstance) return alert('Widget not initialized.');

  const error = new Error('Manual failure triggered.');
  widgetInstance.signalInitComplete(error);
  alert('Widget marked as Failed.');
});
