import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders'; // Nouveau : import du loader glob

const posts = defineCollection({
	// Nouveau : utilisation du loader pour charger les fichiers markdown
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
	schema: z.object({
		title: z.string(),
	}),
});

export const collections = { posts };
