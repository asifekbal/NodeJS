{
  var config = require('./config.js');
  var flock = require('flockos');
  var express = require('express');
  var router = express.Router();
  var mongodb = require('mongodb');
  var MongoClient = mongodb.MongoClient;
  var url = 'mongodb://localhost:27017/travel';
  var app = express();
  var events = require('events');
  var eventEmitter = new events.EventEmitter();
  var Mustache = require('mustache');
  var fs = require('fs');
  var chrono = require('chrono-node');
  var http = require('http');
  var apikey = 'fe67d5r0';
  var host = 'http://api.railwayapi.com';
  var request = require("request");
  var syncrequest = require("sync-request");
  var dateFormat = require('dateformat');
  var listTempate = fs.readFileSync('list.mustache.html', 'utf8');
  var bodyParser = require('body-parser');
  var urlencodedParser = bodyParser.urlencoded({
    extended: false
  })


  flock.appId = config.appId;
  flock.appSecret = config.appSecret;
  //app.use(express.static('public'));
  //app.use(flock.events.tokenVarifier);
  app.post('/events', flock.events.listener);
  app.listen(8080, function() {
    console.log("Listening on port 8080");
  });

  flock.events.on('app.install', function(event, callback) {
    MongoClient.connect(url, function(err, db) {
      if (err) {
        console.log('Unable to connect to the mongoDB server. Error:', err);
      } else {
        console.log('Connection established to', url);
        db.collection('travel').insert({
          userId: event.userId,
          userToken: event.token
        });
      }
    });
    callback();
  });


  flock.events.on('client.slashCommand', function(event, callback) {
    console.log(event.text);
    var commandDetails = parseCommand(event.text);
    console.log('parse result', commandDetails);
    var result = commandExecute(commandDetails, event);
    console.log(' result', result);
    if (result) {
      callback(null, {
        text: result
      });
    } else {
      callback(null, {
        text: 'No result found'
      });
    }
  });

  var parseCommand = function(text) {
    var r = text.split(" ");
    if (r && r.length == 1) {
      return {
        function: r[0],
        parameter: r[0]
      };
    } else if (r && r.length > 1) {
      return {
        function: r[0],
        parameter: text.substring(text.indexOf(" "), text.length).trim().split(" ")
      };
    } else {
      return null;
    }
  };
  var commandExecute = function(commandDetails, event) {
    console.log(commandDetails.function);
    switch (commandDetails.function) {
      case "help":
      var datareturn = "Available commands\n 1. /train status ``| live <train no> \n 2. /train pnr <pnr no> \n 3. /train route <train no> \n 4. /train name <train name> \n 5. /train number <train number> " +
      "\n 6 . /train cancelled <dd-mm-yyyy> \n 7 . /train rescheduled <dd-mm-yyyy> \n 8 . /train stationbyname <station name> \n 9 . /train stationbycode <station code> \n 10 . /train suggesttrain <partial train name or number> \n 11 . /train suggeststation <partial station name>";
      flock.chat.sendMessage(config.botToken, {
        to: event.userId,
        text: datareturn
      });
      return "Request processed...";
      break;
      case "status":
      case "live":
      var route = '/live/train/';
      var now = new Date();
      var doj = dateFormat(now, "yyyymmdd");
      if (commandDetails.parameter[0] != null) {
        var theUrl = host + route + commandDetails.parameter[0] + '/doj/' + doj + '/apikey/' + apikey;
        console.log(theUrl);
        request(theUrl, function(error, response, body) {
          if (error) {
            console.log("Internal Error. Please try after some time");
          } else {
            console.log(body);
            data = JSON.parse(response.body);
            console.log(" response code : " + data.response_code);
            datareturn = "Train Number : " + data.train_number + " , Current Status : " + data.position;
            if (data.response_code == 200) {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: datareturn
              });
            } else {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: "Bad request"
              });
            }
          }
        });
        return "processing the request...";
      } else {
        return "train number not found";
      }
      break;
      case "pnr":
      var route = '/pnr_status/pnr/';
      if (commandDetails.parameter != null) {
        var theUrl = host + route + commandDetails.parameter + '/apikey/' + apikey;
        console.log(theUrl);
        request(theUrl, function(error, response, body) {
          if (error) {
            console.log("Internal Error. Please try after some time");
          } else {
            console.log(body);
            data = JSON.parse(response.body);
            datareturn = "Date Of Journey : " + data.doj + "\nFrom Station : " + data.from_station.name + " , To Station : " + data.to_station.name +
            "\nReservation Upto : " + data.reservation_upto.name + " , Boarding From : " + data.boarding_point.name + "\nTotal Passengers : " + data.total_passengers;
            if (data.response_code == 200) {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: datareturn
              });
            } else {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: "Bad request"
              });
            }
          }
        });
        return "processing the request...";
      } else {
        return "PNR number not found";
      }
      break

      case "name":
      case "number":
      var route = '/name_number/train/';
      if (commandDetails.parameter != null) {
        var theUrl = host + route + commandDetails.parameter + '/apikey/' + apikey;
        console.log(theUrl);
        request(theUrl, function(error, response, body) {
          if (error) {
            console.log("Internal Error. Please try after some time");
          } else {
            console.log(body);
            data = JSON.parse(response.body);
            datareturn = "Train name : " + data.train.name + " , Train Number : " + data.train.number;
            if (data.response_code == 200) {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: datareturn
              });
            } else {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: "Bad request"
              });
            }
          }
        });
        return "processing the request...";
      } else {
        return "Train  not found";
      }
      case "cancelled":
      var route = '/cancelled/date/';
      if (commandDetails.parameter != null) {
        var date = commandDetails.parameter;
        var theUrl = host + route + commandDetails.parameter + '/apikey/' + apikey;
        console.log(theUrl);
        request(theUrl, function(error, response, body) {
          if (error) {
            console.log("Internal Error. Please try after some time");
          } else {
            console.log(body);
            data = JSON.parse(response.body);
            var datareturn = "";
            for (i = 0; i < data.trains.length; i++) {
              datareturn += (i + 1) + " - " + data.trains[i].train.number + "  -  " + data.trains[i].train.name + "\n";
            }
            if (data.response_code == 200) {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: datareturn
              });
            } else {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: "Bad request"
              });
            }
          }
        });
        return "processing the request...";
      } else {
        return "Train  not found";
      }
      break;
      case "rescheduled":
      var route = '/rescheduled/date/';
      if (commandDetails.parameter != null) {
        var date = commandDetails.parameter;
        var theUrl = host + route + commandDetails.parameter + '/apikey/' + apikey;
        console.log(theUrl);
        request(theUrl, function(error, response, body) {
          if (error) {
            console.log("Internal Error. Please try after some time");
          } else {
            console.log(body);
            data = JSON.parse(response.body);
            var datareturn = "";
            for (i = 0; i < data.trains.length; i++) {
              datareturn += (i + 1) + " - " + data.trains[i].number + "  -  " + data.trains[i].name + "\n";
            }
            if (data.response_code == 200) {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: datareturn
              });
            } else {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: "Bad request"
              });
            }
          }
        });
        return "processing the request...";
      } else {
        return "Train  not found";
      }
      break;
      case "route":
            var route = '/route/train/';
            if (commandDetails.parameter != null) {
                var theUrl = host + route + commandDetails.parameter + '/apikey/' + apikey;
                console.log(theUrl);
                request(theUrl, function(error, response, body) {
                    if (error) {
                        console.log("Internal Error. Please try after some time");
                    } else {
                        console.log(body);
                        data = JSON.parse(response.body);
                        var datareturn = "";
                        for (i = 0; i < data.route.length; i++) {
                            datareturn += (i + 1) + " - " + data.route[i].fullname + "\n";
                        }
                        if (data.response_code == 200) {
                            flock.chat.sendMessage(config.botToken, {
                                to: event.userId,
                                text: datareturn
                            });
                        } else {
                            flock.chat.sendMessage(config.botToken, {
                                to: event.userId,
                                text: "Bad request"
                            });
                        }
                    }
                });
                return "processing the request...";
            } else {
                return "Train number not found";
            }
            break;
      case "stationbyname":
      var route = '/name_to_code/station/';
      if (commandDetails.parameter != null) {
        var station = commandDetails.parameter;
        var theUrl = host + route + commandDetails.parameter + '/apikey/' + apikey;
        console.log(theUrl);
        request(theUrl, function(error, response, body) {
          if (error) {
            console.log("Internal Error. Please try after some time");
          } else {
            console.log(body);
            data = JSON.parse(response.body);
            var datareturn = "";
            for (i = 0; i < data.stations.length; i++) {
              datareturn += (i + 1) + " - " + data.stations[i].code + "  -  " + data.stations[i].fullname + "\n";
            }
            if (data.response_code == 200) {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: datareturn
              });
            } else {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: "Bad request"
              });
            }
          }
        });
        return "processing the request...";
      } else {
        return "Train  not found";
      }
      break;
      case "stationbycode":
      var route = '/code_to_name/code/';
      if (commandDetails.parameter != null) {
        var station = commandDetails.parameter;
        var theUrl = host + route + commandDetails.parameter + '/apikey/' + apikey;
        console.log(theUrl);
        request(theUrl, function(error, response, body) {
          if (error) {
            console.log("Internal Error. Please try after some time");
          } else {
            console.log(body);
            data = JSON.parse(response.body);
            var datareturn = "";
            for (i = 0; i < data.stations.length; i++) {
              datareturn += (i + 1) + " - " + data.stations[i].code + "  -  " + data.stations[i].fullname + "\n";
            }
            if (data.response_code == 200) {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: datareturn
              });
            } else {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: "Bad request"
              });
            }
          }
        });
        return "processing the request...";
      } else {
        return "Train  not found";
      }
      break;

      case "suggesttrain":
      var route = '/suggest_train/trains/';
      if (commandDetails.parameter != null) {
        var theUrl = host + route + commandDetails.parameter + '/apikey/' + apikey;
        console.log(theUrl);
        request(theUrl, function(error, response, body) {
          if (error) {
            console.log("Internal Error. Please try after some time");
          } else {
            console.log(body);
            data = JSON.parse(response.body);
            var datareturn = "";
            for (i = 0; i < data.trains.length; i++) {
              datareturn += (i + 1) + " - " + data.trains[i].number + "  -  " + data.trains[i].name + "\n";
            }
            if (data.response_code == 200) {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: datareturn
              });
            } else {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: "Bad request"
              });
            }
          }
        });
        return "processing the request...";
      } else {
        return "Train  not found";
      }
      break;

      case "suggeststation":
      var route = '/suggest_station/name/';
      if (commandDetails.parameter != null) {
        var station = commandDetails.parameter;
        var theUrl = host + route + commandDetails.parameter + '/apikey/' + apikey;
        console.log(theUrl);
        request(theUrl, function(error, response, body) {
          if (error) {
            console.log("Internal Error. Please try after some time");
          } else {
            console.log(body);
            data = JSON.parse(response.body);
            var datareturn = "";
            for (i = 0; i < data.station.length; i++) {
              datareturn += (i + 1) + " - " + data.station[i].code + "  -  " + data.station[i].fullname + "\n";
            }
            if (data.response_code == 200) {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: datareturn
              });
            } else {
              flock.chat.sendMessage(config.botToken, {
                to: event.userId,
                text: "Bad request"
              });
            }
          }
        });
        return "processing the request...";
      } else {
        return "Train  not found";
      }
      break;
      default:
      var datareturn = "Please type a valid command \n For more details about syntax type - \n /train help";
      flock.chat.sendMessage(config.botToken, {
        to: event.userId,
        text: datareturn
      });
      return "Request processed...";
    }
  };



  app.get('/list', function(req, res) {
    // var event = JSON.parse(req.query.flockEvents);
    var test = "Asif";
    res.set('Content-Type', 'text/html');
    var body = Mustache.render(listTempate, {
      test: test
    });
    res.send(body);
  });

  app.post('/list', urlencodedParser, function(req, res) {
    var comand = req.body.command;
    var trainno = req.body.TrainNo;
    var result = commandExecuteCustom(comand,trainno);
    console.log(result);

    res.set('Content-Type', 'text/html');
    var body = Mustache.render(listTempate, {
      result: result
    });
    res.send(body);
  });

  var commandExecuteCustom = function(comand, trainno) {
      var route = '/live/train/';
      var now = new Date();
      var doj = dateFormat(now, "yyyymmdd");
      var theUrl = host + route + trainno + '/doj/' + doj + '/apikey/' + apikey;
      console.log(theUrl);
      var res = syncrequest('GET',theUrl) ;
              data = JSON.parse(res.getBody());
              console.log(" response code : " + data);
              datareturn = "Train Number : " + data.train_number + " , Current Status : " + data.position;
              return datareturn;


      // return "processing the request...";
  }
module.exports = router;
}
``
