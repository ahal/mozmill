var setupModule = function(module) {
  module.controller = mozmill.getBrowserController();
}

/*var testNativeClick = function () {
  controller.open("http://localhost/test.html");
  controller.waitForPageLoad();

  var firefox = findElement.ID(controller.tabs.activeTab, "firefox");
  controller.click(firefox, undefined, undefined, undefined, true);
  controller.sleep(1000);

  var edit = findElement.ID(controller.window.document, "edit-menu");
  controller.click(edit);
  controller.sleep(1000);
  controller.click(edit);

  var view = findElement.ID(controller.window.document, "view-menu");
  controller.click(view);
  controller.sleep(1000);
}*/

var testNativeKey = function () {
  controller.open("http://www.google.com");
  controller.waitForPageLoad();

  var urlbar = findElement.ID(controller.window.document, "urlbar");
  controller.type(urlbar, "asd", {'shiftKey': true});
  controller.keypress(urlbar, "f");
  controller.keypress(urlbar, "VK_ENTER");
  controller.sleep(2000);
}
