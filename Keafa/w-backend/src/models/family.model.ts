import mongoose, { Schema, Document, Types } from 'mongoose';

// Define the structure of the Payment object
const PaymentSchema = new Schema({
  total: { type: Number, required: false },
  firstHalf: {
    paid: { type: Boolean, default: false },
    amount: { type: Number, required: false },
  },
  secondHalf: {
    paid: { type: Boolean, default: false },
    amount: { type: Number, required: false },
  },
}, { _id: false }); // _id: false prevents Mongoose from creating an _id for this sub-document

// Define the structure of the PhoneNumbers object
const PhoneNumbersSchema = new Schema({
  primary: { type: String, required: true },
  secondary: { type: String, required: false },
}, { _id: false });

// Define the structure of the Socials object
const SocialsSchema = new Schema({
  telegram: { type: String, required: false },
}, { _id: false });


// Define the TypeScript interface for a Family document
// This provides type-checking and autocompletion in our code.
export interface IFamily extends Document {
  familyName: string;
  memberIds: Types.ObjectId[]; // This will be an array of references to Individual documents
  phoneNumbers: {
    primary: string;
    secondary?: string;
  };
  socials?: {
    telegram?: string;
  };
  tilefImageUrl?: string;
  colors: string[];
  payment: {
    total?: number;
    firstHalf: { paid: boolean; amount?: number };
    secondHalf: { paid: boolean; amount?: number };
  };
  deliveryDate: string;
}

// Define the Mongoose schema for the Family model
const FamilySchema: Schema = new Schema(
  {
    familyName: {
      type: String,
      required: [true, 'Family name is required.'],
      trim: true,
    },
    // The `memberIds` array will store ObjectIds that link to documents in the 'Individual' collection.
    // The `ref` property is crucial for Mongoose's `populate()` method to work.
    memberIds: [{
      type: Schema.Types.ObjectId,
      ref: 'Individual',
      required: true,
    }],
    phoneNumbers: {
      type: PhoneNumbersSchema,
      required: true,
    },
    socials: {
      type: SocialsSchema,
      required: false,
    },
    tilefImageUrl: {
      type: String,
      required: false,
    },
    colors: {
      type: [String],
      required: false,
      default: [],
    },
    payment: {
      type: PaymentSchema,
      required: true,
    },
    deliveryDate: {
      type: String,
      required: [true, 'Delivery date is required.'],
    },
  },
  {
    // Enable timestamps to automatically add `createdAt` and `updatedAt` fields
    timestamps: true,
  }
);

// Create and export the Mongoose model.
// This model provides the interface for querying the 'families' collection in MongoDB.
const Family = mongoose.model<IFamily>('Family', FamilySchema);

export default Family;