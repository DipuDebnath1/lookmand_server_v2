import httpStatus from 'http-status';
import AppError from '../ErrorHandler/AppError';
import { SubscriptionDurationType } from '../modules/subscription/const';

// Helper function to add duration to the current date
const calculateEndDate = (
  duration: number,
  type: keyof typeof SubscriptionDurationType,
): Date => {
  const startDate = new Date();

  switch (type) {
    case SubscriptionDurationType.Day:
      startDate.setDate(startDate.getDate() + duration);
      break;
    case SubscriptionDurationType.Month:
      startDate.setMonth(startDate.getMonth() + duration);
      break;
    case SubscriptionDurationType.Year:
      startDate.setFullYear(startDate.getFullYear() + duration);
      break;
    default:
      throw new AppError(httpStatus.BAD_REQUEST, 'Invalid subscription type');
  }

  return startDate;
};

export default calculateEndDate;
