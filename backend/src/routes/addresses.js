import express from "express";
import { Address } from "../models/Address.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

// Get all addresses for the current user
router.get('/', requireAuth, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.uid });
    res.json(addresses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching addresses' });
  }
});

// Add a new address
router.post('/', requireAuth, async (req, res) => {
  try {
    const { fullName, mobile, addressLine1, addressLine2, city, state, pincode, isDefault, label } = req.body;
    
    // If this is the first address, make it default
    const addressCount = await Address.countDocuments({ userId: req.user.uid });
    const shouldBeDefault = isDefault || addressCount === 0;

    const address = new Address({
      userId: req.user.uid,
      fullName,
      mobile,
      addressLine1,
      addressLine2,
      city,
      state,
      pincode,
      isDefault: shouldBeDefault,
      label
    });

    await address.save();
    res.status(201).json(address);
  } catch (error) {
    res.status(400).json({ error: 'Error adding address' });
  }
});

// Update an address
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { fullName, mobile, addressLine1, addressLine2, city, state, pincode, isDefault, label } = req.body;
    
    let address = await Address.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    // If setting this as default, update other addresses
    if (isDefault && !address.isDefault) {
      await Address.updateMany(
        { userId: req.user.uid, _id: { $ne: req.params.id } },
        { $set: { isDefault: false } }
      );
    }

    address.fullName = fullName;
    address.mobile = mobile;
    address.addressLine1 = addressLine1;
    address.addressLine2 = addressLine2;
    address.city = city;
    address.state = state;
    address.pincode = pincode;
    address.isDefault = isDefault;
    address.label = label;

    await address.save();
    res.json(address);
  } catch (error) {
    res.status(400).json({ error: 'Error updating address' });
  }
});

// Delete an address
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    await address.remove();

    // If the deleted address was default, make the oldest remaining address default
    if (address.isDefault) {
      const oldestAddress = await Address.findOne({ userId: req.user.uid }).sort({ createdAt: 1 });
      if (oldestAddress) {
        oldestAddress.isDefault = true;
        await oldestAddress.save();
      }
    }

    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: 'Error deleting address' });
  }
});

// Set an address as default
router.post('/:id/default', requireAuth, async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, userId: req.user.uid });
    if (!address) {
      return res.status(404).json({ error: 'Address not found' });
    }

    await Address.updateMany(
      { userId: req.user.uid },
      { $set: { isDefault: false } }
    );

    address.isDefault = true;
    await address.save();
    res.json(address);
  } catch (error) {
    res.status(400).json({ error: 'Error setting default address' });
  }
});

export default router;