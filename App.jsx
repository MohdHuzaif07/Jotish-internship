import { useState, useEffect } from 'react';
import Map from './Map.jsx'; // Importing the Map component
const apiurl = "https://backend.jotish.in/backend_dev/gettabledata.php";

function App() {
  // --- 1. STATE MANAGEMENT ---
  const [data, setData] = useState([]); // Initialized as Array for virtualization
  const [screen, setScreen] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [scrollTop, setScrollTop] = useState(0);
  const [stream, setStream] = useState(null);
  const [capturedImg, setCapturedImg] = useState(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [finalAuditImage, setFinalAuditImage] = useState(null);
  const [chartLoaded, setChartLoaded] = useState(false);
  const [count, setCount] = useState(0);

  // --- 2. DATA FETCHING (BACKEND INTEGRATION) ---
  useEffect(() => {
    fetch(apiurl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ "username": "test", "password": "123456" })
    })
    .then(res => res.json())
    .then(json => {
      if (json.TABLE_DATA && json.TABLE_DATA.data) {
        const mappedData = json.TABLE_DATA.data.map((item, index) => ({
          id: item[3] || index, // ID from API
          name: item[0],        // Name
          role: item[1],        // Role
          salary: item[5]       // Salary
        }));
        setData(mappedData);
      }
    })
    .catch(err => console.log("Error fetching data:", err));
  }, []);

  // --- 3. CUSTOM VIRTUALIZATION LOGIC ---
  const rowHeight = 60; 
  const viewportHeight = 500; 
  const startIndex = Math.floor(scrollTop / rowHeight);
  
  // Calculate indices based on dynamic 'data' state
  const endIndex = Math.min(
    data.length - 1,
    Math.floor((scrollTop + viewportHeight) / rowHeight)
  );
  
  const visibleData = data.slice(
    Math.max(0, startIndex - 2), 
    Math.min(data.length, endIndex + 2)
  );

  // --- 4. EFFECTS & PERSISTENCE ---
  useEffect(() => {
    if (screen === 'insights') {
      const timer = setTimeout(() => setChartLoaded(true), 50); 
      return () => clearTimeout(timer);
    } else {
      setChartLoaded(false);
    }
  }, [screen]);

  useEffect(() => {
    const saved = localStorage.getItem('isLoggedIn');
    if (saved === 'true') setScreen('dashboard');
  }, []);

  // --- 5. EVENT HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (email === "testuser" && password === "Test123") {
      localStorage.setItem('isLoggedIn', 'true');
      setScreen('dashboard');
    } else {
      alert("Invalid credentials. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    setScreen('login');
    if (stream) stream.getTracks().forEach(t => t.stop());
    setStream(null);
    setCapturedImg(null);
    setFinalAuditImage(null);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
    } catch (err) {
      alert("Camera access denied.");
    }
  };

  // --- 6. DATA VISUALIZATION CALCULATIONS ---
  const salaryStats = data.reduce((acc, emp) => {
    const val = emp.salary ? emp.salary.toString().replace(/[^0-9.]/g, '') : "0";
    const bucket = `${Math.floor(parseInt(val) / 10000)}0k`;
    acc[bucket] = (acc[bucket] || 0) + 1;
    return acc;
  }, {});
  
  const chartLabels = Object.keys(salaryStats).sort((a, b) => parseInt(a) - parseInt(b));
  const chartValues = chartLabels.map(l => salaryStats[l]);
  const maxVal = Math.max(...chartValues, 1);

  return (
    <div className="min-h-screen bg-theme-main flex items-center justify-center font-sans text-slate-900 overflow-hidden">

      {/* LOGIN SCREEN */}
      {screen === 'login' && (
        <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 animate-fade-in-up">
          <h1 className="text-4xl font-black text-theme-accent text-center mb-2">Log In</h1>
          <p className="text-center text-slate-400 mb-8 font-medium">Internal Analytics Portal</p>
          <form onSubmit={handleLogin} className="space-y-5">
            <input 
              type="text" required placeholder="Username" 
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
              type="password" required placeholder="Password" 
              className="w-full p-4 border rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button 
              type="submit" 
              className="w-full bg-theme-primary text-white font-bold py-4 rounded-xl shadow-lg hover:opacity-90 transition-all active:scale-95 mt-4"
            >
              Enter Dashboard
            </button>
          </form>
        </div>
      )}

      {/* DASHBOARD SCREEN */}
      {screen === 'dashboard' && (
        <div className="w-full max-w-5xl p-6 animate-fade-in-up">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-4xl font-black tracking-tighter text-theme-primary">Market Overview</h1>
              <p className="text-slate-400 font-medium">Real-time Employee Analytics</p>
            </div>
            <button onClick={handleLogout} className="text-red-500 font-bold hover:bg-red-50 px-4 py-2 rounded-lg transition-colors text-sm">Logout</button>
          </div>
          
          <div className="overflow-auto border border-slate-100 bg-white rounded-3xl h-[500px] relative shadow-2xl" onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
            <div style={{ height: data.length * rowHeight }}>
              <div style={{ position: 'absolute', top: 0, width: '100%', transform: `translateY(${startIndex * rowHeight}px)` }}>
                {visibleData.map(item => (
                  <div key={item.id} className="flex border-b border-slate-50 px-8 items-center h-[60px] hover:bg-emerald-50/30 transition-colors group">
                    <span className="w-16 text-slate-300 font-mono text-xs group-hover:text-theme-accent transition-colors">#{item.id}</span>
                    <span className="flex-1 font-bold text-slate-700">{item.name}</span>
                    <span className="flex-1 text-slate-400 text-sm italic">{item.role}</span>
                    <span className="text-theme-primary font-black tabular-nums text-lg">{item.salary}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={() => setScreen('verify')} 
            className="mt-8 w-full bg-theme-primary text-white py-5 rounded-2xl font-bold text-xl transition-all shadow-lg hover:shadow-emerald-900/20 active:scale-[0.98]"
          >
            Verify Identity & Continue <span className="text-theme-accent">→</span>
          </button>
        </div>
      )}

      {/* IDENTITY VERIFICATION SCREEN */}
      {screen === 'verify' && (
        <div className="w-full max-w-2xl p-6 bg-white rounded-[2.5rem] shadow-2xl mx-auto animate-fade-in-up border border-slate-100">
          <h1 className="text-3xl font-black mb-6 text-center text-theme-primary">Identity Check</h1>
          <div className="relative aspect-video bg-slate-900 rounded-3xl overflow-hidden mb-6 border-4 border-theme-main shadow-inner">
            {!capturedImg ? (
              <video autoPlay playsInline ref={(v) => v && stream && (v.srcObject = stream)} className="w-full h-full object-cover" />
            ) : (
              <>
                <img src={capturedImg} className="w-full h-full object-cover" alt="Capture" />
                <canvas 
                  id="sigCanvas" width={640} height={480} 
                  className="absolute top-0 left-0 w-full h-full cursor-crosshair touch-none"
                  onMouseDown={() => setIsDrawing(true)} 
                  onMouseUp={() => { setIsDrawing(false); setHasSignature(true); }}
                  onMouseMove={(e) => {
                    if (!isDrawing) return;
                    const ctx = e.target.getContext('2d');
                    const rect = e.target.getBoundingClientRect();
                    ctx.lineWidth = 4; ctx.lineCap = 'round'; ctx.strokeStyle = '#d4af37'; 
                    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top); ctx.stroke();
                    ctx.beginPath(); ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
                  }}
                />
              </>
            )}
          </div>
          <div className="flex gap-4">
            {!capturedImg ? (
              <button onClick={startCamera} className="flex-1 bg-theme-primary text-white py-4 rounded-2xl font-bold hover:opacity-90">Start Camera</button>
            ) : (
              <button onClick={() => {setCapturedImg(null); setHasSignature(false);}} className="flex-1 border-2 border-slate-100 py-4 rounded-2xl font-bold">Retake</button>
            )}
            {stream && !capturedImg && (
              <button onClick={() => {
                const c = document.createElement('canvas'); c.width = 640; c.height = 480;
                c.getContext('2d').drawImage(document.querySelector('video'), 0, 0, 640, 480);
                setCapturedImg(c.toDataURL('image/jpeg'));
                stream.getTracks().forEach(t => t.stop());
              }} className="flex-1 bg-theme-accent text-white py-4 rounded-2xl font-bold">Capture Photo</button>
            )}
            {hasSignature && (
              <button onClick={() => {
                const final = document.createElement('canvas'); final.width = 640; final.height = 480;
                const ctx = final.getContext('2d');
                const img = new Image(); img.src = capturedImg;
                img.onload = () => {
                  ctx.drawImage(img, 0, 0);
                  ctx.drawImage(document.getElementById('sigCanvas'), 0, 0);
                  setFinalAuditImage(final.toDataURL('image/png'));
                  setScreen('insights');
                };
              }} className="flex-1 bg-theme-primary text-white py-4 rounded-2xl font-bold">Finalize & Merge</button>
            )}
          </div>
        </div>
      )}

      {/* INSIGHTS SCREEN */}
      {screen === 'insights' && (
        <div className="w-full max-w-6xl p-8 mx-auto animate-fade-in-up">
          <div className="flex justify-between items-end mb-10">
            <h1 className="text-5xl font-black tracking-tighter text-theme-primary">Insights</h1>
            <button onClick={handleLogout} className="font-bold text-red-500 hover:bg-red-50 px-4 py-2 rounded-lg transition-all">Logout</button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-xl border border-theme-main">
        
<h2 className="text-xs font-bold text-slate-400 uppercase mb-8 tracking-widest">Salary Distribution</h2>
<svg viewBox="0 0 500 200" className="w-full h-64 overflow-visible">
  {chartValues.map((val, i) => {
    // 1. Define standard width and desired gap
    const totalBars = chartValues.length;
    const barWidth = 500 / totalBars;
    const gapWidth = 10; // Adjust this number for a bigger or smaller space

    // 2. Calculate final width and starting X position including the gap
    const finalRectWidth = barWidth - gapWidth;
    const xPos = i * barWidth; 

    // Calculate height (unchanged)
    const h = (val / maxVal) * 150;

    return (
      <g key={i} className="group">
        <rect 
          x={xPos + (gapWidth / 2)} // Start slightly offset to recenter
          y={chartLoaded ? 150 - h : 150} 
          width={finalRectWidth} // <--- Dynamic width based on gap
          height={chartLoaded ? h : 0} 
          fill="var(--accent)" 
          rx="6" 
          className="transition-all duration-1000 ease-out hover:opacity-80 cursor-help"
        />
        <text 
          x={xPos + (barWidth / 2)} // Center text under the whole bar space
          y="180" 
          textAnchor="middle" 
          fontSize="10" 
          className="fill-slate-300 font-bold"
        >
          {chartLabels[i]}
        </text>
        <text x={xPos + (barWidth / 2)} y={150-h-10} textAnchor="middle" fontSize="12" className="fill-theme-primary font-black opacity-0 group-hover:opacity-100 transition-opacity">{val}</text>
      </g>
    );
  })}
  <line x1="0" y1="150" x2="500" y2="150" stroke="var(--bg-main)" strokeWidth="4" />
</svg>
<Map></Map>
            </div>
            <div className="space-y-8">
              <div className="bg-theme-primary p-8 rounded-[2rem] text-white shadow-2xl">
                <h2 className="text-xs font-bold text-emerald-200 uppercase mb-6 tracking-widest">Global Status</h2>
                <div className="space-y-4">
                  {['San Francisco', 'London', 'Tokyo', 'Chennai'].map(city => (
                    <div key={city} className="flex justify-between items-center">
                      <span className="font-bold">{city}</span>
                      <span className="flex h-2 w-2 rounded-full bg-theme-accent animate-pulse"></span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-xl border border-theme-main text-center">
                <h2 className="text-xs font-bold text-theme-primary uppercase mb-4 tracking-widest">Audit Image</h2>
                {finalAuditImage && <img src={finalAuditImage} className="w-full rounded-2xl border-2 border-theme-main" alt="Audit" />}
                <p className="mt-4 text-theme-primary font-black text-sm italic">✓ Integrity Verified</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default App;