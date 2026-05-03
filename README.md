# UAE SCAM DETECTOR

![Status](https://img.shields.io/badge/Status-Production-brightgreen?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Deployed](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)

An AI-powered web application that detects fraudulent job offers, phishing messages, and suspicious listings targeting UAE residents.

## ABOUT

Scam targeting of UAE expats and job seekers is a documented, growing problem. This tool allows anyone to paste suspicious text and receive an instant fraud risk score with a structured breakdown — no account required, no data stored.

## LIVE DEMO : uae-scam-detector.vercel.app

SCREENSHOTS
<img width="1872" height="876" alt="Screenshot 2026-04-29 012458" src="https://github.com/user-attachments/assets/b236da69-acc4-46fa-aa66-306360bc7dd6" />
<img width="1880" height="872" alt="Screenshot 2026-04-29 012550" src="https://github.com/user-attachments/assets/4e2215cd-ebd6-4b85-ac3d-3bdeef1b8808" />
<img width="1880" height="851" alt="Screenshot 2026-04-29 012604" src="https://github.com/user-attachments/assets/9b267736-ec05-40a6-bafe-68f085338937" />
<img width="1880" height="861" alt="Screenshot 2026-04-29 012651" src="https://github.com/user-attachments/assets/967014e6-be54-4e8e-a603-87d64fc054d0" />
<img width="1894" height="865" alt="Screenshot 2026-04-29 012720" src="https://github.com/user-attachments/assets/8c733aee-2034-40db-91c0-8da68fc3a09d" />






## HOW IT WORKS

```
User Input  →  Next.js API Route  →  Claude API (Anthropic)  →  Risk Score + Red Flags + Verdict
```

---

## FEATURES

- Fraud likelihood score (0–100) with plain-language verdict
- Red flag identification: upfront fees, missing employer details, visa anomalies
- UAE-specific pattern recognition: free zone scams, MOL impersonation, WhatsApp recruitment fraud
- Stateless and anonymous — no user data logged or retained

---

## TECH STACK

| Layer      | Technology              |
|------------|-------------------------|
| Framework  | Next.js 15 (App Router) |
| Language   | TypeScript              |
| Styling    | Tailwind CSS            |
| AI Engine  | Claude API (Anthropic)  |
| Deployment | Vercel                  |

---

## INSTALLATION

**Prerequisites:** Node.js 18+, Anthropic API key

```bash
git clone https://github.com/YOUR_USERNAME/uae-scam-detector.git
cd uae-scam-detector
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## ROADMAP

- [ ] Arabic language support
- [ ] WhatsApp screenshot analysis (OCR)
- [ ] Browser extension

---

## AUTHOR

SHAHINA.S — Full Stack Developer & AI Engineer, UAE

- Portfolio: https://yoursite.com
- LinkedIn: https://linkedin.com/in/yourhandle
- Email: you@email.com

---

*MIT License. Open source. Built for the UAE community.*
