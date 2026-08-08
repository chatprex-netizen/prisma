require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Conectando a base de datos...");
    const contact = await prisma.contact.findFirst({
      where: {
        firstName: { contains: "Elvis" },
        lastName: { contains: "Meza" }
      }
    });

    if (!contact) {
      console.log("Contacto no encontrado.");
      return;
    }

    console.log("Contacto encontrado:", contact.id, contact.firstName, contact.lastName);

    const user = await prisma.user.findFirst({
      where: {
        firstName: { contains: "Elvis" }
      }
    });

    if (!user) {
      console.log("Usuario 'Elvis Meza' no encontrado en el sistema.");
      return;
    }

    console.log("Usuario encontrado:", user.id, user.firstName, user.lastName);

    console.log("Intentando actualizar el contacto...");
    const updated = await prisma.contact.update({
      where: { id: contact.id },
      data: {
        assignedTo: user.id
      }
    });

    console.log("¡Contacto actualizado con éxito!", updated.assignedTo);
  } catch (error) {
    console.error("ERROR DE PRISMA:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
