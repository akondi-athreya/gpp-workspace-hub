const { prisma } = require('../db/client');
const { hashPassword, comparePassword } = require('../utils/crypto');
const { signToken } = require('../utils/jwt');

/**
 * Register a new tenant with admin user in a transaction
 */
const registerTenant = async ({ tenantName, subdomain, adminEmail, adminPassword, adminFullName }) => {
  // Check if subdomain already exists
  const existingTenant = await prisma.tenant.findUnique({
    where: { subdomain },
  });

  if (existingTenant) {
    const error = new Error('Subdomain already exists');
    error.statusCode = 409;
    throw error;
  }



  // Hash password
  const passwordHash = await hashPassword(adminPassword);

  // Create tenant and admin user in a transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create tenant with default free plan
    const tenant = await tx.tenant.create({
      data: {
        name: tenantName,
        subdomain,
        status: 'active',
        subscriptionPlan: 'free',
        maxUsers: 5,
        maxProjects: 3,
      },
    });

    // Create admin user
    const adminUser = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email: adminEmail,
        passwordHash,
        fullName: adminFullName,
        role: 'tenant_admin',
        isActive: true,
      },
    });

    return { tenant, adminUser };
  });

  return {
    tenantId: result.tenant.id,
    subdomain: result.tenant.subdomain,
    adminUser: {
      id: result.adminUser.id,
      email: result.adminUser.email,
      fullName: result.adminUser.fullName,
      role: result.adminUser.role,
    },
  };
};

/**
 * Login user with email, password, and tenant subdomain
 */
const login = async ({ email, password, tenantSubdomain }) => {
  // Find tenant by subdomain (except for super_admin)
  let tenant = null;
  let user = null;

  if (tenantSubdomain) {
    tenant = await prisma.tenant.findUnique({
      where: { subdomain: tenantSubdomain },
    });

    if (!tenant) {
      const error = new Error('Tenant not found');
      error.statusCode = 404;
      throw error;
    }

    // Check if tenant is active
    if (tenant.status !== 'active') {
      const error = new Error('Tenant account is suspended or inactive');
      error.statusCode = 403;
      throw error;
    }

    // Find user belonging to this tenant
    user = await prisma.user.findFirst({
      where: {
        email,
        tenantId: tenant.id,
      },
    });
  } else {
    // Try to find super_admin (tenantId is null)
    user = await prisma.user.findFirst({
      where: {
        email,
        tenantId: null,
        role: 'super_admin',
      },
    });
  }

  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Check if user is active
  if (!user.isActive) {
    const error = new Error('Account is inactive');
    error.statusCode = 403;
    throw error;
  }

  // Verify password
  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  // Generate JWT token
  const token = signToken({
    userId: user.id,
    tenantId: user.tenantId,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      tenantId: user.tenantId,
    },
    token,
    expiresIn: 86400, // 24 hours in seconds
  };
};

/**
 * Get current authenticated user with tenant info
 */
const getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tenant: true,
    },
  });

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    isActive: user.isActive,
    tenant: user.tenant ? {
      id: user.tenant.id,
      name: user.tenant.name,
      subdomain: user.tenant.subdomain,
      subscriptionPlan: user.tenant.subscriptionPlan,
      maxUsers: user.tenant.maxUsers,
      maxProjects: user.tenant.maxProjects,
    } : null,
  };
};

module.exports = {
  registerTenant,
  login,
  getCurrentUser,
};
