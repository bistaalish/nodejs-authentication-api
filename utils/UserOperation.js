// This is a collection of user operation, CRUD for User operation
// Importing User Models
const User = require("../models/user");

exports.getUser = async (username)=> {
    const user = await User.findOne({username});
    if(!user){
        return {"error": "user not found"}
    }
    return user;
};

exports.putUser = async (newUser) => {
    // Check if the user already exists
    const existingUser = await getUser(newUser.username);
  
    if (existingUser && !existingUser.error) {
      return { error: "user already exists" };
    }
  
    // Create a new user
    const user = new User(newUser);
    await user.save();
  
    return { message: "User added successfully" };
  };