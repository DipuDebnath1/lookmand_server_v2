import ServiceBooking from '../serviceBooking/serviceBooking.model';
import Transaction from '../transaction/transaction.model';
import { User } from '../user';
import { Roles } from '../user/const';

// Get dashboard statistics
const dashboardServiceStatistics = async () => {
  // total users count
  const totalUsersCount = User.countDocuments({
    isDeleted: false,
    role: Roles.USER,
  });

  // total providers count
  const totalProvidersCount = User.countDocuments({
    isDeleted: false,
    role: Roles.PROVIDER,
  });

  // total active bookings count
  const activeBookingsCount = ServiceBooking.countDocuments({
    isDeleted: false,
    status: 'accepted',
  });

  // total completed booking
  const completedBookingsCount = ServiceBooking.countDocuments({
    isDeleted: false,
    status: 'completed',
  });

  // total subscriptions count
  const totalSubscriptionsCount = ServiceBooking.countDocuments({
    isDeleted: false,
  });

  // total revenue calculate
  const totalRevenue = Transaction.aggregate([
    { $match: { status: 'success' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const [
    usersCount,
    providersCount,
    activeBookings,
    completedBooking,
    subscriptionsCount,
    revenue,
  ] = await Promise.all([
    totalUsersCount,
    totalProvidersCount,
    activeBookingsCount,
    completedBookingsCount,
    totalSubscriptionsCount,
    totalRevenue,
  ]);

  // generate response format
  const results = {
    users: usersCount,
    providers: providersCount,
    activeBookings: activeBookings,
    completedBookings: completedBooking,
    subscriptions: subscriptionsCount,
    revenue: revenue[0] ? revenue[0].total : 0,
  };

  return results;
};
// Example response format
interface MonthlyIncome {
  month: string;
  year: number;
  amount: number;
}

// Get monthly income for the last 12 months
const getMonthlyIncome = async (): Promise<MonthlyIncome[]> => {
  // Get current date and date 11 months ago
  const currentDate = new Date();
  const elevenMonthsAgo = new Date();
  elevenMonthsAgo.setMonth(currentDate.getMonth() - 11);
  elevenMonthsAgo.setDate(1);
  elevenMonthsAgo.setHours(0, 0, 0, 0);

  // Aggregation pipeline
  const result = await Transaction.aggregate([
    {
      $match: {
        status: 'success',
        createdAt: { $gte: elevenMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        amount: { $sum: '$amount' },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  // Create a map of existing data
  const dataMap = new Map<string, number>();
  result.forEach((item) => {
    const key = `${item._id.year}-${item._id.month}`;
    dataMap.set(key, item.amount);
  });

  // Generate last 12 months array with 0 for missing months
  const monthNames = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];

  const monthlyIncomeData: MonthlyIncome[] = [];

  for (let i = 11; i >= 0; i--) {
    const date = new Date();
    date.setMonth(currentDate.getMonth() - i);

    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    const monthName = monthNames[monthIndex];
    const key = `${year}-${monthIndex + 1}`;

    monthlyIncomeData.push({
      month: monthName,
      year: year,
      amount: dataMap.get(key) || 0,
    });
  }

  return monthlyIncomeData;
};

const dashboardService = {
  dashboardServiceStatistics,
  getMonthlyIncome,
};

export default dashboardService;
