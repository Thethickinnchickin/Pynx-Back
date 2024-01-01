module.exports = function parseResult(data) {
    
    data = JSON.parse(data);
    
    

    let games = [];
    for (let i=0; i < data.length; i++) {
        //Will be revisted for time zones

        let today = new Date();

        let date = new Date(data[i].commence_time);
        //making sure game has not started
        if(today.getTime() < date.getTime()) {
            
            let game = {};
            let gameDate = new Date(new Date(
                data[i]["commence_time"]).toLocaleString("en-US", {timeZone: "America/New_York"}))
            let gameHour = gameDate.getHours();
            let gameMinutes = gameDate.getMinutes();
            let gameMonth = gameDate.getMonth() + 1;
            let gameDay = gameDate.getDate();
            let amPm;
            game.id = data[i].id
            
            if (gameMinutes < 10) {
                gameMinutes = `0${gameMinutes}`
            }
            if(gameHour > 12) {
                gameHour -= 12
                amPm = 'pm'
            } else {
                amPm = 'am'
            }
            

            game.startTime = `${gameHour} : ${gameMinutes} ${amPm} est ${gameMonth}/${gameDay}`;
            game.startTimeUTC = data[i]["commence_time"];
            game.teams = {
                away: data[i]["away_team"],
                home: data[i]["home_team"]
            }
            game.betting = {}
            for (let j = 0; j < data[i]["bookmakers"].length; j++)
            {
                for (let x = 0; x < data[i]["bookmakers"][j]["markets"].length; x ++)
                {
                    if(!game.betting[`${data[i]["bookmakers"][j].title}`]) {
                        game.betting[`${data[i]["bookmakers"][j].title}`] = {}
                    }
                    
                    if(data[i]["bookmakers"][j]["markets"][x]['key'] == 'h2h'){
                        game.betting[`${data[i]["bookmakers"][j].title}`].h2h = {data : data[i]["bookmakers"][j]["markets"][x]['outcomes']}
                    } else if (data[i]["bookmakers"][j]["markets"][x]['key'] == 'spreads') {
                        game.betting[`${data[i]["bookmakers"][j].title}`].spreads = {data: data[i]["bookmakers"][j]["markets"][x]['outcomes']}
                    }
                }       
            }
            

            games.push(game);
            }

  
        


        
    }
    return games;
}



