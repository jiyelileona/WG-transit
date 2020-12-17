const moment = require('moment');

const getStreetData = streetName => {
  fetch(
    `https://api.winnipegtransit.com/v3/streets.json?api-key=JphSTlx53fKmdiS4jUb2&name=${streetName}&usage=long`
  ).then(response => {
    if (response.status !== 200) {
      console.log("There's an error. Status code: " + response.status);
      return;
    }

    response.json().then(data => {
      data.streets.map(streets => {
        let streetInfo = {
          name: `${streets.name}`,
          dataKey: `${streets.key}`,
        };
        createHTMLOfStreets(streetInfo);
        console.log(streets.key);
      });
    });
  });
};

const getStopData = key => {
  fetch(
    `https://api.winnipegtransit.com/v3/stops.json?api-key=JphSTlx53fKmdiS4jUb2&street=${key}`
  ).then(response => {
    if (response.status !== 200) {
      console.log("There's an error. Status code: " + response.status);
      return;
    }
    response.json().then(data => {
      let stopsData = data.stops.map(stop =>
        fetch(
          `https://api.winnipegtransit.com/v3/stops/${stop.key}/schedule.json?api-key=JphSTlx53fKmdiS4jUb2&max-results-per-route=2`
        ).then(response => response.json())
      );
      Promise.all(stopsData).then(data => {
        data.map(item => {
          let stopSchedual = item['stop-schedule'].stop;
          let nameOfStop = stopSchedual.street.name;
          let crossStreet = stopSchedual['cross-street']['name'];
          let direction = stopSchedual.direction;
          let routeSchedual = item['stop-schedule']['route-schedules'];
          routeSchedual.map(item => {
            let busNumber = item['route']['key'];
            let arriveTime = item['scheduled-stops'][0]['times']['arrival']['scheduled'];

            let stopInfo = {
              name: `${nameOfStop}`,
              crossStreet: `${crossStreet}`,
              direction: `${direction}`,
              busNumber: `${busNumber}`,
              arriveTime: `${arriveTime}`,
            };

            createHTMLOfResults(stopInfo);
          });
        });
      });
    });
  });
};

const createHTMLOfStreets = street => {
  streetList.insertAdjacentHTML(
    'beforeend',
    `
    <a href="#" data-street-key="${street.dataKey}">${street.name}</a>
  `
  );
};

const createHTMLOfResults = stop => {
  table.insertAdjacentHTML(
    'beforeend',
    `
  <tr>
    <td>${stop.name}</td>
    <td>${stop.crossStreet}</td>
    <td>${stop.direction}</td>
    <td>${stop.busNumber}</td>
    <td>${moment(stop.arriveTime).format('LT')}</td>
  </tr>
  `
  );
};

const streetList = document.querySelector('.streets');
const input = document.querySelector('input[type="text"]');
const table = document.querySelector('tbody');
const streetName = document.querySelector('#street-name');

streetList.innerHTML = '';
table.innerHTML = '';
streetName.innerHTML = '';

input.addEventListener('keypress', e => {
  if (e.keyCode == 13) {
    e.preventDefault();
    streetList.innerHTML = '';
    getStreetData(input.value);
    input.value = '';
  }
});

streetList.addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    table.innerHTML = '';
    const key = e.target.getAttribute('data-street-key');
    streetName.innerHTML = `Displaying results for ${e.target.innerHTML}`
    getStopData(key);
  }
});
