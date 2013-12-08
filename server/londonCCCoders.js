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

if (Meteor.isServer) {
  RESTstop.configure();

  // add restful API method
  // to be invoked from Google Docs :)
  RESTstop.add('get_members_list', function() {
    // response object
    var response = this.response;
    response.writeHead(200, {'Content-Type':'text/json'});

    // Fiber Future to wait on async calls :)
    var Future = Npm.require('fibers/future'), wait = Future.wait, Fiber = Npm.require('fibers');
    var getMembersF = Future.wrap(getMembers);
    var getMemberProfileF = Future.wrap(getMemberProfile);

    var fut = new Future();
    Fiber(function() {
      // Return the results
      var membersData = getMembersF();
      wait(membersData);

      if(membersData.error) {
        response.end(JSON.stringify(membersData.error))
        fut.return();
      }

      var resultsArray = [];
      var numMembers = membersData.value.length;
      for (var ii = 0; ii < numMembers; ii++) {
        var member = membersData.value[ii];
        resultsArray.push(getMemberProfileF(member.id, ii));
      }
      wait(resultsArray);

      response.end(JSON.stringify({results: resultsArray}));
      fut.return();
    }).run();

    fut.wait();

  });

  function getMembers (callback) {
      var membersAPIurl =
        'http://api.meetup.com/2/members' +
        '?order=name' +
        '&group_urlname=London-Climate-Change-Coders' +
        '&offset=0' +
        '&page=200' +
        '&sign=true'+
        '&key='+APIKEY;

      HTTP.get(membersAPIurl, function(err, response) {
        callback(err,response.data.results);
      });
  }

  function getMemberProfile(id, delay, callback) {
    // set timeout to avoid getting throttled by meetup API
    Meteor.setTimeout(function() {
      var profileAPIurl =
        'http://api.meetup.com/2/profiles'+
        '?order=visited'+
        '&group_urlname=London-Climate-Change-Coders'+
        '&member_id='+id+
        '&offset=0'+
        '&sign=true'+
        '&key='+APIKEY;

        HTTP.get(profileAPIurl, function(err,response) {
          var responseData = response.data.results[0];
          var techQuestion = null;
          var ccQuestion = null;
          // pluck answers to both questions in profile
          _.each(responseData.answers, function(obj) {
            if(obj.question.indexOf("techy") !== -1) {
              techQuestion = obj;
            } else if(obj.question.indexOf("climate") !== -1) {
              ccQuestion = obj;
            }
          });
          // create JSON object
          var jsonObj = {
            id: id,
            name : responseData.name,
            bio : responseData.bio,
            techAnswer: (techQuestion ? techQuestion.answer : ''),
            ccAnswer: (ccQuestion ? ccQuestion.answer : ''),
          };

          // return data
          callback(err, jsonObj);
        });
      }, 500*delay);
  }

}
