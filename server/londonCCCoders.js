if (Meteor.isServer) {
  RESTstop.configure();  

  // add restful API method
  // to be invoked from Google Docs :)
  RESTstop.add('get_user_list', function() {
    var membersAPIurl = 
      'http://api.meetup.com/2/members' +
      '?order=name' + 
      '&group_urlname=London-Climate-Change-Coders' + 
      '&offset=0' +
      '&page=200' +
      '&sign=true'+
      '&key='+APIKEY;
      
    
    var membersResponse = HTTP.get(membersAPIurl);
    
    var resultArray = [];
    // extracts member ids from response and fetch group profile info
    // for each member
    var numMembers = membersResponse.data.results.length;
    for (var i=0; i<numMembers; i++) {
      var id = membersResponse.data.results[i].id;
      var profileAPIurl = 
        'http://api.meetup.com/2/profiles'+
        '?order=visited'+
        '&group_urlname=London-Climate-Change-Coders'+
        '&member_id='+id+
        '&offset=0'+
        '&sign=true'+
        '&key='+APIKEY;
      
      HTTP.get(profileAPIurl, function(error, response) {
        var responseData = response.data.results[0];
        // pluck answer to tech skills question
        var techQuestion = _.find(responseData.answers, function(obj) {
          return obj.question.indexOf("techy" !== -1);
        });
        // could be null if not answered
        var actualAnswer = (techQuestion ? techQuestion.answer : '');

        // push to result array
        resultArray.push({
          name : responseData.name, 
          bio : responseData.bio,
          answer: actualAnswer
        });
      });
    }

    // return
    return {
      results: resultArray
    };
  });

}
