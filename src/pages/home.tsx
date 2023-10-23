import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  faMagnifyingGlass,
  faLocationDot,
  faDroplet,
  faWind,
  faSpinner,
  faStar,
  faTemperatureLow, 
  faCloud,
  faCalendarDays
} from '@fortawesome/free-solid-svg-icons';

import './home.css';
import { getWeatherData, getFiveDayForecast } from '../api/api';

const getInitialFavorites = () => {
  const storedFavorites = localStorage.getItem('favorites');
  if (storedFavorites) {
    return JSON.parse(storedFavorites);
  }
  return ['São José do Rio Preto'];
};

const initialFavorites = getInitialFavorites();

interface WeatherData {
  city: string;
  temperature: string;
  description: string;
  humidity: string;
  wind: string;
  country: string;
  icon: string;
  countryFlag: string;
}

interface ForecastData {
  date: string;
  temperature: string;
  description: string;
}

function formatDate(dateString: string): string {
  console.log(dateString);
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

function WeatherData({ data }: { data: WeatherData }) {
  const [isFavorite, setIsFavorite] = useState(false);

  const toggleFavorite = () => {
    if (isFavorite) {
      removeFromFavorites(data.city);
    } else {
      addToFavorites(data.city);
    }
    window.location.reload(); 
  };

  const addToFavorites = (city: string) => {
    const updatedFavorites = [...favorites, city];
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setIsFavorite(true);
  };

  const removeFromFavorites = (city: string) => {
    const updatedFavorites = favorites.filter((favCity) => favCity !== city);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    setIsFavorite(false);
  };

  useEffect(() => {
    const isCityFavorite = favorites.includes(data.city);
    setIsFavorite(isCityFavorite);
  }, [data, favorites]);

  return (
    <div id="weather-data">
      <h2>
        <i>
          <FontAwesomeIcon icon={faLocationDot} />
        </i>{' '}
        <span id="city">{data.city}</span>{' '}
        <img id="country" src={data.countryFlag} alt="Bandeira do país" />
        <div
          className={isFavorite ? 'favorite-icon active' : 'favorite-icon'}
          onClick={toggleFavorite}
        >
          <FontAwesomeIcon icon={faStar} />
        </div>
      </h2>
      <p id="temperature">
        <span>{data.temperature}</span>&deg;C
      </p>
      <div id="description-container">
        <p id="description">{data.description}</p>
        <img
          id="weather-icon"
          src={`http://openweathermap.org/img/wn/${data.icon}.png`}
          alt="Condições atuais"
        />
      </div>
      <div id="details-container">
        <p id="humidity">
          <i>
            <FontAwesomeIcon icon={faDroplet} />
          </i>{' '}
          <span>{data.humidity}</span>
        </p>
        <p id="wind">
          <i>
            <FontAwesomeIcon icon={faWind} />
          </i>{' '}
          <span>{data.wind}</span>
        </p>
      </div>
    </div>
  );
}

function ErrorMessage() {
  return (
    <div id="error-message">
      <p>Não foi possível encontrar o clima de uma cidade com este nome.</p>
    </div>
  );
}

function Loader() {
  return (
    <div id="loader">
      <i>
        <FontAwesomeIcon icon={faSpinner} />
      </i>
    </div>
  );
}

const favorites: string[] = initialFavorites;

function Home() {
  const [cityInput, setCityInput] = useState('');
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastData[] | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const lastClickedCity = localStorage.getItem('lastClickedCity');
    if (lastClickedCity) {
      showWeatherData(lastClickedCity);
    } else {
      showWeatherData('São José do Rio Preto');
    }
  }, []);

  const showWeatherData = async (city: string) => {
    setLoading(true);
    setError(false); 

    try {
      const data = await getWeatherData(city);
      const forecast = await getFiveDayForecast(city);

      if (!data || !forecast) {
        showErrorMessage();
      } else {
        setWeatherData(data);
        const formattedForecast = forecast.map((item) => ({
          ...item,
          date: formatDate(item.date),
        }));
        setForecastData(formattedForecast);
      }
    } catch (err) {
      showErrorMessage();
    }

    setLoading(false);
    localStorage.setItem('lastClickedCity', city);
  };

  const showErrorMessage = () => {
    setError(true);
  };

  return (
    <div className="main-container ">
      <div className="container ">
        <h3>Favoritos</h3>
        <div id="suggestions">
          {favorites.map((city) => (
            <button key={city} onClick={() => showWeatherData(city)}>
              {city}
            </button>
          ))}
        </div>
      </div>

      <div className="container">
        <div className="form">
          <h3>Confira o clima de uma cidade:</h3>
          <div className="form-input-container">
            <input
              type="text"
              placeholder="Digite o nome da cidade"
              id="city-input"
              value={cityInput}
              onChange={(e) => setCityInput(e.target.value)}
            />
            <button id="search" onClick={() => showWeatherData(cityInput)}>
              <i>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
              </i>
            </button>
          </div>
        </div>

        {loading && <Loader />}
        {error ? <ErrorMessage /> : weatherData && <WeatherData data={weatherData} />}
      </div>

      <div className="container">
        <h3>Previsão de 5 Dias</h3>
        {forecastData &&
          forecastData.map((forecast, index) => (
            <div key={index} className="forecast-item">
              <p>
              <i>
                  <FontAwesomeIcon icon={faCalendarDays} />
                </i>{' '}
                Data: {forecast.date}</p>
              <p>
                <i>
                  <FontAwesomeIcon icon={faTemperatureLow} />
                </i>{' '}
                Temperatura: {forecast.temperature}°C
              </p>
              <p>
                <i>
                  <FontAwesomeIcon icon={faCloud} />
                </i>{' '}
                Descrição: {forecast.description}
              </p>
              
            </div>
          ))}
      </div>
    </div>
  );
}

export default Home;
