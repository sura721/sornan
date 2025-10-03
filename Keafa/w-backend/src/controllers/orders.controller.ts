import { Request, Response } from 'express';
import Individual from '../models/individual.model';
import Family from '../models/family.model';
import mongoose from 'mongoose';

// --- INDIVIDUAL CONTROLLERS ---

/**
 * @desc    Get all individual orders
 * @route   GET /api/orders/individuals
 * @access  Private
 */
export const getIndividuals = async (req: Request, res: Response) => {
  try {
    // const individuals = await Individual.find().sort({ deliveryDate: 1 }); // Sort by soonest delivery // reco

    const individuals = await Individual.find({ isFamilyMember: false }).sort({ deliveryDate: 1 });
    res.json(individuals);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get a single individual by ID
 * @route   GET /api/orders/individuals/:id
 * @access  Private
 */
export const getIndividualById = async (req: Request, res: Response) => {
  try {
    const individual = await Individual.findById(req.params.id);
    if (!individual) {
      return res.status(404).json({ message: 'Individual order not found.' });
    }
    res.json(individual);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

 
export const createIndividual = async (req: Request, res: Response) => {
 
  try {
    const { body, file } = req;

    const individualData = {
      firstName: body.firstName,
      lastName: body.lastName,
      sex: body.sex,
      age: body.age ? parseInt(body.age, 10) : undefined,
      deliveryDate: body.deliveryDate,

      
      notes: body.notes || undefined,
 
      phoneNumbers: {
        primary: body.phoneNumbers.primary,
        secondary: body.phoneNumbers.secondary || undefined,
      },
      socials: {
        telegram: body.socials.telegram || undefined,
        instagram: body.socials.instagram || undefined,
      },
      clothDetails: {
    colors: body.clothDetails.colors ? body.clothDetails.colors.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
    tilefImageUrl: file ? file.path : undefined,
    
     shirtLength: body.clothDetails.shirtLength || undefined,
    sholder: body.clothDetails.sholder || undefined,
    wegeb: body.clothDetails.wegeb || undefined,
    rist: body.clothDetails.rist || undefined,
    dressLength: body.clothDetails.dressLength || undefined,
    sliveLength: body.clothDetails.sliveLength || undefined,
    breast: body.clothDetails.breast || undefined,
    overBreast: body.clothDetails.overBreast || undefined,
    underBreast: body.clothDetails.underBreast || undefined,
    deret: body.clothDetails.deret || undefined,
    anget: body.clothDetails.anget || undefined,
     
    femaleSliveType: body.clothDetails.femaleSliveType || undefined,
    femaleWegebType: body.clothDetails.femaleWegebType || undefined,
    maleClothType: body.clothDetails.maleClothType || undefined,
    maleSliveType: body.clothDetails.maleSliveType || undefined,
    netela: body.clothDetails.netela || undefined,
},
      payment: {
        total: body.payment.total ? parseFloat(body.payment.total) : undefined,
        firstHalf: {
          paid: String(body.payment.firstHalf.paid) === 'true',
          amount: body.payment.firstHalf.amount ? parseFloat(body.payment.firstHalf.amount) : undefined,
        },
        secondHalf: {
          paid: String(body.payment.secondHalf.paid) === 'true',
          amount: body.payment.secondHalf.amount ? parseFloat(body.payment.secondHalf.amount) : undefined,
        },
      },
    };

    // DEBUGGER #2: Log the final object before it's saved
    console.log("--- Final Object for Database ---");
    console.log(individualData);
    console.log("---------------------------------");

    const newIndividual = new Individual(individualData);
    const savedIndividual = await newIndividual.save();
    res.status(201).json(savedIndividual);

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      console.error("Validation Error:", error.message);
      return res.status(400).json({ message: "Validation Error", errors: error.errors });
    }
    console.error("API call failed. Full error:", error);
    res.status(500).send('Server Error');
  }
};
 

export const updateIndividual = async (req: Request, res: Response) => {
  try {
    const {
      firstName, lastName, sex, age, deliveryDate,
      phoneNumbers, socials, clothDetails, payment
    } = req.body;

    const updateData: { [key: string]: any } = {};

    // --- 1. Handle Top-Level Fields ---
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (sex) updateData.sex = sex;
    if (age) updateData.age = age;
    if (deliveryDate) updateData.deliveryDate = deliveryDate;

    // --- 2. Handle Nested "phoneNumbers" Object ---
    if (phoneNumbers) {
      if (phoneNumbers.primary) updateData['phoneNumbers.primary'] = phoneNumbers.primary;
      if (phoneNumbers.secondary) updateData['phoneNumbers.secondary'] = phoneNumbers.secondary;
    }
    
    // --- 3. Handle Nested "socials" Object --- (This will fix your Telegram issue)
    if (socials) {
      if (socials.telegram) updateData['socials.telegram'] = socials.telegram;
      if (socials.instagram) updateData['socials.instagram'] = socials.instagram;
    }

    // --- 4. Handle Nested "clothDetails" Object ---
    if (clothDetails) {
      // Handle all string/number fields
      for (const key of Object.keys(clothDetails)) {
        if (key !== 'colors' && clothDetails[key]) {
          updateData[`clothDetails.${key}`] = clothDetails[key];
        }
      }
      // Handle the 'colors' array specifically
      if (clothDetails.colors && typeof clothDetails.colors === 'string') {
        updateData['clothDetails.colors'] = clothDetails.colors.split(',').map((s: string) => s.trim());
      }
    }
    
    // --- 5. Handle Nested "payment" Object ---
    if (payment) {
      if (payment.total) updateData['payment.total'] = payment.total;
      if (payment.firstHalf) {
        updateData['payment.firstHalf.paid'] = payment.firstHalf.paid === 'true';
        if (payment.firstHalf.amount) updateData['payment.firstHalf.amount'] = payment.firstHalf.amount;
      }
      if (payment.secondHalf) {
        updateData['payment.secondHalf.paid'] = payment.secondHalf.paid === 'true';
        if (payment.secondHalf.amount) updateData['payment.secondHalf.amount'] = payment.secondHalf.amount;
      }
    }

    // --- 6. Handle File Upload ---
    // This overrides any URL from the form if a new file is uploaded.
    if (req.file) {
      updateData['clothDetails.tilefImageUrl'] = req.file.path;
    }

    // For debugging: check the final flattened object
    console.log('Final Data for $set:', updateData);

    const individual = await Individual.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true, omitUndefined: true } // omitUndefined is a good practice
    );

    if (!individual) {
      return res.status(404).json({ message: 'Individual order not found.' });
    }
    res.json(individual);

  } catch (error) {
    console.error("Individual update failed:", error);
    res.status(500).send('Server Error');
  }
};
/**
 * @desc    Delete an individual order by ID
 * @route   DELETE /api/orders/individuals/:id
 * @access  Private
 */
export const deleteIndividual = async (req: Request, res: Response) => {
  try {
    const individual = await Individual.findById(req.params.id);
    if (!individual) {
      return res.status(404).json({ message: 'Individual order not found.' });
    }
    await individual.deleteOne();
    res.json({ message: 'Individual order removed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// --- FAMILY CONTROLLERS ---

/**
 * @desc    Get all family orders
 * @route   GET /api/orders/families
 * @access  Private
 */
export const getFamilies = async (req: Request, res: Response) => {
  try {
const families = await Family.find().populate('memberIds').sort({ deliveryDate: 1 });
    res.json(families);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Get a single family by ID, with member details populated
 * @route   GET /api/orders/families/:id
 * @access  Private
 */
export const getFamilyById = async (req: Request, res: Response) => {
  try {
    const family = await Family.findById(req.params.id).populate('memberIds');
    if (!family) {
      return res.status(404).json({ message: 'Family order not found.' });
    }
    res.json(family);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

 
export const createFamily = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

 
  console.log("--- Raw Request Body for createFamily ---");
  console.log(req.body);
  console.log("-----------------------------------------");

  try {
    const memberData = JSON.parse(req.body.memberIds);
    
    const familyData: any = {
      familyName: req.body.familyName,
      phoneNumbers: JSON.parse(req.body.phoneNumbers),
      socials: JSON.parse(req.body.socials),
      colors: JSON.parse(req.body.colors),
      deliveryDate: req.body.deliveryDate,
      
      notes: req.body.notes || undefined,
    };

    if (req.body.payment) {
      familyData.payment = JSON.parse(req.body.payment);
    }

    const membersToCreate = memberData.map((member: any) => ({
      ...member,
      isFamilyMember: true,
    }));

    const newMembers = await Individual.create(membersToCreate, { session, ordered: true });
    const newMemberIds = newMembers.map(member => member._id);

    const newFamilyData = {
      ...familyData,
      memberIds: newMemberIds,
      tilefImageUrl: req.file ? req.file.path : undefined,
    };

  
    console.log("--- Final Family Object for Database ---");
    console.log(newFamilyData);
    console.log("----------------------------------------");
    
    const newFamily = new Family(newFamilyData);

    const savedFamily = await newFamily.save({ session });
    await session.commitTransaction();

    const populatedFamily = await Family.findById(savedFamily._id).populate('memberIds');
    res.status(201).json(populatedFamily);
    
  } catch (error) {
    await session.abortTransaction();
    console.error("Family creation failed:", error);
    res.status(500).send('Server Error');
  } finally {
    session.endSession();
  }
};


export const updateFamily = async (req: Request, res: Response) => {
  try {
    const family = await Family.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true, runValidators: true }
    );
    if (!family) {
      return res.status(404).json({ message: 'Family order not found.' });
    }
    res.json(family);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

export const deleteFamily = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const family = await Family.findById(req.params.id).session(session);
    if (!family) {
      throw new Error('Family not found');
    }

    // Step 1: Delete all associated individual members
    await Individual.deleteMany({ _id: { $in: family.memberIds } }).session(session);

    // Step 2: Delete the family itself
    await family.deleteOne();
    
    await session.commitTransaction();
    res.json({ message: 'Family order and its members removed successfully.' });
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).send('Server Error');
  } finally {
    session.endSession();
  }
};

 
export const searchOrders = async (req: Request, res: Response) => {
  const { q: query, type } = req.query;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ message: 'Search query is required.' });
  }

  // Use a case-insensitive regular expression for searching
  const searchRegex = new RegExp(query, 'i');

  try {
    let individuals: any[] = [];
    let families: any[] = [];

    if (type === 'name') {
      individuals = await Individual.find({ firstName: searchRegex });
      families = await Family.find({ familyName: searchRegex });
    } else if (type === 'phone') {
      individuals = await Individual.find({
        $or: [
          { 'phoneNumbers.primary': searchRegex },
          { 'phoneNumbers.secondary': searchRegex },
        ],
      });
      families = await Family.find({
        $or: [
          { 'phoneNumbers.primary': searchRegex },
          { 'phoneNumbers.secondary': searchRegex },
        ],
      });
    } else {
      return res.status(400).json({ message: 'Invalid search type specified.' });
    }
    
    // Combine the results and add a 'type' field to each
    const combinedResults = [
      ...individuals.map(ind => ({ ...ind.toObject(), type: 'individual' })),
      ...families.map(fam => ({ ...fam.toObject(), type: 'family' }))
    ];

    res.json(combinedResults);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).send('Server Error');
  }
};





// Add this new function to your orders.controller.ts file

// The NEW and CORRECT function to paste
export const updateFamilyAndMembers = async (req: Request, res: Response) => {
    console.log('--- UPDATE REQUEST RECEIVED ---');
  console.log('File received by controller:', req.file);
  const { id } = req.params;

  // This is the main change: We now manually parse the data
  // because when a file is sent, everything else becomes a string.
  const memberIds = JSON.parse(req.body.memberIds);
  const familyData = {
    familyName: req.body.familyName,
    phoneNumbers: JSON.parse(req.body.phoneNumbers),
    socials: JSON.parse(req.body.socials),
    colors: JSON.parse(req.body.colors),
    payment: JSON.parse(req.body.payment),
    deliveryDate: req.body.deliveryDate,
    // We get the existing image URL from the form body
    tilefImageUrl: req.body.tilefImageUrl,
  };

  // This is the image logic: If a new file was uploaded,
  // we update the image URL with the new path from multer.
  if (req.file) {
    familyData.tilefImageUrl = req.file.path;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const originalFamily = await Family.findById(id).session(session);
    if (!originalFamily) {
      throw new Error('Family not found');
    }

    const memberUpdates = [];
    const newMemberIds = [];

    // This part of the logic is UNCHANGED
    for (const member of memberIds) {
      if (member._id && !member._id.startsWith('mock_mem_')) {
        const { _id, ...memberDetails } = member;
        memberUpdates.push({
          updateOne: {
            filter: { _id: _id },
            update: { $set: memberDetails },
          },
        });
        newMemberIds.push(_id);
      } else {
        const newMember = new Individual({ ...member, isFamilyMember: true });
        await newMember.save({ session });
        newMemberIds.push(newMember._id);
      }
    }

    if (memberUpdates.length > 0) {
      await Individual.bulkWrite(memberUpdates, { session });
    }

    const originalMemberIds = originalFamily.memberIds.map(id => id.toString());
    const currentMemberIds = newMemberIds.map(id => id.toString());
    const deletedMemberIds = originalMemberIds.filter(id => !currentMemberIds.includes(id));

    if (deletedMemberIds.length > 0) {
      await Individual.deleteMany({ _id: { $in: deletedMemberIds } }).session(session);
    }

    // This part is also UNCHANGED
    const updatedFamily = await Family.findByIdAndUpdate(
      id,
      { ...familyData, memberIds: newMemberIds },
      { new: true, session }
    ).populate('memberIds');

    await session.commitTransaction();
    res.json(updatedFamily);

  } catch (error) {
    await session.abortTransaction();
    console.error('Family update transaction failed:', error);
    res.status(500).send('Server Error');
  } finally {
    session.endSession();
  }
};