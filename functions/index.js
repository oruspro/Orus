/* eslint-disable */
// ==================================================================
// VERSION FINALE SÉCURISÉE
// Ce code vérifie la signature du Webhook pour garantir l'authenticité
// des paiements.
// ==================================================================

const { onCall, HttpsError, onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");

admin.initializeApp();

// DÉFINITION DES SECRETS
// Ces deux clés doivent exister dans Google Secret Manager
const stripeSecretKey = defineSecret("STRIPE_SECRET");
const stripeWebhookKey = defineSecret("STRIPE_WEBHOOK"); // ✅ Décommenté

/**
 * 1. Création de session Stripe (API v2)
 */
exports.createStripeCheckoutSession = onCall(
  { 
    secrets: [stripeSecretKey], 
    maxInstances: 10,
    cors: true 
  },
  async (request) => {
    const stripeKey = stripeSecretKey.value();
    if (!stripeKey) {
      console.error("❌ ERREUR : Clé STRIPE_SECRET manquante.");
      throw new HttpsError("internal", "Erreur configuration.");
    }
    
    const stripe = require("stripe")(stripeKey);
    const auth = request.auth;

    if (!auth) {
      throw new HttpsError("unauthenticated", "Connexion requise.");
    }

    const userId = auth.uid;
    const userEmail = auth.token.email;
    const baseUrl = "https://orus-mind.com"; 

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        success_url: `${baseUrl}/offres?success=true`,
        cancel_url: `${baseUrl}/offres`,
        customer_email: userEmail,
        line_items: [
          {
            price_data: {
              currency: "eur",
              product_data: {
                name: "Orus+ Membre Fondateur",
                description: "Accès illimité à vie (Classé, Versus, Stats).",
              },
              unit_amount: 1990, // 19.90€
            },
            quantity: 1,
          },
        ],
        metadata: { 
          userId: userId,
          type: "premium_lifetime"
        },
      });

      return { url: session.url };

    } catch (error) {
      console.error("❌ Erreur Stripe:", error);
      throw new HttpsError("internal", "Erreur paiement.");
    }
  }
);

/**
 * 2. Webhook Stripe (API v2) - SÉCURISÉ
 */
exports.stripeWebhook = onRequest(
  { 
    // ✅ On injecte les deux secrets ici
    secrets: [stripeSecretKey, stripeWebhookKey],
    maxInstances: 10,
    cors: true
  },
  async (req, res) => {
    const stripeKey = stripeSecretKey.value();
    const webhookKey = stripeWebhookKey.value(); // ✅ On récupère la clé webhook

    if (!stripeKey || !webhookKey) {
      console.error("❌ Erreur Config : Clés Stripe manquantes.");
      return res.status(500).send("Configuration Error");
    }

    const stripe = require("stripe")(stripeKey);
    const sig = req.headers["stripe-signature"];

    let event;

    try {
      // ✅ VÉRIFICATION STRICTE DE LA SIGNATURE
      // Si la signature ne correspond pas à webhookKey, cela échoue ici.
      // C'est ce qui sécurise votre système.
      event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookKey);
    } catch (err) {
      console.error(`❌ Signature Invalide : ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Si on arrive ici, l'événement vient bien de Stripe
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata.userId;

      if (userId) {
        console.log(`💰 Paiement validé pour ${userId}.`);
        try {
          await admin.firestore()
            .collection("artifacts").doc("orus-prod")
            .collection("users").doc(userId)
            .collection("profile").doc("main")
            .set({
              isPremium: true,
              premiumSince: admin.firestore.FieldValue.serverTimestamp(),
              planType: "founder_lifetime"
            }, { merge: true });
            
           console.log(`✅ Premium activé : ${userId}`);
        } catch (dbError) {
          console.error("❌ Erreur Firestore:", dbError);
          return res.status(500).send("Database Error");
        }
      }
    }

    res.json({ received: true });
  }
);