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
      Promise.all(stopsData).then(msg => console.log(msg));
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

const streetList = document.querySelector('.streets');
const input = document.querySelector('input[type="text"]');

streetList.innerHTML = '';

input.addEventListener('keypress', e => {
  if (e.keyCode == 13) {
    e.preventDefault();
    getStreetData(input.value);
    input.value = '';
  }
});

streetList.addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    const key = e.target.getAttribute('data-street-key');
    getStopData(key);
  }
});
