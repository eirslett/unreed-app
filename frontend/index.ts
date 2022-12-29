import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './components/App/App';

const root = document.createElement('div');
document.body.appendChild(root);
createRoot(root).render(createElement(App));
