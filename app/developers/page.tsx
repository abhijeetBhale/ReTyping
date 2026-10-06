import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Abhijeet Bhale — Full Stack Developer",
  description:
    "Abhijeet Bhale is a full stack developer building Finger Fiasco with React, Next.js, and TypeScript. Explore his experience, projects, and technical skills.",
  alternates: { canonical: "/developers" },
  openGraph: { url: "/developers" },
};

const SKILL_GROUPS = [
  { label: "Frontend", skills: ["React.js", "Next.js", "Tailwind CSS"] },
  {
    label: "Backend",
    skills: ["Node.js", "Express.js", "FastAPI", "REST APIs", "gRPC / Protobuf", "OAuth 2.0", "OIDC", "JWT"],
  },
  {
    label: "Tools & Cloud",
    skills: ["GitHub", "Docker", "AWS", "Azure", "GCP", "Claude Code", "Google Tag Manager"],
  },
  { label: "Database", skills: ["PostgreSQL", "MongoDB", "Redis"] },
  { label: "Languages", skills: ["TypeScript", "JavaScript", "Python"] },
] as const;

const PROJECTS = [
  {
    name: "BookHive",
    stack: "React.js, MongoDB",
    period: "Aug 2025 – Feb 2026",
    points: [
      "Engineered a full-stack platform with 8+ features, enabling readers to build libraries and boosting engagement by 65%.",
      "Designed a social reading ecosystem featuring book-borrowing, chat, and map functionality.",
    ],
  },
  {
    name: "GitHub Readme Generator",
    stack: "React.js, Node.js, Devicons",
    period: "May 2025 – June 2025",
    points: [
      "Built a README generator used to create 100+ customizable files with a 40% faster workflow.",
      "Enhanced GitHub profiles with 10+ advanced features, improving personalization by 60%.",
    ],
  },
  {
    name: "Boost AI",
    stack: "MERN Stack",
    period: "Mar 2025 – Apr 2025",
    points: [
      "Managed global state and UI transitions efficiently using React TanStack and custom hooks.",
      "Implemented rich-text chat with Markdown and image uploads via ImageKit.io API integrations.",
    ],
  },
  {
    name: "Typing Test Website",
    stack: "HTML, CSS, JavaScript, Bootstrap",
    period: "June 2024 – Nov 2024",
    points: [
      "Built a dynamic word generation system for non-repetitive gameplay, increasing user retention by 40%.",
    ],
  },
] as const;

export default function DevelopersPage() {
  return (
    <main className="dev-page">
      <section className="profile-hero">
        <Image
          src="/images/abhijeet.jpg"
          alt="Portrait of Abhijeet Bhale"
          width={300}
          height={391}
          priority
          className="profile-photo"
        />
        <div className="profile-intro">
          <p className="profile-eyebrow">Developer profile.</p>
          <h1 className="dev-title profile-name">Abhijeet Bhale.</h1>
          <p className="dev-subtitle profile-role">
            Full Stack Developer — React, Next.js, TypeScript, Python.
          </p>
          <p className="profile-location">Indore, India · +91 91711-19237</p>
          <div className="profile-links">
            <a
              href="https://github.com/abhijeetbhale"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/abhijeetbhale7/"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
            <a href="mailto:abhijeetbhale7@gmail.com">Email</a>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <h2>Summary.</h2>
        <p>
          Full Stack Developer with experience building scalable SaaS
          applications using React, Next.js, TypeScript, Python, and Go.
          Skilled in developing modern frontend experiences and
          high-performance backend systems powered by FastAPI, gRPC, Connect
          RPC, and microservice architectures. Experienced with PostgreSQL,
          Redis, Docker, Azure, REST APIs, real-time communication
          (Socket.IO/SSE), OAuth/OIDC authentication, and cloud-native
          deployments. Passionate about building performant, AI-powered
          products with clean architecture, efficient data access, and
          scalable distributed systems.
        </p>
      </section>

      <section className="profile-section">
        <h2>Experience.</h2>
        <div className="profile-card">
          <div className="profile-card-head">
            <div>
              <p className="profile-card-title">Software Engineer Intern — Soundverse AI</p>
              <p className="profile-card-meta">Remote</p>
            </div>
            <p className="profile-card-meta">Feb 2026 – Aug 2026</p>
          </div>
          <ul>
            <li>
              Spearheaded 40+ product enhancements across the Soundverse AI
              platform, delivering an agent-first redesign of the core
              experience alongside continuous UX and workflow optimization.
            </li>
            <li>
              Designed and integrated 20+ AI capabilities end-to-end, including
              music, vocal, speech (TTS), lyrics, image and video generation,
              and stem separation — each wired from the agent orchestration
              layer to GPU/media inference services.
            </li>
            <li>
              Engineered and optimized 15+ backend services and APIs across
              FastAPI/Python microservices, Protobuf/gRPC contracts, and
              Next.js BFF routes on PostgreSQL, plus geo-aware billing with
              off-session auto-recharge.
            </li>
          </ul>
        </div>
      </section>

      <section className="profile-section">
        <h2>Technical skills.</h2>
        <div className="profile-skills">
          {SKILL_GROUPS.map((group) => (
            <div className="profile-skill-group" key={group.label}>
              <p className="profile-skill-label">{group.label}</p>
              <div className="profile-pills">
                {group.skills.map((skill) => (
                  <span className="profile-pill" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="profile-section">
        <h2>Projects.</h2>
        <div className="profile-grid">
          {PROJECTS.map((project) => (
            <article className="profile-card" key={project.name}>
              <div className="profile-card-head">
                <p className="profile-card-title">{project.name}</p>
                <p className="profile-card-meta">{project.period}</p>
              </div>
              <p className="profile-card-meta">{project.stack}</p>
              <ul>
                {project.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="profile-section">
        <h2>Education.</h2>
        <div className="profile-card">
          <div className="profile-card-head">
            <div>
              <p className="profile-card-title">
                B.Tech, Computer Science and Business Systems — Medicaps University
              </p>
              <p className="profile-card-meta">2022 – 2026</p>
            </div>
            <p className="profile-card-meta">CGPA 8.68 / 10</p>
          </div>
        </div>
      </section>
    </main>
  );
}
