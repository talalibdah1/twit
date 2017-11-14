// Copyright 2017, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

'use strict';
const http = require('https');
const host = 'www.baaz.com';
var qyr ='';
var shortLink ='';
var anyy='';

const access_token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJpZCI6ImIwYTIzMWVjNjA5ZjA4ZTRlYmRiMmM0MjhhM2Q2ZjdjYzQ5M2JkNzEiLCJqdGkiOiJiMGEyMzFlYzYwOWYwOGU0ZWJkYjJjNDI4YTNkNmY3Y2M0OTNiZDcxIiwiaXNzIjpudWxsLCJhdWQiOiJhcGkiLCJzdWIiOm51bGwsImV4cCI6MTUxMDIwODkzNSwiaWF0IjoxNTEwMTIyNTM1LCJ0b2tlbl90eXBlIjoiYmVhcmVyIiwic2NvcGUiOiJtb2JpbGUifQ.g5CRJFzGhuYF-ca4njPW3fqc1uJngUAQ001bwsw5olwxOaRSujWNhK_8Z6YtD6MlqP6fmi7pVzpPv8T0MbZOjRueGUTZ2l-K2EleGsUhS8SYHNwDNWgA6Bmzy7pjJwV2A9giyGonG_6J4sWcVtHn8ogmVmajYb9vTggoYkMwZSJz-N5oScf_16El3jdXBv5os5apa7MHGs6zdbbj_yjFnWgRbAiTnf5A9dgZTmL2rNb_3e9fXwMxpENPtrZjA3WgttOhIr1aSJwEsjl6SJXIVZy0hpLar4WIE0RJb7EInwx4rFOIBvmeiVXLdSCzEpNvUp4jTMKqmAY-O1tVgzj5nA';

exports.dialogflowFirebaseFulfillment = (req, res) => {
  // Get the country and date from the request
  let country = '';
  let output3='';
  // Get the date for the news (if present)
  let category = '';
  if (req.body.result.parameters['country']) {
    country = req.body.result.parameters['country'];
    qyr+='&countryCode='+country;
    console.log('Country: ' + country);
  }
   if (req.body.result.parameters['category']) {
    category = req.body.result.parameters['category'];
    qyr+='&category='+category;
    console.log('Category: ' + category);
  }
  if (req.body.result.parameters['any']) {
    anyy = req.body.result.parameters['any'];
    //qyr+='&category='+category;
    console.log('Any: ' + anyy);
  }

  // Call the Trending API
  callTrending(country, category).then((output) => {
    shortURL (output).then((news) => {
      var fields2 = news.split('~');
      var newsoutput = fields2[0];
      var tweetbodyoutput = fields2[1];
      console.log('Shortining done now : ' + news);
      console.log('tweet body done now : ' + tweetbodyoutput);
      res.setHeader('Content-Type', 'application/json');
      res.send(JSON.stringify({ 
        'speech': newsoutput+' هل تريد خبر آخر', 
        'displayText': newsoutput+'هل تريد خبر آخر',
        'contextOut': [{'name':'story', 'lifespan':2, 'parameters':{'toptweettext':tweetbodyoutput}}]
      }));
      
    });
    
    
  }).catch((error) => {
    // If there is an error let the user know
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ 'speech': error, 'displayText': error }));
  });
};

function callTrending (country, category) {
  return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the news
    let path = '/api/1.1/topics?limit=10' + qyr + '&language=ar';
    let index=2;
    anyy=encodeURIComponent(anyy);
    if(category==''){
      path='/api/1.1/search/topics/extended?query='+anyy+'&limit=10';
      index=1;
    }

    console.log('API Request: ' + host + path);
    // Make the HTTP request to get the news

    //options
    var options = {
      "method": "GET",
      "hostname": "www.baaz.com",
      "port": null,
      "path": path,
      "headers": {
        "content-type": "application/json",
        "authorization": "bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzUxMiJ9.eyJpZCI6ImIyYjMzODNmMDg0NzhjNjE2ZjI1ODI0ZjgzNWE4Y2M2MjNiNjA2YTUiLCJqdGkiOiJiMmIzMzgzZjA4NDc4YzYxNmYyNTgyNGY4MzVhOGNjNjIzYjYwNmE1IiwiaXNzIjpudWxsLCJhdWQiOiJhcGkiLCJzdWIiOm51bGwsImV4cCI6MTUxMDQ3Mjk2OCwiaWF0IjoxNTEwMzg2NTY4LCJ0b2tlbl90eXBlIjoiYmVhcmVyIiwic2NvcGUiOiJtb2JpbGUifQ.c2aQzy4CubEVFtnrsBoCbQJidBoadsTdxjQoPgzuaLHQlOxZJTLojb_fd58e3FqnxubDXEpbKljCEjR4oGmBUhbeNoLqgOZD5K-TnrsyI9iWS24cVnmllOqP3uY7B_3vWWdRx874nCHm0CKcwNbmevW0RFDlqp69ssjZ0a0V4z-zEvhhnueMnV389aD_XvefyM32J36TszzlIBaUliO2BiwaU-I0OZB8PdANNaNoCkYPYjTSSf8fEYEsH5O8VhtUSuOVvexqR4h4eRiWptg3TX-p6lYXvNJG7P5xTyQnYAUUEsdAqfmnlrUaLAls4rJ4qPclIRxmTwhNeVv_H8V8UA",
        "cache-control": "no-cache",
      }
    };

    var req = http.request(options, function (res) {
    let body = ''; // var to store the response chunks
    res.on('data', (d) => { body += d; });
    res.on('end', () => { 
      let response = JSON.parse(body);
      console.log('length is '+response.data.length);
      if (index==2){
        index=Math.floor(Math.random() * response.data.length) + 1 ;
      }
      console.log('index is: '+index);

      let title = response.data[index-1].name;
      let link = response.data[index-1].url;
      let keyword1 = response.data[index-1].keywords[0];
      let keyword2 = response.data[index-1].keywords[1];
      let keyword3 = response.data[index-1].keywords[2];
      let keyword4 = response.data[index-1].keywords[3];
      keyword1='#'+keyword1.replace(/ /g,"_");
      keyword2='#'+keyword2.replace(/ /g,"_");
      keyword3='#'+keyword3.replace(/ /g,"_");
      keyword4='#'+keyword4.replace(/ /g,"_");
      let topTweetBody='';

      //get some tweets for this story
      let index2=Math.floor(Math.random() * 4) + 1 ; 
      if (response.data[index-1].most_trending_posts[index2].owner_user.type == 'social_contact'){
        topTweetBody = '@'+response.data[index-1].most_trending_posts[index2].owner_user.username+' '+response.data[index-1].most_trending_posts[index2].body;
      }
      else{
        topTweetBody = response.data[index-1].most_trending_posts[index2].owner_user.name+' '+response.data[index-1].most_trending_posts[index2].body;
      }

      //var x = shortURL(link);
        //shortURL(link, resultLink);
      let output = title+'~'+link+'~'+keyword1+'~'+keyword2+'~'+keyword3+'~'+keyword4+'~'+topTweetBody;
      resolve(output);
        // Resolve the promise with the output text
      console.log('the news title is ' + output);
      console.log('Top tweet body is  ' + topTweetBody);
     // resolve(output);
      
    });

    res.on('error', (error) => {
      console.log(error);
      reject(error);
    });

    });
    req.end();
  });
}


function shortURL (name) {
  return new Promise((resolve, reject) => {
          var fields = name.split('~');

          var linko = fields[1];
          var texto = fields[0];
          var key1 = fields[2];
          var key2 = fields[3];
          var key3 = fields[4];
          var key4 = fields[5];
          var tweetbody = fields[6];

          console.log('Short URL Request In Progress linko: '+linko);

          var options = {
            "method": "POST",
            "hostname": "www.googleapis.com",
            "port": null,
            "path": "/urlshortener/v1/url?key=AIzaSyBBAK4xsB2C_6S8NaeAInF4TgXnqJC2a24",
            "headers": {
            "content-type": "application/json",
            "cache-control": "no-cache"
            }
          };


          var req = http.request(options, function (res) {
              let body = ''; // var to store the response chunks
              res.on('data', (d) => { body += d; });
              res.on('end', () => { 
                let response = JSON.parse(body);
                let short = response.id;
                let output2 ='';        

                // Resolve the promise with the output text
                console.log('Short URL is: ' + short);
                output2=texto+' '+key1+' '+key2+' '+key3+' '+key4+' '+short+'~'+tweetbody;
                console.log('Outputtoo is: ' + output2);
                resolve(output2);
              });

              res.on('error', (error) => {
                reject(error);
                console.log(error);
                
              });

            });
            req.write(JSON.stringify({ longUrl: linko }));
            req.end();
  });
}