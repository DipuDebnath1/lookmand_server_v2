import { PipelineStage } from 'mongoose';
import BusinessProfile from './businessProfile.model';
import { IBusinessProfile } from './businessProfile.type';
import { Types } from 'mongoose';
import AppError from '../../ErrorHandler/AppError';
import httpStatus from 'http-status';
import { UserBaseService } from '../../../service';
const { ObjectId } = Types;

class BusinessProfileService {
  // Find or create a business profile for the user
  async findOrCreateProfile(authorId: string): Promise<IBusinessProfile> {
    let profile = await BusinessProfile.findOne({ author: authorId });
    if (!profile) {
      const findUser = await UserBaseService.findById(authorId, {
        select: 'role',
      });
      // Ensure the user is a provider
      if (!findUser || findUser.role !== 'provider')
        throw new AppError(httpStatus.BAD_REQUEST, 'profile not found !');

      // Create a new profile with the default author ID
      profile = await BusinessProfile.create({
        author: authorId,
      });
    }

    return profile;
  }

  // Update business profile
  async updateProfile(
    authorId: string,
    updates: Partial<IBusinessProfile>,
  ): Promise<IBusinessProfile> {
    const profile = await this.findOrCreateProfile(authorId);

    // Prevent changing serviceCategory if already set
    if (profile.serviceCategory && updates.serviceCategory)
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "sorry you can't change service category once set",
      );

    // Check if the profile is complete
    const isProfileComplete =
      (profile.name.trim() || updates.name?.trim()) &&
      (profile.phone.trim() || updates.phone?.trim()) &&
      (profile.region.trim() || updates.region?.trim()) &&
      (profile.location.trim() || updates.location?.trim()) &&
      (profile.image.trim() || updates.image?.trim()) &&
      (profile.description.trim() || updates.description?.trim()) &&
      (profile.serviceCategory || updates.serviceCategory);

    profile.isProfileComplete = !!isProfileComplete;

    Object.assign(profile, updates);
    await profile.save();
    return profile;
  }

  // get business profile by authorId
  async getBusinessProfileByAuthorId(
    authorId: string,
  ): Promise<IBusinessProfile | null> {
    // const selectFields = query?.select || '-__v -createdAt -updatedAt -author';

    const pipeline: PipelineStage[] = [
      { $match: { author: { $eq: new ObjectId(authorId) } } },
      {
        $lookup: {
          from: 'providerservices',
          localField: 'author',
          foreignField: 'author',
          as: 'services',
        },
      },
      { $unwind: { path: '$services', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'reviews',
          localField: 'services._id',
          foreignField: 'providerService',
          as: 'reviews',
          pipeline: [{ $match: { isDeleted: false } }],
        },
      },
      { $unwind: { path: '$reviews', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: '$_id',
          name: { $first: '$name' },
          phone: { $first: '$phone' },
          description: { $first: '$description' },
          location: { $first: '$location' },
          image: { $first: '$image' },
          isAvailable: { $first: '$isAvailable' },
          isProfileComplete: { $first: '$isProfileComplete' },
          createdAt: { $first: '$createdAt' },
          reviews: { $push: '$reviews' },
        },
      },
      {
        $project: {
          name: 1,
          phone: 1,
          description: 1,
          location: 1,
          image: 1,
          isAvailable: 1,
          isProfileComplete: 1,
          createdAt: 1,
          rating: { $avg: '$reviews.rating' }, // Placeholder for rating
          ratingCount: { $size: '$reviews' }, // Placeholder for rating count
        },
      },
    ];

    const profile = await BusinessProfile.aggregate(pipeline);
    return profile[0] || null;
  }
}

const businessProfileService = new BusinessProfileService();

export default businessProfileService;
