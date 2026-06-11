import { Types } from "mongoose";
import { StoryRating } from "./story_rating.model";
import ApiError from "../../../errors/api_error";
import httpStatus from "http-status";

/**
 * Upserts a rating for a story by a user
 */
const rateStory = async (
  userId: string,
  storyId: string,
  rating: number,
  review?: string
) => {
  const filter = { userId: new Types.ObjectId(userId), storyId: new Types.ObjectId(storyId) };
  const update = { rating, review };
  const options = { new: true, upsert: true, setDefaultsOnInsert: true };

  const result = await StoryRating.findOneAndUpdate(filter, update, options);
  return result;
};

/**
 * Retrieves paginated reviews for a story
 */
const getStoryRatings = async (storyId: string, page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const ratings = await StoryRating.find({ storyId: new Types.ObjectId(storyId) })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("userId", "name avatar"); // Assuming User has name and avatar fields

  const total = await StoryRating.countDocuments({ storyId: new Types.ObjectId(storyId) });

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: ratings,
  };
};

/**
 * Retrieves the average rating and distribution for a story
 */
const getAverageRating = async (storyId: string) => {
  const result = await StoryRating.aggregate([
    { $match: { storyId: new Types.ObjectId(storyId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalRatings: { $sum: 1 },
        ratingsDistribution: {
          $push: "$rating",
        },
      },
    },
  ]);

  if (!result.length) {
    return {
      averageRating: 0,
      totalRatings: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const data = result[0];
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  data.ratingsDistribution.forEach((r: number) => {
    if (distribution[r] !== undefined) {
      distribution[r]++;
    }
  });

  return {
    averageRating: Number(data.averageRating.toFixed(1)),
    totalRatings: data.totalRatings,
    distribution,
  };
};

export const StoryRatingService = {
  rateStory,
  getStoryRatings,
  getAverageRating,
};
