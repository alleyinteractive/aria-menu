/*
*   This content is licensed according to the W3C Software License at
*   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
*/
import MenubarItem from './MenubarItem';

export default class Menubar {
  constructor(domNode) {
    const msgPrefix = 'Menubar constructor argument menubarNode ';

    // Check whether menubarNode is a DOM element
    if (!(domNode instanceof Element)) {
      throw new TypeError(`${msgPrefix}is not a DOM Element.`);
    }

    // Check whether menubarNode has descendant elements
    if (0 === domNode.childElementCount) {
      throw new Error(`${msgPrefix}has no element children.`);
    }

    // Check whether menubarNode has A elements
    let e = domNode.firstElementChild;
    while (e) {
      const menubarItem = e.firstElementChild;
      if (e && menubarItem && 'A' !== menubarItem.tagName) {
        throw new Error(`${msgPrefix}has child elements are not A elements.${menubarItem.tagName}`);
      }
      e = e.nextElementSibling;
    }

    this.isMenubar = true;

    this.domNode = domNode;

    this.menubarItems = []; // See Menubar init method
    this.firstChars = []; // See Menubar init method

    this.firstItem = null; // See Menubar init method
    this.lastItem = null; // See Menubar init method

    this.hasFocus = false; // See MenubarItem handleFocus, handleBlur
    this.hasHover = false; // See Menubar handleMouseover, handleMouseout
  }

  /*
  *   @method Menubar.prototype.init
  *
  *   @desc
  *       Adds ARIA role to the menubar node
  *       Traverse menubar children for A elements to configure each A element as a ARIA menuitem
  *       and populate menuitems array. Initialize firstItem and lastItem properties.
  */
  init() {
    let menubarItem;
    let menuElement;
    let textContent;

    // Traverse the element children of menubarNode: configure each with
    // menuitem role behavior and store reference in menuitems array.
    let elem = this.domNode.firstElementChild;

    while (elem) {
      menuElement = elem.firstElementChild;

      if (elem && menuElement && 'A' === menuElement.tagName) {
        menubarItem = new MenubarItem(menuElement, this);
        menubarItem.init();
        this.menubarItems.push(menubarItem);
        textContent = menuElement.textContent.trim();
        this.firstChars.push(textContent.substring(0, 1).toLowerCase());
      }

      elem = elem.nextElementSibling;
    }

    // Use populated menuitems array to initialize firstItem and lastItem.
    const numItems = this.menubarItems.length;
    if (0 < numItems) {
      this.firstItem = this.menubarItems[0];
      this.lastItem = this.menubarItems[numItems - 1];
    }
    this.firstItem.domNode.tabIndex = 0;
  }

  /**
   * FOCUS MANAGEMENT METHODS
   */
  setFocusToItem(newItem) {
    let flag = false;
    const item = newItem;

    this.menubarItems.forEach((el) => {
      flag = 0 === el.domNode.tabIndex &&
        'true' === el.domNode.getAttribute('aria-expanded');

      const activeEl = el;
      activeEl.domNode.tabIndex = -1;

      if (el.popupMenu) {
        el.popupMenu.close();
      }
    });

    item.domNode.focus();
    item.domNode.tabIndex = 0;

    if (flag && item.popupMenu) {
      item.popupMenu.open();
    }
  }

  setFocusToFirstItem() {
    this.setFocusToItem(this.firstItem);
  }

  setFocusToLastItem() {
    this.setFocusToItem(this.lastItem);
  }

  setFocusToPreviousItem(currentItem) {
    let index;
    let newItem;

    if (currentItem === this.firstItem) {
      newItem = this.lastItem;
    } else {
      index = this.menubarItems.indexOf(currentItem);
      newItem = this.menubarItems[index - 1];
    }

    this.setFocusToItem(newItem);
  }

  setFocusToNextItem(currentItem) {
    let index;
    let newItem;

    if (currentItem === this.lastItem) {
      newItem = this.firstItem;
    } else {
      index = this.menubarItems.indexOf(currentItem);
      newItem = this.menubarItems[index + 1];
    }

    this.setFocusToItem(newItem);
  }

  setFocusByFirstCharacter(currentItem, currentChar) {
    let start = currentChar.toLowerCase();
    let index = currentChar.toLowerCase();
    const char = currentChar.toLowerCase();

    // Get start index for search based on position of currentItem
    start = this.menubarItems.indexOf(currentItem) + 1;
    if (start === this.menubarItems.length) {
      start = 0;
    }

    // Check remaining slots in the menu
    index = this.getIndexFirstChars(start, char);

    // If not found in remaining slots, check from beginning
    if (-1 === index) {
      index = this.getIndexFirstChars(0, char);
    }

    // If match was found...
    if (-1 < index) {
      this.setFocusToItem(this.menubarItems[index]);
    }
  }

  getIndexFirstChars(startIndex, char) {
    return this.firstChars.splice(startIndex)
      .findIndex((el) => (char === el));
  }
}
