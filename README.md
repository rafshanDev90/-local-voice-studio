<div align="center">
  <h1>local-voice-studio</h1>
  <p><strong>Local, open-source voiceover generation for YouTube videos</strong></p>
  <p>
    <img src="https://img.shields.io/badge/python-3.12%2B-blue" alt="Python">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
    <img src="https://img.shields.io/badge/TTS-Kokoro%20ONNX-orange" alt="Kokoro">
  </p>
</div>

<hr>

<table>
  <tr>
    <td><strong>What</strong></td>
    <td>A local-first voice agent that turns scripts into natural-sounding voiceovers using Kokoro ONNX TTS + OpenFugu orchestration. Built as a personal project to generate audio for YouTube videos without API costs.</td>
  </tr>
  <tr>
    <td><strong>Why</strong></td>
    <td>ElevenLabs-quality voiceovers, fully local, fully free. No monthly bills, no rate limits, no data leaving your machine.</td>
  </tr>
  <tr>
    <td><strong>Stack</strong></td>
    <td>Python 3.12 &middot; FastAPI &middot; Kokoro ONNX &middot; OpenFugu &middot; Ollama</td>
  </tr>
</table>

<hr>

<h2>Features</h2>

<ul>
  <li><strong>Local TTS</strong> &mdash; Kokoro ONNX runs on CPU, 311MB model, 24000 Hz output</li>
  <li><strong>Smart segmentation</strong> &mdash; Ollama (or regex fallback) splits scripts into natural speech segments</li>
  <li><strong>Per-segment voice routing</strong> &mdash; OpenFugu classifies each segment and assigns a matching voice preset</li>
  <li><strong>FastAPI server</strong> &mdash; Two endpoints: file upload (<code>/generate-voice/</code>) and JSON (<code>/api/generate</code>)</li>
    <li><strong>11 voice presets</strong> &mdash; af_bella, af_sarah, af_nicole, af_sky, am_adam, am_michael, and 5 British voices</li>
  <li><strong>No API costs</strong> &mdash; Everything runs on your machine</li>
</ul>

<hr>

<h2>Architecture</h2>

<pre>
                            ┌──────────────────────────────────┐
                            │         FastAPI Server           │
                            │                                  │
 Script (.txt) ───────────►│  ┌─────────────┐  ┌────────────┐ │
 JSON body ────────────────►│  │ optimizer   │─►│ tts_engine │─► .wav
                            │  │ (Ollama)    │  │ (Kokoro)   │ │
                            │  └──────┬──────┘  └────────────┘ │
                            │         │                          │
                            │  ┌──────▼────────┐               │
                            │  │ orchestrator   │  OpenFugu      │
                            │  │ FuguRouter     │  (optional)    │
                            │  └───────────────┘               │
                            └──────────────────────────────────┘

  ┌──────────┐     ┌──────────┐     ┌──────────────┐
  │  Redis   │     │ Backend  │     │   Frontend    │
  │ (cache)  │◄────│(FastAPI) │◄────│  (Next.js)   │
  │ :6379    │     │ :8000    │     │ :3000         │
  └──────────┘     └──────────┘     └──────────────┘
         ▲               ▲                  ▲
         └───────────────┴──────────────────┘
                    Docker Compose
</pre>

<hr>

<h2>Prerequisites</h2>

<ul>
  <li><strong>Docker</strong> &amp; <strong>Docker Compose v2</strong></li>
  <li><strong>MongoDB Atlas</strong> cluster (free tier) — used for auth and history</li>
</ul>

<h2>Quick Start</h2>

<h3>1. Clone</h3>

<pre>
git clone https://github.com/your-username/local-voice-studio.git
cd local-voice-studio
</pre>

<h3>2. Configure MongoDB</h3>

<p>Create a <code>.env</code> file in the project root:</pre>

<pre>
MONGO_URL=mongodb+srv://&lt;user&gt;:&lt;password&gt;@&lt;cluster&gt;.mongodb.net/
MONGO_DB_NAME=local-voice-studio
</pre>

<h3>3. Start all services</h3>

<pre>
docker compose up -d
</pre>

<p>This builds and starts three containers:</p>
<table>
  <tr><th>Service</th><th>Port</th><th>Description</th></tr>
  <tr><td><code>frontend</code></td><td><code>:3000</code></td><td>Next.js UI — <a href="http://localhost:3000">http://localhost:3000</a></td></tr>
  <tr><td><code>backend</code></td><td><code>:8000</code></td><td>FastAPI API — <a href="http://localhost:8000/health">http://localhost:8000/health</a></td></tr>
  <tr><td><code>redis</code></td><td>internal</td><td>Session cache</td></tr>
</table>

<h3>4. Verify</h3>

<pre>
curl http://localhost:8000/health
# → {"status":"ok"}
</pre>

<hr>

<h2>API</h2>

<table>
  <tr>
    <th>Endpoint</th>
    <th>Method</th>
    <th>Input</th>
    <th>Output</th>
  </tr>
  <tr>
    <td><code>/health</code></td>
    <td>GET</td>
    <td>—</td>
    <td><code>{"status":"ok"}</code></td>
  </tr>
  <tr>
    <td><code>/generate-voice/</code></td>
    <td>POST</td>
    <td>multipart .txt file</td>
    <td>.wav audio</td>
  </tr>
  <tr>
    <td><code>/api/generate</code></td>
    <td>POST</td>
    <td><code>{"text":"..."}</code></td>
    <td>.wav audio</td>
  </tr>
</table>

<h3>Query Parameters</h3>

<table>
  <tr>
    <th>Param</th>
    <th>Type</th>
    <th>Default</th>
    <th>Description</th>
  </tr>
  <tr>
    <td><code>voice</code></td>
    <td>string</td>
    <td><code>af_bella</code></td>
    <td>Voice preset</td>
  </tr>
  <tr>
    <td><code>speed</code></td>
    <td>float</td>
    <td><code>1.0</code></td>
    <td>Playback speed (0.5–2.0)</td>
  </tr>
  <tr>
    <td><code>use_orchestrator</code></td>
    <td>bool</td>
    <td><code>false</code></td>
    <td>Enable per-segment voice routing</td>
  </tr>
</table>

<hr>

<h2>Voice Presets</h2>

<table>
  <tr>
    <th>Preset</th>
    <th>Gender</th>
    <th>Character</th>
  </tr>
  <tr>
    <td><code>af_bella</code></td>
    <td>female</td>
    <td>Neutral, explanatory (default)</td>
  </tr>
  <tr>
    <td><code>af_sarah</code></td>
    <td>female</td>
    <td>Warm, narrative, storytelling</td>
  </tr>
  <tr>
    <td><code>af_nicole</code></td>
    <td>female</td>
    <td>Calm, clear, instructional</td>
  </tr>
  <tr>
    <td><code>af_sky</code></td>
    <td>female</td>
    <td>Bright, energetic</td>
  </tr>
  <tr>
    <td><code>am_adam</code></td>
    <td>male</td>
    <td>Authoritative, urgent</td>
  </tr>
  <tr>
    <td><code>am_michael</code></td>
    <td>male</td>
    <td>Friendly, conversational</td>
  </tr>
  <tr>
    <td><code>bf_emma</code></td>
    <td>female (British)</td>
    <td>Refined</td>
  </tr>
  <tr>
    <td><code>bf_isabella</code></td>
    <td>female (British)</td>
    <td>Soft</td>
  </tr>
  <tr>
    <td><code>bm_george</code></td>
    <td>male (British)</td>
    <td>Deep</td>
  </tr>
  <tr>
    <td><code>bm_lewis</code></td>
    <td>male (British)</td>
    <td>Warm</td>
  </tr>
</table>

<hr>

<h2>Roadmap</h2>

<table>
  <tr>
    <th>Phase</th>
    <th>Status</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>Phase 1 &mdash; Base TTS</td>
    <td>✅ Done</td>
    <td>Kokoro engine, script optimizer, FastAPI endpoints</td>
  </tr>
  <tr>
    <td>Phase 2 &mdash; Classifier</td>
    <td>🔧 In Progress</td>
    <td>OpenFugu FuguRouter for per-segment voice selection</td>
  </tr>
  <tr>
    <td>Phase 3 &mdash; Coordinator</td>
    <td>⬜ Pending</td>
    <td>OpenFugu Coordinator with Ollama worker pool</td>
  </tr>
  <tr>
    <td>Phase 4 &mdash; YouTube</td>
    <td>⬜ Pending</td>
    <td>Auto-caption fetch via yt-dlp, transcript pipeline</td>
  </tr>
</table>

<hr>

<h2>Tech Stack</h2>

<table>
  <tr>
    <td><strong>TTS</strong></td>
    <td><a href="https://github.com/thewh1teagle/kokoro-onnx">Kokoro ONNX</a> &mdash; 311MB model, 24000 Hz, 5 voice presets</td>
  </tr>
  <tr>
    <td><strong>Server</strong></td>
    <td>FastAPI + uvicorn</td>
  </tr>
  <tr>
    <td><strong>Orchestration</strong></td>
    <td><a href="https://github.com/opencode-ai/OpenFugu">OpenFugu</a> &mdash; FuguRouter / Coordinator (optional)</td>
  </tr>
  <tr>
    <td><strong>LLM</strong></td>
    <td>Ollama (llama3.2:3b) for script segmentation</td>
  </tr>
</table>

<hr>

<div align="center">
  <p>Built with Kokoro ONNX &middot; OpenFugu &middot; FastAPI</p>
  <p><strong>local-voice-studio</strong> &mdash; Local voiceovers for YouTube</p>
</div>
