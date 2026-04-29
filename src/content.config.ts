import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
	loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/posts" }),
	schema: z.object({
		title: z.string(),
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

export const collections = { posts, products };
