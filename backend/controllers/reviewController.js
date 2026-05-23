const Review = require("../models/Review");

function round1(n) {
  return Math.round(Number(n) * 10) / 10;
}

const getReviewStats = async (req, res) => {
  try {
    const [totalReviews, pendingModeration, approvedRatings] = await Promise.all([
      Review.countDocuments(),
      Review.countDocuments({ status: "pending" }),
      Review.find({ status: "approved" }).select("rating").lean(),
    ]);
    const n = approvedRatings.length;
    const avgRating = n ? round1(approvedRatings.reduce((s, r) => s + r.rating, 0) / n) : 0;
    res.json({
      avgRating,
      totalReviews,
      pendingModeration,
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Review stats failed" });
  }
};

const getReviews = async (req, res) => {
  try {
    const { status, limit = 100 } = req.query;
    const q = {};
    if (status && ["pending", "approved", "rejected"].includes(status)) {
      q.status = status;
    }
    const reviews = await Review.find(q)
      .sort({ createdAt: -1 })
      .limit(Math.min(500, Math.max(1, Number(limit) || 100)))
      .lean();

    res.json({
      reviews: reviews.map((r) => ({
        id: r._id.toString(),
        customerName: r.customerName,
        productName: r.productName,
        rating: r.rating,
        body: r.body,
        status: r.status,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message || "Reviews load failed" });
  }
};

const approveReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status: "approved" },
      { new: true, runValidators: true }
    );
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    return res.json({ message: "Review approved", review: { id: review._id.toString(), status: review.status } });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Approve failed" });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }
    return res.json({ message: "Review removed" });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Delete failed" });
  }
};

const createReview = async (req, res) => {
  try {
    const { productName, rating, body } = req.body;
    const customerName = req.user ? req.user.name : "Anonymous";

    if (!productName || !rating || !body) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const review = await Review.create({
      customerName,
      productName,
      rating: Number(rating),
      body,
      status: "approved" // Auto-approve for immediate display
    });

    // Update the Product's overall rating
    const Product = require("../models/Product");
    const baseName = productName.split(" - ")[0].trim();
    
    const approvedReviews = await Review.find({ productName: new RegExp(`^${baseName}`, "i"), status: "approved" });
    const count = approvedReviews.length;
    const avg = count ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
    
    await Product.findOneAndUpdate(
      { name: new RegExp(`^${baseName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i") },
      { rating: round1(avg), reviews_count: count }
    );

    res.status(201).json({ message: "Review submitted successfully", review });
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to submit review" });
  }
};

module.exports = { getReviewStats, getReviews, approveReview, deleteReview, createReview };
