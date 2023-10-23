

const apiKey = "067c203b31b2ac4e3a2d10ad2923049d";

export interface WeatherData {
  city: string;
  temperature: string;
  description: string;
  humidity: string;
  wind: string;
  country: string;
  icon: string;
  countryFlag: string;
}

export interface ForecastData {
  date: string;
  temperature: string;
  description: string;
  icon: string;
}

export async function getWeatherData(city: string): Promise<WeatherData | null> {
  const apiWeatherURL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}&lang=pt_br`;

  try {
    const res = await fetch(apiWeatherURL);
    const data = await res.json();

    if (data.cod === '404') {
      return null;
    }

    const countryFlagURL = `https://flagcdn.com/64x48/${data.sys.country.toLowerCase()}.png`;

    const weatherData: WeatherData = {
      city: data.name,
      temperature: parseInt(data.main.temp).toString(),
      description: data.weather[0].description,
      humidity: `${data.main.humidity}%`,
      wind: `${data.wind.speed}km/h`,
      country: data.sys.country,
      icon: data.weather[0].icon,
      countryFlag: countryFlagURL,
    };

    return weatherData;
  } catch (error) {
    return null;
  }
}

export async function getFiveDayForecast(city: string): Promise<ForecastData[] | null> {
  const apiForecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}&lang=pt_br`;

  try {
    const res = await fetch(apiForecastURL);
    const data = await res.json();

    if (data.cod === '404') {
      return null;
    }

    // Mapeie os dados da previsão para o formato desejado
    const forecastData: ForecastData[] = [];
    const dailyForecasts: { [date: string]: ForecastData[] } = {};

    for (const item of data.list) {
      const date = item.dt_txt.split(' ')[0]; // Extrai a data, ignorando a hora
      if (!dailyForecasts[date]) {
        dailyForecasts[date] = [];
      }

      dailyForecasts[date].push({
        date: date,
        temperature: parseInt(item.main.temp).toString(),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
      });
    }

    // Calcula a média da temperatura e descrição para cada dia
    for (const date in dailyForecasts) {
      const forecasts = dailyForecasts[date];
      const avgTemperature =
        forecasts.reduce((total, forecast) => total + parseFloat(forecast.temperature), 0) /
        forecasts.length;
      const descriptions = forecasts.map((forecast) => forecast.description);

      // Filtra descrições duplicadas e exibe apenas uma
      const uniqueDescriptions = [...new Set(descriptions)];
      const description = uniqueDescriptions.join(', ');
      
      const icon = forecasts[0].icon;

      forecastData.push({
        date,
        temperature: avgTemperature.toFixed(1),
        description,
        icon,
      });
    }

    return forecastData;
  } catch (error) {
    return null;
  }
}


