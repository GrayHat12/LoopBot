const APIKEY='a20a4b7723be822b79d0fba5fe8fe876';

var weather = require('openweather-apis');

class Weather
{
    static GetWeatherInfo(msg)
    {
        weather.setLang('en');
        let place=msg.content.substring(9);

        if(place!=undefined)
        {

            weather.setCity(place);
            weather.setUnits('metric');
            weather.setAPPID(APIKEY);
            weather.getAllWeather(function(err, JSONObj)
            {
                if(JSONObj.cod!='404')
                {
                    let desc=JSONObj.weather[0].description;
                    let data=JSONObj.name+","+JSONObj.sys.country+"\r\n";
                    data+="Weather: "+desc+"\r\n";
                    data+="Temp: "+JSONObj.main.temp+" ˚C , Min Temp: "+JSONObj.main.temp_min+" ˚C , Max Temp: "+JSONObj.main.temp_max+" ˚C"+"\r\n";
                    data+="Pressure : "+JSONObj.main.pressure+" Pascal\r\n";
                    data+="Humidity : "+JSONObj.main.humidity+" g/m3\r\n";
                    data+="Wind : "+JSONObj.wind.speed+" (km/hr)     ";
                    data+="  "+JSONObj.wind.deg+" degree \r\n";
                    data+="Clouds : "+JSONObj.clouds.all+"%\r\n";
                    msg.channel.send(data);
                }
                else
                {
                    msg.channel.send("That's an odd place , not in weather data base");
                }
            });
        }
        else
        {
            msg.channel.send("Forgot to mention Place ");
        }
    }
}

module.exports=Weather;