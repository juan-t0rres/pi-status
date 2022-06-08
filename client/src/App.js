import './App.css';
import { useEffect, useState } from "react";
import piLogo from "./pi.png";

function Card({ title, fields }) {
  return <div className="card">
    <h1>{title}</h1>
    <table>
      <tbody>
        {fields.map((field) => <tr key={field.title}>
          <td><span>{field.title}</span></td>
          <td style={{ padding: "0 15px" }}>{field.value}</td>
        </tr>)}
      </tbody>
    </table>
  </div>;
}

function App() {
  const [loading, setLoading] = useState(true);
  const [pi, setPi] = useState();
  const [mcServer, setMcServer] = useState();
  const [piVpn, setPiVpn] = useState();
  const [piHole, setPiHole] = useState();

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

  if (loading) return <div>Loading</div>;

  return (
    <>
      <div className="header">
        <img style={{ width: 32 }} src={piLogo} alt="logo" />
        pi status
      </div>
      <div className="content">
        <Card title="🖥️ Pi"
          fields={
            [
              { title: 'CPU Usage', value: formatPercent(pi.cpu) },
              { title: 'Total Memory', value: formatMemory(pi.memoryTotal) },
              { title: 'Free Memory', value: formatMemory(pi.memoryFree) }
            ]}
        />
        <Card title="🎮 Minecraft Server"
          fields={[
            { title: 'Online', value: mcServer.online ? "Yes" : "No" },
            { title: 'Version', value: mcServer.version ?? "N/A" },
            { title: 'Latency', value: mcServer.latency ? mcServer.latency + "ms" : "N/A" },
            { title: 'Players', value: (mcServer.players ?? "0") + ' connected' }
          ]}
        />
        <Card title="⛔ Pi-hole"
          fields={[
            { title: 'Active', value: piHole.active ? "Yes" : "No" }
          ]}
        />
        <Card title="🥸 PiVPN"
          fields={[
            { title: 'Active', value: piVpn.active ? "Yes" : "No" },
          ]}
        />
      </div>
      <div className="footer">
        Created by Juan Torres
      </div>
    </>
  );
}

export default App;
