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

/**
 * @desc    Create a new individual order
 * @route   POST /api/orders/individuals
 * @access  Private
 */
export const createIndividual = async (req: Request, res: Response) => {
  try {
    // The request body is parsed by `multer` for form fields and files
    const newIndividual = new Individual({
      ...req.body,
      // If a file was uploaded, `req.file.path` will be available
      // It stores the path to the uploaded image (e.g., 'uploads/image-123.jpg')
      clothDetails: {
        ...req.body.clothDetails,
        tilefImageUrl: req.file ? req.file.path : undefined,
      },
    });

    const savedIndividual = await newIndividual.save();
    res.status(201).json(savedIndividual);
  } catch (error) {
    console.error("API call failed. Full error:", error);
    res.status(500).send('Server Error');
  }
};

/**
 * @desc    Update an individual order by ID
 * @route   PUT /api/orders/individuals/:id
 * @access  Private
 */
export const updateIndividual = async (req: Request, res: Response) => {
  try {
    const individual = await Individual.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true } // `new: true` returns the updated document
    );

    if (!individual) {
      return res.status(404).json({ message: 'Individual order not found.' });
    }
    res.json(individual);
  } catch (error) {
    console.error(error);
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
 * @desc    Create a new family order
 * @route   POST /api/orders/families
 * @access  Private
 */
export const createFamily = async (req: Request, res: Response) => {
  const { memberIds: memberData, ...familyData } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // FIX 1: Add type to 'member' and set the 'isFamilyMember' flag to true for each one.
    const membersToCreate = memberData.map((member: any) => ({
      ...member,
      isFamilyMember: true,
    }));

    // Step 1: Create the individual documents for each member using the updated data.
    // FIX 2: Use the new 'membersToCreate' array.
    const newMembers = await Individual.create(membersToCreate, { session, ordered: true });
    const newMemberIds = newMembers.map(member => member._id);

    // Step 2: Create the family document, linking it to the new members
    const newFamily = new Family({
      ...familyData,
      memberIds: newMemberIds, // Use the newly created member IDs
      clothDetails: {
        ...(familyData as any).clothDetails, // Using 'as any' to avoid potential type errors if clothDetails is not expected on familyData
        tilefImageUrl: req.file ? req.file.path : undefined,
      },
    });

    const savedFamily = await newFamily.save({ session });

    // If all operations were successful, commit the transaction
    await session.commitTransaction();

    // Populate the member details before sending the response
    const populatedFamily = await Family.findById(savedFamily._id).populate('memberIds');
    
    res.status(201).json(populatedFamily);
  } catch (error) {
    // If any operation fails, abort the transaction
    await session.abortTransaction();
    console.error(error);
    res.status(500).send('Server Error');
  } finally {
    // End the session
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

export const updateFamilyAndMembers = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { memberIds, ...familyData } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const originalFamily = await Family.findById(id).session(session);
    if (!originalFamily) {
      throw new Error('Family not found');
    }

    const memberUpdates = [];
    const newMemberIds = [];

    // Process all incoming members
    for (const member of memberIds) {
      if (member._id && !member._id.startsWith('mock_mem_')) {
        // This is an existing member, prepare an update operation
        const { _id, ...memberDetails } = member;
        memberUpdates.push({
          updateOne: {
            filter: { _id: _id },
            update: { $set: memberDetails },
          },
        });
        newMemberIds.push(_id); // Keep existing ID
      } else {
        // This is a new member, prepare an insert operation
        const newMember = new Individual({ ...member, isFamilyMember: true });
        await newMember.save({ session });
        newMemberIds.push(newMember._id); // Add the new, real ID
      }
    }

    // Perform all member updates/creations
    if (memberUpdates.length > 0) {
      await Individual.bulkWrite(memberUpdates, { session });
    }

    // Determine which members were deleted
    const originalMemberIds = originalFamily.memberIds.map(id => id.toString());
    const currentMemberIds = newMemberIds.map(id => id.toString());
    const deletedMemberIds = originalMemberIds.filter(id => !currentMemberIds.includes(id));

    // Delete the removed members
    if (deletedMemberIds.length > 0) {
      await Individual.deleteMany({ _id: { $in: deletedMemberIds } }).session(session);
    }

    // Finally, update the main Family document
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