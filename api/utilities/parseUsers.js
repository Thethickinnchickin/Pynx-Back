const user = require("../models/user");
const { array } = require("./uploadPhoto");

module.exports = function parseUsers(mainUser) {
    let removeableUsers = [];
    for(let user of users) {

    for(let followId of mainUser.followers) {

                if (user.followers.includes(followId)) {
                    if(!removeableUsers.includes(user)) {

                        removeableUsers.push(user)
                    }
                }
                    
                

                if(user.following.includes(followId)) {
                    if(!removeableUsers.includes(user)) {

                        removeableUsers.push(user)
                    }
                } 
                        
    
    
        }
        for(let followId of mainUser.following) {

            if (user.followers.includes(followId)) {
                if(!removeableUsers.includes(user)) {

                    removeableUsers.push(user)
                }
            }
                
            

            if(user.following.includes(followId)) {
                if(!removeableUsers.includes(user)) {

                    removeableUsers.push(user)
                }
            } 
                    


    }

    



      
    for(i=0; i < removeableUsers.length; i++) {
        if(users.indexOf(removeableUsers[i]) !== -1) {
            users.splice(users.indexOf(removeableUsers[i]), 1);
        }
    }

    


    return removeableUsers;
}