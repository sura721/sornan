import mongoose, { Schema, Document, Types } from 'mongoose';

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
 const PhoneNumbersSchema = new Schema({
  primary: { type: String, required: true },
  secondary: { type: String, required: false },
}, { _id: false });

 const SocialsSchema = new Schema({
  telegram: { type: String, required: false },
}, { _id: false });

 
export interface IFamily extends Document {
  familyName: string;
  memberIds: Types.ObjectId[]; 
  paymentMethod: 'family' | 'member';
  phoneNumbers: {
    primary: string;
    secondary?: string;
  };
  socials?: {
    telegram?: string;
  };
  tilefImageUrl?: string;
  colors: string[];
    payment?: {
    total?: number;
    firstHalf: { paid: boolean; amount?: number };
    secondHalf: { paid: boolean; amount?: number };
  };
  deliveryDate: string;
   notes?: string;
}

 const FamilySchema: Schema = new Schema(
  {
    familyName: {
      type: String,
      required: [true, 'Family name is required.'],
      trim: true,
    },
    
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

    paymentMethod: { 
      type: String,
      required: true,
      enum: ['family', 'member'],
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
      required: false, 
    },
    deliveryDate: {
      type: String,
      required: [true, 'Delivery date is required.'],
    },
    notes: {
      type: String,
      required: false,
    },
  },
  {
     timestamps: true,
  }
);
 
const Family = mongoose.model<IFamily>('Family', FamilySchema);

export default Family;