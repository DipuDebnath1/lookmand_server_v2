import express from 'express';
const router = express.Router();
import { UserRoute } from '../user/user.route';
import { AuthRoute } from '../auth/auth.route';
import BusinessProfileRoute from '../businessProfile/businessProfile.route';
import CategoryRoute from '../category/category.route';
import ProviderServiceRoute from '../providerService/providerService.route';
import NotificationRoute from '../notification/notification.route';
import ServiceBookingRoute from '../serviceBooking/serviceBooking.route';
import ReviewRoute from '../review/review.route';
import FavoriteRoute from '../favoriteService/favoriteService.route';
import ConversationRoute from '../conversation/conversation.route';
import SubscriptionRoute from '../subscription/subscription.route';
import SubscriptionPurchasesRoute from '../subscriptionPurchases/SubscriptionPurchases.route';
import dashboardRoute from '../dashboard/dashboard.route';
import SettingRoute from '../setting/setting.route';
import ReportRoute from '../report/report.route';
import AddsRoute from '../adds/add.route';

const moduleRoute = [
  {
    path: '/auth',
    route: AuthRoute,
  },
  {
    path: '/user',
    route: UserRoute,
  },
  {
    path: '/business_profile',
    route: BusinessProfileRoute,
  },
  {
    path: '/category',
    route: CategoryRoute,
  },
  {
    path: '/service',
    route: ProviderServiceRoute,
  },
  {
    path: '/booking',
    route: ServiceBookingRoute,
  },
  {
    path: '/review',
    route: ReviewRoute,
  },
  {
    path: '/notification',
    route: NotificationRoute,
  },
  {
    path: '/favorite',
    route: FavoriteRoute,
  },
  {
    path: '/conversation',
    route: ConversationRoute,
  },
  {
    path: '/subscription',
    route: SubscriptionRoute,
  },
  {
    path: '/subscription-purchase',
    route: SubscriptionPurchasesRoute,
  },
  {
    path: '/dashboard',
    route: dashboardRoute,
  },
  {
    path: '/settings',
    route: SettingRoute,
  },
  {
    path: '/report',
    route: ReportRoute,
  },
  {
    path: '/adds',
    route: AddsRoute,
  },
];

moduleRoute.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
