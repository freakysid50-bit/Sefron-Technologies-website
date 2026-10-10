# SEFRON TECHNOLOGIES — Official Company Website

A complete, modern, responsive, and enterprise-grade B2B website built specifically around the **SEFRON TECHNOLOGIES** brand identity and custom logo (*Ribbon S 3D Emblem & Split Cyan/Slate Typography*).

---

## 🚀 Live Tech Stack

- **Backend / API**: Node.js & Express
- **Contact Ingestion & Spreadsheet Engine**: ExcelJS (`xlsx`) + CSV fallback
- **Frontend / Styling**: Vanilla Semantic HTML5, Custom CSS3 Design System with CSS variables, Glassmorphism, and Fluid Responsiveness (Tested from 390px to 1920px+)
- **Interactive Visuals**: HTML5 Canvas Core Architecture Visualizer with real-time particle dynamics & AI Agent indicators
- **Typography**: Google Fonts (*Plus Jakarta Sans* & *Outfit*)

---

## 📁 Project Structure

```
website/
├── package.json               # Project dependencies and startup scripts
├── server.js                  # Production Express server, API rate-limiting, and Excel append engine
├── data/
│   ├── submissions.xlsx       # Live Excel-compatible spreadsheet capturing contact submissions
│   └── submissions.csv        # Universal CSV fallback
├── public/
│   ├── index.html             # Semantic, SEO-optimized master page with all sections
│   ├── css/
│   │   └── style.css          # Design system, color tokens, layout, typography, animations
│   ├── js/
│   │   ├── app.js             # Sticky navbar, scroll spy, modal triggers, mobile drawer
│   │   ├── tech-visual.js     # Hero canvas architecture visualizer
│   │   ├── team-slider.js     # Touch swipe & desktop arrow team carousel
│   │   └── contact.js         # Frontend validation & AJAX submission handler
│   └── assets/
│       ├── logo.svg           # High-precision vector logo (Dark text / universal)
│       ├── logo-white.svg     # Dark-mode / navbar / footer white logo
│       ├── favicon.svg        # Standalone Ribbon S favicon
│       └── team/              # Team member portraits and editable placeholders
```

---

## 🛠️ How to Run the Website Locally

1. **Install Dependencies** (if not already installed):
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   npm start
   ```

3. **Open in Browser**:
   Visit [http://localhost:3000](http://localhost:3000)

---

## 📊 Excel Spreadsheet Storage & Contact Form Endpoint

Every contact inquiry submitted via the website triggers:
- **`POST /api/contact`**
- Server-side validation, rate limiting, and sanitization
- Appends a new row to `data/submissions.xlsx` and `data/submissions.csv` with formatted columns:
  `| Date & Time | Name | Phone Number | Email | Message |`

---

## 👥 Leadership Team Profiles & Social Handles

In [public/index.html](file:///c:/Users/mohamed%20siddiq/OneDrive/Desktop/website/public/index.html#L740-L845):
- **Mohamed Siddiq.M** (*CEO & Founder*): [LinkedIn](https://www.linkedin.com/in/mohamed-siddiq-m-520848385) | [Instagram](https://www.instagram.com/freak_ysid?stkn=MmtkNWNuajJyazd3)
- **Sanjai.M** (*Co-Founder & Chief Finance Officer*): [LinkedIn](https://www.linkedin.com/in/sanjai-m-9705a3387?utm_source=share_via&utm_content=profile&utm_medium=member_android) | [Instagram](https://www.instagram.com/iam_sxnjxi.x?utm_source=qr&stkn=enZ3aXhlZjU3MXY1)
- **Ahamed Faizal** (*Chief Technical Officer & Co-Founder*): [LinkedIn](https://www.linkedin.com/in/ahamed-faizal-a-109624366?utm_source=share_via&utm_content=profile&utm_medium=member_android) | [Instagram](https://www.instagram.com/do_0r._die?stkn=MWNjenpzNnJkNjd1MQ==)
- **Rahul.P** (*Co-Founder & Chief Product Officer*): [LinkedIn](https://www.linkedin.com/in/rahul-p-865705375?utm_source=share_via&utm_content=profile&utm_medium=member_android) | [Instagram](https://www.instagram.com/rahul_nathaniel18?stkn=MWM3cXUxYnhtcXI2Mw==)
- **Company Official Email**: `sefrontechnologies07@gmail.com`
- **Company Instagram**: [https://www.instagram.com/sefrontechnologies](https://www.instagram.com/sefrontechnologies?utm_source=qr&stkn=MW5hdmYzNWNxdGxzdA==)
- **Company YouTube Channel**: [https://youtube.com/@sefrontechnologies](https://youtube.com/@sefrontechnologies?si=bZHChKVBbRdbLq0r)
