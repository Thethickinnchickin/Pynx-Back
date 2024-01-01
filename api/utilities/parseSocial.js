module.exports = function parseSocial(data, userID) {

    let followers = [];
    let following = [];
    for(follow of data) {
        if(follow.userRequesting._id == userID) {
            following.push(follow.userToFollow)
        } 

        if(follow.userToFollow._id == userID) {
            followers.push(follow.userRequesting)
        }
    }

    return {
        followers,
        following
    }
}