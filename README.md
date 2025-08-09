# 🌟 Stellar AI Assistant

**Stellar AI Assistant** is a conversational AI tool designed to provide **clear, safe, and accessible medical information**.  
Users can describe their symptoms or a known diagnosis and receive information on:

- Possible conditions (with safety disclaimers)
- Relevant medicines (generic + brand examples)
- Usage details (dosage ranges, administration, precautions, side effects)
- Lifestyle & home remedies (evidence-based)
- Urgent care warnings (red flags)

---

## 📌 Core Idea

Stellar AI offers a **user-friendly** way to understand possible health conditions.  
Example:
- Input: *"I have a sore throat and mild fever"*
- Output: Possible conditions, medicine info, safe home remedies, and warnings when to seek urgent care.

---

## 🔑 Key Features

### 1. **Symptom Checker**
- Uses **NLP** to map symptoms to potential conditions.
- Integrates with **ICD-10** & **SNOMED CT**.
- Returns probability-ranked possibilities.

### 2. **Medicine Information Retrieval**
- Retrieves data from reputable sources like **FDA** & **NHS**.
- Provides:
  - Generic & brand names
  - Dosage ranges
  - Contraindications
  - Side effects
  - Drug interactions

### 3. **Conversational Q&A**
- Follow-up questions supported (e.g., drug-drug interaction checks).
- Context-aware, safety-focused answers.

### 4. **Safety & Ethical Compliance**
- Prominent disclaimers.
- Emergency flagging.
- For **educational purposes only**.

---

## 🧠 How It Works — NLP & LLMs

**Natural Language Processing (NLP)** — *The "ears"*  
- **Entity Recognition**: Extracts symptoms, durations, body parts.
- **Intent Recognition**: Detects if the user wants symptom check, medicine info, or interactions.
- **Red Flag Detection**: Identifies emergency situations.

**Large Language Model (LLM)** — *The "brain"*  
- **Probabilistic Reasoning**: Matches symptoms to possible conditions.
- **Information Synthesis**: Combines database & knowledge base results.
- **Contextual Conversation**: Handles follow-up questions.
- **Safety-First Response Generation**: Always adds disclaimers and emergency guidance.

---

## 🏗️ Technical Architecture

- **Frontend**: Next.js + React + TypeScript + Tailwind CSS + Shadcn/UI
- **Backend**: Python service using **LangGraph** for stateful, multi-agent conversations
- **Authentication**: Clerk
- **API**: Custom streaming API for token-by-token LLM responses

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm / yarn / pnpm
- Python v3.9+

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/stellar-ai-assistant.git
cd stellar-ai-assistant

# Install frontend dependencies
npm install
```
##Create .env.local in the root directory:
```
env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
```
Run Development Server
```
bash
npm run dev
```
