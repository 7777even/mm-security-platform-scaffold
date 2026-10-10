// 释放 dev 占用端口，避免 stale 进程导致 dev:all 端口漂移 / 根代理打到旧实例 404。
//
// 根因：根 vite 把 /apps/mobile 写死代理到 5180；若 5180（或 root 的 5173）被上一轮
// 没关干净的 dev server 占着，新进程要么静默漂到 5181（旧逻辑），要么 strictPort 直接
// 报错（新逻辑）。两者都让根代理指向错误的实例 → 移动端 404。
// 本脚本在 dev:all / dev:mobile 启动前先把这些端口占用的进程杀掉，实现"自愈"。
//
// 用法： node scripts/free-dev-ports.mjs [port...]   不传则默认释放 5173 5180
import { execSync } from 'node:child_process';
import process from 'node:process';

const isWin = process.platform === 'win32';
const ports = process.argv.slice(2).map(Number).filter((n) => Number.isInteger(n));
const targets = ports.length ? ports : [5173, 5180];

function findPids(port) {
  try {
    if (isWin) {
      const text = execSync('netstat -ano', { encoding: 'buffer' }).toString('gbk');
      const pids = new Set();
      for (const line of text.split(/\r?\n/)) {
        // 形如： TCP    0.0.0.0:5173   0.0.0.0:0   LISTENING   27400
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5 && parts[3] === 'LISTENING') {
          const local = parts[1]; // 0.0.0.0:5173 / [::]:5173 / 127.0.0.1:5180
          const p = Number(local.split(':').pop());
          if (p === port) pids.add(Number(parts[4]));
        }
      }
      return [...pids];
    }
    const out = execSync(`lsof -ti tcp:${port}`, { encoding: 'utf8' });
    return out.split(/\s+/).map(Number).filter(Boolean);
  } catch {
    return [];
  }
}

function kill(pid) {
  try {
    if (isWin) {
      execSync(`taskkill /PID ${pid} /F /T`, { stdio: 'ignore' });
    } else {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
    }
    return true;
  } catch {
    return false;
  }
}

let killed = 0;
for (const port of targets) {
  const pids = findPids(port);
  if (!pids.length) {
    console.log(`[free-dev-ports] 端口 ${port} 未被占用，跳过`);
    continue;
  }
  for (const pid of pids) {
    if (kill(pid)) {
      console.log(`[free-dev-ports] 已释放端口 ${port} (PID ${pid})`);
      killed++;
    } else {
      console.warn(`[free-dev-ports] 释放端口 ${port} (PID ${pid}) 失败，可能权限不足`);
    }
  }
}
console.log(`[free-dev-ports] 完成，共释放 ${killed} 个进程`);
