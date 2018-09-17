# Aria Menu keyboard navigation

Allows a user to use arrow keys to navigate a three-level menu.

## Background

These files are a direct adaptation of the [WAI Aria practices navigation menubar example](https://www.w3.org/TR/wai-aria-practices/examples/menubar/menubar-1/menubar-1.html). For an overview of this pattern and why to adopt it, [we recommend the following documentation from w3.org](https://www.w3.org/TR/wai-aria-practices/#menu).

It has been modified from that example in the following ways:

- All of the mouse (click and hover) events that were in the original example have been removed.
- All css styles and classes from the example have been removed in favor of letting the theme's stylesheets apply its own directives to `aria-expanded` and `aria-hidden` elements.
- The code has been updated to modern javascript standards.

## How to use

At the top of your code:

```js
import AriaMenu from 'aria-menu';
```

Then in the body:

```js
const menuElement = document.querySelector('#id-of-list-element');
const menu = new AriaMenu(menuElement);
menu.init();
```

In order for the visual changes to take place, you will need to add styles for `[aria-hidden="true"]` and `[aria-hidden="false"]` in your project's css.


## Contributing to this plugin

The original work is licensed [under the following license](https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document).
