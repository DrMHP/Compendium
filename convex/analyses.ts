import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

export const search = query({
  args: { searchQuery: v.string() },
  handler: async (ctx, args) => {
    const analyses = await ctx.db
      .query("analyses")
      .withSearchIndex("search", (q) => q.search("name", args.searchQuery))
      .take(10);
    return analyses;
  },
});

export const getById = query({
  args: { id: v.id("analyses") },
  handler: async (ctx, args) => {
    const analysis = await ctx.db.get(args.id);
    return analysis;
  },
});

export const getAllAnalyses = query({
  args: {},
  handler: async (ctx) => {
    const analyses = await ctx.db
      .query("analyses")
      .collect();
    return analyses;
  },
});

export const importAnalyses = mutation({
  args: {
    analyses: v.array(
      v.object({
        name: v.string(),
        laboratory: v.string(),
        sampleType: v.string(),
        device: v.string(),
        frequency: v.string(),
        tat: v.string(),
        units: v.string(),
        referenceValues: v.string(),
        stability: v.string(),
        inamiCode: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    for (const analysis of args.analyses) {
      await ctx.db.insert("analyses", analysis);
    }
  },
});
