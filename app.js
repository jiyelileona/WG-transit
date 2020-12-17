const getStreetData = streetName => {
  fetch(
    `https://api.winnipegtransit.com/v3/streets.json?api-key=JphSTlx53fKmdiS4jUb2&name=${streetName}&usage=long`
  ).then(response => {
    if (response.status !== 200) {
      console.log("There's an error. Status code: " + response.status);
      return;
    }

    response.json().then(data => {
      let streetData = data.streets
        .map(streets => {
          let streetInfo = {
            name: `${streets.name}`,
            dataKey: `${streets.key}`,
          };
          createHTMLOfStreets(streetInfo);
          return streets.key;
        })
        .map(key =>
          fetch(
            `https://api.winnipegtransit.com/v3/stops.json?api-key=JphSTlx53fKmdiS4jUb2&street=${key}`
          ).then(response => response.json())
        );
      Promise.all(streetData).then(data => data[0].stops);
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
