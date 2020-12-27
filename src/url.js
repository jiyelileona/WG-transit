require('dotenv').config();

export default function getURL(path, parameters) {
  const url = new URL('http://api.winnipegtransit.com');
  url.pathname = `v3/${path}.json`;
  let params = new URLSearchParams();
  params.set('api-key', `${process.env.API_KEY}`);

  for (let [key, value] of Object.entries(parameters)) {
    params.append(key, value);
  }

  url.search = params.toString();

  return url.href;
}
