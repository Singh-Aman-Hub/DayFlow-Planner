<h1>DayFlow Planner</h1>

<p>
  A lightweight web application to plan your day and capture notes.
  <br />
  DayFlow helps you understand and allocate your time more intentionally so you can focus on meaningful work.
</p>

<hr />

<h2>What this project is</h2>

<p>
  <strong>DayFlow Planner</strong> is a single-page <strong>React</strong> application built with <strong>Vite</strong>.
  It provides a simple planner where users can compose blocks of time, save plans to local history,
  and keep a scratchpad for notes.
</p>

<p>
  All data is persisted in the browser using <code>localStorage</code>,
  so the application does <strong>not require a backend</strong> to retain user data.
</p>

<h2>Key benefits</h2>

<ul>
  <li>Helps you gain visibility into your time by planning blocks and viewing saved plans.</li>
  <li>Lightweight and privacy-first: all data is stored locally in the browser.</li>
  <li>Easy to deploy as a static site (Vite outputs a <code>dist</code> folder).</li>
</ul>

<h2>Prerequisites</h2>

<ul>
  <li>Node.js (recommended v18 or later)</li>
  <li>npm or Yarn</li>
</ul>

<h2>Install and run locally</h2>

<p>Clone the repository, install dependencies, and start the Vite dev server:</p>

<pre><code># clone the repo
git clone https://github.com/Singh-Aman-Hub/DayFlow-Planner.git
cd DayFlow-Planner

# install dependencies (npm)
npm install

# start development server
npm run dev
</code></pre>

<p>
  Open the site at the address printed by Vite
  (usually <code>http://localhost:5173</code>).
</p>

<p>
  <em>
    If you prefer Yarn, replace <code>npm install</code> with <code>yarn</code>
    and use <code>yarn dev</code>.
  </em>
</p>

<h2>Build for production</h2>

<p>To create an optimized production build:</p>

<pre><code>npm run build
</code></pre>

<p>
  The output directory is <code>dist</code>.
  Serve files from this directory using any static host or CDN.
</p>

<h2>Deploying to Render (static site)</h2>

<p>Recommended configuration when creating a new static site on Render:</p>

<ul>
  <li><strong>Branch:</strong> <code>master</code></li>
  <li><strong>Root Directory:</strong> (leave empty)</li>
  <li>
    <strong>Build Command:</strong>
    <code>npm install && npm run build</code>
    (or <code>yarn install && yarn build</code>)
  </li>
  <li><strong>Publish Directory:</strong> <code>dist</code></li>
</ul>

<p>Optional environment variables (set in Render dashboard):</p>

<pre><code>GEMINI_API_KEY=&lt;your_api_key&gt;
</code></pre>

<p>
  <em>
    Avoid committing secrets to the repository.
    Environment variables are injected at build time.
  </em>
</p>

<h2>Data persistence</h2>

<p>
  All user data is stored in the browser using <code>localStorage</code>
  with the following keys:
</p>

<ul>
  <li><code>dayflow_current_plan</code></li>
  <li><code>dayflow_history</code></li>
  <li><code>dayflow_view</code></li>
  <li><code>dayflow_notes</code></li>
</ul>

<p>
  <em>
    There is no server-side persistence by default.
    Clearing browser storage or switching devices will remove saved data.
  </em>
</p>

<h2>How to configure</h2>

<ul>
  <li>
    To change the build output directory, update
    <code>build.outDir</code> in <code>vite.config.ts</code>.
  </li>
  <li>
    For API integrations, define required environment variables
    before building the project.
  </li>
</ul>

<h2>Planned features</h2>

<ul>
  <li>Server-side syncing across devices</li>
  <li>User authentication and accounts</li>
  <li>Time analytics and productivity insights</li>
  <li>Shared plans and collaboration</li>
  <li>Calendar and task manager integrations</li>
</ul>

<p>
  <em>
    These features are not yet implemented.
    The current focus is a minimal, distraction-free, local-first planner.
  </em>
</p>

<h2>Contributing</h2>

<p>
  Contributions are welcome.
  Please open issues or pull requests for bugs, improvements, or feature ideas.
  Keep PRs small and focused when possible.
</p>

<h2>License</h2>

<p>
  This repository does not currently include a license file.
  Add a license (e.g. <code>MIT</code>) if you plan to publish or distribute the code.
</p>

<hr />

<p>
  <strong>Project:</strong> DayFlow Planner <br />
  <strong>Repository:</strong>
  <a href="https://github.com/Singh-Aman-Hub/DayFlow-Planner">
    https://github.com/Singh-Aman-Hub/DayFlow-Planner
  </a>
</p>