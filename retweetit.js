var cronJob = require('cron').CronJob;
var Twit = require('twit');
//var config = require();
var T = new Twit({
  consumer_key:         'D7nf2hveS2HcLXNYCyuowVRK3',
  consumer_secret:      'YVLyRsmRjMJgUaHD80gvnwF6sSfn0jjNw9zBWAM1HAtPy5HdAs',
  access_token:         '893799894728790018-Vyminpate1rWGEXeCfvtf1wfmybbXvy',
  access_token_secret:  'C77FoUknzygXDyBo68qAprEeZ4cUjHZK3rVDBvB8HuKFk'
  //timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
});

const http = require('https');
const host = 'www.baaz.com';

// Do the tweet in a cron 
var job = new cronJob({
    cronTime: '0 */38 * * * *',
    onTick: function() {
      getToken().then((token)=>{
        callTrending('all', 'all', token).then((output) => {
          shortURL (output).then((news) => {
            var fields2 = news.split('~');
            var newsoutput = fields2[0];
            var tweetbodyoutput = fields2[1];
            console.log('Shortining done now : ' + news);
            console.log('tweet body done now : ' + tweetbodyoutput);
      
            var tweet = { status: tweetbodyoutput+'. تابعنا ليصلك كل جديد '  }
            T.post('statuses/update', tweet, tweeted) 
      
          });
       });
      }).catch((error) => {
          // If there is an error let the user know
          console.log(error);
      });
    },
    start: true,
    timeZone: 'Asia/Kolkata'
});

job.start();

function tweeted(err, data, response) {
	if(err){
		console.log("Something went wrong! "+err);
	}
	else{
		console.log("Voila It worked!");
	}
} 

function callTrending (country, category, token) {
  return new Promise((resolve, reject) => {
    // Create the path for the HTTP request to get the news
    let path = '/api/1.1/topics?limit=10&page=1&response_mode=full&trendingStatus=3&language=ar';
    let index=2;

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
        "authorization": "bearer "+token,
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

function getToken () {
  return new Promise((resolve, reject) => {
          console.log('Getting access token now ... ');

          var options = {
            "method": "POST",
            "hostname": "www.baaz.com",
            "port": null,
            "path": "/api/1.1/tokens",
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
                let token_res = response.access_token;
                       

                // Resolve the promise with the output text
                console.log('Token is: ' + token_res);
          
                resolve(token_res);
              });

              res.on('error', (error) => {
                reject(error);
                console.log(error);
                
              });

            });
            req.write(JSON.stringify({"grant_type" : "client_credentials", "client_id" : "api"}));
            req.end();
  });
}