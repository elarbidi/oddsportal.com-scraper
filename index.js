const puppeteer = require("puppeteer");
const iPhone = puppeteer.devices['iPhone 6'];
const delay = require("./delay.js")
const fs = require("fs");




const URL = ["https://www.oddsportal.com/tennis/usa/wta-indian-wells/noskova-linda-begu-irina-dnGFXoib/",
    "https://www.oddsportal.com/tennis/usa/wta-indian-wells/sherif-mayar-fruhvirtova-linda-E32TLlhn/",
    "https://www.oddsportal.com/tennis/usa/atp-indian-wells/giron-marcos-kovacevic-aleksandar-bBjWpHrC/",
    "https://www.oddsportal.com/tennis/usa/atp-indian-wells/isner-john-nakashima-brandon-tE40XcEC/",
    "https://www.oddsportal.com/basketball/usa/nba/washington-wizards-atlanta-hawks-AZRXcmha/",
    "https://www.oddsportal.com/basketball/usa/nba/boston-celtics-portland-trail-blazers-lQQyc775/",
    "https://www.oddsportal.com/basketball/usa/nba/miami-heat-cleveland-cavaliers-61LtdRMB/",
    "https://www.oddsportal.com/basketball/usa/nba/new-orleans-pelicans-dallas-mavericks-phKpeoxI"
]
const res = [];


let userName;
let password;
puppeteer.launch({ headless: true }).then(async (browser) => {
    var page = await browser.newPage();
    await page.emulate(iPhone);
    await page.goto("https://www.oddsportal.com/");
    await delay(1000);
    await page.waitForSelector(".loginModalBtn");
    await page.evaluate(() => {
        document.querySelector(".loginModalBtn").click();
    })
    console.log("trying to LOGIN");
    await delay(1000);
    await page.waitForSelector("#login-username-sign");
    await page.type("#login-username-sign", userName);
    await page.type("#login-password-sign-m", password);
    await page.evaluate(() => {
        document.querySelector('input[type="submit"]').click();
    })
    console.log("LOGIN SUCCESSFULLY");
    await page.waitForSelector('#onetrust-accept-btn-handler')
    await page.evaluate(() => {
        document.querySelector('#onetrust-accept-btn-handler').click();
    })
    console.log("getting DATA");
    for (i = 0; i < URL.length; i++) {
        try {
            await page.goto(URL[i]);
            await page.waitForSelector('[class="flex flex-col items-center justify-center gap-1 border-r border-[#E0E0E0] min-w-[60px] max-sm:min-w-[55px] max-sm:max-w-[55px]"]')
            await delay(4000);
            var data = await page.evaluate(async () => {
                const delay = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
                var t = document.querySelectorAll('[class="flex flex-col items-center justify-center gap-1 border-r border-[#E0E0E0] min-w-[60px] max-sm:min-w-[55px] max-sm:max-w-[55px]"]')
                var average = {
                    avarage1: t[0].innerText,
                    average2: t[1].innerText
                }
                t = document.querySelectorAll('[class="absolute w-full text-center cursor-pointer height-content"]');
                var UserPredictions = {
                    Prediction1: t[0].innerText,
                    Prediction2: t[1].innerText
                }
                var bettingExchange = [];
                t = document.querySelectorAll('[class="height-content min-mt:!hidden text-black-main font-bold text-xs leading-[18px]"]')
                for (i = 0; i < t.length; i++) {
                    t[i].click();
                    await delay(300);
                    if (i % 2 == 0) {
                        var name = document.querySelectorAll('[class="w-[75px] bg-cover bg-no-repeat"]')[0]?.alt;
                        var odds = document.querySelectorAll('[class="flex flex-col gap-1 text-xs"]')[1]?.innerText.split("\n");
                        var oddsP = document.querySelectorAll('[class="flex flex-col gap-1 text-xs"]')[2]?.innerText.split("\n");
                        var opOdds = document.querySelectorAll('[class="flex gap-1"]')[1]?.innerText.split("\n");
                        bettingExchange.push({
                            name,
                            left_OddsMovement: {
                                odds,
                                oddsP
                            },
                            OpeningOdds: opOdds
                        })
                    } else {
                        var name = document.querySelectorAll('[class="w-[75px] bg-cover bg-no-repeat"]')[0]?.alt;
                        var odds = document.querySelectorAll('[class="flex flex-col gap-1 text-xs"]')[1]?.innerText.split("\n");
                        var oddsP = document.querySelectorAll('[class="flex flex-col gap-1 text-xs"]')[2]?.innerText.split("\n");
                        var opOdds = document.querySelectorAll('[class="flex gap-1"]')[1]?.innerText.split("\n");
                        bettingExchange.push({
                            name,
                            right_OddsMovement: {
                                odds,
                                oddsP
                            },
                            OpeningOdds: opOdds
                        })
                    }
                }
                return ({
                    average,
                    UserPredictions,
                    bettingExchange
                })
            })
            data['URL'] = page.url();
            // console.log(JSON.stringify(data));
            console.log(URL[i] + " =>[Success]");
            res.push(data);
        } catch {
            console.error(URL[i] + " =>[ERROR]");
        }
    }
    await browser.close();
    console.log("SaveData");
    var tmp = await JSON.stringify(res)
    fs.writeFileSync("res.json",tmp);
})