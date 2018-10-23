/**
 * Class that describes the first parent menu items in a menu. An AriaMenu will
 * consist of MenubarItems.
 */
import PopupMenu from './PopupMenu';

export default class MenubarItem {
  constructor(domNode, menuObj) {
    this.menu = menuObj;
    this.domNode = domNode;
    this.popupMenu = false;

    this.hasFocus = false;
    this.hasHover = false;

    this.isMenubarItem = true;

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

    // Initialize pop up menus
    const nextElement = this.domNode.nextElementSibling;

    if (nextElement && 'UL' === nextElement.tagName) {
      this.popupMenu = new PopupMenu(nextElement, this);
      this.popupMenu.init();
    }
  }

  handleKeydown(event) {
    const char = event.key;
    let flag = false;

    function isPrintableCharacter(str) {
      return 1 === str.length && str.match(/\S/);
    }

    switch (event.keyCode) {
      case this.keyCode.SPACE:
      case this.keyCode.RETURN:
      case this.keyCode.DOWN:
        if (this.popupMenu) {
          this.popupMenu.open();
          this.popupMenu.setFocusToFirstItem();
          flag = true;
        }
        break;

      case this.keyCode.LEFT:
        this.menu.setFocusToPreviousItem(this);
        flag = true;
        break;

      case this.keyCode.RIGHT:
        this.menu.setFocusToNextItem(this);
        flag = true;
        break;

      case this.keyCode.UP:
        if (this.popupMenu) {
          this.popupMenu.open();
          this.popupMenu.setFocusToLastItem();
          flag = true;
        }
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
        this.popupMenu.close(true);
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
  }
}
