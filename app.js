const _ = require('lodash');
const request = require('request');
const config = require("./config.json");
const fs = require('fs');
const url = `https://loots.com/pub/tip-jars/${config.lootsUser}/status/live`;
setInterval (() => {
    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            const obj = JSON.parse(response.body);
            if(obj.data){
                const tipjar = `https://loots.com/api/v1/aggregates/leaderboards/${obj.data.tipjar.account._id}?json=%7B%7D`
                request(tipjar, function (error, response, html) {
                    if (!error && response.statusCode == 200) {
                        const obj = JSON.parse(response.body);
                        if(obj.data){
                            if(obj.data[config.type]){
                                const topLoot = _.head(obj.data[config.type]);
                                const stream = fs.createWriteStream("topLoot.txt");
                                stream.once('open', function(fd) {
                                stream.write(topLoot.handle_lc + ' - ' + topLoot.total + " Loots");
                                stream.end();
                                });
                                console.log('routine executed')
                            }else{
                                console.log('type not found');
                            }
                        }
                    }else{
                        console.log(error)
                    }
                })
            }else{
                console.log('user not found');
            }
        }else{
            console.log(error)
        }
    })
}, config.updateTime);