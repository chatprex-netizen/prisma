const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    const contact = await prisma.contact.create({
      data: {
        firstName: "Isela Meza",
        lastName: "",
        phone: "+519858789",
        email: "isemeza@gmail.com",
        type: "CLIENTE"
      }
    });
    console.log("Success:", contact);
  } catch (error) {
    console.error("Error details:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
