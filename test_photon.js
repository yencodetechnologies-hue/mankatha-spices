const axios = require('axios');
const lat = 12.984244875163862;
const lng = 80.22148787324468;

async function test() {
  try {
    const res = await axios.get(`https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`);
    console.log(JSON.stringify(res.data, null, 2));
  } catch(e) {
    console.log(e.message);
  }
}
test();
