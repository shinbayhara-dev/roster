import bcrypt from 'bcryptjs';

async function generateHash() {
    const hash = await bcrypt.hash('123456', 10);
    console.log(`Hash for 123456: ${hash}`);
}

generateHash();
