// ***** BEGIN LICENSE BLOCK *****
// Version: MPL 1.1/GPL 2.0/LGPL 2.1
//
// The contents of this file are subject to the Mozilla Public License Version
// 1.1 (the "License"); you may not use this file except in compliance with
// the License. You may obtain a copy of the License at
// http://www.mozilla.org/MPL/
//
// Software distributed under the License is distributed on an "AS IS" basis,
// WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
// for the specific language governing rights and limitations under the
// License.
//
// The Original Code is Mozilla Corporation Code.
//
// The Initial Developer of the Original Code is
// Adam Christian.
// Portions created by the Initial Developer are Copyright (C) 2008
// the Initial Developer. All Rights Reserved.
//
// Contributor(s):
//  Adam Christian <adam.christian@gmail.com>
//  Mikeal Rogers <mikeal.rogers@gmail.com>
//  Henrik Skupin <hskupin@mozilla.com>
//
// Alternatively, the contents of this file may be used under the terms of
// either the GNU General Public License Version 2 or later (the "GPL"), or
// the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
// in which case the provisions of the GPL or the LGPL are applicable instead
// of those above. If you wish to allow use of your version of this file only
// under the terms of either the GPL or the LGPL, and not to allow others to
// use your version of this file under the terms of the MPL, indicate your
// decision by deleting the provisions above and replace them with the notice
// and other provisions required by the GPL or the LGPL. If you do not delete
// the provisions above, a recipient may use your version of this file under
// the terms of any one of the MPL, the GPL or the LGPL.
//
// ***** END LICENSE BLOCK *****

var EXPORTED_SYMBOLS = ["createInstance"]

var EventUtils = {}; Components.utils.import('resource://mozmill/stdlib/EventUtils.js', EventUtils);
var events = {}; Components.utils.import('resource://mozmill/modules/events.js', events);
var frame = {}; Components.utils.import('resource://mozmill/modules/frame.js', frame);
var utils = {}; Components.utils.import('resource://mozmill/modules/utils.js', utils);

var createInstance = function (elem) {
  switch(elem.localName.lower()) {
    case 'select':
    case 'menulist':
      return MozMillDropList(elem);
    case 'input':
      let type = elem.getAttribute('type');
      if (type == 'checkbox') {
        return new MozMillCheckBox(elem);
      } else if (type == 'radio') {
        return new MozMillRadio(elem);
      }
      break;
    case 'checkbox':
      return new MozMillCheckBox(elem);
    case 'radio':
      return new MozMillRadio(elem);
    default:
  }
  return new MozMillElement(elem);
}

/**
 * MozMillElement
 * The base class for all mozmill elements
 */
function MozMillElement(elem) {
  this.element = elem;
}

/**
 * Synthesize a keypress event on the given element
 *
 * @param {ElemBase} aTarget
 *        Element which will receive the keypress event
 * @param {string} aKey
 *        Key to use for synthesizing the keypress event. It can be a simple
 *        character like "k" or a string like "VK_ESCAPE" for command keys
 * @param {object} aModifiers
 *        Information about the modifier keys to send
 *        Elements: accelKey   - Hold down the accelerator key (ctrl/meta)
 *                               [optional - default: false]
 *                  altKey     - Hold down the alt key
 *                              [optional - default: false]
 *                  ctrlKey    - Hold down the ctrl key
 *                               [optional - default: false]
 *                  metaKey    - Hold down the meta key (command key on Mac)
 *                               [optional - default: false]
 *                  shiftKey   - Hold down the shift key
 *                               [optional - default: false]
 * @param {object} aExpectedEvent
 *        Information about the expected event to occur
 *        Elements: target     - Element which should receive the event
 *                               [optional - default: current element]
 *                  type       - Type of the expected key event
 */
MozMillElement.prototype.keypress = function(aKey, aModifiers, aExpectedEvent) {
  if (!this.element) {
    throw new Error("Could not find element " + this.element.getInfo());
    return false;
  }

  events.triggerKeyEvent(this.element, 'keypress', aKey, aModifiers, aExpectedEvent);

  frame.events.pass({'function':'Controller.keypress()'});
  return true;
}

/**
 * Synthesize keypress events for each character on the given element
 *
 * @param {ElemBase} aTarget
 *        Element which will receive the type event
 * @param {string} aText
 *        The text to send as single keypress events
 * @param {object} aExpectedEvent
 *        Information about the expected event to occur
 *        Elements: target     - Element which should receive the event
 *                               [optional - default: current element]
 *                  type       - Type of the expected key event
 */
MozMillController.prototype.type = function (aText, aExpectedEvent) {
  if (!this.element) {
    throw new Error("could not find element " + this.element.getInfo());
    return false;
  }

  Array.forEach(aText, function(letter) {
    events.triggerKeyEvent(this.element, 'keypress', letter, {}, aExpectedEvent);
  });

  frame.events.pass({'function':'Controller.type()'});
  return true;
}

/**
 * Synthesize a general mouse event on the given element
 *
 * @param {ElemBase} aTarget
 *        Element which will receive the mouse event
 * @param {number} aOffsetX
 *        Relative x offset in the elements bounds to click on
 * @param {number} aOffsetY
 *        Relative y offset in the elements bounds to click on
 * @param {object} aEvent
 *        Information about the event to send
 *        Elements: accelKey   - Hold down the accelerator key (ctrl/meta)
 *                               [optional - default: false]
 *                  altKey     - Hold down the alt key
 *                               [optional - default: false]
 *                  button     - Mouse button to use
 *                               [optional - default: 0]
 *                  clickCount - Number of counts to click
 *                               [optional - default: 1]
 *                  ctrlKey    - Hold down the ctrl key
 *                               [optional - default: false]
 *                  metaKey    - Hold down the meta key (command key on Mac)
 *                               [optional - default: false]
 *                  shiftKey   - Hold down the shift key
 *                               [optional - default: false]
 *                  type       - Type of the mouse event ('click', 'mousedown',
 *                               'mouseup', 'mouseover', 'mouseout')
 *                               [optional - default: 'mousedown' + 'mouseup']
 * @param {object} aExpectedEvent
 *        Information about the expected event to occur
 *        Elements: target     - Element which should receive the event
 *                               [optional - default: current element]
 *                  type       - Type of the expected mouse event
 */
MozMillElement.prototype.mouseEvent = function(aOffsetX, aOffsetY, aEvent, aExpectedEvent) {
  if (!this.element) {
    throw new Error(arguments.callee.name + ": could not find element " +
                    aTarget.getInfo());
  }

  // If no offset is given we will use the center of the element to click on.
  var rect = this.element.getBoundingClientRect();
  if (isNaN(aOffsetX))
    aOffsetX = rect.width / 2;
  if (isNaN(aOffsetY))
    aOffsetY = rect.height / 2;

  // Scroll element into view otherwise the click will fail
  if (this.element.scrollIntoView)
    this.element.scrollIntoView();

  if (aExpectedEvent) {
    // The expected event type has to be set
    if (!aExpectedEvent.type)
      throw new Error(arguments.callee.name + ": Expected event type not specified");

    // If no target has been specified use the specified element
    var target = aExpectedEvent.target ? aExpectedEvent.target.getNode() : this.element;
    if (!target) {
      throw new Error(arguments.callee.name + ": could not find element " +
                      aExpectedEvent.target.getInfo());
    }

    EventUtils.synthesizeMouseExpectEvent(this.element, aOffsetX, aOffsetY, aEvent,
                                          target, aExpectedEvent.event,
                                          "controller.mouseEvent()",
                                          this.element.ownerDocument.defaultView);
  } else {
    EventUtils.synthesizeMouse(this.element, aOffsetX, aOffsetY, aEvent,
                               this.element.ownerDocument.defaultView);
  }
}

/**
 * Synthesize a mouse click event on the given element
 */
MozMillElement.prototype.click = function(left, top, expectedEvent) {
  // Handle menu items differently
  if (this.element && this.element.tagName == "menuitem") {
    this.element.click();
  } else {
    this.mouseEvent(left, top, {}, expectedEvent);
  }

  frame.events.pass({'function':'controller.click()'});
}

/**
 * Synthesize a double click on the given element
 */
MozMillElement.prototype.doubleClick = function(left, top, expectedEvent) {
  this.mouseEvent(left, top, {clickCount: 2}, expectedEvent);

  frame.events.pass({'function':'controller.doubleClick()'});
  return true;
}

/**
 * Synthesize a mouse down event on the given element
 */
MozMillElement.prototype.mouseDown = function (button, left, top, expectedEvent) {
  this.mouseEvent(left, top, {button: button, type: "mousedown"}, expectedEvent);

  frame.events.pass({'function':'controller.mouseDown()'});
  return true;
};

/**
 * Synthesize a mouse out event on the given element
 */
MozMillElement.prototype.mouseOut = function (button, left, top, expectedEvent) {
  this.mouseEvent(left, top, {button: button, type: "mouseout"}, expectedEvent);

  frame.events.pass({'function':'controller.mouseOut()'});
  return true;
};

/**
 * Synthesize a mouse over event on the given element
 */
MozMillElement.prototype.mouseOver = function (button, left, top, expectedEvent) {
  this.mouseEvent(left, top, {button: button, type: "mouseover"}, expectedEvent);

  frame.events.pass({'function':'controller.mouseOver()'});
  return true;
};

/**
 * Synthesize a mouse up event on the given element
 */
MozMillElement.prototype.mouseUp = function (button, left, top, expectedEvent) {
  this.mouseEvent(left, top, {button: button, type: "mouseup"}, expectedEvent);

  frame.events.pass({'function':'controller.mouseUp()'});
  return true;
};

/**
 * Synthesize a mouse middle click event on the given element
 */
MozMillElement.prototype.middleClick = function(left, top, expectedEvent) {
  this.mouseEvent(left, top, {button: 1}, expectedEvent);

  frame.events.pass({'function':'controller.middleClick()'});
  return true;
};

/**
 * Synthesize a mouse right click event on the given element
 */
MozMillElement.prototype.rightClick = function(left, top, expectedEvent) {
  this.mouseEvent(left, top, {type : "contextmenu", button: 2 }, expectedEvent);

  frame.events.pass({'function':'controller.rightClick()'});
  return true;
};

MozMillElement.prototype.waitFor = function(callback, message, timeout,
                                               interval, thisObject) {
  utils.waitFor(callback, message, timeout, interval, thisObject);

  frame.events.pass({'function':'controller.waitFor()'});
};

MozMillElement.prototype.waitForElement = function(timeout, interval) {
  this.waitFor(function() {
    return this.element.exists();
  }, "Timeout exceeded for waitForElement " + this.element.getInfo(), timeout, interval);

  frame.events.pass({'function':'Controller.waitForElement()'});
};

MozMillElement.prototype.waitForElementNotPresent = function(timeout, interval) {
  this.waitFor(function() {
    return !this.element.exists();
  }, "Timeout exceeded for waitForElementNotPresent " + this.element.getInfo(), timeout, interval);

  frame.events.pass({'function':'Controller.waitForElementNotPresent()'});
};

MozMillElement.prototype.__defineGetter__("waitForEvents", function() {
  if (this._waitForEvents == undefined)
    this._waitForEvents = new waitForEvents();
  return this._waitForEvents;
});

MozMillController.prototype.waitThenClick = function (timeout, interval) {
  this.waitForElement(timeout, interval);
  this.click();
};


//---------------------------------------------------------------------------------------------------------------------------------------


/**
 * MozMillCheckBox
 * Checkbox element, inherits from MozMillElement
 */
MozMillCheckBox.prototype = new MozMillElement;
MozMillCheckBox.prototype.constructor = MozMillCheckBox;
function MozMillCheckBox(elem) {
  this.element = elem;
}

/**
 * Enable/Disable a checkbox depending on the target state
 */
MozMillCheckBox.prototype.check = function(el, state) {
  var result = false;
  var element = el.getNode();

  if (!element) {
    throw new Error("could not find element " + el.getInfo());
    return false;
  }

  // If we have a XUL element, unwrap its XPCNativeWrapper
  if (element.namespaceURI == "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul") {
    element = utils.unwrapNode(element);
  }

  state = (typeof(state) == "boolean") ? state : false;
  if (state != element.checked) {
    this.click(el);
    this.waitFor(function() {
      return element.checked == state;
    }, "Checkbox " + el.getInfo() + " could not be checked/unchecked", 500);

    result = true;
  }

  frame.events.pass({'function':'Controller.check(' + el.getInfo() + ', state: ' + state + ')'});
  return result;
};


//----------------------------------------------------------------------------------------------------------------------------------------


/**
 * MozMillRadio
 * Radio button inherits from MozMillElement
 */
MozMillRadio.prototype = new MozMillElement;
MozMillRadio.prototype.constructor = MozMillRadio;
MozMillRadio.prototype.parent = MozMillElement.prototype;
function MozMillRadio(elem) {
  MozMillElement
}

/**
 * Select the given radio button
 */
MozMillRadio.prototype.radio = function()
{
  if (!this.element) {
    throw new Error("could not find element " + this.element.getInfo());
    return false;
  }
  
  // If we have a XUL element, unwrap its XPCNativeWrapper
  if (this.element.namespaceURI == "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul") {
    this.element = utils.unwrapNode(this.element);
  }

  this.parent.click.call(this);
  this.waitFor(function() {
    return element.selected == true;
  }, "Radio button " + el.getInfo() + " could not be selected", 500);

  frame.events.pass({'function':'Controller.radio(' + el.getInfo() + ')'});
  return true;
};


//----------------------------------------------------------------------------------------------------------------------------------------


/**
 * MozMillDropList
 * DropList inherits from MozMillElement
 */
MozMillDropList.prototype = new MozMillElement;
MozMillDropList.prototype.parent = MozMillElement.prototype;
MozMillDropList.prototype = MozMillDropList;
function MozMillDropList(elem) {
  this.element = elem;
}

/* Select the specified option and trigger the relevant events of the element.*/
MozMillDropList.prototype.select = function (indx, option, value) {
  if (!this.element){
    throw new Error("Could not find element " + this.element.getInfo());
    return false;
  }

  //if we have a select drop down
  if (this.element.localName.toLowerCase() == "select"){
    var item = null;

    // The selected item should be set via its index
    if (indx != undefined) {
      // Resetting a menulist has to be handled separately
      if (indx == -1) {
        events.triggerEvent(this.element, 'focus', false);
        this.element.selectedIndex = indx;
        events.triggerEvent(this.element, 'change', true);

     frame.events.pass({'function':'Controller.select()'});
     return true;
      } else {
        item = this.element.options.item(indx);
    }
    } else {
      for (var i = 0; i < this.element.options.length; i++) {
        var entry = this.element.options.item(i);
        if (option != undefined && entry.innerHTML == option ||
            value != undefined && entry.value == value) {
          item = entry;
         break;
       }
     }
           }

    // Click the item
    try {
      // EventUtils.synthesizeMouse doesn't work.
      events.triggerEvent(this.element, 'focus', false);
      item.selected = true;
      events.triggerEvent(this.element, 'change', true);

      frame.events.pass({'function':'Controller.select()'});
      return true;
    } catch (ex) {
      throw new Error("No item selected for element " + element.getInfo());
      return false;
    }
  }
  //if we have a xul menulist select accordingly
  else if (this.element.localName.toLowerCase() == "menulist"){
    var ownerDoc = this.element.ownerDocument;
    // Unwrap the XUL element's XPCNativeWrapper
    if (this.element.namespaceURI.toLowerCase() == "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul") {
      this.element = utils.unwrapNode(this.element);
    }
    var item = null;

    if (indx != undefined) {
      if (indx == -1) {
        events.triggerEvent(this.element, 'focus', false);
        this.element.selectedIndex = indx;
        events.triggerEvent(this.element, 'change', true);

        frame.events.pass({'function':'Controller.select()'});
        return true;
      } else {
        item = this.element.getItemAtIndex(indx);
      }
    } else {
      for (var i = 0; i < this.element.itemCount; i++) {
        var entry = this.element.getItemAtIndex(i);
        if (option != undefined && entry.label == option ||
            value != undefined && entry.value == value) {
          item = entry;
          break;
        }
      }
    }

    // Click the item
    try {
      EventUtils.synthesizeMouse(element, 1, 1, {}, ownerDoc.defaultView);
      this.sleep(0);

      // Scroll down until item is visible
      for (var i = s = this.element.selectedIndex; i <= this.element.itemCount + s; ++i) {
        var entry = this.element.getItemAtIndex((i + 1) % this.element.itemCount);
        EventUtils.synthesizeKey("VK_DOWN", {}, ownerDoc.defaultView);
        if (entry.label == item.label) {
          break;
        }
        else if (entry.label == "") i += 1;
      }

      EventUtils.synthesizeMouse(item, 1, 1, {}, ownerDoc.defaultView);
      this.sleep(0);

      frame.events.pass({'function':'Controller.select()'});
      return true;
    } catch (ex) {
      throw new Error('No item selected for element ' + this.element.getInfo());
      return false;
    }
  }
};

