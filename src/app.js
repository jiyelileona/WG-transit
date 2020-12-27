const moment = require('moment');
import {map} from 'lodash';
import regeneratorRuntime from 'regenerator-runtime';
import getURL from './url';

const getStreetData = async streetName => {
  try {
    const streets = await fetch(`${getURL('streets', {name: streetName, usage: 'long'})}`);
    const data = await streets.json();
    if (data.streets.length === 0) {
      streetList.insertAdjacentHTML('beforeend', '<div class="no-results">No Streets Found</div>');
    }
    map(data.streets, createHTMLOfStreets);
  } catch (err) {
    return "There's an error: " + err;
  }
};

const getStopData = async key => {
  try {
    const stops = await fetch(`${getURL('stops', {street: key})}`);
    const data = await stops.json();
    getRouteData(data.stops);
  } catch (err) {
    return "There's an error: " + err;
  }
};

const getRouteData = async stops => {
  const data = stops.map(stop =>
    fetch(`${getURL(`stops/${stop.key}/schedule`, {'max-results-per-route': 2})}`).then(res =>
      res.json()
    )
  );
  const stopsData = await Promise.all(data);
  getSchedual(map(stopsData, 'stop-schedule'));
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
    `<a href="#" data-street-key="${street.key}">${street.name}</a>`
  );
};

const createHTMLOfResults = stop => {
  table.insertAdjacentHTML(
    'beforeend',
    `<tr>
      <td>${stop.name}</td>
      <td>${stop.crossStreet}</td>
      <td>${stop.direction}</td>
      <td>${stop.busNumber}</td>
      <td>${moment(stop.arriveTime).format('LT')}</td>
     </tr>`
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
