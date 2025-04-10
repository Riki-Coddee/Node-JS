import axios from "axios";
import readline from "readline";

const r1 = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const API_KEY = '27cfc8d0c4b8df5f08069ec450b5cff7';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

const getWeather = async (city) => {
    const url = `${BASE_URL}?q=${city}&appid=${API_KEY}&units=metric`;

    try {
        const response = await axios.get(url);
        const weatherData = response.data;

        console.log("\nWeather Information:");
        console.log(`City: ${weatherData.name}`);
        console.log(`Temperature: ${weatherData.main.temp}°C`);
        console.log(`Description: ${weatherData.weather[0].description}`);
        console.log(`Humidity: ${weatherData.main.humidity}%`);
        console.log(`Wind Speed: ${weatherData.wind.speed} m/s \n`);
    } catch (error) {
        console.error("City not found. Please check the city name.");
    } finally {
        r1.close();
    }
};

// Wrapping in an async function
const askCityAndFetchWeather = async () => {
    r1.question("Enter a city to get its weather: ", async (city) => {
        await getWeather(city);
    });
};

askCityAndFetchWeather();
