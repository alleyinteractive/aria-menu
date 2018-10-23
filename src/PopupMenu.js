import MenuItem from './MenuItem';

/**
 * A MenubarItem consists of PopupMenus. These menus are the children of the
 * first parent menu items.
 */
export default class PopupMenu {
  static setFocusToMenubarItem(controller, close) {
    let activeController = controller;
    while (activeController) {
      if (activeController.isMenubarItem) {
        activeController.domNode.focus();
        return activeController;
      }

      if (close) {
        activeController.menu.close(true);
      }
      activeController.hasFocus = false;

      activeController = activeController.menu.controller;
    }
    return false;
  }

  static checkForErrors(domNode) {
    const msgPrefix = 'PopupMenu constructor argument domNode ';

    // Check whether domNode is a DOM element
    if (! (domNode instanceof Element)) {
      throw new TypeError(`${msgPrefix}is not a DOM Element.`);
    }
    // Check whether domNode has child elements
    if (0 === domNode.childElementCount) {
      throw new Error(`${msgPrefix}has no element children.`);
    }
    // Check whether domNode descendant elements have A elements
    let childElement = domNode.firstElementChild;
    while (childElement) {
      const menuitem = childElement.firstElementChild;
      if (menuitem && 'A' === menuitem) {
        throw new Error(
          `${msgPrefix}has descendant elements that are not A elements.`
        );
      }
      childElement = childElement.nextElementSibling;
    }
  }

  constructor(domNode, controllerObj) {
    PopupMenu.checkForErrors(domNode);

    // Set defaults
    this.isMenubar = false;

    this.domNode = domNode;
    this.controller = controllerObj;

    this.menuitems = []; // See PopupMenu init method
    this.firstChars = []; // See PopupMenu init method

    this.firstItem = null; // See PopupMenu init method
    this.lastItem = null; // See PopupMenu init method

    this.hasFocus = false; // See MenuItem handleFocus, handleBlur
  }

  /*
  *   @method PopupMenu.prototype.init
  *
  *   @desc
  *       Add domNode event listeners for mouseover and mouseout. Traverse
  *       domNode children to configure each menuitem and populate menuitems
  *       array. Initialize firstItem and lastItem properties.
  */
  init() {
    let childElement;
    let menuElement;
    let menuItem;
    let textContent;

    // Traverse the element children of domNode: configure each with
    // menuitem role behavior and store reference in menuitems array.
    childElement = this.domNode.firstElementChild;

    while (childElement) {
      menuElement = childElement.firstElementChild;

      if (menuElement && 'A' === menuElement.tagName) {
        menuItem = new MenuItem(menuElement, this);
        menuItem.init();
        this.menuitems.push(menuItem);
        textContent = menuElement.textContent.trim();
        this.firstChars.push(textContent.substring(0, 1).toLowerCase());
      }
      childElement = childElement.nextElementSibling;
    }

    // Use populated menuitems array to initialize firstItem and lastItem.
    const numItems = this.menuitems.length;
    if (0 < numItems) {
      [this.firstItem] = this.menuitems;
      this.lastItem = this.menuitems[numItems - 1];
    }
  }

  /* FOCUS MANAGEMENT METHODS */

  setFocusToController(command, flag) {
    const commandToUse = ('string' === typeof command) ? command : '';

    if ('' === commandToUse) {
      PopupMenu.setFocusToMenubarItem(this.controller, true);
      return;
    }

    if (! this.controller.isMenubarItem) {
      this.controller.domNode.focus();
      this.close();

      if ('next' === commandToUse) {
        const menubarItem = PopupMenu.setFocusToMenubarItem(
          this.controller,
          false
        );
        if (menubarItem) {
          menubarItem.menu.setFocusToNextItem(menubarItem, flag);
        }
      }
    } else if ('previous' === commandToUse) {
      this.controller.menu.setFocusToPreviousItem(this.controller, flag);
    } else if ('next' === commandToUse) {
      this.controller.menu.setFocusToNextItem(this.controller, flag);
    }
  }

  setFocusToFirstItem() {
    this.firstItem.domNode.focus();
  }

  setFocusToLastItem() {
    this.lastItem.domNode.focus();
  }

  setFocusToPreviousItem(currentItem) {
    let index;

    if (currentItem === this.firstItem) {
      this.lastItem.domNode.focus();
    } else {
      index = this.menuitems.indexOf(currentItem);
      const prevItem = this.menuitems[index - 1];

      if (
        prevItem
        && 'none' === window.getComputedStyle(prevItem.domNode).display
      ) {
        // Skip this item if the user cannot see it
        this.setFocusToPreviousItem(prevItem);
      } else {
        prevItem.domNode.focus();
      }
    }
  }

  setFocusToNextItem(currentItem) {
    let index;

    if (currentItem === this.lastItem) {
      this.firstItem.domNode.focus();
    } else {
      index = this.menuitems.indexOf(currentItem);
      const nextItem = this.menuitems[index + 1];

      if (
        nextItem
        && 'none' === window.getComputedStyle(nextItem.domNode).display
      ) {
        // Skip this item if the user cannot see it
        this.setFocusToNextItem(nextItem);
      } else {
        nextItem.domNode.focus();
      }
    }
  }

  setFocusByFirstCharacter(currentItem, char) {
    let start = char.toLowerCase();
    let index = char.toLowerCase();

    // Get start index for search based on position of currentItem
    start = this.menuitems.indexOf(currentItem) + 1;
    if (start === this.menuitems.length) {
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
      this.menuitems[index].domNode.focus();
    }
  }

  getIndexFirstChars(startIndex, char) {
    return this.firstChars.findIndex((el) => (char === el));
  }

  /**
   * Menu display methods
   */

  open() {
    this.domNode.setAttribute('aria-hidden', false);
    document.body.classList.add('menu-open');
  }

  close(force) {
    let { hasFocus } = this;

    this.menuitems.forEach((el) => {
      if (el.popupMenu) {
        hasFocus = el.popupMenu.hasFocus || hasFocus;
      }
    });

    if (force || ! hasFocus) {
      this.domNode.setAttribute('aria-hidden', true);

      if (this.controller.isMenubarItem) {
        document.body.classList.remove('menu-open');
      }
    }
  }
}
