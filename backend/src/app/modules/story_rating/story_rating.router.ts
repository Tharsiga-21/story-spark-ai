import express from "express";
import validateRequest from "../../middleware/validate.request";
import auth from "../../middleware/auth.middleware";
import { ENUM_USER_ROLE } from "../../../enums/user";
import { StoryRatingController } from "./story_rating.controller";
import { StoryRatingValidation } from "./story_rating.validation";

const router = express.Router();

router.post(
  "/",
  auth(
    ENUM_USER_ROLE.USER,
    ENUM_USER_ROLE.WRITER,
    ENUM_USER_ROLE.ADMIN,
    ENUM_USER_ROLE.SUPER_ADMIN
  ),
  validateRequest(StoryRatingValidation.createOrUpdateRating),
  StoryRatingController.createOrUpdateRating
);

router.get(
  "/:storyId/average",
  StoryRatingController.getAverageRating
);

router.get(
  "/:storyId",
  StoryRatingController.getStoryRatings
);

export const StoryRatingRouter = router;
