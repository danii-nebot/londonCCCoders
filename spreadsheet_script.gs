/*
Copyright (C) 2013, Climate Change Coders
This file is part of CCCoders Members Spreadsheet Updater.

CCCoders Members Spreadsheet Updater is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

CCCoders Members Spreadsheet Updater is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with CCCoders Members Spreadsheet Updater.  If not, see <http://www.gnu.org/licenses/>.
*/

/**
 * https://developers.google.com/apps-script/guides/sheets
 * Retrieves all the rows in the active spreadsheet that contain data and logs the
 * values for each row. Use for debuggin purposes
 */
function readRows_() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var rows = sheet.getDataRange();
  var numRows = rows.getNumRows();
  var values = rows.getValues();

  for (var i = 0; i <= numRows - 1; i++) {
    var row = values[i];
    Logger.log(row);
  }
};

/**
 * refreshData will get member's details from meetup API
 */
function refreshData() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var entries = [{
    name : "Read Data",
    functionName : "readRows"
  }];

  var APIurl = 'http://londonccc.meteor.com/api/get_members_list'
  var response = UrlFetchApp.fetch(APIurl);
  var jsonData = Utilities.jsonParse(response.getContentText());

  // debug
  // Logger.log(response);

  // make sure we have results
  if(jsonData.results.length > 1) {
    setRowsData_(sheet, jsonData.results, 4);
  }

  // debug
  // readRows_();

};

// https://developers.google.com/apps-script/guides/sheets
// setRowsData fills in one row of data per object defined in the objects Array.
// For every Column, it checks if data objects define a value for it.
// Arguments:
//   - sheet: the Sheet Object where the data will be written
//   - objects: an Array of Objects, each of which contains data for a row
//   - optFirstDataRowIndex: index of the first row where data should be written. This
//     defaults to the row immediately below the headers.
function setRowsData_(sheet, objects, optFirstDataRowIndex) {
  var firstDataRowIndex = optFirstDataRowIndex || 1;
  var headers = ["name","bio", "techAnswer", "ccAnswer"];

  // clear sheet
  var contents = sheet.getRange(4,1,sheet.getLastRow(), sheet.getLastColumn());
  contents.clear();

  var data = [];
  for (var i = 0; i < objects.length; ++i) {
    var values = [];
    for (j = 0; j < headers.length; ++j) {
      var header = headers[j];

      // If the header is non-empty and the object value is 0...
      if ((header.length > 0) && (objects[i][header] === 0)) {
        values.push(0);
      }
      // If the header is empty or the object value is empty...
      else if ((!(header.length > 0)) || (objects[i][header]=='')) {
        values.push('');
      }
      else {
        values.push(objects[i].value[header]);
      }
    }
    data.push(values);
  }

  var destinationRange = sheet.getRange(firstDataRowIndex, 1, objects.length, headers.length)

  destinationRange.setValues(data);
};
