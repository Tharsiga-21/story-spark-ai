import ApiError from "../../../errors/api_error";
import { ITokenPayload } from "../../../interfaces/token";
import { User } from "../user/user.model";
import httpStatus from "http-status";
import { Reaction } from "./reaction.model";
import { Types } from "mongoose";
import { Post } from "../post/post.model";

type ReactionType = "like" | "love" | "laugh" | "angry" | "sad";

const toggleReaction = async (
  postId: string,
  type: ReactionType = "like",
  token: ITokenPayload
) => {
  const { email } = token;

  const user = await User.findOne({ email }).select("_id").lean();

  if (!user) {
    throw new ApiError(httpStatus.BAD_REQUEST, "User not found!");
  }

  const post = await Post.findOne({
    _id: postId,
    isDeleted: { $ne: true },
  }).select("likesCount reactions");

  if (!post) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Post not found!");
  }
  const existingReaction = await Reaction.findOne({
    postId: new Types.ObjectId(postId),
    userId: user._id,
  });

  if (existingReaction) {
    if (existingReaction.type === type) {
      // Remove reaction if it's the same type
      await Reaction.deleteOne({ _id: existingReaction._id });
      const updatedPost = await Post.findOneAndUpdate(
        { _id: postId },
        { 
          $pull: { reactions: existingReaction._id },
          $inc: { likesCount: -1 } 
        },
        { new: true }
      );
      return { message: "Reaction removed", reacted: false, likesCount: updatedPost?.likesCount || 0 };
    } else {
      // Update reaction type
      existingReaction.type = type;
      await existingReaction.save();
      const updatedPost = await Post.findById(postId);
      return { message: "Reaction updated", reacted: true, reaction: existingReaction, likesCount: updatedPost?.likesCount || 0 };
    }
  } else {
    // Add new reaction
    const newReaction = await Reaction.create({
      postId: new Types.ObjectId(postId),
      userId: user._id,
      type: type,
    });
    
    const updatedPost = await Post.findOneAndUpdate(
      { _id: postId },
      { 
        $push: { reactions: newReaction._id },
        $inc: { likesCount: 1 } 
      },
      { new: true }
    );
    return { message: "Reaction added", reacted: true, reaction: newReaction, likesCount: updatedPost?.likesCount || 0 };
  }
};
export const ReactionService = {
  toggleReaction,
};
