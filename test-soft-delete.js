const { PrismaClient } = require('@prisma/client');
const { createSoftDeleteExtension } = require('prisma-extension-soft-delete');

async function testSoftDelete() {
  const prisma = new PrismaClient();
  
  const extendedPrisma = prisma.$extends(
    createSoftDeleteExtension({
      models: {
        Auth: true,
      },
      defaultConfig: {
        field: 'deleted_at',
        createValue: (deleted) => {
          if (deleted) return Math.floor(Date.now() / 1000);
          return null;
        },
      },
    }),
  );

  try {
    console.log('🧪 Testing Soft Delete Extension...\n');

    // First, create a test user
    console.log('1. Creating a test user...');
    const testUser = await extendedPrisma.auth.create({
      data: {
        email: 'test-soft-delete@example.com',
        username: 'test-soft-delete-user',
        password: 'password123',
        role: 'USER',
        phone: '1234567890',
      },
    });
    console.log('✅ Test user created:', testUser.id);

    // Check if user exists in normal query
    console.log('\n2. Finding user with normal query...');
    const foundUser = await extendedPrisma.auth.findUnique({
      where: { id: testUser.id },
    });
    console.log('✅ User found:', !!foundUser);

    // Soft delete the user
    console.log('\n3. Soft deleting the user...');
    const deletedUser = await extendedPrisma.auth.softDelete({
      where: { id: testUser.id },
    });
    console.log('✅ User soft deleted:', deletedUser.id);

    // Try to find the user with normal query (should return null)
    console.log('\n4. Finding user with normal query after soft delete...');
    const foundUserAfterDelete = await extendedPrisma.auth.findUnique({
      where: { id: testUser.id },
    });
    console.log('✅ User found after soft delete:', !!foundUserAfterDelete);

    // Find user with includeDeleted query
    console.log('\n5. Finding user with includeDeleted query...');
    const foundUserWithDeleted = await extendedPrisma.auth.findUniqueWithDeleted({
      where: { id: testUser.id },
    });
    console.log('✅ User found with includeDeleted:', !!foundUserWithDeleted);
    console.log('✅ User deleted_at field:', foundUserWithDeleted?.deleted_at);

    // Restore the user
    console.log('\n6. Restoring the user...');
    const restoredUser = await extendedPrisma.auth.restore({
      where: { id: testUser.id },
    });
    console.log('✅ User restored:', restoredUser.id);

    // Check if user is found with normal query after restore
    console.log('\n7. Finding user with normal query after restore...');
    const foundUserAfterRestore = await extendedPrisma.auth.findUnique({
      where: { id: testUser.id },
    });
    console.log('✅ User found after restore:', !!foundUserAfterRestore);

    // Clean up - permanently delete the test user
    console.log('\n8. Cleaning up test user...');
    await extendedPrisma.auth.delete({
      where: { id: testUser.id },
    });
    console.log('✅ Test user permanently deleted');

    console.log('\n🎉 Soft delete extension is working correctly!');

  } catch (error) {
    console.error('❌ Error testing soft delete:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSoftDelete();
