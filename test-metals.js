const fetch = require('node-fetch');
fetch('https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json')
  .then(res => res.json())
  .then(data => {
    console.log('XAU:', data.usd.xau);
    console.log('XAG:', data.usd.xag);
    console.log('XPT:', data.usd.xpt);
    console.log('XPD:', data.usd.xpd);
  })
  .catch(console.error);
