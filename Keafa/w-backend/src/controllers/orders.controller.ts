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
    // The body is already nested, so we access its properties directly.
    const { body, file } = req;

    // We still build a new object to handle type conversions and empty strings.
    const individualData = {
      firstName: body.firstName,
      lastName: body.lastName,
      sex: body.sex,
      age: body.age ? parseInt(body.age, 10) : undefined,
      deliveryDate: body.deliveryDate,

      phoneNumbers: {
        // Accessing the nested property correctly
        primary: body.phoneNumbers.primary,
        secondary: body.phoneNumbers.secondary || undefined,
      },

      socials: {
        telegram: body.socials.telegram || undefined,
        instagram: body.socials.instagram || undefined,
      },

      clothDetails: {
        // Handle colors string -> array
        colors: body.clothDetails.colors ? body.clothDetails.colors.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        tilefImageUrl: file ? file.path : undefined,

        // Convert all numeric measurements from strings to numbers
        shirtLength: body.clothDetails.shirtLength ? parseFloat(body.clothDetails.shirtLength) : undefined,
        sholder: body.clothDetails.sholder ? parseFloat(body.clothDetails.sholder) : undefined,
        wegeb: body.clothDetails.wegeb ? parseFloat(body.clothDetails.wegeb) : undefined,
        rist: body.clothDetails.rist ? parseFloat(body.clothDetails.rist) : undefined,
        dressLength: body.clothDetails.dressLength ? parseFloat(body.clothDetails.dressLength) : undefined,
        sliveLength: body.clothDetails.sliveLength ? parseFloat(body.clothDetails.sliveLength) : undefined,
        breast: body.clothDetails.breast ? parseFloat(body.clothDetails.breast) : undefined,
        overBreast: body.clothDetails.overBreast ? parseFloat(body.clothDetails.overBreast) : undefined,
        underBreast: body.clothDetails.underBreast ? parseFloat(body.clothDetails.underBreast) : undefined,
        deret: body.clothDetails.deret ? parseFloat(body.clothDetails.deret) : undefined,
        anget: body.clothDetails.anget ? parseFloat(body.clothDetails.anget) : undefined,

        // Handle optional string fields to avoid saving empty strings
        femaleSliveType: body.clothDetails.femaleSliveType || undefined,
        femaleWegebType: body.clothDetails.femaleWegebType || undefined,
        maleClothType: body.clothDetails.maleClothType || undefined,
        maleSliveType: body.clothDetails.maleSliveType || undefined,
        // This still prevents the enum error if nothing is selected
        netela: body.clothDetails.netela || undefined,
      },

      payment: {
        total: body.payment.total ? parseFloat(body.payment.total) : undefined,
        firstHalf: {
          // Handle boolean conversion from string 'true'/'false'
          paid: String(body.payment.firstHalf.paid) === 'true',
          amount: body.payment.firstHalf.amount ? parseFloat(body.payment.firstHalf.amount) : undefined,
        },
        secondHalf: {
          paid: String(body.payment.secondHalf.paid) === 'true',
          amount: body.payment.secondHalf.amount ? parseFloat(body.payment.secondHalf.amount) : undefined,
        },
      },
    };

    const newIndividual = new Individual(individualData);
    const savedIndividual = await newIndividual.save();
    res.status(201).json(savedIndividual);

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      // This will now give you much clearer errors if something is wrong
      console.error("Validation Error:", error.message);
      return res.status(400).json({ message: "Validation Error", errors: error.errors });
    }
    console.error("API call failed. Full error:", error);
    res.status(500).send('Server Error');
  }
};
export const updateIndividual = async (req: Request, res: Response) => {
 
  try {
 
    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      sex: req.body.sex,
      age: req.body.age,
      deliveryDate: req.body.deliveryDate,
      'phoneNumbers.primary': req.body['phoneNumbers[primary]'],
      'phoneNumbers.secondary': req.body['phoneNumbers[secondary]'],
      'socials.telegram': req.body['socials[telegram]'],
      'socials.instagram': req.body['socials[instagram]'],
      'clothDetails.colors': req.body['clothDetails[colors]'] ? req.body['clothDetails[colors]'].split(',') : [],
      'clothDetails.shirtLength': req.body['clothDetails[shirtLength]'],
      'clothDetails.sholder': req.body['clothDetails[sholder]'],
      'clothDetails.wegeb': req.body['clothDetails[wegeb]'],
      'clothDetails.rist': req.body['clothDetails[rist]'],
      'clothDetails.dressLength': req.body['clothDetails[dressLength]'],
      'clothDetails.sliveLength': req.body['clothDetails[sliveLength]'],
      'clothDetails.breast': req.body['clothDetails[breast]'],
      'clothDetails.overBreast': req.body['clothDetails[overBreast]'],
      'clothDetails.underBreast': req.body['clothDetails[underBreast]'],
      'clothDetails.femaleSliveType': req.body['clothDetails[femaleSliveType]'],
      'clothDetails.femaleWegebType': req.body['clothDetails[femaleWegebType]'],
      'clothDetails.deret': req.body['clothDetails[deret]'],
      'clothDetails.anget': req.body['clothDetails[anget]'],
      'clothDetails.maleClothType': req.body['clothDetails[maleClothType]'],
      'clothDetails.maleSliveType': req.body['clothDetails[maleSliveType]'],
      'clothDetails.netela': req.body['clothDetails[netela]'],
      'clothDetails.tilefImageUrl': req.body['clothDetails[tilefImageUrl]'],
      'payment.total': req.body['payment[total]'],
      'payment.firstHalf.paid': req.body['payment[firstHalf][paid]'] === 'true',
      'payment.firstHalf.amount': req.body['payment[firstHalf][amount]'],
      'payment.secondHalf.paid': req.body['payment[secondHalf][paid]'] === 'true',
      'payment.secondHalf.amount': req.body['payment[secondHalf][amount]'],
    };

    // THE IMAGE FIX: If a new file was uploaded, its path overwrites the old one.
    if (req.file) {
      updateData['clothDetails.tilefImageUrl'] = req.file.path;
    }

    const individual = await Individual.findByIdAndUpdate(
      req.params.id,
      { $set: updateData }, // Use $set to update nested fields correctly
      { new: true, runValidators: true }
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

/**
 * @desc    Create a new family order
 * @route   POST /api/orders/families
 * @access  Private
 */
// export const createFamily = async (req: Request, res: Response) => {
//   const { memberIds: memberData, ...familyData } = req.body;

//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     // Step 1: Create the individual documents for each member
//     // const newMembers = await Individual.create(memberData, { session }); //before 

// const newMembers = await Individual.create(memberData, { session, ordered: true }); // after

//     const newMemberIds = newMembers.map(member => member._id);

//     // Step 2: Create the family document, linking it to the new members
//     const newFamily = new Family({
//       ...familyData,
//       memberIds: newMemberIds, // Use the newly created member IDs
//       clothDetails: {
//         ...familyData.clothDetails,
//         tilefImageUrl: req.file ? req.file.path : undefined,
//       },
//     });

//     const savedFamily = await newFamily.save({ session });

//     // If all operations were successful, commit the transaction
//     await session.commitTransaction();

//     // Populate the member details before sending the response
//     const populatedFamily = await Family.findById(savedFamily._id).populate('memberIds');
    
//     res.status(201).json(populatedFamily);
//   } catch (error) {
//     // If any operation fails, abort the transaction
//     await session.abortTransaction();
//     console.error(error);
//     res.status(500).send('Server Error');
//   } finally {
//     // End the session
//     session.endSession();
//   }
// };




  
/**
 * Your comment would go here
 */ // <--- FIX: Closed the block comment
/**
 * @desc    Create a new family order
 * @route   POST /api/orders/families
 * @access  Private
 */
// In order.controller.js

export const createFamily = async (req: Request, res: Response) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // --- FIX START: Manually parse stringified fields from FormData ---
    const memberData = JSON.parse(req.body.memberIds);
    const familyData = {
      familyName: req.body.familyName,
      phoneNumbers: JSON.parse(req.body.phoneNumbers),
      socials: JSON.parse(req.body.socials),
      colors: JSON.parse(req.body.colors),
      payment: JSON.parse(req.body.payment),
      deliveryDate: req.body.deliveryDate,
    };
    // --- FIX END ---

    const membersToCreate = memberData.map((member: any) => ({
      ...member,
      isFamilyMember: true,
    }));

    const newMembers = await Individual.create(membersToCreate, { session, ordered: true });
    const newMemberIds = newMembers.map(member => member._id);

    const newFamily = new Family({
      ...familyData,
      memberIds: newMemberIds,
      // --- FIX: Get the Cloudinary URL from req.file.path and place it at the root level ---
      tilefImageUrl: req.file ? req.file.path : undefined,
    });

    const savedFamily = await newFamily.save({ session });
    await session.commitTransaction();

    const populatedFamily = await Family.findById(savedFamily._id).populate('memberIds');
    res.status(201).json(populatedFamily);
  } catch (error) {
    await session.abortTransaction();
    console.error(error);
    res.status(500).send('Server Error');
  } finally {
    session.endSession();
  }
};









/**
 * @desc    Update a family order by ID
 * @route   PUT /api/orders/families/:id
 * @access  Private
 */
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

/**
 * @desc    Delete a family order and its members by ID
 * @route   DELETE /api/orders/families/:id
 * @access  Private
 */
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



/**
 * @desc    Search for orders by name or phone number
 * @route   GET /api/orders/search
 * @access  Private
 */
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