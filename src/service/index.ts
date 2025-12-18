import BaseService from './DBService';
import { User } from '../app/modules/user';
import BusinessProfile from '../app/modules/businessProfile/businessProfile.model';
import ServiceBooking from '../app/modules/serviceBooking/serviceBooking.model';
import FavoriteService from '../app/modules/favoriteService/favoriteService.model';
import Adds from '../app/modules/adds/add.model';
import Conversation from '../app/modules/conversation/conversation.model';
import Message from '../app/modules/conversation/message.model';
import Report from '../app/modules/report/report.model';
import Notification from '../app/modules/notification/notification.model';
import categoryModel from '../app/modules/category/category.model';
import Subscription from '../app/modules/subscription/subscription.model';
import SubscriptionPurchase from '../app/modules/subscriptionPurchases/SubscriptionPurchases.model';
import Transaction from '../app/modules/transaction/transaction.model';
import Review from '../app/modules/review/review.model';
import Service from '../app/modules/service/service.model';

const UserBaseService = new BaseService(User);
const ProfileBaseService = new BaseService(BusinessProfile);
const ProviderBaseService = new BaseService(Service);
const BookingBaseService = new BaseService(ServiceBooking);
const FavoriteServiceBaseService = new BaseService(FavoriteService);

const AddsBaseService = new BaseService(Adds);
const ConversationBaseService = new BaseService(Conversation);
const MessageBaseService = new BaseService(Message);
const ReportBaseService = new BaseService(Report);
const NotificationBaseService = new BaseService(Notification);
const CategoryBaseService = new BaseService(categoryModel.Category);
const SubCategoryBaseService = new BaseService(categoryModel.SubCategory);
const SubscriptionBaseService = new BaseService(Subscription);
const SubscriptionPurchaseBaseService = new BaseService(SubscriptionPurchase);
const TransactionBaseService = new BaseService(Transaction);
const ReviewBaseService = new BaseService(Review);

export {
  ProviderBaseService,
  AddsBaseService,
  ReportBaseService,
  ConversationBaseService,
  MessageBaseService,
  NotificationBaseService,
  UserBaseService,
  CategoryBaseService,
  SubCategoryBaseService,
  ProfileBaseService,
  BookingBaseService,
  FavoriteServiceBaseService,
  SubscriptionBaseService,
  SubscriptionPurchaseBaseService,
  TransactionBaseService,
  ReviewBaseService,
};
