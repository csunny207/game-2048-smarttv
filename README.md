# 2048 Game for Smart TV

A 2048 game built for **Samsung Tizen** and **LG webOS** Smart TVs. The project uses React, TypeScript, and Webpack with platform-specific builds and assets.

---

## Prerequisites

- **Node.js** (v14 or higher recommended)
- **npm** (v6 or higher)

For creating installable app packages:

- **LG webOS**: [webOS TV SDK](https://webostv.developer.lge.com/develop/tools/sdk-installation) or [ares-cli](https://webostv.developer.lge.com/develop/tools/ares-cli-installation)
- **Samsung Tizen**: [Tizen Studio](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk.html) (includes Certificate Manager and TV packaging tools)

---

## Running the Code

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

Runs the app with hot reload (default dev server; platform-specific assets are not copied unless you pass a platform flag to webpack):

```bash
npm start
```

The app is served at **http://localhost:8080** (or the port shown in the terminal). Use a browser or a TV emulator to test.

---

## Creating a Build

Builds are **platform-specific**. The build script copies the correct `index.html`, `appinfo.json` (LG), or `config.xml` (Samsung) from `src/platform/<Platform>/` into `dist/`.

### Development build (LG)

```bash
npm run build -- --LG
```

Output: `dist/` with LG assets and `bundle.js`.

### Development build (Samsung)

```bash
npm run build -- --Samsung
```

Output: `dist/` with Samsung assets (including `config.xml`) and `bundle.js`.

### Production build (LG)

```bash
npm run build:prod -- --LG
```

### Production build (Samsung)

```bash
npm run build:prod -- --Samsung
```

**Note:** The app uses a `PLATFORM` constant for remote/key handling. Ensure you build with the correct platform flag so the right platform files are used. For Samsung builds, the `dist` folder will contain the Tizen `config.xml` and entry HTML. If your app uses `process.env.PLATFORM` (injected by Webpack), the platform flag sets it correctly; if it uses a hardcoded constant in `src/constants/appConstant.ts`, you may need to align that with the target platform or switch to the env value.

---

## Creating App Packages for LG and Samsung TV

After building, use each platform’s tools to create the installable package.

---

### LG webOS TV (`.ipk`)

1. **Build for LG** (see above):

   ```bash
   npm run build:prod -- --LG
   ```

2. **Prepare the app package**  
   Your `dist/` folder should contain at least:
   - `index.html`
   - `bundle.js`
   - `appinfo.json`
   - Icons: `icon.png`, `large_icon.png`, `splash.png` (or as referenced in `appinfo.json`)

3. **Create the IPK** using [ares-package](https://webostv.developer.lge.com/develop/tools/ares-cli-installation):

   ```bash
   ares-package dist/
   ```

   This produces an `.ipk` file in the current directory.

4. **Install on a device or emulator** (optional):

   ```bash
   ares-install --device <device_name> com.vgl.game2048_1.0.0_all.ipk
   ```

   Replace `<device_name>` with the name from `ares-setup-device` / `ares-install --list`.

**Reference:** [LG webOS TV app packaging](https://webostv.developer.lge.com/develop/guides/app-development/packaging-app)

---

### Samsung Tizen TV (`.wgt`)

1. **Build for Samsung** (see above):

   ```bash
   npm run build:prod -- --Samsung
   ```

2. **Prepare the app package**  
   Your `dist/` folder should contain:
   - `index.html`
   - `bundle.js`
   - `config.xml` (Tizen widget config from `src/platform/Samsung/`)
   - Icons and other assets referenced in `config.xml`

3. **Create the WGT** using Tizen Studio or CLI:
   - **Tizen Studio**: Open **Tizen Studio** → **Certificate Manager** to create a certificate, then **Device Manager** and use **Build** to package the project (point to your `dist`-based project).
   - **CLI**: Using Tizen Studio’s CLI tools from the installation path, you can build a widget project whose content is your `dist` folder.

   Typical structure for a Tizen widget project:
   - Root contains `config.xml` and `index.html`.
   - JS/CSS/assets can be in the same folder or subfolders (paths in `config.xml` and `index.html` must match).

4. **Sign and install**  
   Use the same certificate in Certificate Manager when building and when installing on a TV or emulator.

**Reference:** [Samsung Smart TV app development](https://developer.samsung.com/smarttv/develop/getting-started/setting-up-sdk.html)

---

## Project structure (relevant to run/build/package)

| Path | Purpose |
|------|--------|
| `src/` | React app source (TypeScript/TSX, styles, assets) |
| `src/platform/LG/` | LG webOS entry HTML and `appinfo.json` |
| `src/platform/Samsung/` | Samsung Tizen entry HTML and `config.xml` |
| `dist/` | Build output (used for both run and packaging) |
| `webpack.config.js` | Development build |
| `webpack.config.prod.js` | Production build |

---

## NPM scripts summary

| Script | Description |
|--------|-------------|
| `npm start` | Start webpack dev server |
| `npm run build` | Development build (pass `-- --LG` or `-- --Samsung`) |
| `npm run build:prod` | Production build (pass `-- --LG` or `-- --Samsung`) |
| `npm run build:lg` | Shortcut for development build for LG: `webpack -- --LG` |
| `npm run create-lg-assets` | Run `scripts/create-lg-assets.js` (if present) |

---

## Summary

- **Run:** `npm install` then `npm start`.
- **Build:** `npm run build -- --LG` or `npm run build -- --Samsung`; for production use `npm run build:prod -- --LG` or `--Samsung`.
- **LG package:** Build for LG, then run `ares-package dist/` to get an `.ipk`.
- **Samsung package:** Build for Samsung, then use Tizen Studio (or CLI) to create and sign a `.wgt` from the `dist` contents.

For the exact steps and UI for packaging and signing, refer to the official LG and Samsung TV developer guides linked above.
