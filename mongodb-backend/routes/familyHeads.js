// mongodb-backend/routes/familyHeads.js
const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { authenticateToken, isAdmin } = require("../middleware/auth");
const QRCode = require("qrcode");

// Import models
const FamilyHead = require("../models/FamilyHead");
const Resident = require("../models/Resident");

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Helper function to generate a unique family head ID
const generateFourPsMemberId = async () => {
  const currentYear = new Date().getFullYear();
  const count = await FourPsMember.countDocuments();
  return `F-${currentYear}${(count + 1).toString().padStart(3, "0")}`;
};

// Get all family heads (admin only)
router.get("/", isAdmin, async (req, res) => {
  try {
    const fourPsMember = await FourPsMember.find({}, "-qrCode");
    res.json(fourPsMembers);
  } catch (error) {
    console.error("Error getting member:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get family head by ID
router.get("/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const fourPsMember = await FourPsMember.findOne({ headId: id }, "-qrCode");

    if (!fourPsMember) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json(fourPsMember);
  } catch (error) {
    console.error(`Error getting member ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get family head QR code
router.get("/:id/qrcode", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const fourPsMember = await FourPsMember.findOne({ headId: id });

    if (!fourPsMember) {
      return res.status(404).json({ error: "Member not found" });
    }

    // If QR code doesn't exist yet, generate it
    if (!fourPsMember.qrCode) {
      // Create data for QR code
      const qrData = {
        id: fourPsMember.memberId,
        name: `${fourPsMember.firstName} ${fourPsMember.lastName}`,
        type: "4Ps Member",
        verified: true,
      };

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

      // Save QR code to family head record
      fourPsMember.qrCode = qrCodeDataUrl;
      await fourPsMember.save();
    }

    res.json({ qrCode: fourPsMember.qrCode });
  } catch (error) {
    console.error(`Error getting member QR code ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get family members for a family head
router.get("/:id/members", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if family head exists
    const fourPsMember = await FourPsMember.findOne({ headId: id });
    if (!fourPsMember) {
      return res.status(404).json({ error: "Member not found" });
    }

    // Get members
    const members = await Resident.find({ fourPsMemberId: id }, "-qrCode");

    res.json(members);
  } catch (error) {
    console.error(`Error getting 4Ps members for ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

// Create new family head (admin only)
router.post(
  "/",
  isAdmin,
  [
    body("firstName")
      .not()
      .isEmpty()
      .trim()
      .withMessage("First name is required"),
    body("lastName")
      .not()
      .isEmpty()
      .trim()
      .withMessage("Last name is required"),
    body("gender").not().isEmpty().withMessage("Gender is required"),
    body("birthDate").not().isEmpty().withMessage("Birth date is required"),
    body("address").not().isEmpty().trim().withMessage("Address is required"),
    body("contactNumber")
      .not()
      .isEmpty()
      .trim()
      .withMessage("Contact number is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: errors
          .array()
          .map((err) => err.msg)
          .join(", "),
        errors: errors.array(),
      });
    }

    try {
      console.log("Creating 4Ps member with data:", req.body);

      // Generate unique family head ID
      const headId = await generateFourPsMemberId();
      console.log("Generated 4Ps Member ID:", headId);

      // Create new family head
      const newFourPsMember = new FourPsMember({
        headId,
        firstName: req.body.firstName.trim(),
        lastName: req.body.lastName.trim(),
        gender: req.body.gender,
        birthDate: new Date(req.body.birthDate),
        address: req.body.address.trim(),
        contactNumber: req.body.contactNumber.trim(),
        registrationDate: new Date(),
        type: "4Ps Member",
      });

      // Save family head
      await newFamilyHead.save();

      // Generate QR code
      const qrData = {
        id: headId,
        name: `${req.body.firstName} ${req.body.lastName}`,
        type: "Family Head",
        verified: true,
      };

      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData));

      // Save QR code to family head record
      newFamilyHead.qrCode = qrCodeDataUrl;
      await newFamilyHead.save();

      // Return family head without QR code in response
      const familyHeadResponse = newFamilyHead.toObject();
      delete familyHeadResponse.qrCode;

      res.status(201).json(familyHeadResponse);
    } catch (error) {
      console.error("Error creating family head:", error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Update family head (admin only)
router.put(
  "/:id",
  isAdmin,
  [
    body("firstName").not().isEmpty().withMessage("First name is required"),
    body("lastName").not().isEmpty().withMessage("Last name is required"),
    body("gender").not().isEmpty().withMessage("Gender is required"),
    body("birthDate").isDate().withMessage("Valid birth date is required"),
    body("address").not().isEmpty().withMessage("Address is required"),
    body("contactNumber")
      .not()
      .isEmpty()
      .withMessage("Contact number is required"),
  ],
  async (req, res) => {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;

      // Check if family head exists
      const familyHead = await FamilyHead.findOne({ headId: id });
      if (!familyHead) {
        return res.status(404).json({ error: "Family head not found" });
      }

      // Get old address for comparison
      const oldAddress = familyHead.address;
      const newAddress = req.body.address;

      // Update family head
      const updatedFamilyHead = await FamilyHead.findOneAndUpdate(
        { headId: id },
        {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          gender: req.body.gender,
          birthDate: req.body.birthDate,
          address: newAddress,
          contactNumber: req.body.contactNumber,
        },
        { new: true, projection: "-qrCode" }
      );

      // If address changed, update all family members' addresses
      if (oldAddress !== newAddress) {
        await Resident.updateMany(
          { familyHeadId: id },
          { address: newAddress }
        );
      }

      res.json(updatedFamilyHead);
    } catch (error) {
      console.error(`Error updating family head ${req.params.id}:`, error);
      res.status(500).json({ error: "Server error" });
    }
  }
);

// Delete family head (admin only)
router.delete("/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if family head exists
    const familyHead = await FamilyHead.findOne({ headId: id });
    if (!familyHead) {
      return res.status(404).json({ error: "Family head not found" });
    }

    // Check if there are family members
    const memberCount = await Resident.countDocuments({ familyHeadId: id });
    if (memberCount > 0) {
      return res.status(400).json({
        error:
          "Cannot delete family head with existing members. Please reassign or delete members first.",
      });
    }

    // Delete family head
    await FamilyHead.deleteOne({ headId: id });

    res.json({ message: "Family head deleted successfully" });
  } catch (error) {
    console.error(`Error deleting family head ${req.params.id}:`, error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
