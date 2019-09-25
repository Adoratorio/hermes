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
|mode|string|`Hermes.MODE.VIRTUAL`||
|events|Array<string>|`[Hermes.EVENT.WHEEL, Hermes.EVENT.TOUCH, Hermes.EVENT.KEYS]`||
|container|HTMLElement|`document.querySelector('.hermes-container')`||
|hook|HTMLElement|`document.querySelector('.hermes-hook')`||
|passive|boolean|`true`||
|emitGlobal|boolean|`false`||
|touchClass|string|`'.prevent-touch'`||
|touchMultiplier|number|2||
