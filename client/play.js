/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */


var main = function()
{
    var socket = io();

    //Listen to score changed event and update the ui
    socket.on('score_changed',function(scores){
        $('#userList').empty(); //clear the current score board
	for (var i in scores) {
  	   var score = scores[i];
           $('#userList').append('<p class="w3-small" id="' + score.user + '">' + score.user + ' (' + score.right + ' , ' + score.wrong + ')</p>');
           if(score.user == currentUser.user)
	   {
              $('#correct .correct-score').remove();
              $('#incorrect .incorrect-score').remove();

              $('#correct').append('<span class="correct-score">'+score.right+'</span>');
              $('#incorrect').append('<span class="incorrect-score">'+score.wrong+'</span>');
           }

	}
    });

    var currentUser = {user:"guest"};
    var user = prompt("Please enter your name", "");
    if (user != null) {
       currentUser.user = user;
    }
    

    'use strict';
    //local variable
    var currentQuestion={}; //stores the question to be showed

     
    //login
    $.post('/login', currentUser,function ()
           {
               console.log('Loggin in :'+ currentUser);
          });

    //start first question
    $.get('/question', function (questionaire)
    {
        currentQuestion=JSON.parse(questionaire);
        $('#question').append('<span class= "questionAsked">'+ currentQuestion.question + '</span>');
    });

    //get all scores of the users when the page load. only one time. rest of the events will be send by socket.io to the client
    $.get('/scores', function (scores)
    {
        $('#userList').empty(); //clear the current score board
	for (var i in scores) {
  	   var score = scores[i];
           $('#userList').append('<p class="w3-small" id="' + score.user + '">' + score.user + ' (' + score.right + ' , ' + score.wrong + ')</p>');
	}
    });

    
    /*****************************************************
        Upon click on next. it conects to server.
        Retrieves and displays question
    ******************************************************/
    $('#next').on('click', function()
    {
        $('#question .questionAsked').remove();
        $.get('/question', function (questionaire)
        {
            currentQuestion=JSON.parse(questionaire);
            $('#question').append('<span class= "questionAsked">'+currentQuestion.question+'</span>');
        });
    });

    /*****************************************************
        Upon click on submit-answer. it sends data from
        input fields Answe to server.
        it Retrieves and displays score from /score
    ******************************************************/
    $('#submit-answer').on('click', function ()
     {
          var currentAnswer={};
          currentAnswer.answer=$('#Answer').val();
          currentAnswer.questionId=currentQuestion.questionId;
          currentAnswer.user=currentUser.user;

          $.post('/answer', currentAnswer,function ()
           {
               console.log('passing:'+currentAnswer);
          });

          $('#Answer').val('');

          $('#question .questionAsked').remove();
          $.get('/question', function (questionaire)
          {
              currentQuestion=JSON.parse(questionaire);
              $('#question').append('<span class= "questionAsked">'+currentQuestion.question+'</span>');
          });

    });
};


$(document).ready(main);
