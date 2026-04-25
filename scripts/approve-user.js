const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/urcompetition';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: String,
    role: String,
    approved: Boolean,
  },
  { collection: 'users', timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function approve(email) {
  await mongoose.connect(MONGODB_URI, { bufferCommands: false });
  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase().trim() },
    { approved: true },
    { new: true }
  );

  if (!user) {
    console.error(`User not found: ${email}`);
    process.exit(1);
  }

  console.log(`Approved user: ${user.email} (role=${user.role}, approved=${user.approved})`);
  await mongoose.disconnect();
}

approve(process.argv[2] || 'admin@UR.com').catch((err) => {
  console.error(err);
  process.exit(1);
});
