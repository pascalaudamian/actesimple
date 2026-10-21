import { useState, useEffect, useCallback } from 'react';
import { UserChecklistState, DocumentItem, StepItem } from '../types.ts';

const STORAGE_PREFIX = 'actesimple_chk_';

export function useChecklist(procedureId: string, documents: DocumentItem[] = [], steps: StepItem[] = []) {
  const storageKey = `${STORAGE_PREFIX}${procedureId}`;

  const [state, setState] = useState<UserChecklistState>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error reading checklist from localStorage:', e);
    }
    return {
      checkedDocumentIds: [],
      checkedStepNumbers: [],
      customDocuments: [],
      personalNotes: '',
      appointmentDate: '',
      appointmentLocation: '',
      lastUpdated: new Date().toISOString(),
    };
  });

  // Keep localStorage updated when state changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.warn('Error saving checklist to localStorage:', e);
    }
  }, [state, storageKey]);

  const toggleDoc = useCallback((docId: string) => {
    setState((prev) => {
      const exists = prev.checkedDocumentIds.includes(docId);
      const updated = exists
        ? prev.checkedDocumentIds.filter((id) => id !== docId)
        : [...prev.checkedDocumentIds, docId];
      return {
        ...prev,
        checkedDocumentIds: updated,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const toggleStep = useCallback((stepNum: number) => {
    setState((prev) => {
      const exists = prev.checkedStepNumbers.includes(stepNum);
      const updated = exists
        ? prev.checkedStepNumbers.filter((n) => n !== stepNum)
        : [...prev.checkedStepNumbers, stepNum];
      return {
        ...prev,
        checkedStepNumbers: updated,
        lastUpdated: new Date().toISOString(),
      };
    });
  }, []);

  const addCustomDoc = useCallback((name: string) => {
    if (!name.trim()) return;
    setState((prev) => ({
      ...prev,
      customDocuments: [
        ...prev.customDocuments,
        {
          id: `custom-${Date.now()}`,
          name: name.trim(),
          is_checked: false,
        },
      ],
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const toggleCustomDoc = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      customDocuments: prev.customDocuments.map((doc) =>
        doc.id === id ? { ...doc, is_checked: !doc.is_checked } : doc
      ),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const deleteCustomDoc = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      customDocuments: prev.customDocuments.filter((doc) => doc.id !== id),
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const setNotes = useCallback((notes: string) => {
    setState((prev) => ({
      ...prev,
      personalNotes: notes,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const setAppointmentDate = useCallback((date: string) => {
    setState((prev) => ({
      ...prev,
      appointmentDate: date,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const setAppointmentLocation = useCallback((loc: string) => {
    setState((prev) => ({
      ...prev,
      appointmentLocation: loc,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const checkAllDocs = useCallback(() => {
    setState((prev) => ({
      ...prev,
      checkedDocumentIds: documents.map((d) => d.id),
      customDocuments: prev.customDocuments.map((d) => ({ ...d, is_checked: true })),
      lastUpdated: new Date().toISOString(),
    }));
  }, [documents]);

  const resetChecklist = useCallback(() => {
    setState({
      checkedDocumentIds: [],
      checkedStepNumbers: [],
      customDocuments: [],
      personalNotes: '',
      appointmentDate: '',
      appointmentLocation: '',
      lastUpdated: new Date().toISOString(),
    });
  }, []);

  // Compute progress
  const totalStandardDocs = documents.length;
  const totalCustomDocs = state.customDocuments.length;
  const totalDocs = totalStandardDocs + totalCustomDocs;

  const checkedStandardDocs = documents.filter((d) => state.checkedDocumentIds.includes(d.id)).length;
  const checkedCustomDocs = state.customDocuments.filter((d) => d.is_checked).length;
  const totalCheckedDocs = checkedStandardDocs + checkedCustomDocs;

  const docPercentage = totalDocs > 0 ? Math.round((totalCheckedDocs / totalDocs) * 100) : 0;

  const totalSteps = steps.length;
  const checkedStepsCount = steps.filter((s) => state.checkedStepNumbers.includes(s.step_number)).length;
  const stepPercentage = totalSteps > 0 ? Math.round((checkedStepsCount / totalSteps) * 100) : 0;

  // Format printable / shareable summary text
  const generateShareText = (procedureTitle: string): string => {
    let text = `📋 ActeSimple - Dosar: ${procedureTitle}\n`;
    text += `Progres documente: ${totalCheckedDocs}/${totalDocs} (${docPercentage}%)\n\n`;

    text += `DOCUMENTAȚIE:\n`;
    documents.forEach((d) => {
      const isDone = state.checkedDocumentIds.includes(d.id);
      text += `${isDone ? '✅' : '⬜'} ${d.name} (${d.type})\n`;
    });

    if (state.customDocuments.length > 0) {
      text += `\nACTE SUPLIMENTARE PERSONALE:\n`;
      state.customDocuments.forEach((cd) => {
        text += `${cd.is_checked ? '✅' : '⬜'} ${cd.name}\n`;
      });
    }

    if (state.appointmentDate) {
      text += `\n📅 Programare: ${state.appointmentDate}`;
      if (state.appointmentLocation) {
        text += ` la ${state.appointmentLocation}`;
      }
      text += `\n`;
    }

    if (state.personalNotes) {
      text += `\n📝 Notițe: ${state.personalNotes}\n`;
    }

    text += `\nGenerat pe ActeSimple.ro`;
    return text;
  };

  return {
    state,
    toggleDoc,
    toggleStep,
    addCustomDoc,
    toggleCustomDoc,
    deleteCustomDoc,
    setNotes,
    setAppointmentDate,
    setAppointmentLocation,
    checkAllDocs,
    resetChecklist,
    docProgress: {
      checked: totalCheckedDocs,
      total: totalDocs,
      percentage: docPercentage,
      isComplete: totalDocs > 0 && totalCheckedDocs === totalDocs,
    },
    stepProgress: {
      checked: checkedStepsCount,
      total: totalSteps,
      percentage: stepPercentage,
    },
    generateShareText,
  };
}

// Helper to list all procedures with user activity in localStorage
export function getAllSavedUserChecklists(): Array<{ procedureId: string; checkedDocsCount: number; lastUpdated: string }> {
  const results: Array<{ procedureId: string; checkedDocsCount: number; lastUpdated: string }> = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        const procedureId = key.replace(STORAGE_PREFIX, '');
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        const checkedDocsCount = (data.checkedDocumentIds?.length || 0) + (data.customDocuments?.filter((d: any) => d.is_checked)?.length || 0);
        if (checkedDocsCount > 0 || data.personalNotes || data.appointmentDate) {
          results.push({
            procedureId,
            checkedDocsCount,
            lastUpdated: data.lastUpdated || '',
          });
        }
      }
    }
  } catch (e) {
    console.warn('Error reading saved checklists:', e);
  }
  return results;
}
