import express from 'express';
import os from 'os-utils';
import ms from 'minestat';
import { promisify } from 'util';
import { exec } from 'child_process';

const app = express();
const execP = promisify(exec);
const PORT = 8080;
const MINECRAFT_IP = '73.139.194.172';
const MINECRAFT_PORT = '25594';

// Gets cpu and memory usage
app.get('/cpu', (req, res) => {
    os.cpuUsage((v) => {
        res.json({
            cpu: v,
            memoryFree: os.freemem(),
            memoryTotal: os.totalmem(),
        });
    });
});

// Gets information on minecraft server
app.get('/minecraft', (req, res) => {
    ms.init(MINECRAFT_IP, MINECRAFT_PORT, () => {
        res.json({
            online: ms.online,
            version: ms.version,
            latency: ms.latency,
            players: ms.current_players
        });
    })
});

// Gets status of pihole
app.get('/pihole', async (req, res) => {
    const systemctl = await execP('sudo systemctl status pihole-FTL');
    const stdout = systemctl.stdout;
    const active = stdout.includes('Active: active')
    res.json({ active });
});

// Gets status of pivpn
app.get('/pivpn', async (req, res) => {
    try {
        const command = await execP('pivpn -c');
        const stdout = command.stdout;
        const connectedList = stdout.substring(0, stdout.indexOf("::: Disabled clients :::"));
        const active = connectedList.includes('mbp');
        res.json({ active });
    }
    catch {
        res.json({ active: false });
    }
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
});