const jwt = require('jsonwebtoken');
const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// Simple keyword filter to enforce money-only topics
const MONEY_KEYWORDS = [
  'money','budget','spend','spent','saving','savings','save','goal','goals','investment','invest','investing','portfolio','expense','expenses','transaction','transactions','debt','loan','interest','retirement','tax','income','cashflow','cash flow','net worth','risk','emergency fund'
];

// Helper: check if message is on-topic
function isOnTopic(message) {
  const lower = message.toLowerCase();
  return MONEY_KEYWORDS.some(k => lower.includes(k));
}

// Build a synthetic financial snapshot from budgets & transactions
function buildSnapshot({ budgets, transactions, investments }) {
  const totalSpent = transactions.reduce((a,t)=>a+t.amount,0);
  const totalBudget = Object.values(budgets).reduce((a,b)=>a+(b.goal||0),0);
  const overspentCategories = Object.entries(budgets)
    .filter(([_,b]) => b.goal > 0 && b.spent > b.goal)
    .map(([c,b]) => ({ category:c, overBy: +(b.spent - b.goal).toFixed(2) }));
  const nearingLimit = Object.entries(budgets)
    .filter(([_,b]) => b.goal > 0 && b.spent / b.goal >= 0.75 && b.spent <= b.goal)
    .map(([c,b]) => ({ category:c, pct: +(100*b.spent/b.goal).toFixed(1) }));
  const investmentTotal = (investments||[]).reduce((a,i)=>a+Number(i.value||0),0);
  return { totalSpent, totalBudget, overspentCategories, nearingLimit, investmentTotal };
}

// Rule-based advisor response
function generateAdvice(userMessage, snapshot) {
  const lines = [];
  lines.push('Here\'s a tailored money management insight based on your current data:');
  lines.push(`Total spent this period: ₹${snapshot.totalSpent.toFixed(2)} against total goals of ₹${snapshot.totalBudget.toFixed(2)}.`);
  if (snapshot.totalBudget > 0) {
    const remaining = snapshot.totalBudget - snapshot.totalSpent;
    lines.push(`Remaining aggregate budget: ₹${remaining.toFixed(2)}.`);
  }
  if (snapshot.overspentCategories.length) {
    lines.push('Overspent categories:');
    snapshot.overspentCategories.forEach(o => lines.push(`• ${o.category}: over by ₹${o.overBy.toFixed(2)}`));
    lines.push('Consider trimming discretionary items or reallocating from under-used categories.');
  } else if (snapshot.nearingLimit.length) {
    lines.push('Categories nearing their limits (≥75% used):');
    snapshot.nearingLimit.forEach(n => lines.push(`• ${n.category}: ${n.pct}% of goal used`));
    lines.push('You can pre-empt overspending by setting micro-limits for the rest of the month.');
  } else {
    lines.push('No categories are overspent or near limits — good control so far!');
  }
  if (snapshot.investmentTotal > 0) {
    lines.push(`Total tracked investments: ₹${snapshot.investmentTotal.toFixed(2)}. Ensure emergency fund and high-interest debt are covered before increasing high-risk allocations.`);
  } else {
    lines.push('You have not added investments yet. Starting with a diversified low-cost index fund and building an emergency fund (3-6 months expenses) is a common first step.');
  }
  // Basic response to explicit saving/invest terms
  const lower = userMessage.toLowerCase();
  if (lower.includes('save')) {
    lines.push('Tip: Automate transfers to a dedicated savings/investment account right after income hits to enforce pay-yourself-first discipline.');
  }
  if (lower.includes('invest')) {
    lines.push('Allocate gradually (DCA) and review expense ratios; keep core holdings diversified.');
  }
  return lines.join('\n');
}

// OpenAI integration (if key provided)
async function callLLMIfEnabled(userMessage, snapshot) {
  if (!process.env.OPENAI_API_KEY) return null;
  try {
    const { OpenAI } = require('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const system = `You are an expert personal finance mentor. Strict rules:
1. ONLY answer money-related topics: budgeting, spending, savings, emergency funds, debt management, investments, risk, taxes basics.
2. REFUSE politely if off-topic.
3. Use INR currency formatting (₹, two decimals).
4. Base advice on provided snapshot JSON if relevant.
5. Be concise: 3-6 short paragraphs or bullet points.
6. Avoid promises or absolute guarantees. Emphasize prudent, diversified, risk-aware approaches.
Snapshot: ${JSON.stringify(snapshot)}`;
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.4,
      max_tokens: 500
    });
    return completion.choices?.[0]?.message?.content?.trim() || null;
  } catch (e) {
    console.error('OpenAI error', e.message);
    return null;
  }
}

exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ msg: 'Invalid message' });
    }
    if (!isOnTopic(message)) {
      return res.json({ reply: 'I can only help with money management, budgeting, expenses, goals, investments, and related financial topics. Please rephrase with a financial focus.' });
    }

    // Load user-specific data from DB
    const userId = req.user?.id;
    const [budgetDocs, txnDocs] = await Promise.all([
      Budget.find({ user: userId }),
      Transaction.find({ user: userId }).sort({ date: -1 }).limit(1000)
    ]);

    const spentByCategory = txnDocs.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

    const budgets = budgetDocs.reduce((acc, b) => {
      acc[b.category] = { goal: Number(b.goal || 0), spent: Number(spentByCategory[b.category] || 0) };
      return acc;
    }, {});

    // Include categories with spend but no goal for visibility
    Object.keys(spentByCategory).forEach(cat => {
      if (!budgets[cat]) budgets[cat] = { goal: 0, spent: Number(spentByCategory[cat]) };
    });

    const transactions = txnDocs.map(t => ({ amount: t.amount, category: t.category }));
    const investments = [];
    const snapshot = buildSnapshot({ budgets, transactions, investments });

  const ruleBased = generateAdvice(message, snapshot);
  const llm = await callLLMIfEnabled(message, snapshot);
  const reply = llm ? `${ruleBased}\n\nAI Perspective:\n${llm}` : ruleBased;

    res.json({ reply });
  } catch (e) {
    console.error(e);
    res.status(500).json({ msg: 'Server error generating advice' });
  }
};
