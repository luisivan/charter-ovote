# cjs-bundler

## Known limitations

This repository is only meant for cases where legacy HTML sites need to load
remote JS code using HTML tags. The only tool that supports (as of writing) the
current dvote-js dependencies is Browserify, which produces very large
artifacts. This is a work in progress.

## Building

```sh
make init
make all
```

This will compile three artifacts on the `dist` folder.

## Get started

Copy the relevant artifact from `dist` to your HTML folder and load it like:

### Whole library

If using both census and voting, it's best to import the `main` artifact to save
some bandwidth.

```html
<script src="./main.js"></script>
```

```js
const Vocdoni = window.getBundle();

const tokenR = Vocdoni.CensusCaApi.decodePoint(hexTokenR);
// ...
```

## Tracking the availability of the bundle artifacts

### Lazy load

This version loads the web site first and then starts loading the bundle script.

```html
<script>
window.addEventListener('load', loadVocdoniArtifacts)

function loadVocdoniArtifacts() {
    const script = document.createElement('script');
    
    script.addEventListener('load', (event) => {
        // TODO: Update the state of your app to use the code
        
        window.getBundle();
    });

    // Start loading the script
    script.src = 'main.js';
    document.body.appendChild(script);
}
</script>
```

### Synchronous

This version waits until all the JS code is available. This may slow down the
loading of the web site on certain devices.

```html
<script src="./main.js"></script>

<script>
  document.addEventListener("DOMContentLoaded", () => {
    // TODO: Update the state of your app to use the code
    
    window.getBundle();
  });
</script>
```
