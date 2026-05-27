import React, { useState, useEffect } from 'react';
import { 
  Server, 
  Settings, 
  Terminal, 
  CheckCircle, 
  RefreshCw, 
  Play, 
  Trash2, 
  HelpCircle, 
  Lock, 
  Plus, 
  Save, 
  Info,
  Shield,
  Layers,
  ChevronRight,
  Sparkles,
  Command,
  FileCode
} from 'lucide-react';

interface RoleDef {
  name: string;
  color: string;
  hoist: boolean;
  mentionable: boolean;
  permissions: string[];
  type: string;
}

interface ChannelItem {
  name: string;
  type: string;
  topic?: string;
}

interface CategoryGroup {
  category: string;
  items: ChannelItem[];
}

interface BotStatus {
  online: boolean;
  tag?: string;
  id?: string;
  avatar?: string;
  guilds?: Array<{ id: string; name: string; memberCount: number; acronym: string }>;
  prefix: string;
  owner: string;
  status: string;
  statusType: string;
  hasToken?: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'credentials' | 'config' | 'deploy' | 'guide'>('dashboard');
  const [status, setStatus] = useState<BotStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Credentials State
  const [tokenInput, setTokenInput] = useState('');
  const [clientIdInput, setClientIdInput] = useState('');
  const [guildIdInput, setGuildIdInput] = useState('');
  const [submittingCreds, setSubmittingCreds] = useState(false);
  const [credsMessage, setCredsMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Layout Configuration Editor state
  const [prefix, setPrefix] = useState('?');
  const [ownerUsername, setOwnerUsername] = useState('zenixx.dev');
  const [statusText, setStatusText] = useState('working for zenixx dev');
  const [statusType, setStatusType] = useState('PLAYING');
  const [roles, setRoles] = useState<RoleDef[]>([]);
  const [channels, setChannels] = useState<CategoryGroup[]>([]);
  const [savingConfig, setSavingConfig] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // REST Slash Command Deploy Tool state
  const [deployLogs, setDeployLogs] = useState<string[]>([]);
  const [deploying, setDeploying] = useState(false);

  // Dynamic Editor additions
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleColor, setNewRoleColor] = useState('#3498DB');
  const [newRoleType, setNewRoleType] = useState('staff');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Fetch status and configurations on launch
  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setStatus(data);
      
      // Load individual configs into states too
      if (data) {
        setPrefix(data.prefix || '?');
        setOwnerUsername(data.owner || 'zenixx.dev');
        setStatusText(data.status || '');
        setStatusType(data.statusType || 'PLAYING');
      }
    } catch (e) {
      console.error('Failed to communicate with local daemon:', e);
    } finally {
      setLoadingStatus(false);
    }
  };

  const fetchConfigOnly = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      if (data) {
        // We can load roles & channels structure directly by initiating an extra config read
        // But since they are stored in the server, let's load them via state
        setPrefix(data.prefix);
        setOwnerUsername(data.owner);
        setStatusText(data.status);
        setStatusType(data.statusType);
      }
    } catch {}
  };

  // Dedicated config fetch
  const loadRolesAndChannels = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      // To get real structure, we can hit a client-friendly mock or retrieve it dynamically
      // But standard way: fetch our template layout or read from static configuration definition
      const configRes = await fetch('/api/status'); // Server.ts serves config variables in status
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
    
    // Load local config.json variables
    const loadData = async () => {
      try {
        const r = await fetch('/api/status');
        const data = await r.json();
        // Since we want roles & channels as customized collections:
        // We fetch the dynamic configuration back
      } catch {}
    };

    // Load initial structures
    const defaultRoles: RoleDef[] = [
      { name: "👑 ． OWNER ． <3", color: "#FF0055", hoist: true, mentionable: true, permissions: ["Administrator"], type: "owner" },
      { name: "🛡️ ． MODERATOR ． <3", color: "#E74C3C", hoist: true, mentionable: true, permissions: ["ManageRoles", "ManageChannels", "KickMembers", "BanMembers"], type: "moderator" },
      { name: "🔨 ． STAFF ． <3", color: "#2ECC71", hoist: true, mentionable: true, permissions: ["KickMembers", "ManageMessages"], type: "staff" },
      { name: "🤖 ． BOTS ． <3", color: "#9B59B6", hoist: true, mentionable: false, permissions: ["Administrator"], type: "bot" },
      { name: "． Members ． <3", color: "#3498DB", hoist: false, mentionable: false, permissions: ["ViewChannel", "SendMessages"], type: "member" }
    ];

    const defaultChannels: CategoryGroup[] = [
      {
        category: "💎・WELCOME・ZONE",
        items: [
          { name: "📢・server・updates", type: "GuildText", topic: "Official announcements and updates from ZENIXX DEV" },
          { name: "🎨・announcements", type: "GuildText", topic: "Community updates and notifications" },
          { name: "👋・welcome・leave", type: "GuildText", topic: "Welcome new members to ZENIXX DEV!" }
        ]
      },
      {
        category: "💬・COMMUNITY・ZONE",
        items: [
          { name: "💬・global・chat", type: "GuildText", topic: "Main room for general community conversation" },
          { name: "👾・bot・commands", type: "GuildText", topic: "Execute bot commands here" },
          { name: "📷・media・share", type: "GuildText", topic: "Share photos, videos, and UI mockups here" }
        ]
      },
      {
        category: "🎫・SUPPORT・PORTAL",
        items: [
          { name: "🎫・open・ticket", type: "GuildText", topic: "Open a support ticket for customized scripts or assistance" },
          { name: "🛠️・dev・support", type: "GuildText", topic: "Discuss technical issues or development questions" }
        ]
      }
    ];

    setRoles(defaultRoles);
    setChannels(defaultChannels);
  }, []);

  // Submit Credentials (Token logging in)
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setCredsMessage({ type: 'error', text: 'Discord Bot Token is required!' });
      return;
    }

    setSubmittingCreds(true);
    setCredsMessage(null);

    try {
      const res = await fetch('/api/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: tokenInput.trim(),
          clientId: clientIdInput.trim(),
          guildId: guildIdInput.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCredsMessage({ 
          type: 'success', 
          text: `Successfully Connected! Bot compiled online as ${data.tag}` 
        });
        fetchStatus();
      } else {
        setCredsMessage({ 
          type: 'error', 
          text: `Connection Failed: ${data.error || 'Check token credentials'}` 
        });
      }
    } catch (err: any) {
      setCredsMessage({ type: 'error', text: `Network request error: ${err.message}` });
    } finally {
      setSubmittingCreds(false);
    }
  };

  // Save Configuration (Prefix/Owner/Presence details)
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prefix,
          ownerUsername,
          status: statusText,
          statusType,
          roles,
          channels
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSaveMessage({ type: 'success', text: 'Configurations securely updated and stored in config.json!' });
        fetchStatus();
      } else {
        setSaveMessage({ type: 'error', text: `Failed to save: ${data.error}` });
      }
    } catch (err: any) {
      setSaveMessage({ type: 'error', text: `Error: ${err.message}` });
    } finally {
      setSavingConfig(false);
    }
  };

  // Deploy Slash Commands over REST
  const handleDeploySlash = async () => {
    setDeploying(true);
    setDeployLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Requesting application REST registrar...`]);

    try {
      const res = await fetch('/api/deploy-slash', { method: 'POST' });
      const data = await res.json();

      if (res.ok && data.success) {
        setDeployLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ✅ GATEWAY RESPONSE: ${data.message}`,
          `[${new Date().toLocaleTimeString()}] Synchronized commands: ${data.commandNames.join(', ')}`,
          `[${new Date().toLocaleTimeString()}] System updated perfectly.`
        ]);
      } else {
        setDeployLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] ❌ REGISTRATION LOST: ${data.error || 'Server error'}`
        ]);
      }
    } catch (err: any) {
      setDeployLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ❌ CRITICAL CONNECTION BREAK: ${err.message}`]);
    } finally {
      setDeploying(false);
    }
  };

  // Config utility editors
  const addCustomRole = () => {
    if (!newRoleName.trim()) return;
    const newRole: RoleDef = {
      name: newRoleName.trim(),
      color: newRoleColor,
      hoist: true,
      mentionable: false,
      permissions: ["ViewChannel", "SendMessages"],
      type: newRoleType
    };
    setRoles([...roles, newRole]);
    setNewRoleName('');
  };

  const removeRole = (index: number) => {
    setRoles(roles.filter((_, i) => i !== index));
  };

  const addCategoryGroup = () => {
    if (!newCategoryName.trim()) return;
    const newCat: CategoryGroup = {
      category: newCategoryName.trim().toUpperCase(),
      items: [
        { name: "💬・general", type: "GuildText", topic: "General topic room" }
      ]
    };
    setChannels([...channels, newCat]);
    setNewCategoryName('');
  };

  const removeCategory = (index: number) => {
    setChannels(channels.filter((_, i) => i !== index));
  };

  const addChannelToCategory = (catIndex: number, chName: string, chType: string) => {
    if (!chName.trim()) return;
    const cleanChName = chName.trim().toLowerCase().replace(/\s+/g, '・');
    const updated = [...channels];
    updated[catIndex].items.push({
      name: cleanChName,
      type: chType,
      topic: 'Premium layout channel node'
    });
    setChannels(updated);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0d0f12] text-gray-200 antialiased font-sans">
      {/* Upper Navigation Header */}
      <header className="border-b border-[#1b2330] bg-[#10141d] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-[#ff0055]/10 text-[#ff0055] p-2 rounded-lg border border-[#ff0055]/30 flex items-center justify-center">
            <Sparkles className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white leading-tight font-sans">ZENIXX DEV</h1>
            <p className="text-xs text-gray-400 font-medium">Automatic Discord Server & Bot Console</p>
          </div>
        </div>

        {/* Live Bot Connection indicator */}
        <div className="flex items-center space-x-3">
          {loadingStatus ? (
            <div className="flex items-center space-x-2 text-xs text-gray-400 bg-[#161d28] px-3 py-1.5 rounded-full border border-[#232e41]">
              <RefreshCw className="h-3 w-3 animate-spin text-[#3498db]" />
              <span>Checking network...</span>
            </div>
          ) : status?.online ? (
            <div className="flex items-center space-x-3 bg-emerald-950/40 text-emerald-400 border border-emerald-500/25 px-4 py-1.5 rounded-full text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold font-mono tracking-wide text-white">{status?.tag} (ONLINE)</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3 bg-rose-950/40 text-rose-400 border border-rose-500/25 px-4 py-1.5 rounded-full text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-rose-500"></span>
              <span>BOT CLIENT OFFLINE</span>
            </div>
          )}

          <button 
            id="refresh-status-btn"
            onClick={fetchStatus}
            className="p-2 rounded-lg bg-[#161d28] border border-[#232e41] text-gray-300 hover:text-white hover:bg-[#1f293a] transition-all"
            title="Refresh Daemon"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Primary Workspace Panels */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        
        {/* Left Side Control Tab Drawer */}
        <nav className="w-full md:w-64 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 border-b md:border-b-0 md:border-r border-[#1b2330] pr-0 md:pr-4">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left border whitespace-nowrap md:whitespace-normal ${activeTab === 'dashboard' ? 'bg-[#ff0055]/10 border-[#ff0055]/30 text-white shadow-sm' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#161d28]'}`}
          >
            <Server className="h-4 w-4 shrink-0" />
            <span>Dashboard Status</span>
          </button>

          <button
            id="tab-credentials"
            onClick={() => setActiveTab('credentials')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left border whitespace-nowrap md:whitespace-normal ${activeTab === 'credentials' ? 'bg-[#ff0055]/10 border-[#ff0055]/30 text-white shadow-sm' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#161d28]'}`}
          >
            <Lock className="h-4 w-4 shrink-0" />
            <span>Bot Connector</span>
          </button>

          <button
            id="tab-config"
            onClick={() => setActiveTab('config')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left border whitespace-nowrap md:whitespace-normal ${activeTab === 'config' ? 'bg-[#ff0055]/10 border-[#ff0055]/30 text-white shadow-sm' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#161d28]'}`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            <span>Channel & Role Config</span>
          </button>

          <button
            id="tab-deploy"
            onClick={() => setActiveTab('deploy')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left border whitespace-nowrap md:whitespace-normal ${activeTab === 'deploy' ? 'bg-[#ff0055]/10 border-[#ff0055]/30 text-white shadow-sm' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#161d28]'}`}
          >
            <Terminal className="h-4 w-4 shrink-0" />
            <span>Slash Commands REST</span>
          </button>

          <button
            id="tab-guide"
            onClick={() => setActiveTab('guide')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all text-left border whitespace-nowrap md:whitespace-normal ${activeTab === 'guide' ? 'bg-[#ff0055]/10 border-[#ff0055]/30 text-white shadow-sm' : 'border-transparent text-gray-400 hover:text-gray-200 hover:bg-[#161d28]'}`}
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            <span>Deployment Guide</span>
          </button>
        </nav>

        {/* Right Active Viewer Tab Card */}
        <main className="flex-1 min-w-0 bg-[#10141d] rounded-xl border border-[#1b2330] p-6 shadow-xl">
          
          {/* TAB 1: DASHBOARD OVERVIEW */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between md:flex-row gap-4 border-b border-[#1b2330] pb-5">
                <div>
                  <h2 className="text-xl font-bold font-sans text-white">Bot Operations Overview</h2>
                  <p className="text-sm text-gray-400">Real-time daemon status indicators and network metrics.</p>
                </div>
                <div className="bg-[#161d28] border border-[#232e41] px-4 py-3 rounded-xl flex items-center space-x-3 select-none">
                  <div className="bg-[#ff0055]/10 text-[#ff0055] p-2 rounded-lg">
                    <Info className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <p className="text-white font-medium">Prefix Rule</p>
                    <p className="text-gray-400">Trigger: <span className="font-mono text-[#ff0055] font-bold">{prefix}</span></p>
                  </div>
                </div>
              </div>

              {/* Server Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-[#161d28] border border-[#232e41] p-5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gateway Clearance</span>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className={`text-2xl font-bold font-mono ${status?.online ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {status?.online ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400 mt-2">
                    {status?.online ? `WebSocket thread executing safely.` : 'Fill credentials to boot client.'}
                  </span>
                </div>

                <div className="bg-[#161d28] border border-[#232e41] p-5 rounded-xl flex flex-col justify-between">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Permitted Supervisor</span>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-white font-mono break-all">{ownerUsername}</span>
                  </div>
                  <span className="text-xs text-amber-500 mt-2 flex items-center space-x-1">
                    <Shield className="h-3 w-3 shrink-0" />
                    <span>Only this user can run setup commands.</span>
                  </span>
                </div>

                <div className="bg-[#161d28] border border-[#232e41] p-5 rounded-xl flex flex-col justify-between md:col-span-2 lg:col-span-1">
                  <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Active Presences</span>
                  <div className="mt-2 text-white">
                    <span className="text-xs bg-[#ff0055]/10 text-[#ff0055] border border-[#ff0055]/20 font-bold uppercase rounded px-2 py-0.5 inline-block mb-1">
                      {statusType}
                    </span>
                    <p className="text-lg font-bold font-mono">"{statusText}"</p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">Updates live on Discord.</span>
                </div>
              </div>

              {/* Bot Client details logs when online */}
              {status?.online ? (
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-white">Connected Guild Arrays ({status.guilds?.length || 0})</h3>
                  {status.guilds && status.guilds.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {status.guilds.map((g, idx) => (
                        <div key={idx} className="bg-[#131923] border border-[#1d2736] p-4 rounded-xl flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-[#1b2330] text-gray-300 font-mono flex items-center justify-center font-bold text-sm border border-[#ff0055]/20">
                              {g.acronym}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-white">{g.name}</p>
                              <p className="text-xs text-gray-400">ID: {g.id}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-xs px-2 py-1 bg-[#ff0055]/10 text-white font-mono rounded">
                              👥 {g.memberCount} users
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="bg-[#161d28] border border-[#232e41] p-6 rounded-xl text-center">
                      <p className="text-sm text-gray-400">The bot client is connected but has not been invited to any guild yet.</p>
                      <a 
                        href={`https://discord.com/oauth2/authorize?client_id=${status.id || 'YOUR_CLIENT_ID'}&permissions=8&scope=bot%20applications.commands`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block mt-4 text-xs font-semibold text-white bg-[#ff0055] hover:bg-[#d00045] px-4 py-2 rounded-lg transition-all"
                      >
                        ⚡ Invite BOT to Server
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-[#1a1215] border border-rose-950/40 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-rose-500/10 text-rose-500 p-3 rounded-full border border-rose-500/20">
                      <Info className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">Setup Credentials to Connect</h4>
                      <p className="text-sm text-gray-400">The bot code is fully compiled but requires a Discord Token to log in. Click the tab below to activate it in real-time.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setActiveTab('credentials')}
                    className="shrink-0 bg-transparent text-xs hover:bg-[#161d28] border border-rose-500/30 text-rose-400 hover:text-white px-5 py-2.5 rounded-lg font-semibold transition-all"
                  >
                    Go to Connector Tab →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BOT CONNECTOR (CREDENTIALS) */}
          {activeTab === 'credentials' && (
            <div className="space-y-6">
              <div className="border-b border-[#1b2330] pb-5">
                <h2 className="text-xl font-bold font-sans text-white">Dynamic Bot Connector</h2>
                <p className="text-sm text-gray-400">Supply your Discord Application parameters to boot the bot inside the Cloud Workspace.</p>
              </div>

              {credsMessage && (
                <div className={`p-4 rounded-xl border text-sm flex items-start space-x-2 ${credsMessage.type === 'success' ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-400' : 'bg-rose-950/40 border-rose-500/20 text-rose-400'}`}>
                  <Info className="h-5 w-5 shrink-0" />
                  <span>{credsMessage.text}</span>
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Discord Bot Token <span className="text-rose-500">*</span></label>
                  <input
                    type="password"
                    placeholder="paste mfa token string (Mjk3...)"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="w-full bg-[#161d28] border border-[#232e41] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff0055]/50 transition-all font-mono"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-1">Obtain from <a href="https://discord.com/developers/applications" target="_blank" rel="noreferrer" className="text-[#3498db] hover:underline">Discord Dev Portal</a> → Select App → Bot → Click "Reset Token".</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Application Client ID <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. 115291... "
                      value={clientIdInput}
                      onChange={(e) => setClientIdInput(e.target.value)}
                      className="w-full bg-[#161d28] border border-[#232e41] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff0055]/50 transition-all font-mono"
                    />
                    <p className="text-xs text-gray-400 mt-1">Found under General Information → Application ID.</p>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider">Target Server ID (Optional Guild ID)</label>
                    <input
                      type="text"
                      placeholder="e.g. 96381..."
                      value={guildIdInput}
                      onChange={(e) => setGuildIdInput(e.target.value)}
                      className="w-full bg-[#161d28] border border-[#232e41] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#ff0055]/50 transition-all font-mono"
                    />
                    <p className="text-xs text-gray-400 mt-1">Required to immediately populate (/) slash commands in your test server.</p>
                  </div>
                </div>

                <div className="border-t border-[#1b2330] pt-4 flex space-x-3">
                  <button
                    type="submit"
                    disabled={submittingCreds}
                    className="flex-1 bg-[#ff0055] hover:bg-[#d00045] disabled:bg-[#ff0055]/40 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-[#ff0055]/10 cursor-pointer"
                  >
                    {submittingCreds ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span>Rebooting Connection Daemon...</span>
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 text-white shrink-0" />
                        <span>Establish Bot Connection</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Bot Permissions Notice */}
              <div className="bg-[#161d28] border border-[#232e41] p-5 rounded-xl space-y-3">
                <span className="text-xs font-semibold text-amber-500 uppercase flex items-center space-x-1.5">
                  <Shield className="h-4 w-4" />
                  <span>CRITICAL PRIVILEGED GATEWAYS</span>
                </span>
                <p className="text-xs text-gray-400 leading-relaxed">
                  In order for prefix commands like <code className="text-white font-mono font-bold">?setup-server</code> to operate, you MUST scroll down to the "Privileged Gateway Intents" frame on your Discord Application page and check:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#111621] border border-[#ff0055]/10 rounded-lg text-xs">
                    <p className="text-white font-bold mb-1">🛡️ Guild Members Intent</p>
                    <p className="text-gray-400">Allows management of styled roles, heights and color edits.</p>
                  </div>
                  <div className="p-3 bg-[#111621] border border-[#ff0055]/10 rounded-lg text-xs">
                    <p className="text-white font-bold mb-1">📢 Message Content Intent</p>
                    <p className="text-gray-400">Allows reading the prefix symbols for triggering build tasks.</p>
                  </div>
                  <div className="p-3 bg-[#111621] border border-[#ff0055]/10 rounded-lg text-xs">
                    <p className="text-white font-bold mb-1">🗣️ Presence Intent</p>
                    <p className="text-gray-400">Allows loading and displaying real-time custom status text updates.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHANNEL & ROLE CONFIGURATION EDITOR */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div className="flex flex-col justify-between sm:flex-row gap-4 border-b border-[#1b2330] pb-5">
                <div>
                  <h2 className="text-xl font-bold font-sans text-white">Visual Layout Configurator</h2>
                  <p className="text-sm text-gray-400">Customize prefix, owner identity, target role hierarchies, and channel naming structures.</p>
                </div>
                {saveMessage ? (
                  <div className="bg-emerald-950/40 border border-emerald-500/25 px-4 py-2 rounded-xl text-xs text-emerald-400 flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Config updated!</span>
                  </div>
                ) : (
                  <button
                    onClick={handleSaveConfig}
                    disabled={savingConfig}
                    className="bg-[#ff0055] hover:bg-[#d00045] text-white font-bold text-xs px-4 py-2.5 rounded-lg flex items-center space-x-1.5 transition-all cursor-pointer shadow-md"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{savingConfig ? 'Saving...' : 'Deploy Changes'}</span>
                  </button>
                )}
              </div>

              {/* SECTION: Global variables */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#161d28]/60 p-4 rounded-xl border border-[#232e41]">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300">COMMAND PREFIX</label>
                  <input
                    type="text"
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full bg-[#11151e] border border-[#232e41] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300">AUTHORIZED ADMIN USERNAME</label>
                  <input
                    type="text"
                    value={ownerUsername}
                    onChange={(e) => setOwnerUsername(e.target.value)}
                    className="w-full bg-[#11151e] border border-[#232e41] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300">DEFAULT BOT STATUS TEXT</label>
                  <input
                    type="text"
                    value={statusText}
                    onChange={(e) => setStatusText(e.target.value)}
                    className="w-full bg-[#11151e] border border-[#232e41] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-300">STATUS PRESENCE TYPE</label>
                  <select
                    value={statusType}
                    onChange={(e) => setStatusType(e.target.value)}
                    className="w-full bg-[#11151e] border border-[#232e41] rounded-lg px-3 py-2 text-sm text-white focus:outline-none select-none"
                  >
                    <option value="PLAYING">Playing</option>
                    <option value="WATCHING">Watching</option>
                    <option value="LISTENING">Listening</option>
                    <option value="STREAMING">Streaming</option>
                  </select>
                </div>
              </div>

              {/* SECTION: Roles lists */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                    <Shield className="h-4.5 w-4.5 text-[#ff0055]" />
                    <span>Role Hierarchy Styling Structure</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Role list */}
                  <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {roles.map((r, idx) => (
                      <div key={idx} className="bg-[#161d28]/60 p-3 rounded-lg border border-[#232e41] flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0" style={{ backgroundColor: r.color }} />
                          <div>
                            <p className="text-xs font-bold text-white font-mono">{r.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">Color: {r.color} | Priority: {r.type.toUpperCase()}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => removeRole(idx)}
                          className="text-gray-500 hover:text-red-400 p-1 rounded transition-colors"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Right creator builder */}
                  <div className="bg-[#11151e] p-4 rounded-xl border border-[#232e41]/60 space-y-4">
                    <p className="text-xs font-semibold text-white uppercase tracking-wider">Add Custom Styled Role</p>
                    
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Decorative Name</label>
                          <input
                            type="text"
                            placeholder="e.g. ． Helper ． <3"
                            value={newRoleName}
                            onChange={(e) => setNewRoleName(e.target.value)}
                            className="w-full bg-[#161d1f] border border-[#232e41] rounded-lg px-3 py-1.5 text-xs text-white"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-gray-400">Role Color Hex</label>
                          <input
                            type="color"
                            value={newRoleColor}
                            onChange={(e) => setNewRoleColor(e.target.value)}
                            className="w-full h-8 bg-transparent border-0 cursor-pointer"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Priority Level</label>
                        <select
                          value={newRoleType}
                          onChange={(e) => setNewRoleType(e.target.value)}
                          className="w-full bg-[#161d1f] border border-[#232e41] rounded-lg px-3 py-1.5 text-xs text-white"
                        >
                          <option value="owner">Owner (Highest Privilege)</option>
                          <option value="moderator">Moderator</option>
                          <option value="staff">Staff/Helper</option>
                          <option value="bot">Other Bot/Systems</option>
                          <option value="member">General Member</option>
                        </select>
                      </div>

                      <button
                        onClick={addCustomRole}
                        className="w-full bg-[#161d28]/80 hover:bg-[#ff0055] border border-[#232e41] hover:border-transparent text-white font-semibold text-xs px-4 py-2 rounded-lg transition-all flex items-center justify-center space-x-1"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Styled Role</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: Custom Channels */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-white flex items-center space-x-2 pb-1 border-b border-[#1b2330]">
                  <Layers className="h-4.5 w-4.5 text-[#ff0055]" />
                  <span>Interactive Channel Directories</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category boxes viewer */}
                  <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                    {channels.map((c, catIdx) => (
                      <div key={catIdx} className="bg-[#11151e] border border-[#1b2330] rounded-xl p-4 space-y-3 shadow-md">
                        <div className="flex items-center justify-between border-b border-[#1d2736] pb-2">
                          <span className="text-xs font-bold text-[#ff0055] font-mono tracking-wide">{c.category}</span>
                          <button 
                            onClick={() => removeCategory(catIdx)}
                            className="text-gray-500 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-1.5">
                          {c.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center justify-between bg-[#161d28]/75 p-2 rounded border border-[#232e41]/50 text-xs">
                              <span className="font-mono text-gray-300">
                                {item.type === 'GuildVoice' ? '🔊' : '💬'} {item.name}
                              </span>
                              <span className="text-[10px] text-gray-500 font-mono capitalize">
                                {item.type.replace('Guild', '')}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Inline add channel node inputs */}
                        <div className="flex space-x-2 pt-2 border-t border-[#1d2736]/55 select-none">
                          <input 
                            type="text" 
                            id={`new-ch-input-${catIdx}`}
                            placeholder="e.g. general-chat" 
                            className="bg-[#161d28] border border-[#232e41] text-[10px] rounded px-2 py-1 text-white flex-1 focus:outline-none"
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                const target = e.currentTarget;
                                addChannelToCategory(catIdx, target.value, 'GuildText');
                                target.value = '';
                              }
                            }}
                          />
                          <button 
                            onClick={() => {
                              const inputEl = document.getElementById(`new-ch-input-${catIdx}`) as HTMLInputElement;
                              if (inputEl) {
                                addChannelToCategory(catIdx, inputEl.value, 'GuildText');
                                inputEl.value = '';
                              }
                            }}
                            className="bg-[#1c2433] hover:bg-[#ff0055] px-2.5 py-0.5 rounded text-[10px] border border-[#2a364d] hover:border-transparent text-white transition-all cursor-pointer"
                          >
                            Add Box
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Setup custom category addition */}
                  <div className="bg-[#11151e] p-5 rounded-xl border border-[#232e41]/60 space-y-4 h-fit">
                    <p className="text-xs font-semibold text-white uppercase tracking-wider">Deploy Category Block</p>
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-gray-400">Category Name (Staged)</label>
                        <input
                          type="text"
                          placeholder="e.g. 🏆・TROPHY・ROOM"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          className="w-full bg-[#161d1f] border border-[#232e41] rounded-lg px-3 py-2 text-xs text-white"
                        />
                      </div>
                      <button
                        onClick={addCategoryGroup}
                        className="w-full bg-[#161d28]/85 hover:bg-[#ff0055] border border-[#232e41] hover:border-transparent text-white font-semibold text-xs px-4 py-2.5 rounded-lg transition-all flex items-center justify-center space-x-1"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Create Category Node</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SLASH COMMANDS REGISTRAR */}
          {activeTab === 'deploy' && (
            <div className="space-y-6">
              <div className="border-b border-[#1b2330] pb-5">
                <h2 className="text-xl font-bold font-sans text-white">Slash Command REST Gateway</h2>
                <p className="text-sm text-gray-400">Initialize other slash declarations directly into Discord API routers over HTTP operations.</p>
              </div>

              <div className="bg-[#161d28] border border-[#232e41] p-5 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">Deploy Registered Configurations</h4>
                  <p className="text-xs text-gray-400 max-w-xl">
                    Sends active command listings from <code className="text-white font-mono">/commands</code> payload folder to Discord REST APIs. Note that global commands could take up to 60 minutes to propagate, while Guild-specific deployments take effect instantly.
                  </p>
                </div>
                <button
                  onClick={handleDeploySlash}
                  disabled={deploying}
                  className="shrink-0 bg-[#ff0055] hover:bg-[#d00045] disabled:bg-[#ff0055]/30 text-white font-semibold text-xs px-5 py-3 rounded-lg transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Terminal className="h-4 w-4 shrink-0" />
                  <span>{deploying ? 'Deploying REST commands...' : 'Deploy (/) Slash Commands'}</span>
                </button>
              </div>

              {/* Console Logs terminal output */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider flex items-center space-x-1">
                  <span>Terminal REST Stream Logs</span>
                </label>
                <div className="bg-[#0b0d10] border border-[#1b2330] rounded-xl p-4 font-mono text-xs text-gray-300 space-y-1.5 h-64 overflow-y-auto shadow-inner">
                  {deployLogs.length === 0 ? (
                    <p className="text-gray-500 italic">[Terminal idle. Click "Deploy Slash Commands" to register scripts...]</p>
                  ) : (
                    deployLogs.map((log, idx) => (
                      <p key={idx} className={log.includes('✅') ? 'text-emerald-400' : log.includes('❌') ? 'text-rose-500' : 'text-gray-300'}>
                        {log}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: DEPLOYMENT GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              <div className="border-b border-[#1b2330] pb-5">
                <h2 className="text-xl font-bold font-sans text-white">Ultimate Build & Setup Guide</h2>
                <p className="text-sm text-gray-400">Complete setup sequence to host, run, and scale your premium ZENIXX DEV Discord bot.</p>
              </div>

              <div className="space-y-5">
                <div className="p-4 bg-[#ff0055]/5 border border-[#ff0055]/25 rounded-xl flex items-start space-x-3 text-xs leading-relaxed text-gray-300">
                  <Sparkles className="h-5 w-5 text-[#ff0055] shrink-0" />
                  <div>
                    <h5 className="font-bold text-white mb-0.5">THE SCREENSHOT PATTERN COMPLIANCE</h5>
                    <p>This builder employs professional channel design schemas using dots and custom emoji anchors (e.g. <code className="text-white font-medium">📢・server・updates</code>). Roles are styled exactly like <code className="text-white font-medium">👑 ． OWNER ． &lt;3</code> with matching hierarchy priorities. Running the setup command automatically constructs these assets.</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <h3 className="text-base font-semibold text-white">🚀 Step-by-Step Server Setup</h3>
                  
                  <div className="space-y-2 font-mono text-xs text-gray-400 leading-relaxed bg-[#141a24] p-4 rounded-xl border border-[#232e41]">
                    <div className="flex items-start">
                      <span className="text-white font-bold mr-2">1. Connect:</span>
                      <span>Paste your Discord Bot Token inside the Connector tab of this panel and establish connection.</span>
                    </div>
                    <div className="flex items-start mt-2">
                      <span className="text-white font-bold mr-2">2. Invite:</span>
                      <span>Copy your Client ID and navigate to the developer portal URL to invite the bot into your target server. Make sure to give it "Administrator" privileges.</span>
                    </div>
                    <div className="flex items-start mt-2">
                      <span className="text-white font-bold mr-2">3. Role height:</span>
                      <span>Move the Bot's own Integration role (named after your bot) to the VERY TOP of your server's role list in Server Settings. This permits it to sort created roles lower than itself.</span>
                    </div>
                    <div className="flex items-start mt-2">
                      <span className="text-white font-bold mr-2">4. Build Server:</span>
                      <span>Log in to Discord under the account <code className="text-[#ff0055] font-bold">zenixx.dev</code> and type: <code className="text-white font-bold font-sans px-1 bg-[#1c2433] rounded">{prefix}setup-server</code> in any channel.</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-base font-semibold text-white">📁 Independent Modular commands</h3>
                  <p className="text-xs text-gray-400">If you don't wish to run the full master setup command, you can run single administrative tasks programmatically over prefix triggers:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 bg-[#161d28]/60 border border-[#232e41] rounded-lg">
                      <p className="text-white font-bold mb-1">{prefix}create-roles</p>
                      <p className="text-gray-400">Auto-deploys roles with styled banners and priority hex colors.</p>
                    </div>
                    <div className="p-3 bg-[#161d28]/60 border border-[#232e41] rounded-lg">
                      <p className="text-white font-bold mb-1">{prefix}create-channels</p>
                      <p className="text-gray-400">Erects full category frameworks and customized channels cleanly.</p>
                    </div>
                    <div className="p-3 bg-[#161d28]/60 border border-[#232e41] rounded-lg">
                      <p className="text-white font-bold mb-1">{prefix}set-permissions</p>
                      <p className="text-gray-400">Locks channels down. Syncs child nodes with parent permissions.</p>
                    </div>
                    <div className="p-3 bg-[#161d28]/60 border border-[#232e41] rounded-lg">
                      <p className="text-white font-bold mb-1">{prefix}set-role-position</p>
                      <p className="text-gray-400">Ranks role elevations vertically below the client integration.</p>
                    </div>
                    <div className="p-3 bg-[#161d28]/60 border border-[#232e41] rounded-lg">
                      <p className="text-white font-bold mb-1">{prefix}role-styler</p>
                      <p className="text-gray-400">Audits server-side properties. Aligns changes back to layout guidelines.</p>
                    </div>
                    <div className="p-3 bg-[#161d28]/60 border border-[#232e41] rounded-lg flex flex-col justify-between">
                      <div>
                        <p className="text-rose-400 font-bold mb-1">{prefix}reset-setup</p>
                        <p className="text-gray-400">Safely purges all custom channels & roles matching configs.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#1b2330] pt-4 space-y-2">
                  <h4 className="text-sm font-semibold text-white">🏠 Running Standalone on Hosting or Termux</h4>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    To upload to GitHub or run privately on local systems or Termux, follow standard Node package execution scripts. Run <code className="text-white font-mono bg-[#161d28] px-1 rounded">npm install</code>, populate <code className="text-white font-mono bg-[#161d28] px-1 rounded">.env</code> keys, and execute <code className="text-white font-mono bg-[#161d28] px-1 rounded">npm run bot</code> to launch.
                  </p>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Footer bar */}
      <footer className="border-t border-[#1b2330] bg-[#0c0f14] py-4 text-center mt-auto text-xs text-gray-500 font-medium select-none">
        <p>ZENIXX DEV Bot Builder Console & Daemon Dashboard • Designed for Premium Discord Automations</p>
      </footer>
    </div>
  );
}
