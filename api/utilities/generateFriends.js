module.exports = function createFriendsData(data, userID) {
    let users = [];

    for(let follow of data) {

        let user;
        if(follow.userRequesting._id != userID) {
            user = follow.userRequesting
            users.push(user)
        } else if(follow.userToFollow._id != userID) {
            user = follow.userToFollow
            users.push(user)
        }

    }


    return users;

}