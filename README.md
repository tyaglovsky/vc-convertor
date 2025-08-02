# 📇 VCF to CSV Converter

A simple and secure web app for converting `.vcf` (vCard) contact files into `.csv` format – entirely in your browser, with no data ever sent to a server.

**Live demo**: [vcc.tyaglovsky.com](https://vcc.tyaglovsky.com)

![preview](https://tyaglovsky.com/lovable-uploads/webvcc.png)

---

## 📱 Also Available on the App Store

If you prefer using a native app, the same converter is available for iPhone, iPad, and Mac:

[![Download on the App Store](https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg)](https://apps.apple.com/us/app/vcf-csv-converter/id6743118383)

> 🧑‍💻 Built entirely in Xcode + Swift.  
> Perfect for offline use, privacy-focused, and optimized for Apple devices.

---

## ✨ Features

- ✅ 100% local conversion – no server, no tracking
- ✅ Supports multiple contacts in one `.vcf` file
- ✅ Works offline after first load (PWA-ready)
- ✅ No installation required

---

## 🚀 Usage

1. Open the web app: [vcc.tyaglovsky.com](https://vcc.tyaglovsky.com)
2. Upload your `.vcf` file (exported from iPhone, Android, etc.)
3. Click **Convert**
4. Download the `.csv` with your contacts

---

## 🛠 Tech Stack

- [Vite](https://vitejs.dev/)
- [React](https://react.dev/)
- [shadcn/ui](https://ui.shadcn.com/)
- TypeScript
- TailwindCSS
- Deployed via **Cloudflare Pages**

## 🧡 Credits

UI/UX design was beautifully bootstrapped with help from [Lovable.dev](https://lovable.dev) – an AI-powered UI builder that helped shape the visual part of this app.

---

## 🛡 Privacy

This app runs entirely in your browser.  
No data is sent, stored, or tracked in any way.

> Hosting is provided by [Cloudflare Pages](https://pages.cloudflare.com/), which may log IP addresses and traffic data for operational purposes only. This information is not used or accessed by the developer.

---

## 📦 Local Development

```bash
git clone https://github.com/tyaglovsky/vc-convertor.git
cd vc-convertor
npm install
npm run dev
