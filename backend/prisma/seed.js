const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data (in reverse order of dependencies)
  console.log('🗑️  Clearing existing data...');
  await prisma.auditLog.deleteMany();
  await prisma.task.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Hash passwords
  const superAdminPassword = await bcrypt.hash('Admin@123', 10);
  const demoAdminPassword = await bcrypt.hash('Demo@123', 10);
  const userPassword = await bcrypt.hash('User@123', 10);

  // 1. Create Super Admin (tenantId = null)
  console.log('👤 Creating Super Admin...');
  const superAdmin = await prisma.user.create({
    data: {
      email: 'superadmin@system.com',
      passwordHash: superAdminPassword,
      fullName: 'Super Admin',
      role: 'super_admin',
      tenantId: null, // Super admin doesn't belong to any tenant
    },
  });
  console.log(`✅ Super Admin created: ${superAdmin.email}`);

  // 2. Create Demo Tenant
  console.log('🏢 Creating Demo Tenant...');
  const demoTenant = await prisma.tenant.create({
    data: {
      name: 'Demo Company',
      subdomain: 'demo',
      status: 'active',
      subscriptionPlan: 'pro',
      maxUsers: 25,
      maxProjects: 15,
    },
  });
  console.log(`✅ Tenant created: ${demoTenant.name} (${demoTenant.subdomain})`);

  // 3. Create Tenant Admin for Demo Company
  console.log('👤 Creating Tenant Admin...');
  const tenantAdmin = await prisma.user.create({
    data: {
      tenantId: demoTenant.id,
      email: 'admin@demo.com',
      passwordHash: demoAdminPassword,
      fullName: 'Demo Admin',
      role: 'tenant_admin',
    },
  });
  console.log(`✅ Tenant Admin created: ${tenantAdmin.email}`);

  // 4. Create 2 Regular Users for Demo Company
  console.log('👥 Creating Regular Users...');
  const user1 = await prisma.user.create({
    data: {
      tenantId: demoTenant.id,
      email: 'user1@demo.com',
      passwordHash: userPassword,
      fullName: 'John Doe',
      role: 'user',
    },
  });
  console.log(`✅ User created: ${user1.email}`);

  const user2 = await prisma.user.create({
    data: {
      tenantId: demoTenant.id,
      email: 'user2@demo.com',
      passwordHash: userPassword,
      fullName: 'Jane Smith',
      role: 'user',
    },
  });
  console.log(`✅ User created: ${user2.email}`);

  // 5. Create 2 Sample Projects
  console.log('📁 Creating Projects...');
  const project1 = await prisma.project.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Website Redesign',
      description: 'Complete redesign of company website with modern UI/UX',
      status: 'active',
      createdBy: tenantAdmin.id,
    },
  });
  console.log(`✅ Project created: ${project1.name}`);

  const project2 = await prisma.project.create({
    data: {
      tenantId: demoTenant.id,
      name: 'Mobile App Development',
      description: 'Build native mobile applications for iOS and Android',
      status: 'active',
      createdBy: tenantAdmin.id,
    },
  });
  console.log(`✅ Project created: ${project2.name}`);

  // 6. Create 5 Sample Tasks
  console.log('✅ Creating Tasks...');
  const task1 = await prisma.task.create({
    data: {
      projectId: project1.id,
      tenantId: demoTenant.id,
      title: 'Design homepage mockup',
      description: 'Create high-fidelity mockup for the new homepage',
      status: 'in_progress',
      priority: 'high',
      assignedTo: user1.id,
      dueDate: new Date('2024-07-15'),
    },
  });
  console.log(`✅ Task created: ${task1.title}`);

  const task2 = await prisma.task.create({
    data: {
      projectId: project1.id,
      tenantId: demoTenant.id,
      title: 'Implement responsive navigation',
      description: 'Build mobile-responsive navigation menu',
      status: 'todo',
      priority: 'medium',
      assignedTo: user2.id,
      dueDate: new Date('2024-07-20'),
    },
  });
  console.log(`✅ Task created: ${task2.title}`);

  const task3 = await prisma.task.create({
    data: {
      projectId: project1.id,
      tenantId: demoTenant.id,
      title: 'SEO optimization',
      description: 'Optimize website for search engines',
      status: 'todo',
      priority: 'low',
      assignedTo: null,
      dueDate: new Date('2024-08-01'),
    },
  });
  console.log(`✅ Task created: ${task3.title}`);

  const task4 = await prisma.task.create({
    data: {
      projectId: project2.id,
      tenantId: demoTenant.id,
      title: 'Setup React Native project',
      description: 'Initialize React Native project with required dependencies',
      status: 'completed',
      priority: 'high',
      assignedTo: user1.id,
      dueDate: new Date('2024-06-30'),
    },
  });
  console.log(`✅ Task created: ${task4.title}`);

  const task5 = await prisma.task.create({
    data: {
      projectId: project2.id,
      tenantId: demoTenant.id,
      title: 'Implement user authentication',
      description: 'Add login and registration screens with JWT authentication',
      status: 'in_progress',
      priority: 'high',
      assignedTo: user2.id,
      dueDate: new Date('2024-07-10'),
    },
  });
  console.log(`✅ Task created: ${task5.title}`);

  console.log('\n✨ Seed completed successfully!\n');
  console.log('📝 Login credentials:');
  console.log('─────────────────────────────────────');
  console.log('Super Admin:');
  console.log('  Email: superadmin@system.com');
  console.log('  Password: Admin@123');
  console.log('');
  console.log('Demo Company (subdomain: demo):');
  console.log('  Admin: admin@demo.com / Demo@123');
  console.log('  User1: user1@demo.com / User@123');
  console.log('  User2: user2@demo.com / User@123');
  console.log('─────────────────────────────────────\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
