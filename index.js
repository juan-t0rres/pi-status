import 'dotenv/config';
import express from 'express';
import os from 'os-utils';
import ms from 'minestat';
import { promisify } from 'util';
import { exec } from 'child_process';
import http from 'http';
import bodyParser from 'body-parser';
import checkDiskSpace from 'check-disk-space';
import bcrypt from 'bcrypt';

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const execP = promisify(exec);
const PORT = 8080;
const MINECRAFT_IP = '73.139.194.172';
const MINECRAFT_PORT = '25594';

app.get('/portfolio', (req, res) => {
    http.get('http://juantorr.es/', function (response) {
        // If you get here, you have a response.
        // If you want, you can check the status code here to verify that it's `200` or some other `2xx`.
        res.json({ active: true });
    }).on('error', function (e) {
        // Here, an error occurred.  Check `e` for the error.
        res.json({ active: false });
    });
});

app.get('/cloud', async (req, res) => {
    const disk = await checkDiskSpace('/media/ssd');
    const { free, size } = disk;
    http.get('http://cloud.juantorr.es/', function (response) {
        res.json({ active: true, free: (free / 1e9).toFixed(2) + "GB", size: (size / 1e9).toFixed(2) + "GB" });
    }).on('error', function (e) {
        res.json({ active: false });
    });
});

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

async function isMinecraftServerActive() {
    try {
        const systemctl = await execP('sudo systemctl status minecraftserver');
        const stdout = systemctl.stdout;
        const active = stdout.includes('Active: active');
        return active;
    }
    catch {
        return false;
    }
}

// Gets information on minecraft server
app.get('/minecraft', async (req, res) => {
    const active = await isMinecraftServerActive();
    if (active) {
        ms.init(MINECRAFT_IP, MINECRAFT_PORT, () => {
            res.json({
                active,
                version: ms.version,
                latency: ms.latency,
                players: ms.current_players,
            });
        });
    }
    else {
        res.json({
            active: false
        });
    }
});

async function isSecret(inputSecret) {
    const hash = await new Promise((resolve, reject) => {
        bcrypt.hash(inputSecret, process.env.SALT, function (err, hash) {
            if (err) reject(err)
            resolve(hash)
        });
    });
    return hash === process.env.SECRET;
}

app.post('/minecraft', async (req, res) => {
    const activate = req.body.active;
    const inputSecret = req.body.secret;
    const isActive = await isMinecraftServerActive();
    if (isActive === activate) {
        return;
    }

    const correct = await isSecret(inputSecret);
    if (!correct) {
        res.json({ correct: false });
        return;
    }

    if (activate) {
        await execP('sudo systemctl start minecraftserver');
    }
    else {
        await execP('sudo systemctl stop minecraftserver');
    }
    res.json({ correct: true, activate });
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