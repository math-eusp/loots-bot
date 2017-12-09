const _ = require('lodash');
const request = require('request');
const config = require("./config.json");
const fs = require('fs');
const url = `https://loots.com/pub/tip-jars/${config.lootsUser}/status/live`;
setInterval (() => {
    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            const obj = JSON.parse(response.body);
            const tipjar = `https://loots.com/api/v1/aggregates/leaderboards/${obj.data.tipjar.account._id}?json=%7B%7D`
            request(tipjar, function (error, response, html) {
                if (!error && response.statusCode == 200) {
                    const obj = JSON.parse(response.body);
                    const topLoot = _.head(obj.data.monthly);
                    const stream = fs.createWriteStream("topLoot.txt");
                    stream.once('open', function(fd) {
                      stream.write(topLoot.handle_lc + ' - ' + topLoot.total + " Loots");
                      stream.end();
                    });
                    console.log('routine executed')
                }else{
                    console.log(error)
                }
            })
        }else{
            console.log(error)
        }
    })
}, 10000);