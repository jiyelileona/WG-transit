const moment = require('moment');
import {map} from 'lodash';

const getStreetData = streetName => {
  fetch(
    `https://api.winnipegtransit.com/v3/streets.json?api-key=JphSTlx53fKmdiS4jUb2&name=${streetName}&usage=long`
  ).then(response => {
    if (response.status !== 200) {
      console.log("There's an error. Status code: " + response.status);
      return;
    }

    response.json().then(data => {
      if (data.streets.length === 0) {
        streetList.insertAdjacentHTML(
          'beforeend',
          '<div class="no-results">No Streets Found</div>'
        );
      }
      map(data.streets, createHTMLOfStreets);
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
      Promise.all(stopsData).then(stopdata => getSchedual(map(stopdata, 'stop-schedule')));
    });
  });
};

const getSchedual = data => {
  data.map(item => {
    let stopSchedual = item.stop;
    item['route-schedules'].map(route => {
      route['scheduled-stops'].map(stop => {
        createHTMLOfResults({
          name: `${stopSchedual.street.name}`,
          crossStreet: `${stopSchedual['cross-street']['name']}`,
          direction: `${stopSchedual.direction}`,
          busNumber: `${route['route']['key']}`,
          arriveTime: `${stop.times.arrival.scheduled}`,
        });
      });
    });
  });
};

const createHTMLOfStreets = street => {
  streetList.insertAdjacentHTML(
    'beforeend',
    `
    <a href="#" data-street-key="${street.key}">${street.name}</a>
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
    streetName.innerHTML = `Displaying results for ${e.target.innerHTML}`;
    getStopData(key);
  }
});
