import { NextResponse } from "next/server";

export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not configured" }, { status: 500 });
    }

    // Create an ephemeral Realtime API session
    const response = await fetch("https://api.openai.com/v1/realtime/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-realtime-preview-2025-06-03",
        voice: "shimmer",
        instructions: SYSTEM_PROMPT,
        tools: VOICE_TOOLS,
        input_audio_transcription: { model: "whisper-1" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("OpenAI Realtime session error:", err);
      return NextResponse.json({ error: "Failed to create session", details: err }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Voice session error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ─── System Prompt ───────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are Swifter, the AI voice co-pilot for SwifterWallet — a premium South African digital wallet app.

PERSONALITY:
- Friendly, professional, and efficient
- Speak naturally in a conversational South African tone
- Use Rands (R) for all currency amounts
- Be concise — mobile users want quick answers

KNOWLEDGE BASE:
You have full access to the user's wallet data:
- User: Malcolm Govender
- Main Wallet: R24,850.00
- Savings Wallet: R12,420.50
- Business Wallet: R8,390.75
- Total Balance: R45,661.25

Recent Transactions:
- Spotify Premium: -R59.99 (yesterday)
- Deposit from Yoco: +R2,500.00 (yesterday)
- Transfer to Savings: -R1,000.00 (10 Apr)
- Woolworths: -R342.80 (10 Apr)
- Vida e Caffè: -R48.00 (10 Apr)

Savings Goals:
- Holiday Fund: R9,750 / R15,000 (65%)
- Emergency Fund: R32,500 / R50,000 (65%)
- New Laptop: R18,200 / R25,000 (73%)

Upcoming Bills:
- Netflix: R199 due 15 Apr
- Internet: R699 due 18 Apr
- Electricity: R850 due 20 Apr
- Rent: R8,500 due 25 Apr

Spending This Month:
- Food & Dining: R2,340 (32%)
- Shopping: R1,820 (25%)
- Bills & Utilities: R1,690 (23%)
- Transport: R1,450 (20%)
- Total: R7,300

Contacts: Sarah M., David K., Thabo N., Lisa P., James R.

CAPABILITIES - You can execute these actions:
1. send_money — Send money to a contact
2. transfer_funds — Transfer between wallets
3. add_funds — Add funds via card/Yoco
4. buy_airtime — Buy airtime for a phone number
5. pay_bill — Pay an upcoming bill
6. check_balance — Read wallet balances
7. show_transactions — Show recent transactions
8. show_spending — Show spending insights
9. navigate_screen — Navigate to any app screen

SUPPORT KNOWLEDGE:
- Daily transaction limit: R50,000
- Minimum transfer: R10
- Supported networks: Vodacom, MTN, Cell C, Telkom
- Airtime amounts: R5, R10, R29, R55, R110
- Card types accepted: Visa, Mastercard
- Fees: No fees between own wallets, 1% for external transfers
- Security: All transactions are encrypted end-to-end
- Support email: support@swifterwallet.co.za
- Support hours: 24/7 AI support, human agents Mon-Fri 8am-6pm

RULES:
- Always confirm the action before executing: "I'll send R500 to Sarah. Shall I go ahead?"
- After user confirms, execute the tool call
- For balance queries, read the amounts naturally
- Never reveal sensitive card details
- If unsure, suggest the user navigate to the relevant screen
- Keep responses under 3 sentences when possible`;

// ─── Tool Definitions ────────────────────────────────────────────────

const VOICE_TOOLS = [
  {
    type: "function",
    name: "send_money",
    description: "Send money to a contact. Confirm amount and recipient first.",
    parameters: {
      type: "object",
      properties: {
        recipient: { type: "string", description: "Name of the contact to send money to" },
        amount: { type: "number", description: "Amount in Rands to send" },
        wallet: { type: "string", enum: ["main", "savings", "business"], description: "Which wallet to send from" },
      },
      required: ["recipient", "amount"],
    },
  },
  {
    type: "function",
    name: "transfer_funds",
    description: "Transfer money between the user's own wallets.",
    parameters: {
      type: "object",
      properties: {
        from_wallet: { type: "string", enum: ["main", "savings", "business"], description: "Source wallet" },
        to_wallet: { type: "string", enum: ["main", "savings", "business"], description: "Destination wallet" },
        amount: { type: "number", description: "Amount in Rands to transfer" },
      },
      required: ["from_wallet", "to_wallet", "amount"],
    },
  },
  {
    type: "function",
    name: "add_funds",
    description: "Add funds to a wallet via card payment or Yoco.",
    parameters: {
      type: "object",
      properties: {
        amount: { type: "number", description: "Amount in Rands to add" },
        wallet: { type: "string", enum: ["main", "savings", "business"], description: "Wallet to add funds to" },
      },
      required: ["amount"],
    },
  },
  {
    type: "function",
    name: "buy_airtime",
    description: "Purchase airtime for a South African mobile number.",
    parameters: {
      type: "object",
      properties: {
        phone_number: { type: "string", description: "Mobile number (e.g. 082 123 4567)" },
        amount: { type: "number", description: "Airtime amount in Rands" },
        network: { type: "string", enum: ["Vodacom", "MTN", "Cell C", "Telkom"], description: "Mobile network" },
      },
      required: ["phone_number", "amount"],
    },
  },
  {
    type: "function",
    name: "pay_bill",
    description: "Pay one of the user's upcoming bills.",
    parameters: {
      type: "object",
      properties: {
        bill_name: { type: "string", description: "Name of the bill (Netflix, Rent, Electricity, Internet)" },
      },
      required: ["bill_name"],
    },
  },
  {
    type: "function",
    name: "check_balance",
    description: "Check wallet balances. Returns current balance information.",
    parameters: {
      type: "object",
      properties: {
        wallet: { type: "string", enum: ["main", "savings", "business", "all"], description: "Which wallet to check, or 'all' for total" },
      },
    },
  },
  {
    type: "function",
    name: "navigate_screen",
    description: "Navigate to a specific screen in the app.",
    parameters: {
      type: "object",
      properties: {
        screen: { type: "string", enum: ["dashboard", "wallets", "history", "settings", "send", "addFunds"], description: "Screen to navigate to" },
      },
      required: ["screen"],
    },
  },
];
