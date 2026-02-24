import { Package } from "../models/packageModel.js";

export const getActivePackages = async (req, res) => {
  try {
    const packages = await Package.find({ isActive: true }).sort({ price: 1 });

    return res.status(200).json({
      success: true,
      packages,
    });
  } catch (error) {
    console.error("Get Packages Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
