const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const contacts = await prisma.contact.findMany({ select: { id: true, firstName: true } });
    const properties = await prisma.property.findMany({ select: { id: true, unitCode: true } });
    const users = await prisma.user.findMany({ select: { id: true, firstName: true } });

    console.log("Contacts count:", contacts.length);
    console.log("Properties count:", properties.length);
    console.log("Users count:", users.length);
    
    console.log("Contacts IDs:", contacts.map(c => `${c.firstName} (${c.id})`));
    console.log("Properties IDs:", properties.map(p => `${p.unitCode} (${p.id})`));
    console.log("Users IDs:", users.map(u => `${u.firstName} (${u.id})`));
  } catch (error) {
    console.error("Database connection error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
