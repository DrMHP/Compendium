{`
"use node";
import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

const resend = new Resend(process.env.CONVEX_RESEND_API_KEY);

export const sendContact = action({
  args: {
    name: v.string(),
    email: v.string(),
    message: v.string(),
    captcha: v.string(),
  },
  handler: async (ctx, args) => {
    // Simple anti-spam
    if (args.captcha !== "BELGIQUE") throw new Error("Captcha incorrect");
    const html = \`
      <h2>Contact via Compendium d'analyses</h2>
      <p><b>Nom:</b> \${args.name}</p>
      <p><b>Email:</b> \${args.email}</p>
      <p><b>Message:</b><br/>\${args.message.replace(/\\n/g, "<br/>")}</p>
    \`;
    const { error } = await resend.emails.send({
      from: "Compendium <noreply@compendium-lab.be>",
      to: "assistanatcours@gmail.com",
      subject: "Contact via Compendium d'analyses",
      html,
    });
    if (error) throw new Error("Erreur d'envoi d'email");
    return null;
  },
});

export const sendSuggestion = action({
  args: {
    name: v.string(),
    laboratory: v.string(),
    sampleType: v.optional(v.string()),
    device: v.optional(v.string()),
    frequency: v.optional(v.string()),
    tat: v.optional(v.string()),
    units: v.optional(v.string()),
    referenceValues: v.optional(v.string()),
    stability: v.optional(v.string()),
    inamiCode: v.optional(v.string()),
    email: v.optional(v.string()),
    captcha: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.captcha !== "BELGIQUE") throw new Error("Captcha incorrect");
    const html = \`
      <h2>Suggestion d'analyse</h2>
      <p><b>Nom:</b> \${args.name}</p>
      <p><b>Laboratoire:</b> \${args.laboratory}</p>
      <p><b>Type d'échantillon:</b> \${args.sampleType || "-"}</p>
      <p><b>Appareil:</b> \${args.device || "-"}</p>
      <p><b>Fréquence:</b> \${args.frequency || "-"}</p>
      <p><b>TAT:</b> \${args.tat || "-"}</p>
      <p><b>Unités:</b> \${args.units || "-"}</p>
      <p><b>Valeurs de référence:</b> \${args.referenceValues || "-"}</p>
      <p><b>Stabilité:</b> \${args.stability || "-"}</p>
      <p><b>Code INAMI:</b> \${args.inamiCode || "-"}</p>
      <p><b>Email de l'utilisateur:</b> \${args.email || "-"}</p>
    \`;
    const { error } = await resend.emails.send({
      from: "Compendium <noreply@compendium-lab.be>",
      to: "assistanatcours@gmail.com",
      subject: "Suggestion d'analyse",
      html,
    });
    if (error) throw new Error("Erreur d'envoi d'email");
    return null;
  },
});
`}
