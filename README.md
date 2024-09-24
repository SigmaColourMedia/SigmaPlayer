# SigmaPlayer
A web application that serves as a frontend layer for the [SigmaMediaServer](https://github.com/SigmaColourMedia/SigmaMediaServer).

Notable features:
- Dynamic lobby representation - show current streams & viewers in real-time using Server Sent Events
- Watch live streamed video media content using `WHEP` protocol.

## Build & dev guide
The repository is split into **frontend** and **backend** _npm packages_. You'll need to build **frontend** artifacts before running the **backend** code.
### Building frontend
First, install dependencies:
```
npm i 
```
Next, export enviornment variables defined in the `env_template`. The enviornment variables are following:
- `SINDER_URL` - URL of the `SigmaMediaServer` HTTPS address
- `BUILD_DIR` - directory to which build artifacts are saved to. This can be a relative/absolute pathname.

Lastly, run `npm run build` to bundle javascript files. Alternatively you may use `npm run dev` to do this on per-file-change basis.

### Building backend
First, install dependencies
```
npm i
```
Next, export enviornment variables defined in the `env_template`. The enviornment variables are the exact same as in the **frontend** package.

You can compile the typescript files using `npm run build`. Afterwards you may use `npm start` to bootup the server. 
It's important that:
- **frontend** build artifacts are present
- The `BUILD_DIR` environment variable is the same for **backend** and **frontend** packages.


