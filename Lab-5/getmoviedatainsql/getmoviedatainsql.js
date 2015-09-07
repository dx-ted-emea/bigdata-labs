//
// This product uses the TMDb API but is not endorsed or certified by TMDb.
//

// make sure to create a config.js with the appropriate settings:
//
// exports.settings = {
//  sqldbserver: 'tcp:<servername>.database.windows.net,1433',
//  sqldbuser: '<dbuser>',
//  sqldbpwd: '<dbpassword',
//  sqldbdatabase: '<dbname>',
//  tmdbapikey: '<moviedatabase-api-key'
//};
var sql = require("msnodesql")
  , querystring = require('querystring')
  , fs = require('fs')
  , config = require('./config')
  , sqldbserver = config.settings.sqldbserver
  , sqldbuser = config.settings.sqldbuser
  , sqldbpwd = config.settings.sqldbpwd
  , sqldbdatabase = config.settings.sqldbdatabase
  , apikey = config.settings.tmdbapikey

var conn_str = "Driver={SQL Server Native Client 11.0};" +
	"Server=" + sqldbserver + ";" + "Database=" + sqldbdatabase + ";Uid=" + sqldbuser + ";Pwd=" + sqldbpwd + ";Encrypt={Yes};"

// Initialize Database and create table
initSQLDB();
//console.log(conn_str);

// Get genres and insert movies
var http = require('http');
var options = {
  host: 'api.themoviedb.org',
  path: '/3/genre/movie/list?api_key=' + apikey,
  headers: {
    'Accept': 'application/json'
  }
};

var callback = function(response) {
  var str = '';
  var genreList = {};

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    var genreJson = JSON.parse(str);
    // console.log(genreJson);
    for(var i=0; i < genreJson.genres.length; i++)
    {
        var genre = genreJson.genres[i];
        genreList[genre.id] = genre.name;
    }
    console.log(" ---- genres loaded ---- \r\n");
    console.log(genreList);
    // insert movies
    loadMovies(genreList);
  });
  
}
http.request(options, callback).end();
function loadMovies(genres)
{
  for (var j=1; j< 11; j++)
  {
    var options = {
      host: 'api.themoviedb.org',
      path: '/3/discover/movie?sort_by=popularity.desc&page=' + j + '&api_key=' + apikey,
      headers: {
        'Accept': 'application/json'
      }
    };
    
    var callback = function(response) {
      var str = '';
    
      //another chunk of data has been recieved, so append it to `str`
      response.on('data', function (chunk) {
        str += chunk;
      });
    
      //the whole response has been recieved, so we just print it out here
      response.on('end', function () {
        var moviedataJson = JSON.parse(str);
        //console.log(moviedataJson);
        for (var i=0; i < moviedataJson.results.length; i++)
        {
            var movieResult = moviedataJson.results[i];
            var strInsertSQL = "INSERT INTO [dbo].[movies]([Id],[Title],[Genre],[Vote_Average],[Popularity],[Vote_count],[Original_language]) VALUES (" +
            movieResult.id + ",'" + movieResult.title.replace("'","''") + "','" + genres[movieResult.genre_ids[0]] + "'," + movieResult.vote_average + "," + movieResult.popularity + "," + movieResult.vote_count + ",'" + movieResult.original_language + "'" +
            ")";
            insertMovieinSQL(strInsertSQL);
        }
      });
    }
        
    http.request(options, callback).end();
  }
}
function initSQLDB()
{
  sql.open(conn_str, function (err, conn) {
      if (err) {
          console.log("Error opening the connection! " + err);
          return;
      }
      else
          console.log("Successfuly connected");
  
    var sqlquery = "SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME='Movies';";
      conn.queryRaw(sqlquery, function (err, results) {
          if (err) {
              console.log("Error running query1!");
              return;
          }
          if(results.rows.length == 0) {
              var sqlcreateTable = "CREATE TABLE [dbo].[movies] ("+
              "	[Id] INT NOT NULL PRIMARY KEY," +
              "	[Title] varchar(100)," +
              "	[Genre] varchar(20)," +
              "	[Vote_Average] decimal," +
              " [Popularity] decimal," +
              " [Vote_count] int, " +
              " [Original_language] varchar(2))";
              conn.queryRaw(sqlcreateTable, function (err, results) {
                  if (err) {
                      console.log("Error creating table!");
                      return;
                  }
                  else
                  {
                    console.log("Table created!");
                  }
            });
          }
      });
  });	
}

function insertMovieinSQL(strinsertquery)
{
  sql.open(conn_str, function (err, conn) {
      if (err) {
          console.log("Error opening the connection! " + err);
          return;
      }
      //else
          //console.log("Successfuly connected");
      console.log(strinsertquery);
      var sqlquery = strinsertquery;
      conn.queryRaw(sqlquery, function (err, results) {
          if (err) {
              console.log("Error running insert!" + err);
              //return;
          }
      });
  });	
}
