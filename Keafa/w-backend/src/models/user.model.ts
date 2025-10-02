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
     timestamps: true,
  }
);
 
const User = mongoose.model<IUser>('User', UserSchema);

export default User;