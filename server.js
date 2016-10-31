/* jshint browser: true, jquery: true, camelcase: true, indent: 2, undef: true, quotmark: single, maxlen: 80, trailing: true, curly: true, eqeqeq: true, forin: true, immed: true, latedef: true, newcap: true, nonew: true, unused: true, strict: true */

//requirements
var express = require('express'),
    http = require('http'),
    body = require('body-parser'),
    redis = require('redis').createClient(),
    mongo= require('mongodb').MongoClient,
    test = require('assert');
    app = express(),
    url='mongodb://localhost/questionnaire';

//global variable
var questionnaire;
var answerId=0; //used so taht each question get a different Id
var random;     //randomizes the question for user side
var sendThisQuestion={}; //question to send
var checkAnswer={}; // check client Answer will contain answer and id
var score={};   // current score for player

http.createServer(app).listen(3000);
app.use(body.urlencoded({extended:false}));
app.use(body.json());
app.use(express.static(__dirname+'/client'));

/******************************************************
     takes db and empties it outuppon complition displays
     Collection removed.
*******************************************************/
function cleanColection(questionnaire)
{
  	'use strict';
    questionnaire.remove({},function (err, db)
 {
     if(err)
     {
         console.log('Couldnt remove collection');
     }
     else
      {
         console.log('Collection removed ');
     }
    });
}

/*****************************************************
 takes current db and loads some pregenerated
    questions
******************************************************/
function loadSomeQuestions(questionnaire)
{
  	'use strict';
    questionnaire.insert({question:'Who was the first computer programmer?', answer:'Ada Lovelace', answerId:++answerId});
    questionnaire.insert({question:'Who launched GNU?', answer:'Richard Stallman', answerId:++answerId});
    questionnaire.insert({question:'Who founded apple?', answer:'Steve Jobs', answerId:++answerId});
    questionnaire.insert({question:'Who founded MicroSoft?', answer:'Bill Gates', answerId:++answerId});
}

/*****************************************************
  start database
******************************************************/
mongo.connect(url, function(err,db)
 {
   		'use strict';

       questionnaire=db.collection('questionnaire');
       cleanColection(questionnaire);
       loadSomeQuestions(questionnaire);

       redis.set('right', 0);
       redis.set('wrong',0);

 });

 /*****************************************************
    home route
 ******************************************************/
app.get('/',function(req,res)
    {
      	'use strict';
          res.send(index.html);
    });

/*****************************************************
   answer post route
    checks if the answer provided by the client is right
    if so increments right counter
    else increment wrong counter
******************************************************/
app.post('/answer',function(req,res)
    {
      	'use strict';
        questionnaire.findOne({answerId:parseInt(req.body.answerId)},function (err, ans)
            {
                if(err)
                {
                    res.send('error');
                }
                 else
                 {
                     if(req.body.answer===ans.answer)
                     {
                         checkAnswer.correct=true;
                         redis.incr('right');
                      }
                      else
                      {
                          checkAnswer.correct=false;
                          redis.incr('wrong');
                      }
                   }
              });
    });

/*****************************************************
       answer get route
        sends an object for client to check answer
******************************************************/
app.get('/answer',function(req,res)
    {
      			'use strict';
            res.json(checkAnswer);
    });

/*****************************************************
           question get route
            sends a random qustion to client
******************************************************/
app.route('/question')
    .get(function(req,res)
            {
              	'use strict';
                random = Math.floor((Math.random() * answerId) + 1);
                questionnaire.findOne({answerId:random},function (err, askQuestion)
                {
                    if(err)
                    {
                        res.send('error');
                    }
                    else
                     {
                         sendThisQuestion.question = askQuestion.question;
                         sendThisQuestion.answerId = askQuestion.answerId;
                         res.send(JSON.stringify(sendThisQuestion));
                     }
                });

            })
/*****************************************************
    question post route
    Gets a question and answer from client.
    it assigns an answerId from curent answerId counter
******************************************************/
    .post(function(req,res)
            {
								'use strict';
           		 	var newQuestion=req.body;
                		newQuestion.answerId= ++answerId;
                		questionnaire.insert(newQuestion);
            });

/*****************************************************
    score post route
    stores the current values of right and wrong
    into score. Then passes score to client
******************************************************/
app.get('/score',function(req,res)
    {
      	'use strict';
        redis.get('right',function(err,value)
            {
                score.right=value;
            });
        redis.get('wrong',function(err,value)
            {
                score.wrong=value;
            });
        res.json(score);
    });


console.log('server listening on  3000');
