import { motion } from 'framer-motion';

export function AITrendSection() {
  
  // 청소년 AI 이미지 도구 활용률 데이터 (가상)
  const trendData = [
    { year: '2021', value: 12, label: '12%' },
    { year: '2022', value: 28, label: '28%' },
    { year: '2023', value: 54, label: '54%' },
    { year: '2024', value: 72, label: '72%' },
    { year: '2025', value: 89, label: '89%' },
  ];

  const aiTools = [
    { name: 'DALL-E 3', usage: 78, color: 'from-brand-cyan-500 to-brand-cyan-300' },
    { name: 'Midjourney', usage: 65, color: 'from-blue-500 to-blue-300' },
    { name: 'Stable Diffusion', usage: 52, color: 'from-indigo-500 to-indigo-300' },
    { name: 'Adobe Firefly', usage: 41, color: 'from-slate-500 to-slate-300' },
  ];

  return (
    <section className="py-24 relative bg-white"> 
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-brand-cyan-600 text-xs font-mono tracking-[0.3em] uppercase mb-4 block font-bold">
              Data Analysis
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight break-keep">
              청소년 <span className="text-brand-cyan-600">AI 이미지</span> 활용 트렌드
            </h2>
            <p className="text-gray-600 text-base sm:text-lg font-normal max-w-3xl mx-auto leading-relaxed break-keep">
              10-20대 청소년들의 AI 이미지 생성 도구 활용률이 급격히 증가하고 있습니다. <br className="hidden sm:inline"/>
              이러한 트렌드를 활용하여 독도 인식 개선 캠페인의 효과를 극대화합니다.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Line Chart - 연도별 활용률 */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-xl p-8 border border-gray-200 shadow-xl relative overflow-hidden group"
            >
              <div className="flex justify-between items-end mb-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">Utilization Rate</h3>
                    <p className="text-gray-500 text-xs font-mono tracking-wider">ANNUAL GROWTH (10-20s)</p>
                </div>
                <div className="text-brand-cyan-600 font-mono text-xs border border-brand-cyan-200 px-2 py-1 rounded-md bg-brand-cyan-50">
                    LIVE DATA
                </div>
              </div>
              
              {/* Chart */}
              <div className="relative h-64 border-l border-b border-gray-200">
                {/* Y-axis labels */}
                {/* Chart area */}
                <div className="absolute inset-0 pl-4 pb-4 flex items-end justify-between gap-4">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex flex-col justify-between pointer-events-none z-0">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div key={i} className="border-t border-gray-100 w-full h-0"></div>
                    ))}
                  </div>
                  
                  {/* Bars */}
                  {trendData.map((item, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center relative z-10 h-full justify-end group/bar">
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 + 0.5 }}
                        className="mb-2 transition-all duration-300 transform translate-y-2 opacity-0 group-hover/bar:translate-y-0 group-hover/bar:opacity-100"
                      >
                        <span className="text-brand-cyan-600 text-xs font-bold font-mono">
                          {item.label}
                        </span>
                      </motion.div>
                      <motion.div 
                        className="w-full max-w-12 bg-gradient-to-t from-brand-cyan-500 to-brand-cyan-400 rounded-t-sm relative shadow-md"
                        initial={{ height: 0 }}
                        whileInView={{ height: `${item.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: index * 0.2, type: "spring", damping: 20 }}
                      />
                      <div className="mt-3 text-gray-500 text-xs font-mono font-medium">{item.year}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Insight */}
              <div className="mt-8 flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-lg">
                 <span className="text-gray-500 text-xs font-mono">GROWTH METRIC</span>
                 <div className="flex items-center gap-2 text-brand-cyan-600 text-sm font-bold font-mono">
                  <i className="ri-arrow-up-line"></i>
                  <span>641% INCREASE</span>
                 </div>
              </div>
            </motion.div>

            {/* Bar Chart - AI 도구별 선호도 */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-white rounded-xl p-8 border border-gray-200 shadow-xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">Platform Preference</h3>
              <p className="text-gray-500 text-xs font-mono tracking-wider mb-8">MARKET SHARE BY TOOL</p>
              
              <div className="space-y-8">
                {aiTools.map((tool, index) => (
                  <div key={index} className="space-y-2 group">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 group-hover:text-gray-900 transition-colors text-xs font-mono uppercase tracking-wide font-semibold">{tool.name}</span>
                      <span className="text-brand-cyan-600 font-bold font-mono">{tool.usage}%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className={`h-full bg-gradient-to-r ${tool.color} rounded-full relative shadow-sm`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${tool.usage}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 + index * 0.15, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>

               <div className="mt-10 grid grid-cols-2 gap-3">
                  <div className="text-[10px] text-gray-400 font-mono border border-gray-100 p-2 rounded-md uppercase">
                    * Data updated real-time
                  </div>
                   <div className="text-[10px] text-gray-400 font-mono border border-gray-100 p-2 rounded-md uppercase text-right">
                    Source: KUDA Analytics
                  </div>
               </div>
            </motion.div>
          </div>

          {/* Bottom Stats - Data Blocks */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12 bg-gray-50 rounded-2xl p-6 border border-gray-100">
            {[
                { val: '89%', label: '2025 Utilization' },
                { val: '78%', label: 'DALL-E Pref.' },
                { val: '10-20', label: 'Primary Age' },
                { val: '641%', label: '4-Year Growth' }
            ].map((stat, i) => (
                <motion.div 
                  key={i} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1 + i * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="text-center p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-brand-cyan-200 transition-all group"
                >
                    <div className="text-3xl font-bold text-gray-900 mb-1 font-mono group-hover:text-brand-cyan-600 transition-colors">{stat.val}</div>
                    <div className="text-gray-400 text-[10px] font-medium uppercase tracking-widest">{stat.label}</div>
                </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
