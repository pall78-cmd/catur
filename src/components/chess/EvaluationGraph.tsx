import React, { useMemo } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';

interface EvaluationGraphProps {
  perMoveEvalMap: Record<number, { evaluation?: string }>;
  history: any[];
  currentMoveIndex: number;
  onNodeClick: (index: number) => void;
}

export const EvaluationGraph: React.FC<EvaluationGraphProps> = ({
  perMoveEvalMap,
  history,
  currentMoveIndex,
  onNodeClick,
}) => {
  const data = useMemo(() => {
    const chartData = [];
    
    // Move 0 (Start pos)
    chartData.push({
      index: -1,
      moveName: 'Posisi Awal',
      cp: 0,
      mate: null,
      val: 0,
    });
    
    for (let i = 0; i < history.length; i++) {
      const move = history[i];
      let val = 0;
      let cp = 0;
      let mate = null;
      
      const moveEval = perMoveEvalMap[i]?.evaluation;
      if (moveEval) {
        if (moveEval.startsWith('+M') || moveEval.startsWith('-M')) {
          mate = parseInt(moveEval.replace(/[^0-9-]/g, ''), 10);
          if (moveEval.startsWith('-M')) mate = -Math.abs(mate);
          val = mate > 0 ? 10 : -10;
        } else {
          const parsed = parseFloat(moveEval);
          if (!isNaN(parsed)) {
            val = Math.max(-10, Math.min(10, parsed));
            cp = parsed;
          }
        }
      } else {
        // Carry over from previous if not yet evaluated
        val = chartData[chartData.length - 1].val;
        cp = chartData[chartData.length - 1].cp;
        mate = chartData[chartData.length - 1].mate;
      }
      
      chartData.push({
        index: i,
        moveName: `${Math.floor(i / 2) + 1}${i % 2 === 0 ? '.' : '...'} ${move.san}`,
        cp,
        mate,
        val,
      });
    }
    return chartData;
  }, [perMoveEvalMap, history]);

  return (
    <div className="w-full h-[80px] bg-neutral-900 rounded-xl overflow-hidden border border-neutral-800 relative select-none">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          onClick={(e: any) => {
            if (e && e.activePayload && e.activePayload.length > 0) {
              const payload = e.activePayload[0].payload;
              onNodeClick(payload.index);
            }
          }}
        >
          <defs>
            <linearGradient id="splitColor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f3f4f6" stopOpacity={0.9} />
              <stop offset="50%" stopColor="#f3f4f6" stopOpacity={0.3} />
              <stop offset="50%" stopColor="#1f2937" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#1f2937" stopOpacity={0.9} />
            </linearGradient>
          </defs>

          <XAxis dataKey="index" hide />
          <YAxis domain={[-10, 10]} hide />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                const evalStr = data.mate ? `M${Math.abs(data.mate)}` : (data.cp > 0 ? `+${data.cp}` : data.cp);
                return (
                  <div className="bg-neutral-800 border border-neutral-700 text-white p-2 rounded shadow-md text-xs font-mono z-50">
                    <p className="font-semibold text-neutral-300 mb-1">{data.moveName}</p>
                    <p className={data.val > 0 ? 'text-neutral-100' : 'text-neutral-400'}>
                      Eval: {evalStr}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine y={0} stroke="#4b5563" strokeDasharray="2 2" strokeWidth={1} />
          <Area
            type="stepAfter"
            dataKey="val"
            stroke="#9ca3af"
            strokeWidth={1.5}
            fill="url(#splitColor)"
            isAnimationActive={false}
          />
          
          {currentMoveIndex >= -1 && (
            <ReferenceLine 
              x={currentMoveIndex} 
              stroke="#6366f1" 
              strokeWidth={2}
              isFront={true}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
