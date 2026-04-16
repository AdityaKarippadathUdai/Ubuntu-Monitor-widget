const os = require("os");
const { exec } = require("child_process");

function getCPU() {
  const cpus = os.cpus();

  let idle = 0, total = 0;

  cpus.forEach(core => {
    for (let type in core.times) total += core.times[type];
    idle += core.times.idle;
  });

  return Math.round(100 - idle / total * 100);
}

function getRAM() {
  const total = os.totalmem();
  const free = os.freemem();
  return Math.round((total - free) / total * 100);
}

function getGPU(callback) {
  exec(
    "nvidia-smi --query-gpu=utilization.gpu,memory.used,memory.total --format=csv,noheader,nounits",
    (err, stdout) => {
      if (err) return callback("--", "--", "--");

      const [gpu, used, total] = stdout.trim().split(",");

      const gpuPercent = gpu.trim();
      const vramUsed = parseInt(used.trim());
      const vramTotal = parseInt(total.trim());
      const vramPercent = Math.round((vramUsed / vramTotal) * 100);

      callback(gpuPercent, vramPercent, `${vramUsed}/${vramTotal} MB`);
    }
  );
}

function update() {
  const cpu = getCPU();
  const ram = getRAM();
  const battery = getBattery();

  document.getElementById("cpuText").innerText = cpu + "%";
  document.getElementById("ramText").innerText = ram + "%";
  document.getElementById("batteryText").innerText = battery.percent + "%";

  document.getElementById("cpuBar").style.width = cpu + "%";
  document.getElementById("ramBar").style.width = ram + "%";
  document.getElementById("batteryBar").style.width = battery.percent + "%";

  getGPU((gpu, vramPercent, vramText) => {
    document.getElementById("gpuText").innerText = gpu + "%";
    document.getElementById("gpuBar").style.width = gpu + "%";

    document.getElementById("vramText").innerText = vramText;
    document.getElementById("vramBar").style.width = vramPercent + "%";
  });
}

setInterval(update, 1000);

const fs = require("fs");

function getBattery() {
  try {
    const capacity = fs.readFileSync("/sys/class/power_supply/BAT0/capacity", "utf8").trim();
    const status = fs.readFileSync("/sys/class/power_supply/BAT0/status", "utf8").trim();

    return {
      percent: capacity,
      status: status
    };
  } catch {
    return {
      percent: "--",
      status: "N/A"
    };
  }
}
const batteryFill = document.getElementById("batteryBar");

if (battery.percent < 20) {
  batteryFill.style.background = "linear-gradient(90deg, #ff4e50, #ff0000)";
} else if (battery.percent < 50) {
  batteryFill.style.background = "linear-gradient(90deg, #f7971e, #ffd200)";
} else {
  batteryFill.style.background = "linear-gradient(90deg, #00ff87, #60efff)";
}