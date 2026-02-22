import { db } from "./db";
import { users, projects } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const SEED_PROJECTS = [
  { title: "Uitbreiding jaren 30 woning in Bennekom", category: "wonen", image: "/images/wonen/project-1.jpg", sortOrder: 1 },
  { title: "Nieuwbouw woning en B&B met bijgebouw Voorthuizen", category: "wonen", image: "/images/wonen/project-2.jpg", sortOrder: 2 },
  { title: "Jaren 50 woning uitbreiden en verduurzamen in Ede", category: "wonen", image: "/images/wonen/project-3.jpg", sortOrder: 3 },
  { title: "Verbouwing en uitbreiding woning met bijgebouw Voorthuizen", category: "wonen", image: "/images/wonen/project-4.jpg", sortOrder: 4 },
  { title: "Verbouwing en uitbreiding woning Otterlo", category: "wonen", image: "/images/wonen/project-5.jpg", sortOrder: 5 },
  { title: "Nieuwbouw woning en schuur Baron van Nagellstraat Voorthuizen", category: "wonen", image: "/images/wonen/project-6.jpg", sortOrder: 6 },
  { title: "Nieuwbouw bosvilla Muiderbos Almere", category: "wonen", image: "/images/wonen/project-7.jpg", sortOrder: 7 },
  { title: "Nieuwbouw woning met bijgebouw Hessenweg Lunteren", category: "wonen", image: "/images/wonen/project-8.jpg", sortOrder: 8 },
  { title: "Verbouwing woning Bennekom", category: "wonen", image: "/images/wonen/project-9.jpg", sortOrder: 9 },
  { title: "Uitbreiding bungalow Voorthuizen", category: "wonen", image: "/images/wonen/project-10.jpg", sortOrder: 10 },
  { title: "Uitbreiding jaren 30 woning Heuvelsepad Ede", category: "wonen", image: "/images/wonen/project-11.jpg", sortOrder: 11 },
  { title: "Verbouw woning en schuren Rijksweg Voorthuizen", category: "wonen", image: "/images/wonen/project-12.jpg", sortOrder: 12 },
  { title: "Uitbreiding 2-1 kapwoning Dalerveen Ede", category: "wonen", image: "/images/wonen/project-13.jpg", sortOrder: 13 },
  { title: "Nieuwbouw 20 woningen Oosterwold", category: "wonen", image: "/images/wonen/project-14.jpg", sortOrder: 14 },
  { title: "Uitbreiding jaren 30 woning Ede", category: "wonen", image: "/images/wonen/project-15.jpg", sortOrder: 15 },
  { title: "Nieuwbouw woning Lunteren", category: "wonen", image: "/images/wonen/project-16.jpg", sortOrder: 16 },
  { title: "Herbestemming kazerneterrein Ede", category: "wonen", image: "/images/wonen/project-17.jpg", sortOrder: 17 },
  { title: "Uitbreiding Gevangenismuseum Veenhuizen", category: "wonen", image: "/images/wonen/project-18.jpg", sortOrder: 18 },
  { title: "Verduurzamen wijk Arnhem", category: "wonen", image: "/images/wonen/project-19.jpg", sortOrder: 19 },
  { title: "Nieuwbouw bedrijfsruimte in Barneveld", category: "werken", image: "/images/werken/project-1.jpg", sortOrder: 1 },
  { title: "Restauratie en uitbreiding winkel in Wageningen", category: "werken", image: "/images/werken/project-2.jpg", sortOrder: 2 },
  { title: "Verbouw en uitbreiding winkelpand in Barneveld", category: "werken", image: "/images/werken/project-3.jpg", sortOrder: 3 },
  { title: "Nieuwbouw kantoor met bedrijfsruimte Wekerom", category: "werken", image: "/images/werken/project-4.jpg", sortOrder: 4 },
  { title: "Nieuwbouw bedrijfsruimte Wekerom", category: "werken", image: "/images/werken/project-5.jpg", sortOrder: 5 },
  { title: "Cultuurcluster Arnhem", category: "werken", image: "/images/werken/project-6.jpg", sortOrder: 6 },
  { title: "Ontwerp wijzigingen exterieur & interieur jaren 30 woning Laren", category: "interieur", image: "/images/interieur/project-1.jpg", sortOrder: 1 },
  { title: "Uitbreiding en interieur ontwerp woning Ede", category: "interieur", image: "/images/interieur/project-2.jpg", sortOrder: 2 },
  { title: "Interieur woning Ede", category: "interieur", image: "/images/interieur/project-3.jpg", sortOrder: 3 },
  { title: "Woning voor mensen met zeer beperkt zicht", category: "interieur", image: "/images/interieur/project-4.jpg", sortOrder: 4 },
];

export async function seed() {
  const existingAdmin = await db.select().from(users).where(eq(users.username, "info@heerikhuize.nl"));
  if (existingAdmin.length === 0) {
    const hash = await bcrypt.hash("LogMijIn2026!!!", 10);
    await db.insert(users).values({ username: "info@heerikhuize.nl", password: hash });
    console.log("Admin user seeded");
  }

  const existingProjects = await db.select().from(projects);
  if (existingProjects.length === 0) {
    await db.insert(projects).values(SEED_PROJECTS);
    console.log("Projects seeded:", SEED_PROJECTS.length);
  }
}
