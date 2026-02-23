const axios = require('axios');
const readline = require('readline');

const API_URL = 'http://geo-jazz.local/api';
const EVENT_TYPES = { 
    ENTRY: 'entry', 
    EXIT: 'exit', 
    CONTENT_VIEW: 'content_view' 
};

let activeUsers = [];
let activeFences = [];

const activeSessions = new Map();

function findUserForContentView(targetFence = null) {
    const validUsers = [];
    
    activeSessions.forEach((session, userId) => {
        if (targetFence && session.fenceId !== targetFence.id) return;
        
        if (!session.hasViewed) {
            const user = activeUsers.find(u => u.id === userId);
            const fence = activeFences.find(f => f.id === session.fenceId);
            if (user && fence) {
                validUsers.push({ user, fence });
            }
        }
    });
    
    return validUsers.length > 0 ? randomItem(validUsers) : null;
}

function findUserForExit(targetFence = null) {
    const validUsers = [];
    
    activeSessions.forEach((session, userId) => {
        if (targetFence && session.fenceId !== targetFence.id) return;
        
        const user = activeUsers.find(u => u.id === userId);
        const fence = activeFences.find(f => f.id === session.fenceId);
        if (user && fence) {
            validUsers.push({ user, fence });
        }
    });
    
    return validUsers.length > 0 ? randomItem(validUsers) : null;
}

function getCentroid(geometry) {
    if (geometry.type === 'Point') {
        return geometry.coordinates;
    }
    
    if (geometry.type === 'Polygon') {
        const ring = geometry.coordinates[0];
        let sumLon = 0, sumLat = 0;
        
        ring.forEach(point => {
            sumLon += point[0];
            sumLat += point[1];
        });
        
        return [sumLon / ring.length, sumLat / ring.length];
    }

    return [-73.985, 40.748];
}

function getPointNearBorder(geometry, eventType) {
    if (geometry.type === 'Point') {
        const drift = () => (Math.random() - 0.5) * 0.0003;
        return [
            geometry.coordinates[0] + drift(),
            geometry.coordinates[1] + drift()
        ];
    }
    
    if (geometry.type === 'Polygon') {
        const ring = geometry.coordinates[0];
        
        const edgeIndex = Math.floor(Math.random() * (ring.length - 1));
        const pointA = ring[edgeIndex];
        const pointB = ring[edgeIndex + 1];
        
        const t = Math.random();
        const edgePoint = [
            pointA[0] + (pointB[0] - pointA[0]) * t,
            pointA[1] + (pointB[1] - pointA[1]) * t
        ];
        
        const centroidLon = ring.reduce((sum, p) => sum + p[0], 0) / ring.length;
        const centroidLat = ring.reduce((sum, p) => sum + p[1], 0) / ring.length;
        
        const toCentroidLon = centroidLon - edgePoint[0];
        const toCentroidLat = centroidLat - edgePoint[1];
        
        const length = Math.sqrt(toCentroidLon * toCentroidLon + toCentroidLat * toCentroidLat);
        const normalizedLon = toCentroidLon / length;
        const normalizedLat = toCentroidLat / length;
        
        const distance = 0.0001 + Math.random() * 0.0001;
        
        const direction = eventType === EVENT_TYPES.ENTRY ? 1 : -1;
        
        return [
            edgePoint[0] + (normalizedLon * distance * direction),
            edgePoint[1] + (normalizedLat * distance * direction)
        ];
    }

    return [-73.985, 40.748];
}

async function bootstrap() {
    console.log("Connecting to GeoJazz Backend...");

    try {
        const usersRes = await axios.get(`${API_URL}/users`);
        activeUsers = usersRes.data;
        if (activeUsers.length === 0) throw new Error("No users found.");
        console.log(`   Users loaded: ${activeUsers.length}`);

        const fencesRes = await axios.get(`${API_URL}/geofences`);
        activeFences = fencesRes.data;
        if (activeFences.length === 0) throw new Error("No geofences found.");
        console.log(`   Locations loaded: ${activeFences.length}`);

    } catch (error) {
        console.error("Bootstrap Error:", error.message);
        process.exit(1);
    }
}

async function sendEvent(user, fence, type, date = new Date()) {
    const session = activeSessions.get(user.id);
    
    if (type === EVENT_TYPES.CONTENT_VIEW) {
        if (!session || session.fenceId !== fence.id || session.hasViewed) {
            console.log(`   Skipped CONTENT_VIEW (no valid session for ${user.username})`);
            return;
        }
    }
    
    if (type === EVENT_TYPES.EXIT) {
        if (!session || session.fenceId !== fence.id) {
            console.log(`   Skipped EXIT (no active session for ${user.username})`);
            return;
        }
    }

    let longitude, latitude;
    
    if (type === EVENT_TYPES.ENTRY || type === EVENT_TYPES.EXIT) {
        [longitude, latitude] = getPointNearBorder(fence.geometry, type);
    } 
    else if (type === EVENT_TYPES.CONTENT_VIEW) {
        const [centerLon, centerLat] = getCentroid(fence.geometry);
        const drift = () => (Math.random() - 0.5) * 0.0003;
        longitude = centerLon + drift();
        latitude = centerLat + drift();
    }

    const payload = {
        type: type,
        userId: user.id,
        fenceId: fence.id,
        location: {
            type: "Point",
            coordinates: [longitude, latitude] 
        },
        timestamp: date.toISOString()
    };

    try {
        await axios.post(`${API_URL}/events`, payload);
        
        if (type === EVENT_TYPES.ENTRY) {
            activeSessions.set(user.id, {
                fenceId: fence.id,
                hasViewed: false,
                entryTime: date
            });
        } else if (type === EVENT_TYPES.CONTENT_VIEW) {
            session.hasViewed = true;
        } else if (type === EVENT_TYPES.EXIT) {
            activeSessions.delete(user.id);
        }
        
        const time = date.toLocaleTimeString();
        let color;
        
        switch(type) {
            case EVENT_TYPES.ENTRY:
                color = '\x1b[32m';
                break;
            case EVENT_TYPES.EXIT:
                color = '\x1b[31m';
                break;
            case EVENT_TYPES.CONTENT_VIEW:
                color = '\x1b[36m';
                break;
        }
        
        const userName = user.username || "Unknown";
        console.log(`[${time}] ${color}${userName.padEnd(10)} ${type.padEnd(12)} -> ${fence.name}\x1b[0m`);
    } catch (error) {
        if (error.response && error.response.status !== 201) {
             console.error(`API Error: ${error.message}`);
        }
    }
}

const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function seedHistory() {
    console.log("\nGenerating Realistic History (Last 7 days)...");
    const TOTAL_SESSIONS = 40;
    
    activeSessions.clear();

    for (let i = 0; i < TOTAL_SESSIONS; i++) {
        const user = randomItem(activeUsers);
        const fence = randomItem(activeFences);
        
        const daysAgo = Math.floor(Math.random() * 7);
        const enterTime = new Date();
        enterTime.setDate(enterTime.getDate() - daysAgo);

        if (daysAgo === 0) {
            const currentHour = new Date().getHours();
            const safeHour = Math.max(0, Math.floor(Math.random() * currentHour));
            enterTime.setHours(safeHour);
        } else {
            enterTime.setHours(18 + Math.floor(Math.random() * 5));
        }
        
        await sendEvent(user, fence, EVENT_TYPES.ENTRY, enterTime);

        if (Math.random() > 0.3) {
            const viewTime = new Date(enterTime);
            viewTime.setMinutes(viewTime.getMinutes() + 2 + Math.floor(Math.random() * 5));
            
            if (viewTime < new Date()) {
                await sendEvent(user, fence, EVENT_TYPES.CONTENT_VIEW, viewTime);
            }
        }

        const exitTime = new Date(enterTime);
        exitTime.setMinutes(exitTime.getMinutes() + 30 + Math.floor(Math.random() * 90));
        if (exitTime < new Date()) {
            await sendEvent(user, fence, EVENT_TYPES.EXIT, exitTime);
        }
        
        await sleep(20); 
    }
    
    console.log("\nHistory generated with valid sessions!");
}

async function startLiveCLI() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    console.log("\nLIVE DEMO CONTROL CENTER");
    console.log("-----------------------------------------------");
    console.log(" [1] Mixed Crowd (Heavy Traffic)");
    console.log(" [2] Single Entry (ENTRY)");
    console.log(" [3] Single View (CONTENT_VIEW)");
    console.log(" [4] Single Exit (EXIT)");
    console.log(" [5] Migration to Park (All ENTRY)");
    console.log(" [6] Full Session (ENTRY -> VIEW -> EXIT)");
    console.log(" [0] Exit");
    console.log("-----------------------------------------------");

    const prompt = () => {
        rl.question('Action > ', async (opt) => {
            switch(opt.trim()) {
                case '1':
                    console.log("Simulating club activity...");
                    
                    for(let i = 0; i < 4; i++) {
                        const user = randomItem(activeUsers);
                        const fence = randomItem(activeFences);
                        
                        await sendEvent(user, fence, EVENT_TYPES.ENTRY);
                        await sleep(300);
                        
                        if (Math.random() > 0.4) {
                            await sendEvent(user, fence, EVENT_TYPES.CONTENT_VIEW);
                            await sleep(300);
                        }
                        
                        await sendEvent(user, fence, EVENT_TYPES.EXIT);
                        await sleep(300);
                    }
                    break;
                    
                case '2':
                    await sendEvent(randomItem(activeUsers), randomItem(activeFences), EVENT_TYPES.ENTRY);
                    break;
                    
                case '3':
                    const validViewer = findUserForContentView();
                    if (validViewer) {
                        await sendEvent(validViewer.user, validViewer.fence, EVENT_TYPES.CONTENT_VIEW);
                    } else {
                        console.log("    No users available for CONTENT_VIEW. Create an ENTRY first!");
                    }
                    break;
                    
                case '4':
                    const validExiter = findUserForExit();
                    if (validExiter) {
                        await sendEvent(validExiter.user, validExiter.fence, EVENT_TYPES.EXIT);
                    } else {
                        console.log("    No users available for EXIT. Create an ENTRY first!");
                    }
                    break;
                    
                case '5':
                    const park = activeFences.find(f => f.name.toLowerCase().includes("park")) || activeFences[0];
                    console.log(`Moving everyone to ${park.name}!`);
                    for(const u of activeUsers) {
                        await sendEvent(u, park, EVENT_TYPES.ENTRY);
                        await sleep(200);
                    }
                    break;
                    
                case '6':
                    console.log("Simulating full session...");
                    const user = randomItem(activeUsers);
                    const fence = randomItem(activeFences);
                    
                    await sendEvent(user, fence, EVENT_TYPES.ENTRY);
                    await sleep(500);
                    await sendEvent(user, fence, EVENT_TYPES.CONTENT_VIEW);
                    await sleep(500);
                    await sendEvent(user, fence, EVENT_TYPES.EXIT);
                    break;
                    
                case '0':
                    process.exit(0);
                    
                default:
                    console.log("Invalid option.");
            }
            prompt();
        });
    };
    prompt();
}

(async () => {
    await bootstrap();
    if (process.argv.includes('--seed')) {
        await seedHistory();
    } else {
        await startLiveCLI();
    }
})();