var setupModule = function(module) {
  module.controller = mozmill.getBrowserController();
};

var testFoo = function(){
  controller.open('http://www.mozilla.org');
  controller.waitForPageLoad();
  
  var about = new elementslib.Link(undefined, "About Us"); 
  about.click();
  controller.sleep(1000);
  
  var textbox = new elementslib.Elem(controller.tabs.activeTab.getElementById("q"));
  var button = new elementslib.ID(undefined, "quick-search-btn");
  
  textbox.type("mozmill");
  controller.sleep(1000);
  
  controller.click(button);
  controller.sleep(1000);
  
  var radio = elementslib.ID(undefined, "www");
  button = elementslib.XPath(undefined, "/html/body/div/table/tbody/tr/td/table/tbody/tr/td[2]/table/tbody/tr[2]/td/input[7]");
  
  radio.select();
  
  button.keypress("VK_RETURN", {});
  controller.waitForPageLoad();
  
  var logo = elementslib.XPath(undefined, "/html/body/div/table/tbody/tr/td/table/tbody/tr/td/a/img");
  logo.click();
  controller.waitForPageLoad();

  
  const NAV_BAR = '/id("main-window")/id("tab-view-deck")/{"flex":"1"}' +
                                 '/id("navigator-toolbox")/id("nav-bar")';
  const URL_BAR = NAV_BAR + '/id("urlbar-container")/id("urlbar")';
  var urlBar = elementslib.Lookup(controller.window.document, URL_BAR);
  
  urlBar.keypress("a", {accelKey:true});
  urlBar.type("http://www.mozilla.org");
  urlBar.keypress("VK_RETURN", {});
  controller.waitForPageLoad();
};
