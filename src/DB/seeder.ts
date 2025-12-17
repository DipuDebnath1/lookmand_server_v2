import mongoose from 'mongoose';
import { User } from '../app/modules/user';
import { logger } from '../app/logger';
import config from '../config';
import process from 'process';

const usersData = [
  {
    name: 'Super Admin',
    email: 'superadmin@gmail.com',
    password: '$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO', // password: 1qazxsw2
    role: 'superAdmin',
    isEmailVerified: true,
  },
  {
    name: 'Admin',
    email: 'user.dipudebnath@gmail.com',
    password: '$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO',
    role: 'admin',
    isEmailVerified: true,
  },
  {
    name: 'disciple',
    email: 'disciple@gmail.com',
    password: '$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO',
    role: 'disciple',
    isEmailVerified: true,
  },
  {
    name: 'disciple_maker',
    email: 'disciple_maker@gmail.com',
    password: '$2a$08$cUQ3uMdbQjlyDF/dgn5mNuEt9fLJZqq8TaT9aKabrFuG5wND3/mPO',
    role: 'disciple_maker',
    isEmailVerified: true,
  },
];

const connectDB = async () => {
  try {
    await mongoose.connect(config.databaseUri as string);
    logger.info('Connected to MongoDB');
  } catch (err) {
    logger.error('Error connecting to MongoDB:', err);
    process.exit(1);
  }
};

const dropDatabase = async () => {
  try {
    await mongoose.connection.dropDatabase();
    logger.info('Database dropped successfully!');
  } catch (err) {
    logger.error('Error dropping database:', err);
  }
};

const seedUsers = async () => {
  try {
    await User.deleteMany();
    await User.insertMany(usersData);
    logger.info('Users seeded successfully!');
  } catch (err) {
    logger.error('Error seeding users:', err);
  }
};

const seedDatabase = async () => {
  await connectDB();
  await dropDatabase();
  await seedUsers();
  logger.info('Database seeding completed!');
  mongoose.disconnect();
};

seedDatabase();
