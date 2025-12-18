/* eslint-disable @typescript-eslint/no-explicit-any */
import httpStatus from 'http-status';
import Transaction from './transaction.model';
import { ITransaction } from './transaction.type';
import AppError from '../../ErrorHandler/AppError';
import { PipelineStage } from 'mongoose';
import { TransactionBaseService } from '../../../service';

const paymentResult = {
  amount: 100,
  transactionId: Date.now().toString(),
  status: 'success',
}; // Mock payment result

// create transaction
const saveTransactionInfo = async (payload: ITransaction) => {
  try {
    const res = await Transaction.create({ ...payload, ...paymentResult });
    if (!res)
      throw new AppError(httpStatus.BAD_GATEWAY, 'Transaction creation failed');
    return res;
  } catch (error: any) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Transaction creation failed:: ${error.message}`,
    );
  }
};

// get transactions
const getTransactions = async (query: any) => {
  const filter: any = {};
  if (query?.status) filter.status = query?.status;
  const pipeline: PipelineStage[] = [
    { $match: filter },
    {
      $lookup: {
        from: 'users',
        localField: 'author',
        foreignField: '_id',
        as: 'author',
      },
    },
    {
      $unwind: {
        path: '$author',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'subscriptionpurchases',
        localField: 'subscriptionPurchase',
        foreignField: '_id',
        as: 'subscriptionPurchase',
      },
    },
    {
      $unwind: {
        path: '$subscriptionPurchase',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'subscriptions',
        localField: 'subscriptionPurchase.subscription',
        foreignField: '_id',
        as: 'subscriptionPurchase.subscription',
      },
    },
    {
      $unwind: {
        path: '$subscriptionPurchase.subscription',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        author: {
          _id: '$author._id',
          name: '$author.name',
          image: '$author.image',
        },
        subscription: {
          _id: '$subscriptionPurchase.subscription._id',
          title: '$subscriptionPurchase.subscription.title',
          duration: '$subscriptionPurchase.subscription.duration',
          durationType: '$subscriptionPurchase.subscription.durationType',
        },
        // },
        amount: 1,
        transactionId: 1,
        status: 1,
        createdAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ];

  const transactions = await TransactionBaseService.aggregateWithPagination(
    pipeline,
    query,
  );
  return transactions;
};

const transactionService = { saveTransactionInfo, getTransactions };

export default transactionService;
