import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  const razorpay = new Razorpay({
    key_id: process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    key_secret: process.env.RAZORPAY_KEY_SECRET || "placeholder_secret",
  });

  // Log Razorpay initialization status (without secrets)
  console.log("Razorpay Initialized with Key ID:", (process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder").substring(0, 8) + "...");

  // API Routes
  app.post("/api/create-order", async (req, res) => {
    try {
      const { amount, currency = "INR", receipt } = req.body;
      
      const keyId = process.env.VITE_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!keyId || !keySecret) {
        console.error("Razorpay Error: Missing Configuration", { 
          hasKeyId: !!keyId, 
          hasKeySecret: !!keySecret 
        });
        return res.status(500).json({ 
          error: "Razorpay configuration missing", 
          details: `Missing: ${!keyId ? 'Key ID' : ''} ${!keySecret ? 'Key Secret' : ''}`.trim()
        });
      }

      // Re-initialize if keys were missing at startup but are present now
      const rzp = new Razorpay({
        key_id: keyId,
        key_secret: keySecret,
      });

      const options = {
        amount: Math.round(amount * 100), // amount in the smallest currency unit (paise for INR)
        currency,
        receipt,
      };

      const order = await rzp.orders.create(options);
      res.json(order);
    } catch (error: any) {
      console.error("Razorpay Order Error Details:", JSON.stringify(error, null, 2));
      res.status(500).json({ 
        error: "Failed to create order", 
        details: error.description || error.message || "Unknown error"
      });
    }
  });

  app.post("/api/verify-payment", async (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

      const sign = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSign = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "placeholder_secret")
        .update(sign.toString())
        .digest("hex");

      if (razorpay_signature === expectedSign) {
        res.json({ status: "success", message: "Payment verified successfully" });
      } else {
        res.status(400).json({ status: "failure", message: "Invalid signature" });
      }
    } catch (error) {
      console.error("Payment Verification Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

  app.get("/api/billing", async (req, res) => {
    try {
      const githubToken = process.env.GITHUB_TOKEN;
      const vercelToken = process.env.VERCEL_TOKEN;
      const vercelTeamId = process.env.VERCEL_TEAM_ID;

      let githubData = {
        cost: "$0.00",
        usage: [
          { label: 'Actions Minutes', current: '0', limit: '3,000', percent: 0 },
          { label: 'Storage (LFS)', current: '0GB', limit: '10GB', percent: 0 },
          { label: 'Seats Used', current: '0', limit: '10', percent: 0 },
        ]
      };

      let vercelData = {
        cost: "$0.00",
        usage: [
          { label: 'Bandwidth', current: '0GB', limit: '1TB', percent: 0 },
          { label: 'Serverless Execution', current: '0GB-hrs', limit: '1000GB-hrs', percent: 0 },
          { label: 'Edge Middleware', current: '0', limit: '50M', percent: 0 },
        ]
      };

      // Fetch GitHub Data if token is present
      if (githubToken) {
        try {
          // Note: This requires a token with 'repo' or 'admin:org' scope depending on the account type
          const ghResponse = await fetch('https://api.github.com/user/billing/actions', {
            headers: { 'Authorization': `token ${githubToken}` }
          });
          if (ghResponse.ok) {
            const data: any = await ghResponse.json();
            githubData.usage[0].current = data.total_minutes_used.toString();
            githubData.usage[0].percent = (data.total_minutes_used / 3000) * 100;
            githubData.cost = `$${(data.total_paid_runs_cost || 0).toFixed(2)}`;
          }
        } catch (e) {
          console.error("GitHub Fetch Error:", e);
        }
      }

      // Fetch Vercel Data if token is present
      if (vercelToken) {
        try {
          const url = vercelTeamId 
            ? `https://api.vercel.com/v1/billing/usage?teamId=${vercelTeamId}`
            : `https://api.vercel.com/v1/billing/usage`;
          
          const vResponse = await fetch(url, {
            headers: { 'Authorization': `Bearer ${vercelToken}` }
          });
          if (vResponse.ok) {
            const data: any = await vResponse.json();
            // Map Vercel data to our structure
            // This is a simplified mapping as Vercel's API response is complex
            vercelData.cost = `$${(data.metrics?.bandwidth?.cost || 0).toFixed(2)}`;
            vercelData.usage[0].current = `${(data.metrics?.bandwidth?.value / (1024**3) || 0).toFixed(1)}GB`;
            vercelData.usage[0].percent = (data.metrics?.bandwidth?.value / (1024**4) || 0) * 100; // 1TB limit
          }
        } catch (e) {
          console.error("Vercel Fetch Error:", e);
        }
      }

      // If no tokens, return realistic mock data for demo purposes
      if (!githubToken && !vercelToken) {
        return res.json({
          firebase: {
            cost: "$42.20",
            usage: [
              { label: 'Firestore Reads', current: '1.2M', limit: '5M', percent: 24 },
              { label: 'Firestore Writes', current: '450K', limit: '1M', percent: 45 },
              { label: 'Cloud Functions', current: '85K', limit: '2M', percent: 4 },
              { label: 'Storage', current: '12GB', limit: '50GB', percent: 24 },
            ]
          },
          github: {
            cost: "$40.00",
            usage: [
              { label: 'Actions Minutes', current: '1,200', limit: '3,000', percent: 40 },
              { label: 'Storage (LFS)', current: '4.2GB', limit: '10GB', percent: 42 },
              { label: 'Seats Used', current: '5', limit: '10', percent: 50 },
            ]
          },
          vercel: {
            cost: "$60.30",
            usage: [
              { label: 'Bandwidth', current: '45GB', limit: '1TB', percent: 4.5 },
              { label: 'Serverless Execution', current: '120GB-hrs', limit: '1000GB-hrs', percent: 12 },
              { label: 'Edge Middleware', current: '1.2M', limit: '50M', percent: 2.4 },
            ]
          },
          totalCost: "$142.50",
          activeSubscriptions: 24,
          projectedMonthly: "$185.00"
        });
      }

      const billingData = {
        firebase: {
          cost: "$42.20",
          usage: [
            { label: 'Firestore Reads', current: '1.2M', limit: '5M', percent: 24 },
            { label: 'Firestore Writes', current: '450K', limit: '1M', percent: 45 },
            { label: 'Cloud Functions', current: '85K', limit: '2M', percent: 4 },
            { label: 'Storage', current: '12GB', limit: '50GB', percent: 24 },
          ]
        },
        github: githubData,
        vercel: vercelData,
        totalCost: `$${(42.20 + parseFloat(githubData.cost.replace('$','')) + parseFloat(vercelData.cost.replace('$',''))).toFixed(2)}`,
        activeSubscriptions: 24,
        projectedMonthly: "$185.00"
      };

      res.json(billingData);
    } catch (error) {
      console.error("Billing Data Error:", error);
      res.status(500).json({ error: "Failed to fetch billing data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
