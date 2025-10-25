import { Request, Response } from 'express';
import Individual from '../models/individual.model';
import Family from '../models/family.model';
import mongoose from 'mongoose';
import fs from 'fs/promises'; // Import the file system module
import path from 'path';    


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
    // MODIFICATION 1: Changed `file` to `files`
    const { body, files } = req as { body: any; files: Express.Multer.File[] };

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
        
        // MODIFICATION 2: Changed `tilefImageUrl` logic to handle the array
        tilefImageUrls: files && files.length > 0 ? files.map(f => f.path) : [],

        shirtLength: body.clothDetails.shirtLength || undefined,
        sholder: body.clothDetails.sholder || undefined,
        wegeb: body.clothDetails.wegeb || undefined,
        rist: body.clothDetails.rist || undefined,
        sleeve: body.clothDetails.sleeve || undefined,
        dressLength: body.clothDetails.dressLength || undefined,
        sliveLength: body.clothDetails.sliveLength || undefined,
        breast: body.clothDetails.breast || undefined,
         pantWaist: body.clothDetails.pantWaist || undefined,
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

    const newIndividual = new Individual(individualData);
    const savedIndividual = await newIndividual.save();
    console.log(savedIndividual)
    res.status(201).json(savedIndividual);

  } catch (error: any) {
    if (error.name === 'ValidationError') {
      console.error("Validation Error:", error.message);
      return res.status(400).json({ message: "Validation Error", errors: error.errors });
    }
    console.error("API call failed. Full error:", error);
    res.status(500).send('Server Error');
  }
}
export const updateIndividual = async (req: Request, res: Response) => {
  try {
    const { body, files } = req as { body: any; files: Express.Multer.File[] };
    const {
      firstName, lastName, sex, age, deliveryDate, notes,
      phoneNumbers, socials, clothDetails, payment,
      existingTilefUrls
    } = body;

    const updateData: { [key: string]: any } = {};

    // --- 1. Handle Top-Level Fields ---
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (sex) updateData.sex = sex;
    if (age) updateData.age = age;
    if (deliveryDate) updateData.deliveryDate = deliveryDate;
    if (notes) updateData.notes = notes;

    // --- 2. Handle Nested Objects (Phone, Socials, Payment) ---
    if (phoneNumbers) {
      updateData['phoneNumbers.primary'] = phoneNumbers.primary || "";
      updateData['phoneNumbers.secondary'] = phoneNumbers.secondary || "";
    }
    if (socials) {
      updateData['socials.telegram'] = socials.telegram || "";
      updateData['socials.instagram'] = socials.instagram || "";
    }
    if (payment) {
      if (payment.total) updateData['payment.total'] = parseFloat(payment.total);
      if (payment.firstHalf) {
        updateData['payment.firstHalf.paid'] = String(payment.firstHalf.paid) === 'true';
        if (payment.firstHalf.amount) updateData['payment.firstHalf.amount'] = parseFloat(payment.firstHalf.amount);
      }
      if (payment.secondHalf) {
        updateData['payment.secondHalf.paid'] = String(payment.secondHalf.paid) === 'true';
        if (payment.secondHalf.amount) updateData['payment.secondHalf.amount'] = parseFloat(payment.secondHalf.amount);
      }
    }

    // ===================================================================
    // MODIFICATION: Smarter handling of clothDetails to avoid enum errors
    // ===================================================================
    if (clothDetails) {
      // A) Handle regular string/number fields that can be empty
      const simpleFields = ['shirtLength', 'sholder', 'wegeb', 'rist', 'sleeve','pantWaist', 'dressLength', 'sliveLength', 'breast', 'overBreast', 'underBreast', 'deret', 'anget'];
      simpleFields.forEach(key => {
        // Only set the field if it's actually sent from the form
        if (clothDetails[key] !== undefined) {
          updateData[`clothDetails.${key}`] = clothDetails[key];
        }
      });

      // B) Handle enum fields: ONLY set them if they have a valid, non-empty value
      const enumFields = ['femaleSliveType', 'femaleWegebType', 'maleClothType', 'maleSliveType', 'netela'];
      enumFields.forEach(key => {
        if (clothDetails[key]) { // This checks for non-empty strings
          updateData[`clothDetails.${key}`] = clothDetails[key];
        }
      });

      // C) Handle colors array
      if (clothDetails.colors && typeof clothDetails.colors === 'string') {
        updateData['clothDetails.colors'] = clothDetails.colors.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    }
    // ===================================================================

    // --- Handle Multiple Images ---
    let finalImageUrls = existingTilefUrls ? JSON.parse(existingTilefUrls) : [];
    if (files && files.length > 0) {
      const newImageUrls = files.map(f => f.path);
      finalImageUrls = [...finalImageUrls, ...newImageUrls];
    }
    updateData['clothDetails.tilefImageUrls'] = finalImageUrls;
    
    // --- Final Database Query ---
    const unsetData: { [key: string]: any } = { 'clothDetails.tilefImageUrl': '' };

    const individual = await Individual.findByIdAndUpdate(
      req.params.id,
      { $set: updateData, $unset: unsetData },
      { new: true, runValidators: true, omitUndefined: true }
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
  console.log("--- Uploaded Files ---");
  console.log(req.files); // Log req.files to debug
  console.log("-----------------------------------------");

  try {
    // --- No changes to parsing member and family data ---
    const memberData = JSON.parse(req.body.memberIds);
    
    const familyData: any = {
      familyName: req.body.familyName,
      phoneNumbers: JSON.parse(req.body.phoneNumbers),
      socials: JSON.parse(req.body.socials),
      colors: JSON.parse(req.body.colors),
      deliveryDate: req.body.deliveryDate,
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes || undefined,
    };

    if (req.body.payment) {
      familyData.payment = JSON.parse(req.body.payment);
    }

    // --- No changes to creating members ---
    const membersToCreate = memberData.map((member: any) => ({
      ...member,
      isFamilyMember: true,
    }));

    const newMembers = await Individual.create(membersToCreate, { session, ordered: true });
    const newMemberIds = newMembers.map(member => member._id);

    // --- THIS IS THE UPDATED SECTION ---
    // Change `req.file` to `req.files` and save an array of paths
    
    // 1. Check if req.files exists (it's an array from multer's .array() middleware)
    const imagePaths = req.files 
      ? (req.files as Express.Multer.File[]).map(file => file.path) 
      : []; // Default to an empty array if no files are uploaded

    const newFamilyData = {
      ...familyData,
      memberIds: newMemberIds,
      // 2. Use the new schema field `tilefImageUrls` and assign the array of paths
      tilefImageUrls: imagePaths, 
    };
    // --- END OF UPDATED SECTION ---

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
    // Provide a more descriptive error in the response
    res.status(500).json({ message: 'Server Error: Failed to create family.', error });
  } finally {
    session.endSession();
  }
};



export const updateFamily = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { body, files } = req as { body: any; files: Express.Multer.File[] };
    const {
      familyName, deliveryDate, notes, paymentMethod,
      phoneNumbers, socials, colors, payment,
      memberIds, // This is the JSON string of members
      existingImageUrls // JSON string of old URLs to keep
    } = body;
    
    // --- 1. Build the update object using dot notation ---
    const updateData: { [key: string]: any } = {};

    // Simple fields
    if (familyName) updateData.familyName = familyName;
    if (deliveryDate) updateData.deliveryDate = deliveryDate;
    if (notes) updateData.notes = notes;
    if (paymentMethod) updateData.paymentMethod = paymentMethod;

    // Handle nested objects
    if (phoneNumbers) {
      updateData['phoneNumbers.primary'] = phoneNumbers.primary || "";
      updateData['phoneNumbers.secondary'] = phoneNumbers.secondary || "";
    }
    if (socials) {
      updateData['socials.telegram'] = socials.telegram || "";
    }
    if (colors) {
        updateData.colors = colors.split(',').map((c: string) => c.trim()).filter(Boolean);
    }
    if (payment) {
      if (payment.total) updateData['payment.total'] = parseFloat(payment.total);
      if (payment.firstHalf) {
        updateData['payment.firstHalf.paid'] = String(payment.firstHalf.paid) === 'true';
        if (payment.firstHalf.amount) updateData['payment.firstHalf.amount'] = parseFloat(payment.firstHalf.amount);
      }
      if (payment.secondHalf) {
        updateData['payment.secondHalf.paid'] = String(payment.secondHalf.paid) === 'true';
        if (payment.secondHalf.amount) updateData['payment.secondHalf.amount'] = parseFloat(payment.secondHalf.amount);
      }
    }

    // --- 2. Process Members: Update existing, create new ---
    const finalMemberIds = [];
    if (memberIds) {
      const members = JSON.parse(memberIds);
      for (const member of members) {
        if (member._id && !member._id.startsWith('mock_mem_')) {
          // EXISTING MEMBER: Update and add ID to our list
          await Individual.findByIdAndUpdate(member._id, member);
          finalMemberIds.push(member._id);
        } else {
          // NEW MEMBER: Create and add ID to our list
          delete member._id;
          // --- THIS IS THE FIX ---
          // Now it behaves exactly like your createFamily function
          const newMember = new Individual({ ...member, isFamilyMember: true });
          await newMember.save();
          finalMemberIds.push(newMember._id);
        }
      }
      updateData.memberIds = finalMemberIds;
    }

    // --- 3. Handle Images ---
    const existingUrls = existingImageUrls ? JSON.parse(existingImageUrls) : [];
    const newImageUrls = (files || []).map(f => f.path); // Multer gives us the path/URL
    updateData.tilefImageUrls = [...existingUrls, ...newImageUrls];

    // --- 4. Final Database Query ---
    const updatedFamily = await Family.findByIdAndUpdate(
      id,
      { 
        $set: updateData,
        $unset: { tilefImageUrl: "" } // Clean up the old single image field
      },
      { new: true, runValidators: true }
    );

    if (!updatedFamily) {
      return res.status(404).json({ message: 'Family order not found.' });
    }
    
    const populatedFamily = await updatedFamily.populate('memberIds');
    res.json(populatedFamily);

  } catch (error) {
    console.error("Family update failed:", error);
    res.status(500).send('Server Error');
  }
}
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



const safeJsonParse = (jsonString: string | undefined): any | null => {
  if (typeof jsonString === 'string' && jsonString !== 'undefined' && jsonString.length > 2) {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse JSON string:', jsonString, error);
      return null;
    }
  }
  return null;
};


// Add this new function to your orders.controller.ts file

// The NEW and CORRECT function to paste

export const updateFamilyAndMembers = async (req: Request, res: Response) => {
  console.log('--- UPDATE REQUEST RECEIVED ---');
  console.log('Body:', req.body);
  console.log('File:', req.file);

  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // --- FIX START: Use the safeJsonParse helper for all JSON fields ---
    // This prevents the '"undefined" is not valid JSON' crash.
    const membersData = safeJsonParse(req.body.memberIds) || [];
    const phoneNumbers = safeJsonParse(req.body.phoneNumbers);
    const socials = safeJsonParse(req.body.socials);
    const colors = safeJsonParse(req.body.colors);
    const payment = safeJsonParse(req.body.payment);
    // --- FIX END ---

    const familyUpdatePayload: any = {
      familyName: req.body.familyName,
      deliveryDate: req.body.deliveryDate,
      paymentMethod: req.body.paymentMethod,
      notes: req.body.notes || undefined,
    };

    // Conditionally add parsed objects to the payload to avoid overwriting with null
    if (phoneNumbers) familyUpdatePayload.phoneNumbers = phoneNumbers;
    if (socials) familyUpdatePayload.socials = socials;
    if (colors) familyUpdatePayload.colors = colors;
    if (payment) familyUpdatePayload.payment = payment;
    
    // Handle image update logic
    if (req.file) {
      familyUpdatePayload.tilefImageUrl = req.file.path;
    } else {
      // If no new file, respect the image URL sent from the frontend
      familyUpdatePayload.tilefImageUrl = req.body.tilefImageUrl;
    }
    
    const originalFamily = await Family.findById(id).session(session);
    if (!originalFamily) {
      throw new Error('Family not found');
    }

    const memberUpdates = [];
    const finalMemberIds = [];

    // This is your original, correct logic for handling members
    for (const member of membersData) {
      // If the member has a real ID, it's an update
      if (member._id && !member._id.startsWith('mock_mem_')) {
        const { _id, ...memberDetails } = member;
        memberUpdates.push({
          updateOne: {
            filter: { _id: _id },
            update: { $set: memberDetails },
          },
        });
        finalMemberIds.push(_id);
      } else {
        // If no ID or a mock ID, it's a new member to create
        const { _id, ...newMemberDetails } = member; // remove mock _id
        const newMember = new Individual({ ...newMemberDetails, isFamilyMember: true });
        await newMember.save({ session });
        finalMemberIds.push(newMember._id);
      }
    }

    // Execute updates for existing members
    if (memberUpdates.length > 0) {
      await Individual.bulkWrite(memberUpdates, { session });
    }

    // Determine which members were removed and delete them
    const originalMemberIds = originalFamily.memberIds.map(id => id.toString());
    const currentMemberIds = finalMemberIds.map(id => id.toString());
    const deletedMemberIds = originalMemberIds.filter(id => !currentMemberIds.includes(id));

    if (deletedMemberIds.length > 0) {
      await Individual.deleteMany({ _id: { $in: deletedMemberIds } }, { session });
    }

    // Finally, update the family document with the new data and the final list of member IDs
    const updatedFamily = await Family.findByIdAndUpdate(
      id,
      { ...familyUpdatePayload, memberIds: finalMemberIds },
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
}