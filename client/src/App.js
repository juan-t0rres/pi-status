import './App.css';
import { Children, useEffect, useState } from "react";
import piLogo from "./pi.png";

function OnlineTag() {
  return <div style={{ display: 'flex', alignItems: 'center', columnGap: '5px' }}>
    <div style={{ fontSize: 8 }}>🟢</div>
    <div>Yes</div>
  </div>;
}

function OfflineTag() {
  return <div style={{ display: 'flex', alignItems: 'center', columnGap: '5px' }}>
    <div style={{ fontSize: 8 }}>🔴</div>
    <div>No</div>
  </div>;
}

function Card({ title, fields, children }) {
  return <div className="card">
    <h1>{title}</h1>
    <table>
      <tbody>
        {fields && fields.map((field) => <tr key={field.title}>
          <td><span>{field.title}</span></td>
          <td style={{ padding: "0 15px" }}>{field.value}</td>
        </tr>)}
      </tbody>
    </table>
    <div style={{ marginTop: 10 }}>
      {children}
    </div>
  </div>;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [pi, setPi] = useState();
  const [mcServer, setMcServer] = useState();
  const [piVpn, setPiVpn] = useState();
  const [piHole, setPiHole] = useState();
  const [portfolio, setPortfolio] = useState();
  const [mcLoad, setMcLoad] = useState(false);
  const [secret, setSecret] = useState();
  const [secretInput, setSecretInput] = useState('');

  useEffect(() => {
    async function getData() {
      const piJson = await (await fetch('/cpu')).json();
      setPi(piJson);
      const minecraftJson = await (await fetch('/minecraft')).json();
      setMcServer(minecraftJson);
      const piVpnJson = await (await fetch('/pivpn')).json();
      setPiVpn(piVpnJson);
      const piHoleJson = await (await fetch('/pihole')).json();
      setPiHole(piHoleJson);
      const portfolioJson = await (await fetch('/portfolio')).json();
      setPortfolio(portfolioJson);
      setLoading(false);
    }
    getData();
  }, []);

  function formatPercent(num) {
    return (num * 1e2).toFixed(2) + '%';
  }

  function formatMemory(num) {
    return (num / 1e3).toFixed(2) + 'GB';
  }

  async function activateServer(active) {
    if (secret === null || secret === undefined) {
      alert("No secret set. Secret is required to start/stop server.");
      return;
    }
    setMcLoad(true);
    const post = await fetch('/minecraft', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ active, secret })
    });
    setMcLoad(false);
    const json = await post.json();
    if (json.correct) {
      alert("Server status updated");
      refreshMinecraft();
    }
    else {
      alert("Incorrect secret");
    }
  }

  async function refreshPi() {
    const piJson = await (await fetch('/cpu')).json();
    setPi(piJson);
  }

  async function refreshMinecraft() {
    const minecraftJson = await (await fetch('/minecraft')).json();
    setMcServer(minecraftJson);
  }

  return (
    <>
      <div className="header">
        <img style={{ width: 32 }} src={piLogo} alt="logo" />
        pi status
      </div>
      {loading ? <div style={{ padding: 40 }}>Loading...</div> : <div className="content">
        <Card title="🖥️ Pi"
          fields={
            [
              { title: 'CPU Usage', value: formatPercent(pi?.cpu) },
              { title: 'Total Memory', value: formatMemory(pi?.memoryTotal) },
              { title: 'Free Memory', value: formatMemory(pi?.memoryFree) }
            ]}
        >
          <button onClick={() => refreshPi()}>Refresh</button>
        </Card>
        <Card title="👔 Portfolio Website"
          fields={[
            { title: 'Active', value: portfolio?.active ? <OnlineTag /> : <OfflineTag /> },
            { title: 'Domain 1', value: <a className='domain' href="https://juantorr.es/">juantorr.es</a> },
            { title: 'Domain 2', value: <a className='domain' href="https://torresjuan.com/">torresjuan.com</a> }
          ]}
        />
        <Card title="🎮 Minecraft Server"
          fields={[
            { title: 'Active', value: mcServer?.active ? <OnlineTag /> : <OfflineTag /> },
            { title: 'Version', value: mcServer?.version ?? "N/A" },
            { title: 'Latency', value: mcServer?.latency ? mcServer.latency + "ms" : "N/A" },
            { title: 'Players', value: (mcServer?.players ?? "0") + ' connected' }
          ]}
        >
          {mcLoad ? <div>Loading...</div> : <div className="minecraft-buttons">
            {mcServer?.active ?
              <button onClick={() => activateServer(false)}>Stop</button>
              : <button onClick={() => activateServer(true)}>Start</button>}
            <button onClick={() => refreshMinecraft()}>Refresh</button>
          </div>}
        </Card>
        <Card title="🔑 Authentication">
          <div className="authentication">
            <label>Enter Secret</label>
            <span>
              <input value={secretInput} onChange={(e) => setSecretInput(e.target.value)} type="password" />
              <button onClick={() => setSecret(secretInput)}>Set</button>
            </span>
            <div>
              {secret ? "🔒 Set" : "🔓 Not Set"}
            </div>
          </div>
        </Card>
        <Card title="⛔ Pi-hole"
          fields={[
            { title: 'Active', value: piHole?.active ? <OnlineTag /> : <OfflineTag /> }
          ]}
        />
        <Card title="🥸 PiVPN"
          fields={[
            { title: 'Active', value: piVpn?.active ? <OnlineTag /> : <OfflineTag /> },
          ]}
        />
      </div>}
      <div className="footer">
        Created by Juan Torres
      </div>
    </>
  );
}

export default App;
