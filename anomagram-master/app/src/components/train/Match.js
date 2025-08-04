import React, { useEffect, useState } from 'react';
import PlayerComparisonChart from './PlayerComparisonChart';
import PlayerAnomalyChart from './PlayerAnomalyChart';
import ComparePlayerBehaviorChart from './ComparePlayerBehaviorChart';
import TacticalChangeChart from './TacticalChangeChart';
import { MatchProvider } from '../../context/MatchContext';
import MatchSelector from './MatchSelector';

const RolesView = () => {
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    // Delay showing charts to prevent race conditions
    const timer = setTimeout(() => setShowCharts(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <MatchProvider>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <MatchSelector />
        {showCharts && (
          <>
            <div className="mb-6">
              <PlayerComparisonChart />
            </div>
            <div className="mb-6">
              <PlayerAnomalyChart />
            </div>
            <div className="mb-6">
              <ComparePlayerBehaviorChart />
            </div>
            <div className="mb-6">
              <TacticalChangeChart />
            </div>
          </>
        )}
      </div>
    </MatchProvider>
  );
};

export default RolesView;
