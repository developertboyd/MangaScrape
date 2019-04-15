var fs = require('fs');
var colors = require('colors');
var rp = require('request-promise');
var cheerio = require('cheerio');
var _cliProgress = require('cli-progress');

var base_url = 'https://mangakakalot.com/chapter/' + process.argv[2] + '/chapter_';
var chapterStart = parseInt(process.argv[3]) || 1;
var maxChapter = parseInt(process.argv[4]) || 1;
var saveLocation = './';
var chapterCountDown = maxChapter + 1;
var chapterRequests = [];

const bar1 = new _cliProgress.Bar({}, {format: colors.cyan(' {bar}') + ' {percentage}%'});
const bar2 = new _cliProgress.Bar({}, {format: colors.magenta(' {bar}') + ' {percentage}%'});

console.log("Fetching Chapter Pages".cyan);
bar1.start(100, 0);
var chaptersToComplete = chapterStart + 4;
if (chaptersToComplete > maxChapter) {
    chaptersToComplete = maxChapter;
}

for (var x = (chapterStart - 1); x < chaptersToComplete; x++) {
    var chapterOptions = {
        method: 'GET',
        uri: base_url + (x + 1)
    };
    chapterRequests.push(rp(chapterOptions));
}

var count = 0;
return chapterRequests.reduce((promiseChain, currentTask) => {
    count++;
    return promiseChain.then(chainResults =>
        currentTask.then(currentResult => {
            bar1.update(Math.floor((count / maxChapter) * 100));
            return [...chainResults, currentResult];
        }).catch(function (err) {
            console.log(err);
        })
    ).catch(function (err) {
        console.log(err);
    })
}, Promise.resolve([])).then(arrayOfResults => {

    bar1.stop();
    console.log("Chapter Pages Loaded".cyan);
    console.log("Downloading Images".magenta);
    bar2.start(100, 0);

    var chapterChain = [];
    arrayOfResults.forEach(function (html) {
        chapterChain.push(downloadPages(html));
    });
    return chapterChain.reduce((promiseChain, currentTask) => {
        return promiseChain.then(chainResults =>
            currentTask.then(currentResult =>
                [...chainResults, currentResult]
            )
        )
    }, Promise.resolve([])).then(arrayOfResults => {
        bar2.stop();
        console.log("Download Complete".magenta);
        console.log("Chapters ".green + chapterStart + " - ".green + chaptersToComplete + " downloaded.".green);
        console.log("Run again starting at ".green + (chaptersToComplete + 1) + " to continue.".green);
    });
});

function downloadPages(html) {
    chapterCountDown--;
    var currentChapter = Math.abs(chapterCountDown - maxChapter) + 1;
    return new Promise(function (resolve, reject) {
        var $ = cheerio.load(html);
        fs.promises.mkdir(saveLocation + 'ch' + currentChapter, {recursive: true}).then(function () {
            var imageRequests = [];
            var imageCount = 0;
            $(".vung-doc").children('img').each(function (i, image) {
                imageCount++;
                var img_url = image.attribs.src;
                var imageOptions = {
                    method: 'GET',
                    uri: img_url,
                    encoding: null
                };
                imageRequests.push(rp(imageOptions));
            });
            var count = 0;
            return imageRequests.reduce((promiseChain, currentTask) => {
                return promiseChain.then(chainResults =>
                    currentTask.then(currentResult => {
                        count++;
                        var img_name = "./ch" + currentChapter + "/page_" + count + ".jpg";
                        var buffer = Buffer.from(currentResult, 'utf8');
                        fs.writeFileSync(img_name, buffer);

                        bar2.update(Math.floor(Math.floor(((count / imageCount) * 100)) / chapterCountDown));
                        return [...chainResults, currentResult]
                    })
                );
            }, Promise.resolve([])).then(arrayOfResults => {
                resolve();
            });
        }).catch(function (error) {
            reject(error);
        });
    })
}