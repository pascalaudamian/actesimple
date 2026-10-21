# Ghid de Publicare și Administrare — ActeSimple

Acest document descrie pașii pentru publicarea în producție a portalului **ActeSimple** pe Vercel, configurarea bazei de date PostgreSQL (pe Neon sau Supabase), migrarea schemei și setarea variabilelor de mediu.

---

## 1. Arhitectura Aplicației

- **Frontend:** React 19, TypeScript, Tailwind CSS 4, Vite 8 (SPA responsive, accesibil WCAG 2.2 AA).
- **Backend:** Node.js / Express REST API cu validare Zod și protecție CSRF/XSS.
- **Bază de date:** 
  - *Mediu de dezvoltare / fallback:* structură relațională JSON cu audit logs în `data/procedures.json` și `data/audit_logs.json`.
  - *Producție (Vercel / Supabase / Neon):* schemă PostgreSQL completă definită în `database/schema.sql` (tabele: `categories`, `procedures`, `documents`, `steps`, `sources`, `procedure_keywords`, `audit_logs`).

---

## 2. Variabile de Mediu Necesare

Creați fișierul `.env` sau adăugați variabilele în **Vercel Project Settings > Environment Variables**:

| Variabilă | Descriere | Valoare recomandată / Exemplu |
|---|---|---|
| `NODE_ENV` | Mediul de execuție | `production` |
| `PORT` | Portul serverului HTTP | `3000` |
| `ADMIN_PASSWORD` | Parola unică pentru accesul în Panoul de Administrare | Un șir generat aleatoriu (minim 16 caractere) |
| `ADMIN_API_KEY` | Cheie secretă pentru apeluri automate administrative | Cheie hexzecimală generată |
| `DATABASE_URL` | Șirul de conexiune PostgreSQL (Neon / Supabase) | `postgresql://user:pass@ep-xyz.eu-central-1.aws.neon.tech/actesimple?sslmode=require` |

> **Important de securitate:** Nu includeți niciodată parola de administrator sau cheile secrete în codul sursă comis pe GitHub.

---

## 3. Inițializarea Bazei de Date PostgreSQL (Supabase / Neon)

1. Creați un proiect gratuit pe [Neon.tech](https://neon.tech) sau [Supabase.com](https://supabase.com).
2. Deschideți consola **SQL Editor** a bazei de date.
3. Rulați scriptul complet din `database/schema.sql`:
   - Se vor crea tabelele cu chei străine (`FOREIGN KEY`), constrângeri (`CHECK`) și indexuri pentru performanță (`CREATE INDEX`).
   - Se activează politicile de securitate la nivel de rând (**Row Level Security - RLS**), asigurând că publicul are acces doar la citire (read-only) pentru procedurile cu statut `published`.

---

## 4. Publicare pe Vercel (Step-by-Step)

1. Conectați repository-ul GitHub la Vercel:
   ```bash
   # Opțional prin Vercel CLI
   vercel link
   ```
2. În panoul Vercel:
   - **Framework Preset:** Vite / Other
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
3. În secțiunea **Environment Variables**, adăugați:
   - `ADMIN_PASSWORD`
   - `ADMIN_API_KEY`
   - `DATABASE_URL` (dacă este activată conexiunea directă)
4. Apăsați butonul **Deploy**.

---

## 5. Administrare și Atestare a Verificărilor Oficiale

- Accesați aplicația și faceți clic pe butonul **Administrare** din bara de navigare.
- Introduceți parola de administrator configurată în `ADMIN_PASSWORD`.
- **Atestarea verificării oficiale:**
  1. În tabelul procedurilor, faceți clic pe butonul **Verifică** din dreptul procedurii.
  2. Completați numele persoanei care a efectuat verificarea și notele detaliate (ex: *„Verificat pe hub.mai.gov.ro, taxa este de 0 lei”*).
  3. Bifați confirmarea pe propria răspundere și salvați.
  4. Acțiunea va fi înregistrată automat în **Jurnalul de Audit** (`/api/admin/audit-logs`).
- **Ghiduri ce necesită revizuire:** Panoul marchează automat cu eticheta `> 6 luni!` orice procedură a cărei verificare este mai veche de 180 de zile.

---

## 6. Procedură de Rollback

În cazul identificării unei regresiuni sau a unor date eronate:
1. În **Vercel Dashboard > Deployments**, selectați versiunea anterioară stabilă și apăsați **Instant Rollback**.
2. Pentru restabilirea procedurilor demonstrate oficiale, administratorul poate apăsa oricând butonul **Restabilește Seed** din panoul de administrare (necesită confirmare explicită).

---

## 7. Rularea Testelor Automate

Pentru a verifica integritatea căutării, a diacriticelor, a sinonimelor și a securității:
```bash
npm run test
```
Toate cele 11 teste unitare și de integrare rulează fără dependențe externe de rețea.
