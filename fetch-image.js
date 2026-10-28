import https from 'https';
import fs from 'fs';

https.get('https://ibb.co/HT42Hx9D', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const match = data.match(/<meta property="og:image" content="([^"]+)"/);
    if (match) {
      const imgUrl = match[1];
      console.log("Found URL:", imgUrl);
      https.get(imgUrl, (imgRes) => {
        const file = fs.createWriteStream('public/logo.png');
        imgRes.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log("Downloaded to public/logo.png");
        });
      });
    } else {
      console.log("Could not find image URL");
    }
  });
}).on('error', (e) => {
  console.error(e);
});
