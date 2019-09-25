//powered by newsapi.org
const request = require('request');
const Cat=require('./news_cat.json');

const API_KEY='547bdc15873544ea8eef6f1b12094853';
class News
{
    static PostArticle(msg,category)
    {

        var size=msg.content.length;


        if(size>6)
        {
            let cat=msg.content.substring(6);
           if(Cat['category'].includes(cat)==true)
            category=cat;
           else
           {
            msg.channel.send("news category incorrect");
            return;
           }

        }

        let endpoint="https://newsapi.org/v2/top-headlines?country=in&apiKey="+API_KEY;

        if(category!=undefined)
        endpoint="https://newsapi.org/v2/top-headlines?country=in&category="+category+'&apiKey='+API_KEY;
        
        request(endpoint, { json: true }, (err, res, body) => 
        {
            if (err) { return console.log(err); }
            let leng=0;
            let articleData=body.articles[leng].title+'\r\n'+body.articles[leng].url;
            msg.channel.send(articleData);

   });

  }
  
}

module.exports=News;