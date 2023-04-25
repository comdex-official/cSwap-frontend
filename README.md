<div align="center" style="margin-top:20px">

[![C_Swap_v2](./public/logo.svg)]()

### C Swap v2 Frontend Repositories

[![C_Swap_v2](./public/homepage.png)]()

</div>
<hr>

## Docs

- [Technical](#contributing)
  - [Codebase](#codebase)
    - [Technologies](#technologies)
    - [Folder Structure](#folder-structure)
    - [Code Style](#code-style)
  - [First time setup](#first-time-setup)
  - [Running the app locally](#running-the-app-locally)

#### Technologies

Here is a list of technologies we use:

- **Next JS**: Frontend Next JS
- **Typescript**: We use Next to power our frontend apps. Almost all of the code you'll touch in this codebase will be Typescript.
- **Redux Toolkit**: we use Redux toolkit for globally data management.
- **SCSS**: We use scss for style.

#### Folder structure

```sh
C_Swap_v2/
    ├── public
    │   ├── assets
    │   └── ...
    ├── pages
    │   ├── _app.tsx
    │   ├── _document.tsx
    │   ├── index.tsx
    │   └── ...
    ├── modules
    │   └── ...
    ├── helpers
    ├── logic
    │   └── redux
    ├── styles
    ├── shared
    │   ├── components
    │   ├── hooks
    │   └── image
    └── ...

```

#### Code Style

- We follow proper naming convention like for folder we are using `camel Case` for files `Pascal Case` and function name should be in `camel Case`.
- We are following Prettier to proper format the code.

##### Rules

- **No `console.log`s in any file**: we are removing `console.log` after develping done.

### First time setup

The first step to running C Swap V2 locally is downloading the code by cloning the repository:

```sh
git clone https://github.com/comdex-official/cSwap-frontend.git
```

After clone install the node modules:

```sh
yarn
```

To start the Next Server locally:

```sh
yarn run dev
```
