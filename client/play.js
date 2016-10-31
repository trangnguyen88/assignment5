/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */
var main = function()
{
  	'use strict';
    //local variable
    var currentQuestion={}; //stores the question to be showed

    //start first question
    $.get('/question', function (questionaire)
    {
        currentQuestion=JSON.parse(questionaire);
        $('#question').append('<span class= "questionAsked">'+ currentQuestion.question + '</span>');
    });

    /*****************************************************
        Retrieves, displays, updates score from /score
    ******************************************************/
    setInterval(function()
    {
        $.get('/score', function (check)
          {
              $('#correct .correct-score').remove();
              $('#incorrect .incorrect-score').remove();

             $('#correct').append('<span class="correct-score">'+check.right+'</span>');
             $('#incorrect').append('<span class="incorrect-score">'+check.wrong+'</span>');

          });
    },500);

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
          currentAnswer.answer=$('#Answe').val();
          currentAnswer.answerId=currentQuestion.answerId;

          $.post('/answer', currentAnswer,function ()
           {
               console.log('passing:'+currentAnswer);
          });

          $('#Answe').val('');

          $('#question .questionAsked').remove();
          $.get('/question', function (questionaire)
          {
              currentQuestion=JSON.parse(questionaire);
              $('#question').append('<span class= "questionAsked">'+currentQuestion.question+'</span>');
          });

    });
};


$(document).ready(main);
