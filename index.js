const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

let urls = [] // your content urls
let proxies = [] // Add your proxies here Please note that the proxies should be in the format http://hostname:port or https://hostname:port.

function generateUniqueFilename(url) {
    const extension = path.extname(url);
    const hash = crypto.createHash('md5').update(url).digest('hex');
    return `${hash}${extension}`;
}

const downloadDir = path.join(__dirname, 'your_desired_directory');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

async function downloadMedia(url) {
  try {
    const proxy = proxies.length > 0 ? proxies[Math.floor(Math.random() * proxies.length)] : null;
    const axiosConfig = {
      method: 'get',
      url: url,
      responseType: 'stream',
    };
    if (proxy) {
      axiosConfig.proxy = {
        host: proxy.split(':')[1].replace('//', ''),
        port: parseInt(proxy.split(':')[2]),
      };
    }
    const response = await axios(axiosConfig);

    const fileName = generateUniqueFilename(url);
    const filePath = path.join(downloadDir, fileName);

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => resolve(filePath));
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`Failed to download ${url}: ${error.message}`);
  }
}

async function main() {
  const downloadPromises = urls.map(url => downloadMedia(url));
  await Promise.all(downloadPromises);
  console.log('All media downloaded successfully!');
}

main();
