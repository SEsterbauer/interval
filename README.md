## Prepare IDE

### Install eslint:

```
npm -g install eslint eslint-plugin-import eslint-config-airbnb-base
```

### Intellij: 

WebStorm -> Preferences -> Languages & Frameworks -> Javascript -> Code Quality Tools -> Eslint -> tick Enable

### Architecture

- `app.js` server & middleware initialization file
- `routes.js` public API
- `/classes` logic of the backend
- `/client` frontend application
- `/db` used in-file databases
- `/public` pre-compiled client source code

### Build process

Run `npm run build` to pre-compile the client app.

`npm run start` starts the server
