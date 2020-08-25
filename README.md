# Hermes
A utility library for wheel events and touch event normalization

## Installation
```bash
# Install package
npm install @adoratorio/hermes
```
## Usage

Since this package has a [pkg.module](https://github.com/rollup/rollup/wiki/pkg.module) field, it’s highly recommended to import it as an ES6 module with some bundlers like [webpack](https://webpack.js.org/) or [rollup](https://rollupjs.org/):
```javascript
import Hermes from '@adoratorio/hermes';
const hermes = new Hermes({ });
```
If you are not using any bundlers, you can just load the UMD bundle:
```html
<script src="/medusa/umd/index.js"></script>
<script>var medusa = window.Hermes({ });</script>
```
## Available options

Hermes accept in the constructor and `option` object with the following possible props.

|parameter|type|default|description|
|:-------|:--:|:-----:|:----------|
|mode|string|`Hermes.MODE.VIRTUAL`|The mode to use when creating the instance, `VIRTUAL` will not use any DOM element to detect scroll but mousewheel events instead, `FAKE` will use a hook div underneath the content to detect scroll and `NATIVE` will use de DOM element declared as container tod etect scroll events|
|events|Array<string>|`[Hermes.EVENT.WHEEL, Hermes.EVENT.TOUCH, Hermes.EVENT.KEYS]`|The events to listen to|
|container|HTMLElement|`document.querySelector('.hermes-container')`|The DOM element used as container to detect event on|
|hook|HTMLElement|`document.querySelector('.hermes-hook')`|The DOM element used as hook for scroll amount in `FAKE` mode|
|passive|boolean|`true`|If you want to use passive event listeners|
|emitGlobal|boolean|`false`|If you want to emit global event on the `window`|
|touchClass|string|`'.prevent-touch'`|The class used to prevent touch|
|touchMultiplier|number|2|A multiplier for touch values, less it's going to be slower scroll and require more user action to scroll, more will end up in a fast page scroll with minimum finger move|
  
## APIs
The main core exposes only two methods
```typescript
hermesInstance.bind(handler : Function); // Will call the function every event trigger
hermesInstance.unbind();
```
Otherwhise a global event will be emitted (if `emitGlobal` option is set to `true`). Event types are

|name|enum|When|
|:---|:--:|:---|
|`hermes-wheel`|`Hermes.EVENTS.WHEEL`|When a type of mouswheel event is detected|
|`hermes-touch`|`Herms.EVENTS.TOUCH`|When a `touchmouve` event occurs after a `touchstart`, triggered also one last time on `touchend` with the inertia of the finger leaving the screen|
|`hermes-spacebar`|`Hermes.EVENTS.SPACEBAR`|When spacebar is pressed in to scroll the page|
|`hermes-arrows`|`Hermes.EVENTS.ARROWS`|When arrows are pressed to scroll the page|
|`hermes-keys`|`Hermes.EVENTS.KEY`|When any key (spacebar or arrows) is pressed to scroll the page, this is a sum event of the preceding two|
|SCROLL|
