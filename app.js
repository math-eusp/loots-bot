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
                                var strWrite = topLoot.handle_lc;
                                stream.once('open', function(fd) {
                                    if(config.showLoots) strWrite += ' - ' + topLoot.total + " Loots";
                                    stream.write(strWrite);
                                    stream.end();
                                    console.log('routine executed: ' + strWrite)
                                });
                            }else{
                                console.log('type not found: ' + config.type);
                            }
                        }
                    }else{
                        console.log(error)
                    }
                })
            }else{
                console.log('user not found: ' + config.lootsUser);
            }
        }else{
            console.log(error)
        }
    })
}, config.updateTime);