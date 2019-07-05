/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*/
import PopupMenu from './PopupMenu';

export default class MenuItem {
  constructor(domNode, menuObj) {
    this.domNode = domNode;
    this.menu = menuObj;
    this.popupMenu = false;
    this.isMenubarItem = false;

    this.keyCode = Object.freeze({
      TAB: 9,
      RETURN: 13,
      ESC: 27,
      SPACE: 32,
      PAGEUP: 33,
      PAGEDOWN: 34,
      END: 35,
      HOME: 36,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
    });
  }

  init() {
    this.domNode.tabIndex = -1;

    this.domNode.addEventListener('keydown', this.handleKeydown.bind(this));
    this.domNode.addEventListener('focus', this.handleFocus.bind(this));
    this.domNode.addEventListener('blur', this.handleBlur.bind(this));

    // Initialize flyout menu
    const nextElement = this.domNode.nextElementSibling;

    if (nextElement && 'UL' === nextElement.tagName) {
      this.popupMenu = new PopupMenu(nextElement, this);
      this.popupMenu.init();
    }
  }

  isExpanded() {
    return 'true' === this.domNode.getAttribute('aria-expanded');
  }

  /* EVENT HANDLERS */

  handleKeydown(event) {
    const tgt = event.currentTarget;
    const char = event.key;
    let flag = false;
    let clickEvent;

    function isPrintableCharacter(str) {
      return 1 === str.length && str.match(/\S/);
    }

    switch (event.keyCode) {
      case this.keyCode.SPACE:
      case this.keyCode.RETURN:
        if (this.popupMenu) {
          this.popupMenu.open();
          this.popupMenu.setFocusToFirstItem();
        } else {
          // Create simulated mouse event to mimic the behavior of ATs
          // and let the event handler handleClick do the housekeeping.
          try {
            clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true,
            });
          } catch (err) {
            if (document.createEvent) {
              // DOM Level 3 for IE 9+
              clickEvent = document.createEvent('MouseEvents');
              clickEvent.initEvent('click', true, true);
            }
          }
          tgt.dispatchEvent(clickEvent);
        }

        flag = true;
        break;

      case this.keyCode.UP:
        this.menu.setFocusToPreviousItem(this);
        flag = true;
        break;

      case this.keyCode.DOWN:
        this.menu.setFocusToNextItem(this);
        flag = true;
        break;

      case this.keyCode.ESC:
      case this.keyCode.LEFT:
        this.menu.setFocusToController('previous', true);
        this.menu.close(true);
        flag = true;
        break;

      case this.keyCode.RIGHT:
        if (this.popupMenu) {
          this.popupMenu.open();
          this.popupMenu.setFocusToFirstItem();
        } else {
          this.menu.setFocusToController('next', true);
          this.menu.close(true);
        }
        flag = true;
        break;

      case this.keyCode.HOME:
      case this.keyCode.PAGEUP:
        this.menu.setFocusToFirstItem();
        flag = true;
        break;

      case this.keyCode.END:
      case this.keyCode.PAGEDOWN:
        this.menu.setFocusToLastItem();
        flag = true;
        break;

      case this.keyCode.TAB:
        this.menu.setFocusToController();
        break;

      default:
        if (isPrintableCharacter(char)) {
          this.menu.setFocusByFirstCharacter(this, char);
          flag = true;
        }
        break;
    }

    if (flag) {
      event.stopPropagation();
      event.preventDefault();
    }
  }

  handleFocus() {
    this.menu.hasFocus = true;
  }

  handleBlur() {
    this.menu.hasFocus = false;
    setTimeout(this.menu.close.bind(this.menu, false), 300);
  }
}
