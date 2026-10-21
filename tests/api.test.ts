import { describe, it } from 'node:test';
import assert from 'node:assert';
import { dbService, normalizeText } from '../src/server/db.ts';
import {
  procedureCreateSchema,
  verifyProcedureSchema,
  adminLoginSchema,
} from '../src/server/validation.ts';
import { loginAdmin } from '../src/server/auth.ts';

describe('ActeSimple Test Suite', () => {
  it('NormalizeText elimină diacriticele corect (ă, â, î, ș, ț)', () => {
    assert.strictEqual(normalizeText('Înmatriculare auto'), 'inmatriculare auto');
    assert.strictEqual(normalizeText('Căsătorie și pașaport'), 'casatorie si pasaport');
    assert.strictEqual(normalizeText('Ședință la ghișeu'), 'sedinta la ghiseu');
  });

  it('Căutarea după sinonime funcționează (ex: buletin găsește carte de identitate)', () => {
    const res = dbService.getAllProcedures({ search: 'buletin' });
    assert.ok(res.procedures.length > 0, 'Trebuie să găsească proceduri pentru sinonimul buletin');
    const hasBuletin = res.procedures.some((p) => p.slug.includes('carte-identitate'));
    assert.ok(hasBuletin, 'Procedura carte de identitate trebuie să fie prezentă');
  });

  it('Căutarea fără diacritice funcționează (inmatriculare fără î/â)', () => {
    const res = dbService.getAllProcedures({ search: 'inmatriculare' });
    assert.ok(res.procedures.length > 0, 'Trebuie să găsească înmatricularea chiar fără diacritice');
    assert.ok(res.procedures.some((p) => p.slug.includes('inmatriculare')));
  });

  it('Căutarea sinonimului "cazier" returnează cazierul judiciar', () => {
    const res = dbService.getAllProcedures({ search: 'cazier' });
    assert.ok(res.procedures.length > 0);
    assert.ok(res.procedures.some((p) => p.slug.includes('cazier')));
  });

  it('Filtrarea pe categorii funcționează corect', () => {
    const res = dbService.getAllProcedures({ category: 'auto' });
    assert.ok(res.procedures.length > 0);
    res.procedures.forEach((p) => {
      assert.strictEqual(p.category, 'auto', 'Fiecare procedură returnată trebuie să fie din categoria auto');
    });
  });

  it('Filtrarea după proceduri online funcționează', () => {
    const res = dbService.getAllProcedures({ onlineOnly: true });
    assert.ok(res.procedures.length > 0);
    res.procedures.forEach((p) => {
      assert.strictEqual(p.is_online_available, true, 'Trebuie să fie marcată ca online');
    });
  });

  it('Validarea Zod respinge o procedură fără titlu sau cu date invalide', () => {
    const invalidData = {
      title: '', // prea scurt
      short_description: 'scurt', // mai puțin de 10 caractere
    };
    const parse = procedureCreateSchema.safeParse(invalidData);
    assert.strictEqual(parse.success, false, 'Trebuie să respingă datele invalide');
  });

  it('Validarea Zod acceptă o verificare oficială completă și o respinge dacă lipsește confirmarea responsabilității', () => {
    const validVerify = {
      verifier_name: 'Consilier Juridic',
      verification_notes: 'Verificat cu OUG 97/2005 și site-ul oficial.',
      is_confirmed_correct: true,
    };
    const parseValid = verifyProcedureSchema.safeParse(validVerify);
    assert.strictEqual(parseValid.success, true);

    const invalidVerify = {
      verifier_name: 'Consilier Juridic',
      verification_notes: 'Note sumare',
      is_confirmed_correct: false, // neconfirmat
    };
    const parseInvalid = verifyProcedureSchema.safeParse(invalidVerify);
    assert.strictEqual(parseInvalid.success, false, 'Trebuie să respingă dacă is_confirmed_correct este false');
  });

  it('Autentificarea administratorului respinge parolele greșite', () => {
    const res = loginAdmin('parola_total_gresita', 'test-ip-1');
    assert.strictEqual(res.success, false);
    assert.ok(res.error);
  });

  it('Autentificarea administratorului acceptă parola corectă și emite token', () => {
    const res = loginAdmin('actesimple2026admin', 'test-ip-2');
    assert.strictEqual(res.success, true);
    assert.ok(res.token && res.token.startsWith('adm_'));
  });

  it('Verificarea atestată a unei proceduri actualizează data și notele verificatorului', () => {
    const procs = dbService.getAllProcedures().procedures;
    const testProc = procs[0];
    const today = new Date().toISOString().slice(0, 10);

    const updated = dbService.verifyProcedureWithDetails(
      testProc.id,
      {
        verifier_name: 'Tester Oficial',
        verification_notes: 'Verificat conformitatea în testul automat.',
        verified_at: today,
      },
      'TestRunner'
    );

    assert.ok(updated);
    assert.strictEqual(updated.last_verified_at, today);
    assert.strictEqual(updated.verified_by, 'Tester Oficial');
    assert.strictEqual(updated.verification_notes, 'Verificat conformitatea în testul automat.');
  });
});
