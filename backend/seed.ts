import User from './src/models/User';
import bcrypt from 'bcryptjs';
import sequelize from './src/config/db';

const createSampleUser = async () => {
  try {
    await sequelize.sync();
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const user = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN'
    });

    console.log('Sample Admin Created:');
    console.log('Email: admin@example.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
};

createSampleUser();
