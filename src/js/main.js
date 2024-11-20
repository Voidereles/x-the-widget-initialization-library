import X from './X';

console.log('x');
X.init(document.getElementById('root'), (errors) => {
  if (errors) {
    console.error('Initialization failed for:', errors);
  } else {
    console.log('All widgets initialized successfully.');
  }
});
