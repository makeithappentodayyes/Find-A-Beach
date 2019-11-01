const icons = document.querySelector(".weather-icon");

const temperature = document.querySelector(".temperature-value p");

const descElement = document.querySelector(".the-temperature p");

const locationElement = document.querySelector(".location p");

const notification = document.querySelector(".notification");





const weather = {};



weather.temperature = {

    unit : "celsius"

}


const KELVIN = 273;


const key = "54fa5b40f77ee5f294c70a3cc2cd4ce9";



if('geolocation' in navigator){

    navigator.geolocation.getCurrentPosition(setPosition, showError);

}else{

    notification.style.display = "block";

    notification.innerHTML = "<p>Browser doesn't Support Geolocation</p>";

}



function setPosition(position){

    let latitude = position.coords.latitude;

    let longitude = position.coords.longitude;

    

    getWeather(latitude, longitude);

}



function showError(error){

    notificationElement.style.display = "block";

    notificationElement.innerHTML = `<p> ${error.message} </p>`;

}



function getWeather(latitude, longitude){

    let api = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${key}`;

    

    fetch(api)

        .then(function(response){

            let data = response.json();

            return data;

        })

        .then(function(data){

            weather.temperature.value = Math.floor(data.main.temp - KELVIN);

            weather.description = data.weather[0].description;

            weather.iconId = data.weather[0].icon;

            weather.city = data.name;

            weather.country = data.sys.country;

        })

        .then(function(){

            displayWeather();

        });

}



function displayWeather(){

    icons.innerHTML = `<img src="icons/${weather.iconId}.png"/>`;

    temperature.innerHTML = `${weather.temperature.value}°<span>C</span>`;

    descElement.innerHTML = weather.description;

    locationElement.innerHTML = `${weather.city}, ${weather.country}`;

}


function celsiusToFahrenheit(temperature){

    return (temperature * 9/5) + 32;

}



temperature.addEventListener("click", function(){

    if(weather.temperature.value === undefined) return;

    

    if(weather.temperature.unit == "celsius"){

        let fahrenheit = celsiusToFahrenheit(weather.temperature.value);

        fahrenheit = Math.floor(fahrenheit);

        

        temperature.innerHTML = `${fahrenheit}°<span>F</span>`;

        weather.temperature.unit = "fahrenheit";

    }else{

        temperature.innerHTML = `${weather.temperature.value}°<span>C</span>`;

        weather.temperature.unit = "celsius"

    }

});

