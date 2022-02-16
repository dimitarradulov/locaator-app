'use strict';

const showLocationBtn = document.querySelector('.btn-location');
const main = document.querySelector('main');
const btnContainer = document.querySelector('.btn-container');
// const neighboursGrid = document.querySelector('.neighbours__grid');

// *** FUNCTIONS ***
const geolocation = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => reject(new Error("Sorry, we couldn't get your location! 😞"))
    );
  });
};

const getJSON = (
  url,
  errorMsg = 'Failed to get your location from the server.. 😞'
) => {
  return fetch(url).then((res) => {
    if (!res.ok) throw new Error(errorMsg);
    return res.json();
  });
};

const populationNumFormatter = (pop) => {
  if (Math.abs(pop) >= 1000000000) {
    return Math.sign(pop) * (Math.abs(pop) / 1000000000).toFixed(1) + 'B';
  }

  if (Math.abs(pop) >= 1000000) {
    return Math.sign(pop) * (Math.abs(pop) / 1000000).toFixed(1) + 'M';
  }

  if (Math.abs(pop) > 999) {
    return Math.sign(pop) * (Math.abs(pop) / 1000).toFixed(1) + 'K';
  }

  return Math.sign(pop) * Math.abs(pop);
};

const renderLocation = (data, location) => {
  const html = `
  <div class="container">
    <article class="location">
      <div class="location-current center-align">
        <h3>Your Current Location:</h3>
        <h4>🚩 <em>${location}</em></h4>
      </div>

      <div class="row">
        <div class="col s12 m6 offset-m3 xl4 offset-xl4">
          <div class="card">
            <div class="card-image">
              <img
                src="${data[0].flags.png}"
                alt="country flag"
              />
            </div>
            <div class="card-content">
              <span class="card-title">${data[0].name.common}</span>
              <p class="grey-text region">${data[0].region}</p>
              <p><span class="card-icons">👫</span>${populationNumFormatter(
                data[0].population
              )} people</p>
              <p><span class="card-icons">🗣️</span>${
                Object.values(data[0].languages)[0]
              }</p>
              <p><span class="card-icons">💰</span>${
                Object.values(data[0].currencies)[0].name
              }</p>
              <p><span class="card-icons">🏫</span>${data[0].capital[0]}</p>
            </div>
            <div class="card-action center-align">
              <button
                class="waves-effect waves-light btn green btn-neighbours"
              >
                Show Neighbours
              </button>
          </div>
          </div>
        </div>
      </div>
    </article>
  </div>
  `;

  main.insertAdjacentHTML('beforeend', html);
};

const renderNeighbours = (country = []) => {
  if (country.length === 0) {
    return main.insertAdjacentHTML(
      'beforeend',
      `
      <div class="container neighbours-container">
        <h5 class="center-align">This country has no neighbours!</h5>
      </div>
      `
    );
  }

  const neighboursContainer = document.createElement('div');
  neighboursContainer.classList.add('container', 'neighbours-container');
  const neighboursHtml = `
  <article class="neighbours">
    <h5 class="center-align">Neighbours:</h5>
    <div class="row neighbours__grid">
    </div>
  </article>
  `;
  neighboursContainer.insertAdjacentHTML('afterbegin', neighboursHtml);
  const neighboursGrid = neighboursContainer.querySelector('.neighbours__grid');
  country.forEach((data) => {
    const html = `
      <div class="col s12 m6 l4">
        <div class="card">
          <div class="card-image">
            <img
              src="${data[0].flags.png}"
              alt="country flag"
            />
          </div>
          <div class="card-content">
          <span class="card-title">${data[0].name.common}</span>
          <p class="grey-text region">${data[0].region}</p>
          <p><span class="card-icons">👫</span>${populationNumFormatter(
            data[0].population
          )} people</p>
          <p><span class="card-icons">🗣️</span>${
            Object.values(data[0].languages)[0]
          }</p>
          <p><span class="card-icons">💰</span>${
            Object.values(data[0].currencies)[0].name
          }</p>
          <p><span class="card-icons">🏫</span>${data[0].capital[0]}</p>
        </div>
        </div>
      </div>
      `;
    neighboursGrid.insertAdjacentHTML('beforeend', html);
  });

  main.insertAdjacentElement('beforeend', neighboursContainer);
};

const renderError = (err) => {
  const html = `
  <div class="error center-align">
    <div class="red lighten-2 error-box center-align">
      <p class="white-text flow-text">
        ${err.message}
      </p>
    </div>
    <button class="waves-effect waves-light btn-large green btn-try-again">
      <i class="material-icons left">rocket</i>Try Again
    </button>
  </div>
  `;
  main.insertAdjacentHTML('beforeend', html);
};

const hideShowLocationBtn = () => btnContainer.classList.add('hidden');

// const whereAmI = () => {
//   let exactLocation;
//   const errorMsg = 'Failed to get your location from the server.. 😞';

//   geolocation()
//     .then((pos) => {
//       const { latitude: lat, longitude: lon } = pos.coords;
//       return getJSON(
//         `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=4956001598b44d1d86e2bf247340924e`,
//         errorMsg
//       );
//     })
//     .then((data) => {
//       exactLocation = `${data.features[0].properties.city}, ${data.features[0].properties.country}`;
//       return getJSON(
//         `https://restcountries.com/v3.1/alpha/${data.features[0].properties.country_code}`,
//         errorMsg
//       );
//     })
//     .then((data) => {
//       console.log(data);
//       main.textContent = '';
//       hideShowLocationBtn();
//       renderLocation(data, exactLocation);
//     })
//     .catch((err) => {
//       console.error(err);
//       main.textContent = '';
//       hideShowLocationBtn();
//       renderError(err);
//     });
// };

// whereAmI();

let borders = [];

const whereAmI = async () => {
  try {
    const position = await geolocation();
    const { latitude: lat, longitude: lon } = position.coords;

    const currLocation = await fetch(
      `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=4956001598b44d1d86e2bf247340924e`
    );
    if (!currLocation.ok) throw new Error(errorMsg);
    const currLocationRes = await currLocation.json();

    const exactLocation = `${currLocationRes.features[0].properties.city}, ${currLocationRes.features[0].properties.country}`;

    const country = await fetch(
      `https://restcountries.com/v3.1/alpha/${currLocationRes.features[0].properties.country_code}`
    );
    if (!country.ok) throw new Error(errorMsg);
    const countryRes = await country.json();
    console.log(countryRes);

    if (countryRes[0].borders?.length > 0) borders = [...countryRes[0].borders];

    main.textContent = '';
    hideShowLocationBtn();
    renderLocation(countryRes, exactLocation);
  } catch (err) {
    console.error(err);
    main.textContent = '';
    hideShowLocationBtn();
    renderError(err);
  }
};

const showNeighbours = async () => {
  try {
    const neighbours = borders.map(
      async (border) =>
        await getJSON(
          `https://restcountries.com/v3.1/alpha/${border}`,
          'Failed retrieving the neighbours, sorry! 😔'
        )
    );

    const neighboursRes = await Promise.all(neighbours);

    renderNeighbours(neighboursRes);
  } catch (err) {
    console.error(err);
    main.textContent = '';
    renderError(err);
  }
};

// *** EVENTS ***
let neighboursBtnClickCounter = 0;

showLocationBtn.addEventListener('click', whereAmI);
main.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-try-again')) return whereAmI();

  if (e.target.classList.contains('btn-neighbours')) {
    if (neighboursBtnClickCounter > 0) return;
    neighboursBtnClickCounter++;
    return showNeighbours();
  }
});
