var setupModule = function(module) {
  module.controller = mozmill.getBrowserController();
}

var testFoo = function(){
  controller.open('http://www.mozilla.org');
  controller.waitForPageLoad();
  
  var about = new elementslib.Link(controller.tabs.activeTab, "About Us"); 
  about.click();
  controller.sleep(1000);
  
  var textbox = new elementslib.Elem(controller.tabs.activeTab.getElementById("q"));
  var button = new elementslib.ID(controller.tabs.activeTab, "quick-search-btn");
  
  textbox.type("mozmill");
  controller.sleep(1000);
  
  button.click();
  controller.sleep(1000);
  
  var radio = elementslib.ID(controller.tabs.activeTab, "www");
  button = elementslib.XPath(controller.tabs.activeTab, "/html/body/div/table/tbody/tr/td/table/tbody/tr/td[2]/table/tbody/tr[2]/td/input[7]");

  radio.select();
  
  button.keypress("VK_RETURN", {});
  controller.waitForPageLoad();
  
  var logo = elementslib.XPath(controller.tabs.activeTab, "/html/body/div/table/tbody/tr/td/table/tbody/tr/td/a/img");
  logo.click();
  controller.waitForPageLoad();
}
