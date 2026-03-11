"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [selectedBranch, setSelectedBranch] = useState("Hyderabad");
  
  // Registration / Login forms
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [otp, setOtp] = useState("");
  
  // Transfer form
  const [toAccountId, setToAccountId] = useState("");
  const [amount, setAmount] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Api Helper
  const apiCall = async (method: string, path: string, body?: any) => {
    const res = await fetch("/api/proxy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, path, body }),
    });
    
    // Wait for text first so we don't crash on empty responses
    const text = await res.text();
    let data = {};
    if (text) {
      try { data = JSON.parse(text); } catch(e) { data = { message: text }; }
    }
    
    if (!res.ok) throw new Error((data as any).error || (data as any).detail || `Error code ${res.status}`);
    return data;
  };

  const getApiCall = async (path: string) => {
    const res = await fetch(`/api/proxy?path=${encodeURIComponent(path)}`);
    const text = await res.text();
    let data = {};
    if (text) {
      try { data = JSON.parse(text); } catch(e) { data = { message: text }; }
    }
    if (!res.ok) throw new Error((data as any).error || (data as any).detail || `Error code ${res.status}`);
    return data;
  };

  const fetchDashboard = async (userId: string) => {
    try {
      // Get user accounts
      const accounts: any = await getApiCall(`/accounts/${userId}`);
      let mainAccount = null;
      if (accounts && accounts.length > 0) {
        mainAccount = accounts[0];
        setAccount(mainAccount);
      } else {
        setAccount(null); // Explicitly null means needs branch selection
      }
      
      // Fetch transactions
      if (mainAccount) {
        const txs: any = await getApiCall(`/transactions/${mainAccount.id}`);
        setTransactions(txs || []);
      }
    } catch (err: any) {
      // Let it go silently
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      const newAcc: any = await apiCall("POST", "/accounts", { user_id: user.id, branch: selectedBranch });
      await apiCall("POST", `/accounts/${newAcc.id}/update_balance`, { amount: 1000 }); // initial fund for demo
      newAcc.balance = 1000;
      setAccount(newAcc);
      setSuccess(`Account created successfully at ${selectedBranch} branch!`);
      await fetchDashboard(user.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      if (isLogin) {
        const data: any = await apiCall("POST", "/login", { username, password });
        setUser({ id: data.id, username });
        await fetchDashboard(data.id);
        setSuccess("Successfully logged in.");
      } else {
        await apiCall("POST", "/register", { username, password, email });
        setSuccess("Registration successful! Please check your email for the verification code.");
        setNeedsVerification(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setSuccess(""); setLoading(true);
    try {
      await apiCall("POST", "/verify", { username, otp });
      setSuccess("Account verified successfully! You can now log in.");
      setNeedsVerification(false);
      setIsLogin(true);
      setOtp("");
      setPassword(""); // For safety, let them re-enter
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) return;
    setError(""); setSuccess(""); setLoading(true);
    try {
      const parsedAmount = parseFloat(amount);
      if(isNaN(parsedAmount) || parsedAmount <= 0) throw new Error("Invalid transfer amount");
      
      await apiCall("POST", "/transactions/transfer", {
        from_account_id: account.id,
        to_account_id: toAccountId,
        amount: parsedAmount,
        user_id: user.id
      });
      
      setSuccess("Transfer successful! Check your balance and transactions.");
      setAmount("");
      setToAccountId("");
      await fetchDashboard(user.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadStatement = () => {
    if (!account || transactions.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Type,Description,Amount\r\n";

    transactions.forEach((tx) => {
      const isSender = tx.from_account_id === account.id;
      const date = new Date(tx.timestamp).toLocaleString();
      const type = isSender ? "Debit" : "Credit";
      const desc = isSender ? `Transfer to ${tx.to_account_id}` : `Transfer from ${tx.from_account_id}`;
      const amount = (isSender ? "-" : "+") + tx.amount.toFixed(2);
      
      // Escape Quotes just in case
      csvContent += `"${date}","${type}","${desc}","${amount}"\r\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `statement_${account.id.substring(0, 8)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalSpent = transactions
    .filter((tx) => account && tx.from_account_id === account.id)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalReceived = transactions
    .filter((tx) => account && tx.to_account_id === account.id)
    .reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="container">
      {!user ? (
        <div className="card" style={{ maxWidth: "480px", margin: "0 auto" }}>
          <h1 className="title">NexBank</h1>
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          {needsVerification ? (
            <form onSubmit={handleVerify}>
              <p style={{ marginBottom: "1rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                We sent a 6-digit verification code to your email.
              </p>
              <div className="input-group">
                <label>Verification Code</label>
                <input type="text" className="input" value={otp} onChange={e => setOtp(e.target.value)} placeholder="Wait a few seconds..." required />
              </div>
              <button type="submit" className="btn btn-success" disabled={loading}>
                {loading ? "Verifying..." : "Verify Account"}
              </button>
              <div style={{ marginTop: "1rem", textAlign: "center" }}>
                <a href="#" onClick={(e) => { e.preventDefault(); setNeedsVerification(false); setIsLogin(true); setError(""); setSuccess(""); }} style={{ color: "var(--accent-color)", textDecoration: "none", fontSize: "0.875rem" }}>
                  Back to Login
                </a>
              </div>
            </form>
          ) : (
            <>
              <form onSubmit={handleAuth}>
                <div className="input-group">
                  <label>Username</label>
                  <input type="text" className="input" value={username} onChange={e => setUsername(e.target.value)} required />
                </div>
                {!isLogin && (
                  <div className="input-group">
                    <label>Email</label>
                    <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                )}
                <div className="input-group">
                  <label>Password</label>
                  <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? "Processing..." : isLogin ? "Login" : "Register"}
                </button>
              </form>
              
              <div style={{ marginTop: "1rem", textAlign: "center" }}>
                <span style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <a href="#" onClick={(e) => { e.preventDefault(); setIsLogin(!isLogin); setError(""); setSuccess(""); }} style={{ color: "var(--accent-color)", textDecoration: "none" }}>
                    {isLogin ? "Register here" : "Login here"}
                  </a>
                </span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
            <h1 className="title" style={{ marginBottom: 0 }}>Welcome back, {user.username}</h1>
            <button className="btn btn-danger" style={{ width: "auto" }} onClick={() => setUser(null)}>Logout</button>
          </div>
          
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          {!account ? (
            <div className="card" style={{ maxWidth: "480px", margin: "0 auto", marginTop: "2rem" }}>
              <h2>Welcome to NexBank!</h2>
              <p style={{ color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
                To get started, please select your preferred home branch to open your checking account.
              </p>
              <form onSubmit={handleCreateAccount}>
                <div className="input-group">
                  <label>Select Home Branch</label>
                  <select 
                    className="input" 
                    value={selectedBranch} 
                    onChange={(e) => setSelectedBranch(e.target.value)} 
                    required
                    style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}
                  >
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Bangalore">Bangalore</option>
                    <option value="Pune">Pune</option>
                    <option value="Bidar">Bidar</option>
                    <option value="Chennai">Chennai</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? "Creating..." : "Open Account"}
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="grid">
                {/* Account Card */}
                <div className="card">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <h2>My Account</h2>
                    <span style={{ 
                      background: "rgba(88, 166, 255, 0.1)", 
                      color: "var(--accent-color)", 
                      padding: "0.25rem 0.75rem", 
                      borderRadius: "12px",
                      fontSize: "0.75rem",
                      fontWeight: "bold"
                    }}>
                      {account.branch || "Branch"}
                    </span>
                  </div>
                  <p style={{ color: "var(--text-secondary)" }}>Account ID:</p>
                  <p style={{ fontSize: "1.125rem", fontFamily: "monospace", marginBottom: "1rem", letterSpacing: "1px" }}>
                    {account?.id || "Loading..."}
                  </p>
                  
                  <p style={{ color: "var(--text-secondary)" }}>Available Balance:</p>
                  <div className="stat-value">${account?.balance?.toFixed(2) || "0.00"}</div>
                  
                  <button className="btn" style={{ marginTop: "1.5rem" }} onClick={() => fetchDashboard(user.id)}>
                    Refresh Balance
                  </button>
                </div>
                
                {/* Transfer Card */}
                <div className="card">
                  <h2>Send Money</h2>
                  <form onSubmit={handleTransfer}>
                    <div className="input-group">
                      <label>Recipient Account ID</label>
                      <input type="text" className="input" value={toAccountId} onChange={e => setToAccountId(e.target.value)} placeholder="e.g. 12345678901" required />
                    </div>
                    <div className="input-group">
                      <label>Amount ($)</label>
                      <input type="number" step="0.01" className="input" value={amount} onChange={e => setAmount(e.target.value)} placeholder="100.00" required />
                    </div>
                    <button type="submit" className="btn btn-success" disabled={loading || !account}>
                      {loading ? "Processing Transfer..." : "Transfer Funds"}
                    </button>
                  </form>
                </div>
              </div>

              {/* Financial Overview Dashboard */}
          {transactions.length > 0 && (
            <div className="card" style={{ marginTop: "2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ marginBottom: 0 }}>Financial Dashboard</h2>
              </div>
              
              <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", flexWrap: "wrap" }}>
                <div style={{
                  flex: 1, minWidth: "200px", padding: "1.5rem", borderRadius: "8px", 
                  background: "rgba(248, 81, 73, 0.05)", border: "1px solid var(--danger-color)"
                }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Total Money Spent</p>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--danger-color)" }}>
                    ${totalSpent.toFixed(2)}
                  </div>
                </div>
                
                <div style={{
                  flex: 1, minWidth: "200px", padding: "1.5rem", borderRadius: "8px", 
                  background: "rgba(46, 160, 67, 0.05)", border: "1px solid var(--success-color)"
                }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.25rem" }}>Total Money Received</p>
                  <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--success-color)" }}>
                    ${totalReceived.toFixed(2)}
                  </div>
                </div>
              </div>
              
              {/* Simple Visual Bar */}
              {(totalSpent > 0 || totalReceived > 0) && (
                <div style={{ marginTop: "2rem" }}>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "0.5rem" }}>Spend vs Receive Ratio</p>
                  <div style={{ display: "flex", width: "100%", height: "12px", borderRadius: "6px", overflow: "hidden", background: "rgba(0,0,0,0.2)" }}>
                    <div style={{ width: `${(totalSpent / (totalSpent + totalReceived)) * 100}%`, background: "var(--danger-color)" }} />
                    <div style={{ width: `${(totalReceived / (totalSpent + totalReceived)) * 100}%`, background: "var(--success-color)" }} />
                  </div>
                </div>
              )}
            </div>
          )}
          
              {/* Recent Transactions & Statements */}
              {transactions.length > 0 && (
                <div className="card" style={{ marginTop: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h2 style={{ marginBottom: 0 }}>Account Statement</h2>
                    <button className="btn" style={{ width: "auto", padding: "0.5rem 1rem", fontSize: "0.875rem" }} onClick={downloadStatement}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "0.5rem", verticalAlign: "text-bottom" }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                      Download Statement (CSV)
                    </button>
                  </div>
                  
                  <ul className="transaction-list">
                    {transactions.map(tx => {
                      const isSender = tx.from_account_id === account?.id;
                      return (
                        <li key={tx.id} className="transaction-item">
                          <div>
                            <strong>{isSender ? "Sent to:" : "Received from:"}</strong>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                              {isSender ? tx.to_account_id : tx.from_account_id}
                            </div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{new Date(tx.timestamp).toLocaleString()}</div>
                          </div>
                          <div className="stat-value" style={{ 
                            fontSize: "1.5rem", 
                            marginTop: 0, 
                            color: isSender ? "var(--text-primary)" : "var(--success-color)" 
                          }}>
                            {isSender ? "-" : "+"}${tx.amount.toFixed(2)}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
