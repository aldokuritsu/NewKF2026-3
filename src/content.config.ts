import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
	schema: z.object({
		title: z.string(),
		date: z.string().optional(),
		description: z.string().optional(),
		image: z.string().optional(),
		imageAlt: z.string().optional(),
		author: z.string().default('Équipe Kontfeel'),
		// Slug de catégorie blog (cf. src/data/blog-categories.json) :
		// experience-shopper | guide-plv | graphisme-plv | plv-durable-et-rse
		// | salons | conseils-et-astuces-plv
		category: z.string().optional(),
		tags: z.array(z.string()).optional(),
		relatedRealisation: z.string().optional(),
		relatedLinks: z.array(z.object({
			label: z.string(),
			href: z.string(),
		})).optional(),
		tldr: z.object({
			before: z.string(),
			linkLabel: z.string(),
			linkHref: z.string(),
			after: z.string().optional(),
		}).optional(),
	}),
});

const realisations = defineCollection({
	loader: glob({ pattern: "*.json", base: "./src/content/realisations" }),
	schema: z.object({
		title: z.string(),
		client: z.string(),
		sector: z.string(),
		// Catégorie d'affichage (= filtres de /realisations-plv/) :
		// "PLV 3D" | "PLV de comptoir" | "PLV de sol" | "Événementielle"
		// | "ILV" | "Signalétique" | "Théâtralisation"
		category: z.string().optional(),
		// Ordre éditorial (asc) repris du site live ; absent ou 9999 → en queue
		order: z.number().optional(),
		// `date` retiré du modèle : non porté par la source xlsx (placeholder
		// arbitraire) — on s'aligne désormais sur `order` pour le tri.
		date: z.string().optional(),
		description: z.string(),
		challenge: z.string(),
		solution: z.string(),
		results: z.array(z.object({
			value: z.string(),
			label: z.string(),
		})),
		image: z.string(),
		imageAlt: z.string().optional(),
		quote: z.object({
			text: z.string(),
			author: z.string(),
			role: z.string(),
		}).optional(),
		relatedPost: z.string().optional(),
		relatedLinks: z.array(z.object({
			label: z.string(),
			href: z.string(),
		})).optional(),
		tldr: z.object({
			before: z.string(),
			linkLabel: z.string(),
			linkHref: z.string(),
			after: z.string().optional(),
		}).optional(),
		// Corps éditorial complet (migré depuis le site live) — système de blocs,
		// rendu via BlockRenderer. Si présent, remplace l'affichage challenge/solution.
		blocks: z.array(z.any()).optional(),
		active: z.boolean().default(true),
	}),
});

const products = defineCollection({
	loader: glob({ pattern: "*.json", base: "./src/content/products" }),
	schema: z.object({
		name: z.string(),
		shortDescription: z.string(),
		description: z.string(),
		price: z.number().positive(),
		currency: z.enum(['eur', 'usd', 'gbp', 'chf']).default('eur'),
		image: z.string(),
		imageAlt: z.string().optional(),
		specs: z.array(z.object({
			label: z.string(),
			value: z.string(),
		})).optional(),
		variants: z.array(z.object({
			id: z.string(),
			label: z.string(),
			price: z.number().positive(),
			default: z.boolean().optional(),
		})).optional(),
		options: z.array(z.object({
			id: z.string(),
			label: z.string(),
			price: z.number().nonnegative(),
		})).optional(),
		shippingCountries: z.array(z.string()).default(['FR', 'BE', 'CH', 'LU']),
		active: z.boolean().default(true),
	}),
});

export const collections = { posts, realisations, products };
