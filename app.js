const _ = require('lodash');
const request = require('request');
const config = require("./config.json");
const fs = require('fs');
const url = `https://loots.com/pub/tip-jars/${config.lootsUser}/status/live`;

rmDir = function(dirPath) {
    try { var files = fs.readdirSync(dirPath); }
    catch(e) { return; }
    if (files.length > 0)
      for (var i = 0; i < files.length; i++) {
        var filePath = dirPath + '/' + files[i];
        if (fs.statSync(filePath).isFile())
          fs.unlinkSync(filePath);
        else
          rmDir(filePath);
      }
  };
createFiles = () => {
    try { var files = fs.readdirSync('leaderboard'); }
    catch(e) { fs.mkdirSync('leaderboard'); }

    request(url, function (error, response, html) {
        if (!error && response.statusCode == 200) {
            const obj = JSON.parse(response.body);
            if(obj.data){
                const tipjar = `https://loots.com/api/v1/aggregates/leaderboards/${obj.data.tipjar.account._id}?json=%7B%7D`
                request(tipjar, function (error, response, html) {
                    rmDir('leaderboard');
                    if (!error && response.statusCode == 200) {
                        const obj = JSON.parse(response.body);
                        if(obj.data){
                            if(obj.data[config.type]){
                                const topLoots = obj.data[config.type];
                                let leaderboard = config.top;
                                if(topLoots.length < config.top){
                                    leaderboard = topLoots.length;
                                }
                                for(let i = 0; i < leaderboard; i++){
                                    const stream = fs.createWriteStream(`./leaderboard/${i+1}.txt`);
                                    const topLoot = topLoots[i];
                                    stream.once('open', function(fd) {
                                        var strWrite = topLoot.handle_lc;
                                        if(config.showLoots) strWrite += ' - ' + topLoot.total + " Loots";
                                        stream.write(strWrite);
                                        stream.end();
                                    });
                                }
                                console.log('routine executed')
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
}

createFiles();
setInterval (() => {
    createFiles()
}, config.updateTime);