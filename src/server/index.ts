import express from "express";
import { exec } from "child_process";
import cors from "cors";
import type { Request, Response } from "express";

const app = express();

// More permissive CORS configuration for testing
app.use(
  cors({
    origin: true, // Allow all origins for testing
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
    credentials: true,
  })
);

app.use(express.json());

interface HardhatRequest {
  tokenId: number;
}

// Updated route handler with proper type annotations
app.post(
  "/execute-hardhat",
  (req: Request<{}, {}, HardhatRequest>, res: Response) => {
    const { tokenId } = req.body;

    // Use current directory instead of hardcoded path
    const command = `npx hardhat run scripts/deploy-avalanche.js --network avalancheFuji`;

    console.log(`Executing: ${command}`);

    exec(
      command,
      { cwd: process.cwd() },
      (error: Error | null, stdout: string, stderr: string) => {
        if (error) {
          console.error(`Error: ${error}`);
          return res.status(500).json({
            status: "failed",
            output: stderr,
            error: error.message,
          });
        }
        console.log(`Success: ${stdout}`);
        res.json({ status: "success", output: stdout });
      }
    );
  }
);

// Add a health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Add an endpoint to get wallet balance
app.post(
  "/wallet-balance",
  (req: Request<{}, {}, { address: string }>, res: Response) => {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: "Address is required" });
    }

    // This is a placeholder - in production you'd check actual balance
    res.json({
      address,
      balance: "1.5", // AVAX
      network: "avalanche-fuji",
      timestamp: new Date().toISOString(),
    });
  }
);

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("CORS enabled for all origins");
});
