'use client';

import React, { useState } from 'react';
import type { UnderwritingScenarioRow } from '@/types/underwriting';
import { toDisplayType } from '@/utils/scenarios';
import { formatCurrency, formatPercent, formatMultiple } from '@/utils/underwriting';
import type { UnderwritingResults } from '@/utils/underwriting';
import styles from './ScenarioList.module.css';

interface ScenarioListProps {
  scenarios: UnderwritingScenarioRow[];
  activeScenarioId: string | null;
  onSelect: (id: string) => void;
  onPromote: (id: string) => void;
  onDelete: (id: string) => void;
  onNew: () => void;
}

export default function ScenarioList({
  scenarios,
  activeScenarioId,
  onSelect,
  onPromote,
  onDelete,
  onNew,
}: ScenarioListProps) {
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    if (confirmDeleteId === id) {
      onDelete(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Scenarios</h3>
        <button className={styles.newButton} onClick={onNew}>+ New Scenario</button>
      </div>

      <div className={styles.list}>
        {scenarios.map((scenario) => {
          const res = scenario.results as UnderwritingResults;
          const isActive = scenario.id === activeScenarioId;

          return (
            <div
              key={scenario.id}
              className={`${styles.card} ${isActive ? styles.cardActive : ''}`}
              onClick={() => onSelect(scenario.id)}
            >
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  {scenario.is_primary && <span className={styles.primaryStar}>&#9733;</span>}
                  {scenario.name}
                </div>
                <span className={styles.strategyBadge}>
                  {toDisplayType(scenario.strategy_type)}
                </span>
              </div>

              <div className={styles.metrics}>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>IRR</span>
                  <span className={styles.metricValue}>{formatPercent(res.irr)}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Cap Rate</span>
                  <span className={styles.metricValue}>{formatPercent(res.capRate)}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>EM</span>
                  <span className={styles.metricValue}>{formatMultiple(res.equityMultiple)}</span>
                </div>
                <div className={styles.metric}>
                  <span className={styles.metricLabel}>Cash Flow</span>
                  <span className={styles.metricValue}>{formatCurrency(res.monthlyCashFlow)}/mo</span>
                </div>
              </div>

              <div className={styles.actions}>
                <button
                  className={styles.actionButton}
                  onClick={(e) => { e.stopPropagation(); onSelect(scenario.id); }}
                >
                  View
                </button>
                {!scenario.is_primary && (
                  <>
                    <button
                      className={styles.actionButton}
                      onClick={(e) => { e.stopPropagation(); onPromote(scenario.id); }}
                    >
                      Promote
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.deleteButton}`}
                      onClick={(e) => { e.stopPropagation(); handleDelete(scenario.id); }}
                    >
                      {confirmDeleteId === scenario.id ? 'Confirm?' : 'Delete'}
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
