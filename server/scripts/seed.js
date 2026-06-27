import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

import connectDB from '../config/db.js';
import User from '../models/User.js';
import Event from '../models/Event.js';
import JoinRequest from '../models/JoinRequest.js';
import Attendance from '../models/Attendance.js';
import Review from '../models/Review.js';
import HostCreditTransaction from '../models/HostCreditTransaction.js';

dotenv.config();

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const seedData = async () => {
  try {
    console.log('Connecting to database for seeding...');
    await connectDB();

    console.log('Clearing existing database collections...');
    await User.deleteMany();
    await Event.deleteMany();
    await JoinRequest.deleteMany();
    await Attendance.deleteMany();
    await Review.deleteMany();
    await HostCreditTransaction.deleteMany();

    console.log('Generating dummy users...');
    const hashedPass = await hashPassword('password123');

    // Create 3 users
    const users = await User.insertMany([
      {
        name: 'Aravind Sharma',
        email: 'aravind@gmail.com',
        password: hashedPass,
        phone: '+919876543210',
        isVerified: true,
        verificationStatus: 'verified',
        hostCredits: 3, // Purchased credits
        communityScore: 120,
        bio: 'Tech enthusiast and active community developer. Love organizing UNO nights and outdoor sports.',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
        achievements: ['Welcome Gift', 'Identity Verified', 'First Purchase'],
        attendedEventsCount: 4,
        verifiedAttendanceForCredits: 4
      },
      {
        name: 'Pooja Hegde',
        email: 'pooja@gmail.com',
        password: hashedPass,
        phone: '+919988776655',
        isVerified: false,
        verificationStatus: 'unverified',
        hostCredits: 1,
        communityScore: 100,
        bio: 'College student looking for weekend board game tables and book clubs.',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
        achievements: ['Welcome Gift'],
        attendedEventsCount: 1,
        verifiedAttendanceForCredits: 1
      },
      {
        name: 'Vikram Malhotra (Organizer)',
        email: 'vikram@gmail.com',
        password: hashedPass,
        phone: '+919000011111',
        isVerified: true,
        verificationStatus: 'verified', // Verified Badge
        hostCredits: 5,
        communityScore: 230,
        bio: 'Professional event coordinator & runner. GTG verified community organizer.',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        achievements: ['Welcome Gift', 'Identity Verified', 'Frequent Host', 'Community Pillar'],
        attendedEventsCount: 0,
        verifiedAttendanceForCredits: 0
      }
    ]);

    const aravind = users[0];
    const pooja = users[1];
    const vikram = users[2];

    console.log('Seeding host credit transactions...');
    await HostCreditTransaction.insertMany([
      { user: aravind._id, amount: 1, type: 'welcome_gift', details: 'Welcome Free Credit' },
      { user: aravind._id, amount: 1, type: 'purchase', details: 'Purchased 1 credit' },
      { user: aravind._id, amount: 1, type: 'purchase', details: 'Purchased 1 credit' },
      { user: pooja._id, amount: 1, type: 'welcome_gift', details: 'Welcome Free Credit' },
      { user: vikram._id, amount: 1, type: 'welcome_gift', details: 'Welcome Free Credit' },
      { user: vikram._id, amount: 5, type: 'purchase', details: 'Purchased 5 hosting bundle' }
    ]);

    console.log('Generating sample events...');
    // Create events around Bangalore area
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(17, 0, 0, 0);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 4);
    nextWeek.setHours(10, 0, 0, 0);

    const matchDate = new Date();
    matchDate.setDate(matchDate.getDate() + 2);
    matchDate.setHours(7, 30, 0, 0);

    const jamDate = new Date();
    jamDate.setDate(jamDate.getDate() + 3);
    jamDate.setHours(18, 30, 0, 0);

    const events = await Event.insertMany([
      {
        title: 'UNO & Board Games in Cubbon Park',
        description: 'Join us for a casual Sunday evening under the trees at Cubbon Park. We will be playing UNO, Catan, and Exploding Kittens. Bring your own snacks and a picnic mat if you can! Suitable for anyone looking to meet cool folks.',
        category: 'Social',
        coverImage: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=800&q=80',
        dateTime: tomorrow,
        location: {
          address: 'Cubbon Park, Near Metro Station, Bangalore',
          latitude: 12.9750,
          longitude: 77.5980
        },
        participantLimit: 8,
        whatsappLink: 'https://chat.whatsapp.com/GjN9vU8wK7zHkU6wV9xY2z',
        organizer: aravind._id,
        spotsLeft: 6, // 8 - 2 approved participants
        requireApproval: true
      },
      {
        title: 'Vite & Tailwind v4 Hack Night',
        description: 'Calling all frontend devs in Koramangala! We are hosting a mini-hackathon to build responsive mobile widgets with Vite & Tailwind CSS v4. Bring your laptop, charger, and coding ideas. Pizza & coffee are on us!',
        category: 'Tech',
        coverImage: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=800&q=80',
        dateTime: nextWeek,
        location: {
          address: 'Koramangala 5th Block Tech Hub, Bangalore',
          latitude: 12.9345,
          longitude: 77.6101
        },
        participantLimit: 25,
        whatsappLink: 'https://chat.whatsapp.com/GjN9vU8wK7zHkU6wV9xY2z',
        organizer: vikram._id,
        spotsLeft: 23,
        requireApproval: false // Auto approved
      },
      {
        title: '7v7 Football Match (Sunday Morning)',
        description: 'Need two midfielders and a goalkeeper for our weekly morning session. High intensity but friendly game. Booking cost will be split equally. Studs are compulsory on the turf.',
        category: 'Sports',
        coverImage: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=800&q=80',
        dateTime: matchDate,
        location: {
          address: 'Indiranagar Football Turf, Bangalore',
          latitude: 12.9784,
          longitude: 77.6408
        },
        participantLimit: 14,
        whatsappLink: 'https://chat.whatsapp.com/GjN9vU8wK7zHkU6wV9xY2z',
        organizer: vikram._id,
        spotsLeft: 13,
        requireApproval: true
      },
      {
        title: 'Acoustic Jam Session at Third Wave Coffee',
        description: 'Bring your acoustic guitars, ukes, cajons, or just your vocal cords! We are jamming to 90s rock, indie pop, and Bollywood classics. Buying a beverage at the cafe is recommended.',
        category: 'Music',
        coverImage: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
        dateTime: jamDate,
        location: {
          address: 'Third Wave Coffee, Lavelle Road, Bangalore',
          latitude: 12.9698,
          longitude: 77.5950
        },
        participantLimit: 10,
        whatsappLink: 'https://chat.whatsapp.com/GjN9vU8wK7zHkU6wV9xY2z',
        organizer: aravind._id,
        spotsLeft: 10,
        requireApproval: true
      }
    ]);

    const unoEvent = events[0];
    const hackEvent = events[1];
    const footballEvent = events[2];

    console.log('Deducting host credits for created events...');
    // Aravind created UNO & Jam events (-2 credits)
    aravind.hostCredits -= 2;
    await aravind.save();
    await HostCreditTransaction.insertMany([
      { user: aravind._id, amount: -1, type: 'event_host', details: 'Hosted UNO Board Games' },
      { user: aravind._id, amount: -1, type: 'event_host', details: 'Hosted Acoustic Jam Session' }
    ]);

    // Vikram created Hackathon & Football events (-2 credits)
    vikram.hostCredits -= 2;
    await vikram.save();
    await HostCreditTransaction.insertMany([
      { user: vikram._id, amount: -1, type: 'event_host', details: 'Hosted Hack Night' },
      { user: vikram._id, amount: -1, type: 'event_host', details: 'Hosted Football Match' }
    ]);

    console.log('Seeding join requests...');
    await JoinRequest.insertMany([
      // UNO Requests
      { event: unoEvent._id, user: pooja._id, status: 'approved' },
      { event: unoEvent._id, user: vikram._id, status: 'approved' },
      
      // Hack Night Requests
      { event: hackEvent._id, user: aravind._id, status: 'approved' }, // Auto approved
      { event: hackEvent._id, user: pooja._id, status: 'approved' }, // Auto approved
      
      // Football Requests
      { event: footballEvent._id, user: aravind._id, status: 'approved' }
    ]);

    console.log('Seeding attendance sheets...');
    await Attendance.insertMany([
      { event: unoEvent._id, user: pooja._id, isPresent: true, markedBy: aravind._id },
      { event: unoEvent._id, user: vikram._id, isPresent: true, markedBy: aravind._id },
      { event: hackEvent._id, user: aravind._id, isPresent: false, markedBy: vikram._id },
      { event: hackEvent._id, user: pooja._id, isPresent: false, markedBy: vikram._id },
      { event: footballEvent._id, user: aravind._id, isPresent: false, markedBy: vikram._id }
    ]);

    console.log('Seeding organizer reviews...');
    await Review.create({
      organizer: vikram._id,
      reviewer: aravind._id,
      event: hackEvent._id,
      rating: 5,
      comment: 'Vikram is an amazing host! He arranged pizza and setup the workspace beautifully. 10/10 hack night.'
    });

    console.log('Database seeded successfully!');
    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
