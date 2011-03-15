/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is MozMill Native Events.
 *
 * The Initial Developer of the Original Code is
 *      Andrew Halberstadt <halbersa@gmail.com>.
 *
 * Portions created by the Initial Developer are Copyright (C) 2011
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

var EXPORTED_SYMBOLS = ["events"];
var frame = {}; Components.utils.import('resource://mozmill/modules/frame.js', frame);

// Load JS Ctypes module
Components.utils.import("resource://gre/modules/ctypes.jsm");

function getFile(chromeURL) {
  // convert the chrome URL into a file URL
  var cr = Components.classes['@mozilla.org/chrome/chrome-registry;1']
                            .getService(Components.interfaces.nsIChromeRegistry); 
  var io = Components.classes['@mozilla.org/network/io-service;1']
                            .getService(Components.interfaces.nsIIOService);
  var uri = io.newURI(decodeURI(chromeURL), 'UTF-8', null);
  var fileURL = cr.convertChromeURL(uri);
  // get the nsILocalFile for the file
  return  fileURL.QueryInterface(Components.interfaces.nsIFileURL).file;
}

function events() {
  var file = getFile("chrome://mozmill/content/libnative_events.so");
  this.lib = ctypes.open(file.path);

  /** Function Declarations **/
  this.sendClick = this.lib.declare("sendClick", ctypes.default_abi, ctypes.int32_t, ctypes.int32_t, ctypes.int32_t);
  this.sendKey = this.lib.declate("sendKey", ctypes.default_abi, ctypes.int32_t, ctypes.int32_t);

}
