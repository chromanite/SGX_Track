const homedir = require('os').homedir();
const schedule = require('node-schedule');
const { join } = require('path');
const webdriver = require('selenium-webdriver');
const fs = require('fs');
const chrome = require('selenium-webdriver/chrome');
const chromeDriver = require('chromedriver');

const basePath = join(homedir, 'Desktop', 'SGX');

chrome.setDefaultService(new chrome.ServiceBuilder(chromeDriver.path).build());

By = webdriver.By;
until = webdriver.until;

let i = 0;

if (!fs.existsSync(basePath)) {
    fs.mkdir(basePath, err => {
        if (err) throw err;
    });
}

const screenshot = () => {
    const date = new Date();
    const d = date.toLocaleString('en-GB', { timeZone: 'Asia/Singapore', hour12: false });
    const rs = d.split('/').join('_');
    const rc = rs.split(',').join('');
    const rspace = rc.split(' ').join('_');
    const dsUS = rspace.split(':').join('_');
    const driver = new webdriver.Builder()
        .forBrowser('chrome')
        .build();

    console.log('Taking screenshot...');
    
    driver.get('https://www.sgx.com/derivatives/delayed-prices-futures?cc=FEF&category=iron-ore');
    driver.manage().window().maximize();
    driver.findElement(By.className('sgx-consent-banner-acceptance-button sgx-button--primary sgx-button--small')).click();
    optInt = driver.findElement(By.xpath('/html/body/div[1]/main/div[1]/article/template-base/div/div/sgx-widgets-wrapper/widget-derivatives-futures-prices/section[1]/div[1]/sgx-table/div/sgx-table-column-headers-manager/div[1]/div[17]/span[1]'));
    header = driver.findElement(By.xpath('//*[@id="masthead-header"]/div[3]/div/div/div/sgx-breadcrumbs/a[1]'));
    driver.executeScript("arguments[0].scrollIntoView()", optInt);
    driver.sleep(1000);
    driver.executeScript("arguments[0].scrollIntoView()", header);
    driver.sleep(1000);
    driver.takeScreenshot().then(
        (image, err) => {
            fs.writeFile(join(basePath, `sgx_${dsUS}_image_${i}.png`), image, 'base64', function(err) {
                i++;
                driver.quit();
                if (err) console.log(err);
            });
        }
    )
}

const startDay = schedule.scheduleJob('40 20 * * 1-5', () => {
    i = 0;
    console.log('startDay is running...');
    screenshot();
    schedule.scheduleJob('*/1 * * * 1-5', () => screenshot());
});

schedule.scheduleJob('40 22 * * *', () => {
    console.log('Jobs finished running. Rescheduling...');
    startDay.cancel(true);
})

process.on('unhandledRejection', err => {
    console.log(err);
});
