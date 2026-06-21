// Test koneksi ke OpenCode API dengan model Kimi K2.6
const API_KEY = "sk-9VY4xTkawVSMRWeF4lmRHDcBHfXuajQ7UF5Zz6pJIHpZhocIcweigB78wusONjl1";
const BASE_URL = "https://opencode.ai/zen/go/v1";

async function testConnection() {
  console.log("Testing connection to OpenCode API...");
  console.log("Base URL:", BASE_URL);
  
  try {
    // Test 1: Coba /models endpoint
    console.log("\n1. Testing /models endpoint...");
    const modelsRes = await fetch(`${BASE_URL}/models`, {
      headers: { "Authorization": `Bearer ${API_KEY}` }
    });
    console.log("Models status:", modelsRes.status);
    if (modelsRes.ok) {
      const models = await modelsRes.json();
      console.log("Available models:", models.data?.length || 0);
      if (models.data) {
        models.data.slice(0, 10).forEach((m: any) => {
          console.log("  -", m.id || m.model);
        });
      }
    } else {
      console.log("Models error:", await modelsRes.text());
    }
    
    // Test 2: Coba chat completions sederhana
    console.log("\n2. Testing /chat/completions with Kimi K2.6...");
    const chatRes = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "Kimi K2.6",
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 100
      })
    });
    console.log("Chat status:", chatRes.status);
    const chatText = await chatRes.text();
    console.log("Chat response:", chatText.substring(0, 500));
    
    // Test 3: Coba dengan kimi-k2.6 (fixed model name)
    console.log("\n3. Testing /chat/completions with kimi-k2.6...");
    const kimiRes = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: "kimi-k2.6",
        messages: [{ role: "user", content: "Hi" }],
        max_tokens: 100
      })
    });
    console.log("Kimi status:", kimiRes.status);
    const kimiText = await kimiRes.text();
    console.log("Kimi response:", kimiText.substring(0, 500));
    
  } catch (err) {
    console.error("Error:", err);
  }
}

testConnection();
