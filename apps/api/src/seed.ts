import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando creación de datos semilla...');

  // 1. Crear un usuario administrador (Agente)
  const user = await prisma.user.upsert({
    where: { email: 'admin@propify.com' },
    update: {},
    create: {
      email: 'admin@propify.com',
      password: 'password123', // En un entorno real debe ir encriptada (bcrypt)
      firstName: 'Admin',
      lastName: 'Propify',
      role: 'ADMIN',
    },
  });
  console.log(`✅ Usuario creado: ${user.email}`);

  // 2. Crear un Desarrollador
  const developer = await prisma.developer.create({
    data: {
      name: 'Constructora XYZ',
      email: 'contacto@constructoraxyz.com',
    },
  });
  console.log(`✅ Desarrollador creado: ${developer.name}`);

  // 3. Crear un Proyecto Inmobiliario
  const project = await prisma.project.create({
    data: {
      name: 'Torre Marina',
      type: 'EDIFICIO_MULTIFAMILIAR',
      address: 'Av. Costanera 123',
      city: 'Lima',
      state: 'Lima',
      developerId: developer.id,
    },
  });
  console.log(`✅ Proyecto creado: ${project.name}`);

  // 4. Crear un Contacto (Lead de Prueba)
  const contact = await prisma.contact.create({
    data: {
      firstName: 'Juan',
      lastName: 'Pérez',
      email: 'juan.perez@example.com',
      phone: '+51999888777',
      type: 'CLIENTE',
      source: 'WEB',
      assignedTo: user.id,
    },
  });
  console.log(`✅ Contacto creado: ${contact.firstName} ${contact.lastName}`);

  console.log('✅ ¡Seed completado con éxito!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
