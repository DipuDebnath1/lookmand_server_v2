import { Request, Response } from 'express';
import BusinessProfile from './businessProfile.model';

// ============================================
// SERVICE METHOD - Get Specific Day
// ============================================

export class BusinessAvailabilityService {
  // Get availability for a specific day of the week
  static async getSpecificDayAvailability(
    businessProfileId: string,
    dayName: string,
  ) {
    const profile = await BusinessProfile.findById(businessProfileId).lean();

    if (!profile) {
      return null;
    }

    // Find the specific day in workingHours array
    const dayAvailability = profile.workingHours?.find(
      (hours) => hours.day.toLowerCase() === dayName.toLowerCase(),
    );

    if (!dayAvailability) {
      return {
        businessProfile: {
          _id: profile._id,
          name: profile.name,
          phone: profile.phone,
          location: profile.location,
        },
        day: dayName,
        dayLabel: this.capitalize(dayName),
        isAvailable: false,
        message: 'Day not found in schedule',
      };
    }

    // Format the response
    return {
      businessProfile: {
        _id: profile._id,
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
        image: profile.image,
      },
      day: dayAvailability.day,
      dayLabel: this.capitalize(dayAvailability.day),
      isAvailable: dayAvailability.isAvailable,
      workingHours: dayAvailability.isAvailable
        ? {
            openingTime: dayAvailability.openingTime,
            closingTime: dayAvailability.closingTime,
            displayTime: `${this.formatTime(dayAvailability.openingTime)} - ${this.formatTime(dayAvailability.closingTime)}`,
          }
        : null,
      message: dayAvailability.isAvailable
        ? 'Available'
        : 'Not available on this day',
    };
  }

  // Get current day availability
  static async getCurrentDayAvailability(businessProfileId: string) {
    const today = new Date();
    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const currentDay = days[today.getDay()];

    return this.getSpecificDayAvailability(businessProfileId, currentDay);
  }

  // Get availability for multiple specific days
  static async getMultipleDaysAvailability(
    businessProfileId: string,
    dayNames: string[],
  ) {
    const profile = await BusinessProfile.findById(businessProfileId).lean();

    if (!profile) {
      return null;
    }

    const availability = dayNames.map((dayName) => {
      const dayAvailability = profile.workingHours?.find(
        (hours) => hours.day.toLowerCase() === dayName.toLowerCase(),
      );

      if (!dayAvailability) {
        return {
          day: dayName,
          dayLabel: this.capitalize(dayName),
          isAvailable: false,
          message: 'Not found',
        };
      }

      return {
        day: dayAvailability.day,
        dayLabel: this.capitalize(dayAvailability.day),
        isAvailable: dayAvailability.isAvailable,
        workingHours: dayAvailability.isAvailable
          ? {
              openingTime: dayAvailability.openingTime,
              closingTime: dayAvailability.closingTime,
              displayTime: `${this.formatTime(dayAvailability.openingTime)} - ${this.formatTime(dayAvailability.closingTime)}`,
            }
          : null,
      };
    });

    return {
      businessProfile: {
        _id: profile._id,
        name: profile.name,
        phone: profile.phone,
        location: profile.location,
      },
      availability,
    };
  }

  // Get availability for next N days
  static async getNextNDaysAvailability(
    businessProfileId: string,
    numberOfDays: number = 7,
  ) {
    const profile = await BusinessProfile.findById(businessProfileId).lean();

    if (!profile) {
      return null;
    }

    const days = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];

    const today = new Date();
    const nextDays = [];

    for (let i = 0; i < numberOfDays; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayName = days[date.getDay()];
      const dayAvailability = profile.workingHours?.find(
        (hours) => hours.day.toLowerCase() === dayName,
      );

      nextDays.push({
        date: date.toISOString().split('T')[0],
        dayName: dayName,
        dayLabel: this.capitalize(dayName),
        isAvailable: dayAvailability?.isAvailable || false,
        workingHours: dayAvailability?.isAvailable
          ? {
              openingTime: dayAvailability.openingTime,
              closingTime: dayAvailability.closingTime,
              displayTime: `${this.formatTime(dayAvailability.openingTime)} - ${this.formatTime(dayAvailability.closingTime)}`,
            }
          : null,
      });
    }

    return {
      businessProfile: {
        _id: profile._id,
        name: profile.name,
        phone: profile.phone,
      },
      nextDays,
    };
  }

  // Helper methods
  private static formatTime(time: number | undefined): string {
    if (time === undefined) return 'N/A';

    const hours = Math.floor(time / 100);
    const minutes = time % 100;
    const period = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;

    return `${displayHours}:${minutes.toString().padStart(2, '0')}${period}`;
  }

  private static capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}

// ============================================
// CONTROLLERS
// ============================================

// 1. Get specific day availability
export const getSpecificDayAvailability = async (
  req: Request,
  res: Response,
) => {
  try {
    const { businessProfileId } = req.params;
    const { day } = req.query; // e.g., "monday", "tuesday"

    if (!day) {
      return res.status(400).json({
        success: false,
        message: 'Day parameter is required',
      });
    }

    const availability =
      await BusinessAvailabilityService.getSpecificDayAvailability(
        businessProfileId,
        day as string,
      );

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 2. Get current day availability
export const getCurrentDayAvailability = async (
  req: Request,
  res: Response,
) => {
  try {
    const { businessProfileId } = req.params;

    const availability =
      await BusinessAvailabilityService.getCurrentDayAvailability(
        businessProfileId,
      );

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 3. Get multiple days availability
export const getMultipleDaysAvailability = async (
  req: Request,
  res: Response,
) => {
  try {
    const { businessProfileId } = req.params;
    const { days } = req.query; // e.g., "monday,wednesday,friday"

    if (!days) {
      return res.status(400).json({
        success: false,
        message: 'Days parameter is required',
      });
    }

    const dayNames = (days as string).split(',').map((d) => d.trim());

    const availability =
      await BusinessAvailabilityService.getMultipleDaysAvailability(
        businessProfileId,
        dayNames,
      );

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// 4. Get next N days availability
export const getNextNDaysAvailability = async (req: Request, res: Response) => {
  try {
    const { businessProfileId } = req.params;
    const { days } = req.query; // Number of days, default 7

    const numberOfDays = days ? parseInt(days as string) : 7;

    const availability =
      await BusinessAvailabilityService.getNextNDaysAvailability(
        businessProfileId,
        numberOfDays,
      );

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Business profile not found',
      });
    }

    res.status(200).json({
      success: true,
      data: availability,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const multipleDaysResponse = {
  success: true,
  data: {
    businessProfile: {
      _id: '507f1f77bcf86cd799439011',
      name: 'ABC Services',
      phone: '+880123456789',
      location: 'Dhaka, Bangladesh',
    },
    availability: [
      {
        day: 'monday',
        dayLabel: 'Monday',
        isAvailable: true,
        workingHours: {
          openingTime: 1000,
          closingTime: 1800,
          displayTime: '10:00am - 6:00pm',
        },
      },
      {
        day: 'wednesday',
        dayLabel: 'Wednesday',
        isAvailable: true,
        workingHours: {
          openingTime: 1000,
          closingTime: 1800,
          displayTime: '10:00am - 6:00pm',
        },
      },
      {
        day: 'friday',
        dayLabel: 'Friday',
        isAvailable: false,
        workingHours: null,
      },
    ],
  },
};

// 4. GET NEXT 7 DAYS
// GET /api/business-profiles/507f1f77bcf86cd799439011/availability/upcoming?days=7

const nextDaysResponse = {
  success: true,
  data: {
    businessProfile: {
      _id: '507f1f77bcf86cd799439011',
      name: 'ABC Services',
      phone: '+880123456789',
    },
    nextDays: [
      {
        date: '2025-12-21',
        dayName: 'saturday',
        dayLabel: 'Saturday',
        isAvailable: true,
        workingHours: {
          openingTime: 1000,
          closingTime: 1800,
          displayTime: '10:00am - 6:00pm',
        },
      },
      {
        date: '2025-12-22',
        dayName: 'sunday',
        dayLabel: 'Sunday',
        isAvailable: false,
        workingHours: null,
      },
      {
        date: '2025-12-23',
        dayName: 'monday',
        dayLabel: 'Monday',
        isAvailable: true,
        workingHours: {
          openingTime: 1000,
          closingTime: 1800,
          displayTime: '10:00am - 6:00pm',
        },
      },
      // ... 4 more days
    ],
  },
};
