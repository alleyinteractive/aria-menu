# Aria Menubar Component

Allows a user to use the keyboard to navigate a three-level menu.

## Background

These files are a direct adaptation of the [WAI Aria practices navigation menubar example](https://www.w3.org/TR/wai-aria-practices/examples/menubar/menubar-1/menubar-1.html). For an overview of this pattern and why to adopt it, [we recommend the following documentation from w3.org](https://www.w3.org/TR/wai-aria-practices/#menu).

It has been modified from that example in the following ways:

- All of the mouse (click and hover) events that were in the original example have been removed. This site applies its own click and hover events in `client/js/components/MegaMenu.js`
- All css styles and classes from the example have been removed in favor of letting the theme's stylesheets apply its own directives to `aria-expanded` and `aria-hidden` elements.
- The code has been linted to adhere to this project's eslint standards.

## How to use

At the top of your code:

```js
import Menubar from '../lib/Menubar'; // or wherever
```

Then in the body:

```js
const menubar = new Menubar(this.element);
menubar.init();
```


