# 🧠 InsightMinds

InsightMinds is an innovative therapy analytics platform designed to empower mental health professionals with AI-powered insights and client progress tracking.

---

## ✨ Features

- 🎯 **Client Progress Dashboard**: Track mood trends, coping mechanisms, and therapeutic goals.
- 🤖 **AI-Powered Session Analysis**: Extracts insights using NLP and emotional analytics.
- 📊 **Interactive Analytics Dashboard**: Visualize metrics and sentiment over time.
- 🗣️ **Sentiment & Self-Talk Analysis**: Tracks emotional expressions and self-references.
- 📝 **Automated Session Notes**: Generates comprehensive session summaries and transcripts.

---

### 🧪 Try It Out!

Want to test InsightMinds' powerful recording analysis features? 

Use this sample therapy session:

🎥 [Sample Recording](https://drive.google.com/file/d/1lVw-D7lHVQYaoh7CRDURC76UsmsDiTqN/view?usp=sharing)  
[_Source: MedCircle YouTube Channel_](https://www.youtube.com/watch?v=8-2WQF3SWwo&t=19s&ab_channel=MedCircle)

This will demonstrate our AI-powered capabilities including:

- 📝 Automated session transcription
- ✍️ Detailed session summary
- 🎯 Key insights and observations

---

### 🛠️ Technology Stack

InsightMinds is built with cutting-edge technologies:

- ⚛️ **Next.js** — React-based framework for production-ready web applications
- 🗄️ **Supabase** — Open-source Firebase alternative (authentication, database, and storage)
- 🤖 **OpenAI** — Natural language processing for smart session insights
- 🧠 **Hume AI** — Emotion recognition for deeper psychological understanding
- 🎙️ **Assembly AI** — Transcription engine for speech-to-text

---

## 🖥️ Getting Started

Follow these steps to set up and run InsightMinds locally:

### 1. 🔁 Clone the Repository

```bash
   git clone https://github.com/onkaryemul/InsightMinds.git
```

### 2. 📦 Install Dependencies

Navigate to the project directory:

```bash
   cd InsightMinds
```

Make sure you have Node.js (v18 or higher) and npm installed. Then run:

```bash
   npm install 
```

### 3. 🔐 Environment Variables

Create a `.env.local` file in the root directory and add the following keys:

```env
   OPENAI_API_KEY=your_openai_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ASSEMBLYAI_API_KEY=your_assemblyai_key
   NEXT_PUBLIC_ASSEMBLY_AI_API_KEY=your_assemblyai_key
   NEXT_PUBLIC_HUME_API_KEY=your_hume_api_key
```

### 4. ⚙️ Build the Application

For production setup, build the app with:

```bash
   npm run build
```

Then start the production server:

```bash
   npm start
```

### 5. 🧪 Run in Development Mode

For development and testing purposes:

```bash
   npm run dev
```


## 🙌 Contributing

If you'd like to contribute, feel free to fork the repository and submit a pull request. We welcome improvements in UI/UX, API integration, and documentation.
