const app = require("express")();
const cors = require('cors');
app.use(cors());

let chrome = {};
let puppeteer;

if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
  chrome = require("chrome-aws-lambda");
  puppeteer = require("puppeteer-core");
} else {
  puppeteer = require("puppeteer");
}

app.get("/api", async (req, res) => {
  let options = {};

  if (process.env.AWS_LAMBDA_FUNCTION_VERSION) {
    options = {
      args: [...chrome.args, "--hide-scrollbars", "--disable-web-security"],
      defaultViewport: chrome.defaultViewport,
      executablePath: await chrome.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    };
  }

  try {
    let browser = await puppeteer.launch(options);

    let page = await browser.newPage();
    await page.goto("https://www.google.co.in/books/edition/The_Cormoran_Strike_Novels_Books_1_4/kDn_DwAAQBAJ?hl=en");

    const [el] = await page.$x('//*[@id="tsuid_7"]');
    const src = await el.getProperty('src')
    srcTxt = await src.jsonValue()

    const [name] = await page.$x('//*[@id="bep-tab-content"]/g-flippy-carousel/div/div/ol/li[1]/span/div/div/div/div/div[3]/div/div[2]/div[2]/div[4]/div/div/div/div[2]/text()');
    const txt = await name.getProperty('textContent')
    rawTxt = await txt.jsonValue()
    res.json({
      "img": srcTxt,
      "name": rawTxt
    });
  } catch (err) {
    console.error(err);
    return null;
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("Server started");
});

module.exports = app;
