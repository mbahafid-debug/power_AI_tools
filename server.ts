import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";

dotenv.config();

// Verify API Key initialization with diagnostic logging
const rawGeminiKey = process.env.GEMINI_API_KEY || "";
if (rawGeminiKey) {
  console.log(`[BOOT] GEMINI_API_KEY detected during booting. First 4 characters: "${rawGeminiKey.substring(0, 4)}"`);
} else {
  console.log("[BOOT] Warning: GEMINI_API_KEY is not defined in environment variables. Gemini calls will gracefully fallback to the Heuristic/Basic Text Generator.");
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize tools JSON database path
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "tools.json");

// Ensure data folder and file exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), "utf-8");
}

// Read database
function readTools() {
  try {
    const data = fs.readFileSync(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Database read error, returning empty list:", error);
    return [];
  }
}

// Write database
function writeTools(tools: any[]) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tools, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Database write error:", error);
    return false;
  }
}

// Scrape helper on standard web URL
async function scrapeUrlMeta(urlString: string) {
  try {
    const res = await fetch(urlString, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.statusText}`);
    }
    const html = await res.text();
    
    // Meta title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : "";
    
    // Meta og:image
    const ogImageMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i) ||
                         html.match(/<meta\s+content=["'](.*?)["']\s+property=["']og:image["']/i);
    const ogImage = ogImageMatch ? ogImageMatch[1].trim() : "";
    
    // Meta og:description/description
    const ogDescMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) ||
                        html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i) ||
                        html.match(/<meta\s+content=["'](.*?)["']\s+property=["']og:description["']/i) ||
                        html.match(/<meta\s+content=["'](.*?)["']\s+name=["']description["']/i);
    const ogDescription = ogDescMatch ? ogDescMatch[1].trim() : "";

    // Parse simple body text for analysis context
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    let bodyText = bodyMatch ? bodyMatch[1] : html;
    bodyText = bodyText.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
    bodyText = bodyText.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
    bodyText = bodyText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    bodyText = bodyText.slice(0, 4000); // cut off to avoid overly long payloads

    return { title, ogImage, ogDescription, bodyText };
  } catch (e) {
    console.warn("Raw webpage fetching failed, using fallback:", (e as Error).message);
    return { title: "", ogImage: "", ogDescription: "", bodyText: "" };
  }
}

// Category fallback Unsplash backgrounds
const categoryBGImages: Record<string, string> = {
  "LLMs & Chatbots": "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80",
  "Development & Coding": "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?auto=format&fit=crop&w=800&q=80",
  "Design & Graphics": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
  "Productivity & Research": "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
  "Audio & Speech": "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=800&q=80",
  "Creative Tools": "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80"
};

// ==========================================
// REGISTER ALL API ROUTE HANDLERS
// ==========================================

// GET ALL TOOLS
app.get("/api/tools", (req, res) => {
  const tools = readTools();
  res.json(tools);
});

// INCREMENT TOOL CLICK COUNTER
app.post("/api/tools/:id/click", (req, res) => {
  const { id } = req.params;
  const tools = readTools();
  const toolIndex = tools.findIndex((t: any) => t.id === id);
  if (toolIndex > -1) {
    tools[toolIndex].clicks = (tools[toolIndex].clicks || 0) + 1;
    writeTools(tools);
    res.json({ success: true, clicks: tools[toolIndex].clicks });
  } else {
    res.status(404).json({ success: false, error: "Tool not found" });
  }
});

// SCRAPE & ANALYZE ACTION (POWERED BY GEMINI 3.5 FLASH WITH HIGH-FIDELITY HEURISTIC FALLBACKS)
app.post("/api/tools/scrape", async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: "URL path parameter is required." });
  }

  try {
    // 1. Pre-scrape with simple Fetch
    const scrapeData = await scrapeUrlMeta(url);
    
    // Initialize parsed data placeholders
    let parsedData: any = null;
    let fallbackTriggered = false;
    let fallbackReason = "";

    try {
      // 2. Initialize Gemini client inside the try-catch to absorb any initialization/API/auth throws cleanly
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY environment variable is not configured. Falling back to Heuristic Generator.");
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });

      const systemPrompt = `You are an expert tech curator and software analyzer assistant.
Your job is to analyze the provided URL and optional parsed content, and return a structured JSON synthesis explaining what the tool is and its properties.
Always use standard human-friendly terminology. Keep details completely professional and truthful. No marketing hype.
Categories MUST be strictly one of: 'LLMs & Chatbots', 'Development & Coding', 'Design & Graphics', 'Productivity & Research', 'Audio & Speech', 'Creative Tools'.`;

      const userPromptContent = `Please analyze this tool info strictly using the provided scraper text context:
URL: ${url}
Extracted Meta Title: ${scrapeData.title || "N/A"}
Extracted Meta Description: ${scrapeData.ogDescription || "N/A"}
Extracted Web Text Preview: ${scrapeData.bodyText || "N/A"}

Return a structured JSON output mapped to the following schema:`;

      // Call Gemini Flash with structured output and NO search grounding configurations (clean and free-tier compliant)
      const geminiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          { text: systemPrompt },
          { text: userPromptContent }
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "Official display name of the tool, capitalized properly." },
              category: { 
                type: Type.STRING, 
                description: "Must be exactly one of: 'LLMs & Chatbots', 'Development & Coding', 'Design & Graphics', 'Productivity & Research', 'Audio & Speech', 'Creative Tools'."
              },
              microSummary: { type: Type.STRING, description: "A high-impact micro-summary explaining what the tool is in less than 50 words." },
              description: { type: Type.STRING, description: "A comprehensive description of the tool (2-3 detailed sentences)." },
              features: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of exactly 3 or 4 high-value key features or capability details of the tool."
              },
              solvedProblems: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "List of 2 or 3 common issues or workflows resolved by this tool."
              },
              systemRequirements: { type: Type.STRING, description: "Estimated system requirements (e.g., 'Web Browser', 'Mac/Windows/Linux', 'API integration required')." },
              suggestedImageKeyword: { type: Type.STRING, description: "Single-word keyword suited for image visualizer (e.g., 'robot', 'code', 'waves', 'design')." }
            },
            required: ["name", "category", "microSummary", "description", "features", "solvedProblems", "systemRequirements", "suggestedImageKeyword"]
          }
        }
      });
      parsedData = JSON.parse(geminiResponse.text?.trim() || "{}");
    } catch (apiError: any) {
      console.warn("Gemini Engine / Authentication bypass triggered. Gracefully executing Heuristic Text Generator. Error details:", apiError.message);
      fallbackTriggered = true;
      fallbackReason = apiError.message || "403 / 429 API Limitation or Denied Access Detected";

      // Match categories using keyword analysis on the scraped payload
      const analysisSpace = ((scrapeData.title || "") + " " + (scrapeData.ogDescription || "") + " " + (scrapeData.bodyText || "")).toLowerCase();
      let guessedCategory = "LLMs & Chatbots";
      if (analysisSpace.includes("code") || analysisSpace.includes("developer") || analysisSpace.includes("programming") || analysisSpace.includes("compile") || analysisSpace.includes("github")) {
        guessedCategory = "Development & Coding";
      } else if (analysisSpace.includes("design") || analysisSpace.includes("graphics") || analysisSpace.includes("image") || analysisSpace.includes("canvas") || analysisSpace.includes("draw")) {
        guessedCategory = "Design & Graphics";
      } else if (analysisSpace.includes("notes") || analysisSpace.includes("search") || analysisSpace.includes("document") || analysisSpace.includes("paper") || analysisSpace.includes("learn")) {
        guessedCategory = "Productivity & Research";
      } else if (analysisSpace.includes("voice") || analysisSpace.includes("speech") || analysisSpace.includes("audio") || analysisSpace.includes("sound") || analysisSpace.includes("music")) {
        guessedCategory = "Audio & Speech";
      } else if (analysisSpace.includes("creative") || analysisSpace.includes("video") || analysisSpace.includes("art")) {
        guessedCategory = "Creative Tools";
      }

      // Guestimate Display Name
      let guessedName = scrapeData.title || "";
      if (guessedName.includes("-")) {
        guessedName = guessedName.split("-")[0].trim();
      } else if (guessedName.includes("|")) {
        guessedName = guessedName.split("|")[0].trim();
      }
      if (!guessedName || guessedName.length > 50) {
        try {
          guessedName = new URL(url).hostname.replace("www.", "").split(".")[0];
          guessedName = guessedName.charAt(0).toUpperCase() + guessedName.slice(1);
        } catch {
          guessedName = "AI Catalog Tool";
        }
      }

      // Guestimate descriptions
      const scrapedSummary = scrapeData.ogDescription || "A powerful curated AI utility cataloged for the local developer ecosystem directory.";
      
      parsedData = {
        name: guessedName,
        category: guessedCategory,
        microSummary: scrapedSummary.length > 150 ? scrapedSummary.slice(0, 147) + "..." : scrapedSummary,
        description: `Deep-dive study on ${guessedName}. This resource provides specialized operational toolkits for modern generative content pipelines.`,
        features: [
          "Streamlined generative UI/UX modules",
          "Automated contextual search assistance",
          "Advanced workflow integration metrics"
        ],
        solvedProblems: [
          "Reduces overhead tracking diverse AI tools",
          "Accelerates manual categorization processes"
        ],
        systemRequirements: "Modern Web Browser",
        suggestedImageKeyword: "robot"
      };
    }

    // Compute beautiful design image URL
    let finalOgImage = scrapeData.ogImage;
    if (!finalOgImage || !finalOgImage.startsWith("http")) {
      // Use category bg or default based on the keyword generated by Gemini
      const catKey = parsedData.category || "Development & Coding";
      finalOgImage = categoryBGImages[catKey] || categoryBGImages["Development & Coding"];
      
      if (parsedData.suggestedImageKeyword) {
         console.log("Heuristic / Gemini recommended image keyword flag:", parsedData.suggestedImageKeyword);
      }
    }

    const compiledToolAnalysis = {
      name: parsedData.name || scrapeData.title || "Unknown Tool",
      url,
      category: parsedData.category || "Development & Coding",
      microSummary: parsedData.microSummary || scrapeData.ogDescription || "Curated tool overview",
      description: parsedData.description || scrapeData.ogDescription || "No full description compiled yet.",
      features: parsedData.features || ["Useful utility interface", "Web-accessible client services"],
      solvedProblems: parsedData.solvedProblems || ["General operational efficiency helper"],
      systemRequirements: parsedData.systemRequirements || "Web Browser",
      ogImage: finalOgImage
    };

    res.json({
      success: true,
      tool: compiledToolAnalysis,
      fallbackActive: fallbackTriggered,
      fallbackReason: fallbackReason
    });

  } catch (error: any) {
    console.error("Scraper Endpoint Fatal Failure:", error.message);
    res.status(500).json({
      success: false,
      error: error.message || "An unexpected error occurred during page analysis."
    });
  }
});

// PUBLISH DIRECTORY TOOL & TELEGRAM SYNC CHANNEL
app.post("/api/tools/publish", async (req, res) => {
  const { tool } = req.body;
  if (!tool || !tool.name || !tool.url) {
    return res.status(400).json({ success: false, error: "Valid tool data structure is required." });
  }

  try {
    const tools = readTools();
    
    // Check if tool URL already published
    const exists = tools.some((t: any) => t.url.toLowerCase().trim() === tool.url.toLowerCase().trim());
    if (exists) {
      return res.status(400).json({ success: false, error: "A curated tool with this official URL already exists in the directory." });
    }

    const newToolId = String(Date.now());
    const publishedTool = {
      id: newToolId,
      ...tool,
      clicks: 0,
      createdAt: new Date().toISOString()
    };

    tools.unshift(publishedTool);
    writeTools(tools);

    // TELEGRAM BROADCAST SYNCHRONIZATION
    let telegramSent = false;
    let telegramError = undefined;

    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    const tgChatId = process.env.TELEGRAM_CHAT_ID;

    if (tgToken && tgChatId) {
      try {
        const payloadMessage = `🔥 *New Curated AI Tool Published!*

🤖 *${publishedTool.name}*
📁 _Category: ${publishedTool.category}_

✨ *Micro-Summary:*
${publishedTool.microSummary}

💡 *Key Features:*
${publishedTool.features.map((f: string) => `• ${f}`).join("\n")}

🎒 *Solved Problems:*
${publishedTool.solvedProblems.map((p: string) => `• ${p}`).join("\n")}

💻 *System Requirements:* ${publishedTool.systemRequirements}

🔗 *Access now:* ${publishedTool.url}`;

        const tgRes = await fetch(`https://api.telegram.org/bot${tgToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: tgChatId,
            text: payloadMessage,
            parse_mode: "Markdown"
          })
        });

        const tgResultJson = await tgRes.json();
        if (tgResultJson.ok) {
          telegramSent = true;
          console.log("Telegram publication dispatch completed successfully for:", publishedTool.name);
        } else {
          telegramError = tgResultJson.description || "Unknown TG API issue";
          console.warn("Telegram API warning response during publish dispatch:", telegramError);
        }
      } catch (tgErr: any) {
        telegramError = tgErr.message;
        console.error("Telegram publish pipeline exception:", tgErr.message);
      }
    } else {
      console.log("Telegram Bot token/chat environment keys not set. Automatic channel posting bypassed.");
    }

    res.json({
      success: true,
      tool: publishedTool,
      telegramSent,
      telegramError
    });

  } catch (error: any) {
    console.error("Publishing action failure:", error.message);
    res.status(500).json({ success: false, error: error.message || "An error occurred compiling directory write." });
  }
});

// DELETE DIRECTORY TOOL (ADMIN ABILITY)
app.delete("/api/tools/:id", (req, res) => {
  const { id } = req.params;
  const tools = readTools();
  const filtered = tools.filter((t: any) => t.id !== id);
  
  if (filtered.length !== tools.length) {
    writeTools(filtered);
    res.json({ success: true, message: "Curated tool deleted successfully." });
  } else {
    res.status(404).json({ success: false, error: "Tool not found matching the criteria." });
  }
});

// ==========================================
// MOUNT VITE WEB SERVING MIDDLEWARES
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Express integrated Vite developer middlewares successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Express set up static serving from production dist assets.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Curated AI Tools Directory service online. Access url: http://localhost:${PORT}`);
  });
}

startServer();
