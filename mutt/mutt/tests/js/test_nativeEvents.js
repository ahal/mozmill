var setupModule = function(module) {
  module.controller = mozmill.getBrowserController();
}

var testNativeClick = function () {
  var edit = findElement.ID(controller.window.document, "edit-menu");
  controller.click(edit);
  controller.sleep(1000);
  controller.click(edit);

  var view = findElement.ID(controller.window.document, "view-menu");
  controller.click(view);
  controller.sleep(1000);
  controller.click(view);
}

var testNativeKey = function () {
  var urlbar = findElement.ID(controller.window.document, "urlbar");
  controller.type(urlbar, "asdf", {'shiftKey': true});
  controller.keypress(urlbar, "VK_ENTER");
  controller.sleep(1000);
  controller.keypress(urlbar, 'a', {'ctrlKey':true});
  controller.sleep(1000);
}
