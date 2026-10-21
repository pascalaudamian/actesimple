import React from 'react';
import { FileCheck, ShieldCheck, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs sm:text-sm border-t border-slate-800 mt-20 print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <FileCheck className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                Acte<span className="text-blue-400">Simple</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs sm:text-sm max-w-md">
              Ghidul tău practic prin labirintul administrativ din România. Îți oferim liste complete de documente, pași ordonați cronologic, taxe oficiale și checklist-uri interactive salvate pe dispozitivul tău, fără cont.
            </p>
            <div className="pt-2 text-xs text-slate-500">
              Informații actualizate periodic conform reglementărilor naționale 2026.
            </div>
          </div>

          {/* Official Portals Quick Links */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Portaluri Oficiale România
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.ghiseul.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>Ghișeul.ro (Plăți taxe online)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://hub.mai.gov.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>HUB MAI (Cazier, Programări)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://dgpci.mai.gov.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>DGPCI (Permise &amp; Înmatriculări)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://pasapoarte.mai.gov.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>Direcția Generală de Pașapoarte</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://portal.myonrc.onrc.ro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition flex items-center gap-1.5"
                >
                  <span>MyONRC (Registrul Comerțului)</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Civic Transparency */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
              Transparență &amp; Confidențialitate
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Nu colectăm date cu caracter personal. Toate bifările și notițele tale sunt păstrate exclusiv în memoria locală a browserului tău (localStorage).
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Fără cookies de tracking</span>
            </div>
          </div>

        </div>

        {/* Disclaimer row */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <p>
            © {new Date().getFullYear()} ActeSimple. Proiect civic independent de simplificare a birocrației.
          </p>
          <p className="flex items-center gap-1 justify-center">
            Creat cu grijă pentru cetățenii din România
          </p>
        </div>

      </div>
    </footer>
  );
};
