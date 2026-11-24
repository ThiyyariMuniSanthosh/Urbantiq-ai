import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import L from 'leaflet';
import {
  ShieldCheck,
  MapPin,
  Brain,
  LayoutDashboard,
  Sparkles,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Search,
  Download,
  LogOut,
  User,
  Building2,
  Activity,
  Navigation,
  Languages,
  FileText,
  Filter,
  RefreshCw,
  Layers,
  Menu,
  X
} from 'lucide-react';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase =
  SUPABASE_URL && SUPABASE_ANON_KEY
    ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null;

const CATEGORIES = [
  { name: 'Roads & Potholes', dept: 'Public Works' },
  { name: 'Waste Management', dept: 'Sanitation' },
  { name: 'Water Supply & Leaks', dept: 'Water Board' },
  { name: 'Streetlights & Power', dept: 'Electrical' },
  { name: 'Drainage & Flooding', dept: 'Stormwater' },
  { name: 'Public Safety', dept: 'Municipal Enforcement' }
];

const LANGUAGES = ['English', 'Telugu', 'Hindi', 'Tamil', 'Kannada', 'Marathi'];
const WARDS = ['Ward 1 - Central', 'Ward 2 - North Market', 'Ward 3 - Tech Park', 'Ward 4 - Lakeview', 'Ward 5 - Station Road'];
const STATUSES = ['Pending', 'Assigned', 'In Progress', 'Resolved'];

const DEMO_COMPLAINTS = [
  {
    id: 'UIQ-2026-1041',
    citizen_name: 'Ananya Rao',
    title: 'Deep pothole near Station Road junction',
    description: 'Large water-filled pothole causing two-wheeler skids during peak evening traffic.',
    category: 'Roads & Potholes',
    department: 'Public Works',
    severity: 'High',
    priority_score: 88,
    status: 'Assigned',
    ward: 'Ward 5 - Station Road',
    lat: 13.6288,
    lng: 79.4192,
    image_url: '',
    language: 'English',
    ai_summary: 'High-risk arterial road hazard near major transit junction requiring rapid cold-mix patching.',
    is_duplicate: false,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'UIQ-2026-1042',
    citizen_name: 'Karthik Reddy',
    title: 'Overflowing garbage bin beside North Market',
    description: 'Waste has not been cleared for 3 days, creating foul smell and stray animal congestion.',
    category: 'Waste Management',
    department: 'Sanitation',
    severity: 'Medium',
    priority_score: 69,
    status: 'Pending',
    ward: 'Ward 2 - North Market',
    lat: 13.6352,
    lng: 79.4241,
    image_url: '',
    language: 'Telugu',
    ai_summary: 'Sanitation backlog at commercial market zone; dispatch compactor truck on priority route.',
    is_duplicate: false,
    created_at: new Date(Date.now() - 86400000 * 1.5).toISOString()
  },
  {
    id: 'UIQ-2026-1043',
    citizen_name: 'Meera Nair',
    title: 'Broken main water pipeline flooding lane',
    description: 'Continuous clean water leakage near Lakeview Cross since early morning.',
    category: 'Water Supply & Leaks',
    department: 'Water Board',
    severity: 'Critical',
    priority_score: 95,
    status: 'In Progress',
    ward: 'Ward 4 - Lakeview',
    lat: 13.6215,
    lng: 79.4128,
    image_url: '',
    language: 'English',
    ai_summary: 'Critical potable water main rupture with high loss volume; immediate valve isolation required.',
    is_duplicate: false,
    created_at: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'UIQ-2026-1044',
    citizen_name: 'Suresh Babu',
    title: 'Five consecutive streetlights out near Tech Park',
    description: 'Entire pedestrian stretch is pitch dark after 7 PM, unsafe for commuters.',
    category: 'Streetlights & Power',
    department: 'Electrical',
    severity: 'High',
    priority_score: 81,
    status: 'Resolved',
    ward: 'Ward 3 - Tech Park',
    lat: 13.6410,
    lng: 79.4310,
    image_url: '',
    language: 'Hindi',
    ai_summary: 'Feeder-line outage affecting 5 LED poles; public safety lighting restoration completed.',
    is_duplicate: false,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString()
  },
  {
    id: 'UIQ-2026-1045',
    citizen_name: 'Divya Sharma',
    title: 'Clogged stormwater drain near Central Bus Stand',
    description: 'Plastic debris blocking culvert causing stagnant water on footpath.',
    category: 'Drainage & Flooding',
    department: 'Stormwater',
    severity: 'Medium',
    priority_score: 72,
    status: 'Pending',
    ward: 'Ward 1 - Central',
    lat: 13.6299,
    lng: 79.4265,
    image_url: '',
    language: 'English',
    ai_summary: 'Blocked stormwater grate creating pre-monsoon flooding risk in high-footfall transit hub.',
    is_duplicate: false,
    created_at: new Date(Date.now() - 3600000 * 14).toISOString()
  }
];

function runDemoAIAnalysis(title, description, language, existingComplaints) {
  const text = `${title} ${description}`.toLowerCase();
  let category = 'Roads & Potholes';
  let department = 'Public Works';
  let severity = 'Medium';
  let priority = 62;

  if (text.includes('water') || text.includes('pipe') || text.includes('leak')) {
    category = 'Water Supply & Leaks';
    department = 'Water Board';
    severity = text.includes('burst') || text.includes('flood') || text.includes('main') ? 'Critical' : 'High';
    priority = severity === 'Critical' ? 94 : 82;
  } else if (text.includes('garbage') || text.includes('waste') || text.includes('trash') || text.includes('bin')) {
    category = 'Waste Management';
    department = 'Sanitation';
    severity = 'Medium';
    priority = 68;
  } else if (text.includes('light') || text.includes('dark') || text.includes('power') || text.includes('pole')) {
    category = 'Streetlights & Power';
    department = 'Electrical';
    severity = 'High';
    priority = 79;
  } else if (text.includes('drain') || text.includes('sewer') || text.includes('stagnant')) {
    category = 'Drainage & Flooding';
    department = 'Stormwater';
    severity = 'High';
    priority = 80;
  } else if (text.includes('pothole') || text.includes('road') || text.includes('crack')) {
    category = 'Roads & Potholes';
    department = 'Public Works';
    severity = text.includes('deep') || text.includes('accident') ? 'High' : 'Medium';
    priority = severity === 'High' ? 85 : 66;
  }

  const isDuplicate = existingComplaints.some(
    (c) =>
      c.category === category &&
      c.title.toLowerCase().split(' ').some((w) => w.length > 4 && text.includes(w))
  );

  return {
    category,
    department,
    severity,
    priority_score: priority,
    is_duplicate: isDuplicate,
    source: 'Demo Simulation',
    ai_summary: `[${language} → EN] Classified as ${category} (${severity} severity). Recommended routing: ${department}. ${
      isDuplicate ? 'Possible duplicate of an existing open ticket.' : 'Unique civic incident verified.'
    }`
  };
}

function CivicMap({ complaints, pickerMode, pickedCoords, onPickCoords }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [pickedCoords?.lat || 13.6288, pickedCoords?.lng || 79.4192],
      zoom: 13
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    layerGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    if (pickerMode && onPickCoords) {
      map.on('click', (e) => {
        onPickCoords({
          lat: Number(e.latlng.lat.toFixed(5)),
          lng: Number(e.latlng.lng.toFixed(5))
        });
      });
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const group = layerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (pickerMode && pickedCoords) {
      L.circleMarker([pickedCoords.lat, pickedCoords.lng], {
        radius: 10,
        color: '#14b8a6',
        fillColor: '#14b8a6',
        fillOpacity: 0.75
      })
        .bindPopup(`Selected Location: ${pickedCoords.lat}, ${pickedCoords.lng}`)
        .addTo(group);
      return;
    }

    complaints.forEach((c) => {
      if (!c.lat || !c.lng) return;
      const color =
        c.severity === 'Critical'
          ? '#ef4444'
          : c.severity === 'High'
          ? '#f97316'
          : '#14b8a6';
      L.circleMarker([c.lat, c.lng], {
        radius: 9,
        color: '#071120',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.9
      })
        .bindPopup(
          `<div style="min-width:180px;color:#0f172a">
            <strong>${c.id}</strong><br/>
            <div style="font-weight:600;margin-top:2px">${c.title}</div>
            <div style="font-size:12px;margin-top:4px">${c.category} • <b>${c.severity}</b></div>
            <div style="font-size:12px;color:#475569">Status: ${c.status} | ${c.ward || 'Central'}</div>
          </div>`
        )
        .addTo(group);
    });
  }, [complaints, pickerMode, pickedCoords]);

  return (
    <div
      ref={mapContainerRef}
      className={`w-full rounded-2xl overflow-hidden border border-slate-800 ${
        pickerMode ? 'h-56' : 'h-[480px]'
      }`}
    />
  );
}

export default function App() {
  const [mode, setMode] = useState(supabase ? 'LIVE' : 'DEMO');
  const [role, setRole] = useState('citizen');
  const [activeTab, setActiveTab] = useState('citizen');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [user, setUser] = useState({ name: 'Demo Citizen', email: 'citizen@urbaniq.ai' });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authIsSignup, setAuthIsSignup] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');

  const [complaints, setComplaints] = useState(DEMO_COMPLAINTS);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  // Citizen form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ward, setWard] = useState(WARDS[0]);
  const [language, setLanguage] = useState('English');
  const [coords, setCoords] = useState({ lat: 13.6288, lng: 79.4192 });
  const [photoPreview, setPhotoPreview] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [formError, setFormError] = useState('');
  const [trackQuery, setTrackQuery] = useState('');

  // Admin & Map filter states
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (mode === 'DEMO') {
      setComplaints(DEMO_COMPLAINTS);
      return;
    }
    if (!supabase) {
      showToast('Supabase keys not configured. Staying in Demo Mode.', 'error');
      setMode('DEMO');
      return;
    }

    const fetchLive = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData?.session?.user) {
        const u = sessionData.session.user;
        setUser({
          id: u.id,
          email: u.email,
          name: u.user_metadata?.full_name || u.email.split('@')[0]
        });
      } else {
        setUser(null);
      }

      const { data, error } = await supabase
        .from('complaints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        showToast(`Database error: ${error.message}`, 'error');
      } else {
        setComplaints(data || []);
      }
      setLoading(false);
    };

    fetchLive();
  }, [mode]);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!authEmail || authPassword.length < 6) {
      setAuthError('Enter a valid email and a password of at least 6 characters.');
      return;
    }

    if (mode === 'DEMO') {
      setUser({ name: authName || authEmail.split('@')[0], email: authEmail });
      setAuthModalOpen(false);
      showToast('Signed in (Demo Mode)');
      return;
    }

    setLoading(true);
    try {
      if (authIsSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
          options: { data: { full_name: authName || authEmail.split('@')[0] } }
        });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            email: data.user.email,
            name: authName || authEmail.split('@')[0]
          });
        }
        showToast('Account created! Check email if confirmation is enabled.');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword
        });
        if (error) throw error;
        setUser({
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || data.user.email.split('@')[0]
        });
        showToast('Signed in to Live Mode!');
      }
      setAuthModalOpen(false);
    } catch (err) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (mode === 'LIVE' && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    showToast('Signed out');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      setFormError('Image must be smaller than 3 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported on this browser.', 'error');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: Number(pos.coords.latitude.toFixed(5)),
          lng: Number(pos.coords.longitude.toFixed(5))
        });
        showToast('GPS location captured!');
      },
      () => showToast('Unable to fetch GPS location. Tap the map instead.', 'error')
    );
  };

  const handleAnalyzeAI = async () => {
    if (!title.trim() || !description.trim()) {
      setFormError('Enter both a title and description before running AI analysis.');
      return;
    }
    setFormError('');
    setAnalyzing(true);

    setTimeout(() => {
      const result = runDemoAIAnalysis(title, description, language, complaints);
      setAiResult(result);
      setAnalyzing(false);
      showToast('AI Civic Intelligence analysis complete');
    }, 600);
  };

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    setFormError('');

    if (mode === 'LIVE' && !user) {
      setAuthModalOpen(true);
      showToast('Please sign in to submit a complaint in Live Mode.', 'error');
      return;
    }

    if (title.trim().length < 5 || description.trim().length < 10) {
      setFormError('Title must be at least 5 characters and description at least 10 characters.');
      return;
    }

    const analysis = aiResult || runDemoAIAnalysis(title, description, language, complaints);
    const newId = `UIQ-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const record = {
      id: newId,
      user_id: user?.id || null,
      citizen_name: user?.name || 'Anonymous Citizen',
      title: title.trim(),
      description: description.trim(),
      category: analysis.category,
      department: analysis.department,
      severity: analysis.severity,
      priority_score: analysis.priority_score,
      status: 'Pending',
      ward,
      lat: coords.lat,
      lng: coords.lng,
      image_url: photoPreview || '',
      language,
      ai_summary: analysis.ai_summary,
      is_duplicate: analysis.is_duplicate,
      created_at: new Date().toISOString()
    };

    if (mode === 'LIVE' && supabase) {
      setLoading(true);
      const { error } = await supabase.from('complaints').insert([record]);
      setLoading(false);
      if (error) {
        showToast(`Failed to save: ${error.message}`, 'error');
        return;
      }
    }

    setComplaints((prev) => [record, ...prev]);
    setTitle('');
    setDescription('');
    setPhotoPreview('');
    setAiResult(null);
    showToast(`Complaint ${newId} submitted successfully!`);
  };

  const handleUpdateComplaint = async (id, patch) => {
    if (mode === 'LIVE' && supabase) {
      const { error } = await supabase.from('complaints').update(patch).eq('id', id);
      if (error) {
        showToast(`Update failed: ${error.message}`, 'error');
        return;
      }
    }
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    showToast(`Updated ${id}`);
  };

  const exportCSV = () => {
    const headers = ['ID', 'Title', 'Category', 'Department', 'Severity', 'Priority', 'Status', 'Ward', 'Created'];
    const rows = complaints.map((c) => [
      c.id,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      c.category,
      c.department,
      c.severity,
      c.priority_score,
      c.status,
      c.ward,
      c.created_at
    ]);
    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urbaniq-civic-report-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV Report downloaded');
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      const matchStatus = filterStatus === 'All' || c.status === filterStatus;
      const matchSev = filterSeverity === 'All' || c.severity === filterSeverity;
      const matchSearch =
        !searchTerm ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.ward || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSev && matchSearch;
    });
  }, [complaints, filterStatus, filterSeverity, searchTerm]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((c) => c.status === 'Pending').length;
    const assigned = complaints.filter((c) => c.status === 'Assigned' || c.status === 'In Progress').length;
    const resolved = complaints.filter((c) => c.status === 'Resolved').length;
    const byDept = {};
    const byWard = {};
    complaints.forEach((c) => {
      byDept[c.department] = (byDept[c.department] || 0) + 1;
      byWard[c.ward || 'Other'] = (byWard[c.ward || 'Other'] || 0) + 1;
    });
    return { total, pending, assigned, resolved, byDept, byWard };
  }, [complaints]);

  const trackedTicket = useMemo(() => {
    if (!trackQuery.trim()) return null;
    return complaints.find((c) => c.id.toLowerCase() === trackQuery.trim().toLowerCase());
  }, [complaints, trackQuery]);

  const navItems = [
    { id: 'citizen', label: 'Citizen Portal', icon: User },
    { id: 'map', label: 'Interactive Map', icon: MapPin },
    { id: 'admin', label: 'Admin Dashboard', icon: LayoutDashboard },
    { id: 'innovation', label: 'Innovation Centre', icon: Sparkles }
  ];

  return (
    <div className="min-h-screen bg-[#071120] text-slate-100 flex flex-col">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-2xl border text-sm font-medium flex items-center gap-2 ${
            toast.type === 'error'
              ? 'bg-red-950/95 border-red-500/40 text-red-200'
              : 'bg-teal-950/95 border-teal-500/40 text-teal-200'
          }`}
        >
          {toast.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* Top Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#071120]/85 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <ShieldCheck className="w-5 h-5 text-[#071120]" />
            </div>
            <div>
              <div className="font-bold tracking-tight text-white leading-none">URBANIQ AI</div>
              <div className="text-[11px] text-teal-400 tracking-wide">Intelligence for Better Communities</div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition ${
                    activeTab === item.id
                      ? 'bg-teal-500 text-[#071120] shadow'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {/* Mode Switcher */}
            <button
              onClick={() => setMode((m) => (m === 'DEMO' ? 'LIVE' : 'DEMO'))}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition ${
                mode === 'LIVE'
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
              }`}
            >
              {mode === 'LIVE' ? '● LIVE MODE' : '● DEMO MODE'}
            </button>

            {/* Role Toggle */}
            <button
              onClick={() => {
                const next = role === 'citizen' ? 'admin' : 'citizen';
                setRole(next);
                setActiveTab(next === 'admin' ? 'admin' : 'citizen');
              }}
              className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700"
            >
              Role: {role === 'admin' ? 'Civic Admin' : 'Citizen'}
            </button>

            {user ? (
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#071120] text-xs font-semibold"
              >
                Sign In
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pb-3 pt-1 border-t border-slate-800 bg-[#071120] space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 ${
                    activeTab === item.id ? 'bg-teal-500 text-[#071120]' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {mode === 'DEMO' && (
          <div className="mb-6 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex flex-wrap items-center justify-between gap-2">
            <span>
              <strong>Demo Mode Active:</strong> Sample municipal data and simulated AI scoring are loaded for testing. Switch to <strong>LIVE MODE</strong> once Supabase environment variables are added.
            </span>
          </div>
        )}

        {/* CITIZEN PORTAL */}
        {activeTab === 'citizen' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <section className="lg:col-span-7 bg-[#0c1a2e] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h1 className="text-xl font-bold text-white">Report a Civic Issue</h1>
                  <p className="text-xs text-slate-400 mt-0.5">AI-assisted classification, routing & duplicate detection</p>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5">
                  <Languages className="w-3.5 h-3.5 text-teal-400" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent text-xs text-slate-200 focus:outline-none"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l} className="bg-slate-900">
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <form onSubmit={handleSubmitComplaint} className="space-y-4">
                {formError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                    {formError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Issue Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Broken water pipeline near Station Road"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Description ({language}) *</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the civic problem, landmark, and impact..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white focus:border-teal-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Municipal Ward</label>
                    <select
                      value={ward}
                      onChange={(e) => setWard(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white focus:border-teal-500 focus:outline-none"
                    >
                      {WARDS.map((w) => (
                        <option key={w} value={w} className="bg-slate-900">
                          {w}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Upload Photo Evidence</label>
                    <label className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-dashed border-slate-700 hover:border-teal-500 cursor-pointer text-xs text-slate-300">
                      <Upload className="w-4 h-4 text-teal-400" />
                      {photoPreview ? 'Photo Attached (Change)' : 'Choose Photo (Max 3MB)'}
                      <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                    </label>
                  </div>
                </div>

                {photoPreview && (
                  <img src={photoPreview} alt="Preview" className="h-32 w-full object-cover rounded-xl border border-slate-800" />
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-slate-300">
                      Pin Issue Location ({coords.lat}, {coords.lng})
                    </label>
                    <button
                      type="button"
                      onClick={handleLocateMe}
                      className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
                    >
                      <Navigation className="w-3.5 h-3.5" /> Use GPS
                    </button>
                  </div>
                  <CivicMap complaints={[]} pickerMode={true} pickedCoords={coords} onPickCoords={setCoords} />
                </div>

                {/* AI Civic Intelligence Box */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-teal-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-semibold text-teal-300">
                      <Brain className="w-4 h-4" /> AI Civic Intelligence
                    </div>
                    <button
                      type="button"
                      onClick={handleAnalyzeAI}
                      disabled={analyzing}
                      className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 text-xs font-semibold border border-teal-500/40"
                    >
                      {analyzing ? 'Analyzing...' : 'Run AI Triage'}
                    </button>
                  </div>

                  {aiResult && (
                    <div className="text-xs space-y-2 pt-2 border-t border-slate-800">
                      <div className="flex flex-wrap gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          {aiResult.source}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200">{aiResult.category}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-teal-300">
                          Priority: {aiResult.priority_score}/100 ({aiResult.severity})
                        </span>
                      </div>
                      <p className="text-slate-300">{aiResult.ai_summary}</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#071120] font-bold text-sm transition shadow-lg shadow-teal-500/20"
                >
                  {loading ? 'Submitting...' : 'Submit Civic Complaint & Generate ID'}
                </button>
              </form>
            </section>

            {/* Right Column: Track & History */}
            <section className="lg:col-span-5 space-y-6">
              <div className="bg-[#0c1a2e] border border-slate-800 rounded-3xl p-5 shadow-xl">
                <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4 text-teal-400" /> Track Complaint Status
                </h2>
                <input
                  type="text"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  placeholder="Enter Complaint ID (e.g., UIQ-2026-1041)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-white focus:border-teal-500 focus:outline-none"
                />
                {trackQuery && (
                  <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                    {trackedTicket ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-between">
                          <span className="font-bold text-teal-400">{trackedTicket.id}</span>
                          <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300">{trackedTicket.status}</span>
                        </div>
                        <div className="font-semibold text-white">{trackedTicket.title}</div>
                        <div className="text-slate-400">
                          {trackedTicket.department} • {trackedTicket.ward} • Severity: {trackedTicket.severity}
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">No complaint found with that ID.</span>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-[#0c1a2e] border border-slate-800 rounded-3xl p-5 shadow-xl">
                <h2 className="text-base font-bold text-white mb-3">Recent Complaints ({complaints.length})</h2>
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {complaints.map((c) => (
                    <div key={c.id} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono text-teal-400 font-semibold">{c.id}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                            c.status === 'Resolved'
                              ? 'bg-emerald-500/15 text-emerald-300'
                              : c.status === 'Pending'
                              ? 'bg-amber-500/15 text-amber-300'
                              : 'bg-cyan-500/15 text-cyan-300'
                          }`}
                        >
                          {c.status}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-white">{c.title}</div>
                      <div className="text-xs text-slate-400">
                        {c.category} • {c.ward} • Priority {c.priority_score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* INTERACTIVE MAP */}
        {activeTab === 'map' && (
          <div className="bg-[#0c1a2e] border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-white">Interactive Civic Map</h1>
                <p className="text-xs text-slate-400">OpenStreetMap real-time incident pins color-coded by severity</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={filterSeverity}
                  onChange={(e) => setFilterSeverity(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  <option value="All">All Severities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                </select>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200"
                >
                  <option value="All">All Statuses</option>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <CivicMap complaints={filteredComplaints} pickerMode={false} />
          </div>
        )}

        {/* ADMIN DASHBOARD */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Complaints', val: stats.total, color: 'text-white' },
                { label: 'Pending Review', val: stats.pending, color: 'text-amber-400' },
                { label: 'Assigned / Active', val: stats.assigned, color: 'text-cyan-400' },
                { label: 'Resolved Issues', val: stats.resolved, color: 'text-emerald-400' }
              ].map((kpi) => (
                <div key={kpi.label} className="bg-[#0c1a2e] border border-slate-800 rounded-2xl p-4">
                  <div className="text-xs text-slate-400">{kpi.label}</div>
                  <div className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.val}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0c1a2e] border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-400" /> Department Workload
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(stats.byDept).map(([dept, count]) => (
                    <div key={dept} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{dept}</span>
                        <span className="font-semibold text-teal-300">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className="h-full bg-teal-500 rounded-full"
                          style={{ width: `${Math.min(100, (count / Math.max(1, stats.total)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#0c1a2e] border border-slate-800 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-teal-400" /> Ward-Wise Distribution
                </h3>
                <div className="space-y-2.5">
                  {Object.entries(stats.byWard).map(([w, count]) => (
                    <div key={w} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{w}</span>
                        <span className="font-semibold text-cyan-300">{count}</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
                        <div
                          className="h-full bg-cyan-500 rounded-full"
                          style={{ width: `${Math.min(100, (count / Math.max(1, stats.total)) * 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[#0c1a2e] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-bold text-white">Municipal Ticket Queue</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search ID, title, ward..."
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                  <button
                    onClick={exportCSV}
                    className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-[#071120] text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 pr-3">ID</th>
                      <th className="py-2.5 pr-3">Issue</th>
                      <th className="py-2.5 pr-3">Department</th>
                      <th className="py-2.5 pr-3">Severity</th>
                      <th className="py-2.5 pr-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70">
                    {filteredComplaints.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-900/40">
                        <td className="py-3 pr-3 font-mono text-teal-400">{c.id}</td>
                        <td className="py-3 pr-3">
                          <div className="font-medium text-white">{c.title}</div>
                          <div className="text-[11px] text-slate-400">{c.ward}</div>
                        </td>
                        <td className="py-3 pr-3">
                          <select
                            value={c.department}
                            onChange={(e) => handleUpdateComplaint(c.id, { department: e.target.value })}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
                          >
                            {CATEGORIES.map((cat) => (
                              <option key={cat.dept} value={cat.dept}>
                                {cat.dept}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-3 pr-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-medium ${
                              c.severity === 'Critical'
                                ? 'bg-red-500/20 text-red-300'
                                : c.severity === 'High'
                                ? 'bg-orange-500/20 text-orange-300'
                                : 'bg-teal-500/20 text-teal-300'
                            }`}
                          >
                            {c.severity} ({c.priority_score})
                          </span>
                        </td>
                        <td className="py-3 pr-3">
                          <select
                            value={c.status}
                            onChange={(e) => handleUpdateComplaint(c.id, { status: e.target.value })}
                            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-200"
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* INNOVATION CENTRE */}
        {activeTab === 'innovation' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0c1a2e] border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-400 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Civic Hotspot Detection</h2>
              <p className="text-xs text-slate-400">
                Top active municipal zone based on live complaint density:
              </p>
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-sm font-semibold text-teal-300">
                {Object.entries(stats.byWard).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Ward 1 - Central'}
              </div>
            </div>

            <div className="bg-[#0c1a2e] border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Predictive Maintenance (Beta)</h2>
              <p className="text-xs text-slate-400">
                Forecasts recurring infrastructure stress from historical category clusters.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
                <li>Water Board: High pressure valve inspection recommended in Lakeview corridor.</li>
                <li>Public Works: Pre-monsoon resurfacing flagged for Station Road junction.</li>
              </ul>
            </div>

            <div className="bg-[#0c1a2e] border border-slate-800 rounded-3xl p-6 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-white">Community Impact Score</h2>
              <div className="text-3xl font-bold text-emerald-400">
                {stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%
              </div>
              <p className="text-xs text-slate-400">
                Resolution rate across {stats.total} tracked civic reports with transparent citizen tracking.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1a2e] border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {authIsSignup ? 'Create Citizen Account' : 'Sign In to URBANIQ AI'}
              </h2>
              <button onClick={() => setAuthModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {authError && (
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              {authIsSignup && (
                <input
                  type="text"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
                />
              )}
              <input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="Email address"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
              />
              <input
                type="password"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-[#071120] font-bold text-sm"
              >
                {authIsSignup ? 'Sign Up' : 'Sign In'}
              </button>
            </form>

            <button
              onClick={() => setAuthIsSignup((v) => !v)}
              className="w-full text-center text-xs text-teal-400 hover:underline"
            >
              {authIsSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
