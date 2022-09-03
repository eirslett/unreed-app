# Unreed

This is the main repository for the Unreed app.

## Development

Prerequisites/tools you have to install:

- git
- Node.js (and npm)
- A code editor (for example: Visual Studio Code)

### Tools that come automatically with this project

- The application is written in [React](https://reactjs.org/).
- We use [TypeScript](https://www.typescriptlang.org/) for type checking.
- We use [Storybook](https://storybook.js.org/) to develop all the UI components in isolation.
- We use [Prettier](https://prettier.io/) to ensure that all the code follows the
  same style conventions.
- We use the [Vite](https://vitejs.dev/) build tool, for a quick developer experience.

### Setup/preparation

```bash
git clone git@github.com:eirslett/unreed-app.git
cd unreed-app
npm install
```

## Available commands:

### `npm run dev`

This will start Unreed locally. Will be available on http://localhost:3000.

### `npm run storybook`

The Storybook instance should now run on http://localhost:6006.

### `npm run lint:typescript`

Any type errors should show up in the console.
Also, it's a good idea to configure your code editor with a TypeScript
plugin, which will highlight type errors directly in the editor.

### `npm run lint:prettier`

Any formatting errrors should show up in the console.
Also, it's a good idea to configure your code editor with a Prettier
plugin, and set it up to automatically format the code on every save.

### `npm run build`

This will take the index.html file, all the TypeScript and CSS files,
compress and bundle them so they are ready to deploy to production.
