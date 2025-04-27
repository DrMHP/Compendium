import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  analyses: defineTable({
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
  }).searchIndex("search", {
    searchField: "name",
    filterFields: ["laboratory"]
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
