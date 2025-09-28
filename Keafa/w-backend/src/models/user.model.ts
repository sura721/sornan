import mongoose, { Schema, Document } from 'mongoose';
 
export interface IUser extends Document {
  username: string;
  password?: string;  
}

 
const UserSchema: Schema = new Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required.'],
      unique: true,  
      trim: true,    
    },
    password: {
      type: String,
      required: [true, 'Password is required.'],
      minlength: [6, 'Password must be at least 6 characters long.'],
    },
  },
  {
    // Automatically add `createdAt` and `updatedAt` fields to each document.
    timestamps: true,
  }
);

// 3. Create and export the Mongoose model.
//    This `User` object is what we will use to interact with the database
//    (e.g., User.findOne(), new User().save()).
const User = mongoose.model<IUser>('User', UserSchema);

export default User;