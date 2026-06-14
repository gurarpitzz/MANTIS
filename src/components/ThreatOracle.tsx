import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThreatForecastBranch } from '../types';
import { 
  Sparkles, TrendingUp, AlertCircle, Ban, 
  HelpCircle, Percent, ArrowRight, CornerDownRight 
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ThreatOracleProps {
  branches: ThreatForecastBranch[];
  selectedBranch: ThreatForecastBranch | null;
  onSelectBranch: (branch: ThreatForecastBranch | null) => void;
}

export const ThreatOracle: React.FC<ThreatOracleProps> = ({
  branches,
  selectedBranch,
  onSelectBranch
}) => {
  return (
    <div className="w-full h-full min-h-0 flex flex-col lg:flex-row gap-5 overflow-hidden">
      
      {/* Holographic Branching Timelines Map */}
      <div className="flex-grow min-h-[220px] lg:min-h-0 relative border border-white/5 bg-black/60 rounded-3xl p-5 overflow-hidden flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex justify-between items-center z-10 border-b border-white/5 pb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="text-amber-neon animate-spin" size={12} />
              <span className="text-[10px] font-black tracking-[0.4em] text-amber-neon uppercase">MANTIS Threat Oracle</span>
            </div>
            <div className="text-[8px] font-mono text-white/30 uppercase tracking-widest">
              Predictive transformer sequencing & Branching future outcomes
            </div>
          </div>
          <div>
            <span className="px-2.5 py-0.5 bg-amber-neon/10 border border-amber-neon/20 rounded text-[8.5px] text-amber-neon tracking-wider font-bold">
              TIMELINES MONITORED: 3 ACTIVE
            </span>
          </div>
        </div>

        {/* Dynamic Timeline visualization */}
        <div className="flex-1 my-4 flex flex-col justify-start gap-3.5 relative min-h-0 overflow-y-auto pr-1.5 custom-scrollbar">
          {branches.map((branch) => {
            const isSelected = selectedBranch?.id === branch.id;
            return (
              <motion.div
                key={branch.id}
                onClick={() => onSelectBranch(branch)}
                whileHover={{ scale: 1.005 }}
                className={cn(
                  "p-4 rounded-2xl border transition-all duration-300 cursor-pointer relative overflow-hidden",
                  isSelected
                    ? 'bg-white/[0.04] border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.03)]'
                    : 'bg-white/[0.01] border-white/5 opacity-50 hover:bg-white/[0.02]'
                )}
              >
                {/* Horizontal left indicator */}
                <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: branch.color }} />
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div>
                    <h4 className="text-xs font-extrabold text-white leading-normal flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: branch.color }} />
                      {branch.scenarioName}
                    </h4>
                    <p className="text-[7.5px] tracking-[0.1em] text-white/30 font-mono mt-0.5">PROSPECTIVE TIMELINE PATHWAY</p>
                  </div>
                  
                  <div className="flex items-center gap-4 text-right shrink-0">
                    <div>
                      <span className="text-[7px] uppercase tracking-widest font-mono opacity-30 block">Prob</span>
                      <span className="text-[11px] font-black font-mono" style={{ color: branch.color }}>{branch.probability}%</span>
                    </div>
                    <div>
                      <span className="text-[7px] uppercase tracking-widest font-mono opacity-30 block">Loss Outcome</span>
                      <span className="text-[11px] font-black font-mono text-white leading-none">{branch.expectedLoss}</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Nodes Horizontal Loop */}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {branch.nodesTimeline.slice(0, 3).map((nodeText, idx) => (
                    <React.Fragment key={idx}>
                      <div className="px-2 py-1 bg-black/40 border border-white/5 rounded-lg text-[8.5px] font-mono text-white/70">
                        {nodeText}
                      </div>
                      {idx < 2 && <ArrowRight className="text-white/20" size={10} />}
                    </React.Fragment>
                  ))}
                  {branch.nodesTimeline.length > 3 && (
                    <span className="text-[8px] font-mono text-white/30 ml-1.5">+{branch.nodesTimeline.length - 3} more segments</span>
                  )}
                </div>

              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em] pt-3 border-t border-white/5">
          Predictive engine predicting attacker sequence vectors before cashout event.
        </div>
      </div>

      {/* Selected Forecast Details View */}
      <div className="w-full lg:w-72 xl:w-80 shrink-0 h-[220px] lg:h-full min-h-0 overflow-y-auto pr-1 z-10 custom-scrollbar flex flex-col gap-4">
        
        {/* Branch metrics Card */}
        <div className="bg-glass border border-white/10 rounded-3xl p-5 shrink-0">
          <h5 className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 mb-3 flex items-center gap-2">
            <TrendingUp size={12} /> Timeline Metrics
          </h5>
          
          <div className="space-y-3">
            <div>
              <span className="text-[7.5px] uppercase tracking-widest font-mono opacity-30 block mb-0.5">Expected Financial Damages</span>
              <span className="text-2xl font-black text-white tracking-tighter">
                {selectedBranch ? selectedBranch.expectedLoss : '₹0'}
              </span>
            </div>

            <div>
              <span className="text-[7.5px] uppercase tracking-widest font-mono opacity-30 block mb-0.5">Probability Occurrence Cloud</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black font-mono" style={{ color: selectedBranch?.color }}>
                  {selectedBranch ? selectedBranch.probability : 0}%
                </span>
                <span className="text-[8.5px] text-white/30 leading-snug">Likelihood based on Jamtara Trojan models</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step-by-Step branching node timeline */}
        <AnimatePresence mode="wait">
          {selectedBranch ? (
            <motion.div
              key={selectedBranch.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex-grow bg-glass border border-white/10 rounded-3xl p-5 flex flex-col justify-between overflow-hidden min-h-[160px]"
            >
              <div className="flex flex-col min-h-0 h-full">
                <h5 className="text-[9px] tracking-widest uppercase opacity-40 font-bold mb-4 flex items-center gap-2 shrink-0">
                  <CornerDownRight size={12} /> Sequence Path steps
                </h5>
                
                <div className="flex-1 space-y-3 overflow-y-auto pr-1 custom-scrollbar min-h-0">
                  {selectedBranch.nodesTimeline.map((step, idx) => (
                    <div key={idx} className="flex gap-2.5 relative min-h-0 pl-1 py-0.5">
                      {/* Vertical connector */}
                      {idx < selectedBranch.nodesTimeline.length - 1 && (
                        <div className="absolute left-[3px] top-[14px] w-[1px] h-[calc(100%-8px)] bg-white/10" />
                      )}
                      <span 
                        className="w-1.5 h-1.5 rounded-full mt-[5px] shrink-0" 
                        style={{ backgroundColor: selectedBranch.color }} 
                      />
                      <span className="text-[9.5px] leading-relaxed font-mono text-white/80">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 border-t border-white/5 pt-3.5 shrink-0">
                <div className={cn(
                  "p-2.5 rounded-xl border flex items-center gap-2.5 justify-center",
                  selectedBranch.status === 'blocked'
                    ? "bg-amber-neon/15 border-amber-neon/40 text-amber-neon text-glow-amber"
                    : selectedBranch.status === 'partially_mitigated'
                      ? "bg-cyan-data/15 border-cyan-data/40 text-cyan-data text-glow-cyan"
                      : "bg-red-threat/15 border-red-threat/40 text-red-threat"
                )}>
                  {selectedBranch.status === 'blocked' ? (
                    <>
                      <Ban size={12} />
                      <span className="text-[8.5px] uppercase font-bold tracking-widest">PROACTIVE MUTATION DEFUSED FUTURE EVENT</span>
                    </>
                  ) : selectedBranch.status === 'partially_mitigated' ? (
                    <>
                      <Sparkles size={12} />
                      <span className="text-[8.5px] uppercase font-bold tracking-widest">SANDBOX DECEPTION RE-ROUTING DAMAGE PATH</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle size={12} />
                      <span className="text-[8.5px] uppercase font-bold tracking-widest">CRITICAL EXPLOIT PIPELINE CURRENTLY RUNNING</span>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="flex-grow border border-dashed border-white/10 rounded-3xl p-5 flex flex-col justify-center items-center text-center">
              <Sparkles className="opacity-20 text-white mb-3 animate-spin" size={24} />
              <h5 className="text-[10px] font-bold uppercase tracking-widest text-white mb-1.5">Select Branch Matrix</h5>
              <p className="text-[8.5px] text-white/40 leading-relaxed max-w-xs">
                Select any prospective branch timeline on the left to display its full exfiltration sequence and action recommendations.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
