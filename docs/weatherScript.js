import "https://cdn.jsdelivr.net/npm/chart.js";

let imageOfWeather = document.querySelector('.img-src');
let degreesText = document.querySelector('.°C');
let cityText = document.querySelector('.city');
let humidityPercentage = document.querySelector('.hum-percentage');
let windSpeed = document.querySelector('.wind-speed');
let feelsLikeTemperatureParagraph = document.querySelector('.feels-like');
let typeOfWeatherParag = document.querySelector('.weather-type');
const myInputTextField = document.querySelector('#inp-text');
const myInputSearchButton = document.querySelector('.search-btn');

let dateInput = document.getElementById('dateInput');

let maxDate = new Date();
let maxDateISO = maxDate.toISOString().split("T")[0];
dateInput.value = maxDateISO;
dateInput.max = maxDateISO;

let minDate = new Date(maxDate);
minDate.setDate(maxDate.getDate() - 7);
let minDateISO = minDate.toISOString().split("T")[0];
dateInput.min = minDateISO;

let audio = null;
let animationName = "";
const allElements = document.querySelectorAll('*');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let isPreferedReduced = false;

if (prefersReducedMotion) {
  isPreferedReduced = true;
  const settingsLink = document.createElement('a');
  settingsLink.textContent = "Go to Accessibility Settings";
  settingsLink.href = "https://scholar.harvard.edu/ccwilcox/blog/how-reduce-motion-various-operating-systems";

  const message = document.createElement('div');
  message.classList.add("message")
  message.textContent = "It seems like you prefer reduced motion. You can adjust this setting in your device's accessibility settings.";
  message.appendChild(settingsLink);

  const secondChild = document.body.children[0];
  document.body.insertBefore(message, secondChild.nextSibling);
}

const flickerElement = document.getElementById('flicker');
flickerElement.addEventListener('click', function () {
  toggleFlicker(audio)
});

function addAnimationToAllElements(animationName = "") {
  if (animationName !== "") {
    if (animationName == "snowing") {
      allElements.forEach(element => {
        element.classList.add('snowing');
      });
    } else if (animationName === "drizzle") {
      allElements.forEach(element => {
        element.classList.add('drizzle');
      });
    } else if (animationName === "rainy") {
      allElements.forEach(element => {
        element.classList.add('rainy');
      });
    } else if (animationName === "misty") {
      allElements.forEach(element => {
        element.classList.add('misty');
      });
    } else if (animationName === "clear-day") {
      allElements.forEach(element => {
        element.classList.add('clear-day');
      });
    } else if (animationName === "cloudy") {
      allElements.forEach(element => {
        element.classList.add('cloudy');
      });
    }
  }
}

function removeAnimationFromAllElements(animationName = "") {
  if (animationName !== "") {
    allElements.forEach(element => {
      element.classList.remove(animationName);
    });
  }
}

myInputSearchButton.addEventListener('click', () => {
  let cityEntered = myInputTextField.value;
  let selectedDate = dateInput.value;
  console.log(selectedDate);
  updateInfo(cityEntered, selectedDate, isPreferedReduced, flickerElement);
})

async function updateInfo(city = null, selectedDate = new Date().toISOString().split("T")[0], areAnimationsAllowed = false) {

  if (audio) {
    audio.src = null
    audio.load();
  }

  if (!areAnimationsAllowed && animationName) {
    removeAnimationFromAllElements(animationName);
  }

  if (myInputTextField.value.length === 0) {
    alert("You didnt enter a city name!");
    return;
  }
  else {
    let regexForSymbolCheck = /[./><;:'@[{}\]\#\~\+\=\_\-\¬\`\!\"\£\$\%\^\&\*0-9]+/gm;

    if (regexForSymbolCheck.test(city)) {
      alert("The city name cannot contain symbols nor numbers");
      return;
    }
  }

  let response = await fetch(`/apiResp/${city}/${selectedDate}`);
  let responseData = await response.json();

  console.log(responseData);

  // precip_mm
  let chartData = responseData.forecast.forecastday[0].hour;
  let objToSend = [];
  for (let item of chartData) {
    objToSend.push(item.precip_mm);
  }

  //Temperatures
  let lineChartTempsInC = [];
  let lineChartTempsInF = [];

  for (let item of chartData) {
    lineChartTempsInC.push(item.temp_c);
    lineChartTempsInF.push(item.temp_f);
  }
  let objPackaged = {
    "temp_c": lineChartTempsInC,
    "temp_f": lineChartTempsInF,
  };
  // Wind speed in kph and mph
  let lineChartWindInKph = [];
  let lineChartWindInMph = [];

  for (let item of chartData) {
    lineChartWindInMph.push(item.wind_mph);
    lineChartWindInKph.push(item.wind_kph);
  }
  let objPackagedWind = {
    "wind_mph": lineChartWindInMph,
    "wind_kph": lineChartWindInKph,
  };

  //Moon data
  let astroData = responseData.forecast.forecastday[0].astro;
  //

  //Chances of rain information
  let chancesData = responseData.forecast.forecastday[0].day;
  //

  updateChancesInformation(chancesData);
  addAstroInformation(astroData);
  createChart(objToSend, objPackaged, objPackagedWind);
  addUVIndexInfo(responseData);

  function getLastEntry(array, searchHour) {
    let lastEntry = null;

    for (let entry = 0; entry < array.length; entry++) {
      if (searchHour === 0) {
        lastEntry = array[entry];
        break; // Exit the loop once we've found the entry
      }
      searchHour--;
    }

    return lastEntry;
  }


  let hourToSearch = new Date().getHours();
  const lastEntry = getLastEntry(chartData, hourToSearch);
  console.log(lastEntry);

  feelsLikeTemperatureParagraph.textContent = `Feels like: ${Math.round(lastEntry.feelslike_c
  )} °C`;
  degreesText.textContent = lastEntry.temp_c + "°C";
  cityText.textContent = city;
  humidityPercentage.textContent = lastEntry.humidity + "%";
  windSpeed.textContent = lastEntry.wind_kph + "km/h";

  let typeOfWeather = responseData.forecast.forecastday[0].day.condition.text;
  typeOfWeatherParag.textContent = "Type of weather: " + typeOfWeather;
  let audioToPlay = "";

  switch (typeOfWeather) {
    case "Cloudy":
    case "Overcast":
    case "Partly cloudy":
      imageOfWeather.src = "./images/pictures for weather app/cloudy.svg";
      audioToPlay = "./sounds/light-drizzle.wav";
      animationName = "cloudy";
      break;
    case "Clear":
    case "Sunny":
      imageOfWeather.src = "./images/pictures for weather app/clear-day.svg";
      audioToPlay = "./sounds/birds.mp3";
      animationName = "clear-day";
      break;
    case "Heavy Rain":
    case "Heavy rain at times":
    case "Moderate or heavy rain shower":
    case "Torrential rain shower":
    case "Thundery outbreaks possible":
      imageOfWeather.src = "./images/pictures for weather app/rain.svg";
      audioToPlay = "./sounds/light-rain.mp3";
      animationName = "rainy";
      break;
    case "Patchy freezing drizzle possible":
    case "Patchy rain possible":
    case "Patchy light rain with thunder":
    case "Moderate or heavy rain with thunder":
    case "Light rain shower":
    case "Patchy light drizzle":
    case "Light drizzle":
    case "Freezing drizzle":
    case "Heavy freezing drizzle":
    case "Patchy light rain":
    case "Light rain":
    case "Moderate or heavy freezing rain":
    case "Light freezing rain":
    case "Moderate rain at times":
    case "Moderate rain":
      imageOfWeather.src = "./images/pictures for weather app/drizzle.svg";
      audioToPlay = "./sounds/light-drizzle.wav";
      animationName = "drizzle";
      break;
    case "Mist":
    case "Freezing fog":
    case "Fog":
    case "Haze":
      imageOfWeather.src = "./images/pictures for weather app/mist.svg";
      audioToPlay = "./sounds/light-rain-mist.wav";
      animationName = "misty";
      break;
    case "Light sleet showers":
    case "Moderate or heavy snow with thunder":
    case "Patchy light snow with thunder":
    case "Moderate or heavy showers of ice pellets":
    case "Light showers of ice pellets":
    case "Moderate or heavy snow showers":
    case "Patchy snow possible":
    case "Patchy light snow with thunder":
    case "Moderate or heavy snow with thunder":
    case "Light sleet showers":
    case "Moderate or heavy sleet showers":
    case "Light snow showers":
    case "Moderate or heavy snow showers":
    case "Light sleet":
    case "Moderate or heavy sleet":
    case "Patchy light snow":
    case "Light snow":
    case "Patchy moderate snow":
    case "Moderate snow":
    case "Patchy heavy snow":
    case "Heavy snow":
    case "Blowing snow":
    case "Blizzard":
    case "Patchy sleet possible":
    case "Freezing Rain":
    case "Heavy snow":
      imageOfWeather.src = "./images/pictures for weather app/snow.svg";
      animationName = "snowing";
      audioToPlay = "./sounds/snowy_forest-snowfall.wav";
      break;
    case "Ice pellets":
    case "Light showers of ice pellets":
    case "Moderate or heavy showers of ice pellets":
    case "":
      audioToPlay = "./sounds/snowy_forest-snowfall.wav";
      imageOfWeather.src = "./images/pictures for weather app/icons8-light-snow.gif";
      // No animation here
      break;
    case "Tornado":
      audioToPlay = "./sounds/snowy_forest-snowfall.wav";
      imageOfWeather.src = "./images/pictures for weather app/icons8-light-snow.gif";
      //no animation here
      break;
    default:
      alert("No weather icon available for the usage of the API!");
  }

  if (animationName !== "" && !areAnimationsAllowed) {
    addAnimationToAllElements(animationName);
  }

  audio = new Audio();
  audio.src = audioToPlay;
  audio.load();
  audio.loop = true;
}


async function createChart(barChartData, objDataForTemps, objWindData) {
  // Remove existing canvas elements
  const canvasWrapper = document.getElementById('canvas-wrapper');
  while (canvasWrapper.firstChild) {
    canvasWrapper.removeChild(canvasWrapper.firstChild);
  }

  // Create new canvas elements
  const barChartCanvas = document.createElement('canvas');
  barChartCanvas.id = 'bar-chart-precipitation';
  barChartCanvas.classList.add('chart');
  canvasWrapper.appendChild(barChartCanvas);

  const tempsChartCanvas = document.createElement('canvas');
  tempsChartCanvas.id = 'temp-chart';
  tempsChartCanvas.classList.add('chart');
  canvasWrapper.appendChild(tempsChartCanvas);

  const windChartCanvas = document.createElement('canvas');
  windChartCanvas.id = 'wind-speed-chart';
  windChartCanvas.classList.add('chart');
  canvasWrapper.appendChild(windChartCanvas);

  // Create new charts
  new Chart(barChartCanvas, {
    type: 'bar',
    data: {
      labels: ['00:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
      datasets: [{
        label: 'Precipitation',
        data: barChartData,
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          title: {
            display: true,
            text: 'Precipitation (mm)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time of the day (hour)'
          }
        }
      }
    },
    legend: {
      labels: {
        fontSize: 16,
      }
    },
    tooltips: {
      mode: 'index'
    }
  });

  new Chart(tempsChartCanvas, {
    type: 'line',
    data: {
      labels: ['00:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
      datasets: [{
        label: 'Temperature (F)',
        data: objDataForTemps.temp_f,
        borderColor: 'rgb(255, 99, 132)',
        fill: true
      },
      {
        label: 'Temperature (C)',
        data: objDataForTemps.temp_c,
        borderColor: 'rgb(54, 162, 235)',
        fill: false
      }
      ]
    },
    options: {
      scales: {
        y: {
          title: {
            display: true,
            text: 'Temperatures in Fahrenheit and Celsius'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time of the day (hour)'
          }
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Temperature Chart',
          padding: {
            top: 10,
            bottom: 30
          }
        },
        legend: {
          labels: {
            fontSize: 16
          }
        },
        tooltips: {
          mode: 'index'
        },
        scales: {
          x: {
            grid: {
              color: 'rgba(255, 255, 255, 0.2)',
            }
          },
          y: {
            grid: {
              color: 'rgba(255, 255, 255, 0.2)',
            }
          }
        },
        background: {
          color: {
            gradient: {
              start: '#87CEEB',
              end: '#FFFFFF'
            }
          }
        }
      }
    }
  });


  new Chart(windChartCanvas, {
    type: 'line',
    data: {
      labels: ['00:00', '1:00', '2:00', '3:00', '4:00', '5:00', '6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'],
      datasets: [{
        label: 'Wind kph',
        data: objWindData.wind_kph,
        borderColor: 'rgb(255, 99, 132)',
        fill: true
      }, {
        label: 'wind mph',
        data: objWindData.wind_mph,
        borderColor: 'rgb(54, 162, 235)',
        fill: false
      }]
    },
    options: {
      scales: {
        y: {
          title: {
            display: true,
            text: 'Wind speed in kph and mph'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Time of the day (hour)'
          }
        }
      }
    },
    legend: {
      labels: {
        fontSize: 16,
      }
    },
    tooltips: {
      mode: 'index'
    }
  });
}

async function addUVIndexInfo(responseData) {
  let uvIndex = responseData.forecast.forecastday[0].day.uv;
  const pointerObj = Array.from(document.querySelectorAll('.pointer'));
  const upperPointer = document.querySelector('.upper');

  upperPointer.style.transform = "rotate(180deg)";
  
  pointerObj.forEach(obj => {
    switch (uvIndex) {
      case 1:
        obj.style.left = '0px';
        break;
      case 2:
        obj.style.left = '12px';
        break;
      case 3:
        obj.style.left = '28px';
        break;
      case 4:
        obj.style.left = '45px';
        break;
      case 5:
        obj.style.left = '70px';
        break;
      case 6:
        obj.style.left = '100px';
        break;
      case 7:
        obj.style.left = '130px';
        break;
      case 8:
        obj.style.left = '160px';
        break;
      case 9:
        obj.style.left = '190px';
        break;
      case 10:
        obj.style.left = '250px';
        break;
    }
    obj.style.transform = "rotate(180deg)";
  })

  let uvSlider = document.getElementById('uv-slider');

  while (uvSlider.querySelector('p.animate__animated')) {
    let animatedParagraphs = Array.from(uvSlider.querySelectorAll('p.animate__animated'));

    animatedParagraphs.forEach(paragraph => {
      paragraph.remove();
    });
  }

  let uvText = document.createElement('p');
  uvText.textContent = "The data shows that the uv index is: " + uvIndex;
  uvText.classList.add('animate__animated');
  uvText.classList.add('animate__heartBeat');
  uvText.setAttribute('id', 'reflection');
  uvSlider.appendChild(uvText);
}

function addAstroInformation(data) {
  // Update the moon information
  let moonContainer = document.getElementById('moon-list');
  for (let i = 0; i < moonContainer.children.length; i++) {
    let currentChild = moonContainer.children[i];

    if (i === 0) {
      currentChild.textContent = "Illumination: " + data.moon_illumination;
    } else if (i === 1) {
      currentChild.textContent = "Moonset time: " + data.moonset;
    } else if (i === 2) {
      currentChild.textContent = "Moonrise time: " + data.moonrise;
    } else if (i === 3) {
      currentChild.textContent = "Moon phase: " + data.moon_phase;
    } else {
      currentChild.textContent = "undefined";
    }
  }

  // Update the sun information
  let sunContainer = document.getElementById('sun-list');
  for (let i = 0; i < sunContainer.children.length; i++) {
    let currentChild = sunContainer.children[i];

    if (i === 0) {
      currentChild.textContent = "Sunset time: " + data.sunset;
    } else if (i === 1) {
      currentChild.textContent = "Sunrise time: " + data.sunrise;
    } else {
      currentChild.textContent = "undefined";
    }
  }

  let moonImg = document.getElementById('phase');

  let moonPhases = {
    "Waxing Crescent": "./images/Moon phases/waxing-crescent-moon.jpg",
    "First Quarter": "./images/Moon phases/First-quarter.jpg",
    "Waxing Gibbous": "./images/Moon phases/Waxing-Gibbous.jpg",
    "Full": "./images/Moon phases/full-moon.jpg",
    "Waning Gibbous": "./images/Moon phases/Waning-Gibbous.jpg",
    "Last Quarter": "./images/Moon phases/third-quarter-moon.jpg",
    "Waning Crescent": "./images/Moon phases/Waning-Crescent.jpg",
    "New Moon": "./images/Moon phases/New-Moon.jpg"
  };

  for (const [key, val] of Object.entries(moonPhases)) {
    if (key === data.moon_phase) {
      moonImg.src = val;
      moonImg.alt = key;
    }
  }
}

function updateChancesInformation(chancesData) {
  let ulListContainer = document.getElementById('chances-list');
  for (let j = 0; j < ulListContainer.children.length; j++) {
    let currentChild = ulListContainer.children[j];

    if (j === 0) {
      if (chancesData.daily_will_it_rain) {
        currentChild.textContent = "Will it rain: " + "yes" + '\n' + 'with ' + chancesData.
          daily_chance_of_rain + '%' + " chance of rain";
      } else {
        currentChild.textContent = "Will it rain: " + "no";
      }
    } else if (j === 1) {
      if (chancesData.daily_will_it_snow) {
        currentChild.textContent = "Will it snow: " + "yes" + '\n' + "with " + chancesData.
          daily_chance_of_snow + '%' + " chance of snow";
      } else {
        currentChild.textContent = "Will it snow: " + "no"
      }
    }
  }
}
function toggleFlicker(audioExp = null) {
  if (flickerElement.classList.contains('flicker-on')) {
    flickerElement.classList.remove('flicker-on');
    flickerElement.classList.add('flicker-off');

    if (audioExp !== null) {
      audioExp.pause();
    }
  } else {
    flickerElement.classList.remove('flicker-off');
    flickerElement.classList.add('flicker-on');

    if (audioExp !== null) {
      audioExp.play();
    }
  }
}

