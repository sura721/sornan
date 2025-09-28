import mongoose, { Schema, Document } from 'mongoose';

// Define the structures for nested objects (sub-documents) first.
// Using `_id: false` is a best practice for sub-documents that don't need their own unique ID.

const PhoneNumbersSchema = new Schema({
  primary: { type: String, required: true },
  secondary: { type: String, required: false },
}, { _id: false });

const SocialsSchema = new Schema({
  telegram: { type: String, required: false },
  instagram: { type: String, required: false },
}, { _id: false });

const ClothDetailsSchema = new Schema({
  colors: { type: [String], required: true },
  tilefImageUrl: { type: String, required: false },
  // Common measurements
  shirtLength: { type: Number, required: false },
  sholder: { type: Number, required: false },
  wegeb: { type: Number, required: false },
  rist: { type: Number, required: false },
  // Female-specific measurements
  dressLength: { type: Number, required: false },
  sliveLength: { type: Number, required: false },
  breast: { type: Number, required: false },
  overBreast: { type: Number, required: false },
  underBreast: { type: Number, required: false },
  femaleSliveType: { type: String, required: false },
  femaleWegebType: { type: String, required: false },
  // Male-specific measurements
  deret: { type: Number, required: false },
  anget: { type: Number, required: false },
  maleClothType: { type: String, required: false },
  maleSliveType: { type: String, required: false },
  netela: { type: String, enum: ['Yes', 'No'], required: false },
}, { _id: false });

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
}, { _id: false });

// Define the TypeScript interface for an Individual document for type safety.
export interface IIndividual extends Document {
  isFamilyMember?: boolean;
  firstName: string;
  lastName: string;
  sex: 'Male' | 'Female';
  age?: number;
  phoneNumbers?: { primary: string; secondary?: string };
  socials?: { telegram?: string; instagram?: string };
  clothDetails: {
    colors: string[];
    tilefImageUrl?: string;
    shirtLength?: number;
    sholder?: number;
    wegeb?: number;
    rist?: number;
    dressLength?: number;
    sliveLength?: number;
    breast?: number;
    overBreast?: number;
    underBreast?: number;
    femaleSliveType?: string;
    femaleWegebType?: string;
    deret?: number;
    anget?: number;
    maleClothType?: string;
    maleSliveType?: string;
    netela?: 'Yes' | 'No';
  };
  payment?: {
    total?: number;
    firstHalf: { paid: boolean; amount?: number };
    secondHalf: { paid: boolean; amount?: number };
  };
  deliveryDate?: string;
}

// Define the main Mongoose schema for the Individual model.
const IndividualSchema: Schema = new Schema(
  {
    isFamilyMember: {
      type: Boolean,
      default: false,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required.'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required.'],
      trim: true,
    },
    sex: {
      type: String,
      required: [true, 'Sex is required.'],
      enum: ['Male', 'Female'],
    },
    age: {
      type: Number,
      required: false,
    },
    phoneNumbers: {
      type: PhoneNumbersSchema,
      required: false,
    },
    socials: {
      type: SocialsSchema,
      required: false,
    },
    clothDetails: {
      type: ClothDetailsSchema,
      required: true,
    },
    payment: {
      type: PaymentSchema,
      required: false,
    },
    deliveryDate: {
      type: String,
      required: false,
    },
  },
  {
    // Automatically add createdAt and updatedAt timestamps.
    timestamps: true,
  }
);

// Create and export the Mongoose model.
const Individual = mongoose.model<IIndividual>('Individual', IndividualSchema);

export default Individual;