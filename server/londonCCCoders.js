if (Meteor.isServer) {
  RESTstop.configure();

  // add restful API method
  // to be invoked from Google Docs :)
  RESTstop.add('get_members_list', function() {
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

      var response = HTTP.get(profileAPIurl)

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
        name : responseData.name,
        bio : responseData.bio,
        techAnswer: (techQuestion ? techQuestion.answer : ''),
        ccAnswer: (ccQuestion ? ccQuestion.answer : ''),
      };

      // push to result array
      resultArray.push(jsonObj);
    }

    return { results: resultArray};

  });

}
