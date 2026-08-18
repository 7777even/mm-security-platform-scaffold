/**
 * 构建产物体积分析（B4 性能基线实测的可复现入口）
 * 用法：npm run build 后执行 `node scripts/analyze-dist.mjs [dist目录]`
 * 输出：产物体积清单（原始/gzip/占比）+ 入口chunk + 超限预警（对齐 D1 首屏预算）
 */
import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import { gzipSync } from 'node:zlib'

const distDir = process.argv[2] || 'dist'
const LIMIT_WARN_KB = 500 // 与 vite build.chunkSizeWarningLimit 对齐

function collect(dir, base = distDir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) {
      out.push(...collect(p, base))
    } else if (extname(name) === '.js' || extname(name) === '.css') {
      const raw = readFileSync(p)
      const gz = gzipSync(raw, { level: 9 }).length
      out.push({
        name: p.slice(base.length + 1).replace(/\\/g, '/'),
        sizeBytes: st.size,
        sizeKb: +(st.size / 1024).toFixed(2),
        gzipKb: +(gz / 1024).toFixed(2),
      })
    }
  }
  return out
}

function main() {
  const files = collect(distDir).sort((a, b) => b.sizeKb - a.sizeKb)
  const totalRaw = files.reduce((s, f) => s + f.sizeBytes, 0)
  const totalGz = files.reduce((s, f) => s + f.gzipKb * 1024, 0)

  // 入口 chunk = 不含路由懒加载 chunk 的普通 index（粗略按 index-*.js 主入口）
  const entry = files.find((f) => /^index-.*\.js$/.test(basename(f.name)) && f.name.includes('assets'))
  // 直接进入首屏的 css 主文件
  const entryCss = files.find((f) => /^index-.*\.css$/.test(basename(f.name)) && f.name.includes('assets'))

  const lines = []
  lines.push(`# 构建产物体积基线（${new Date().toISOString().slice(0, 19)}）`)
  lines.push('')
  lines.push(`- 产物文件数：${files.length}`)
  lines.push(`- 原始体积合计：${(totalRaw / 1024).toFixed(2)} KB`)
  lines.push(`- gzip 体积合计：${(totalGz / 1024).toFixed(2)} KB`)
  lines.push('')
  lines.push('## 首屏入口（进入平台场景）')
  lines.push('')
  if (entry) lines.push(`- 入口 JS：${entry.name}（${entry.sizeKb} KB / gzip ${entry.gzipKb} KB）`)
  if (entryCss) lines.push(`- 入口 CSS：${entryCss.name}（${entryCss.sizeKb} KB / gzip ${entryCss.gzipKb} KB）`)
  const entryTotal = (entry?.sizeKb ?? 0) + (entryCss?.sizeKb ?? 0)
  lines.push(`- 首屏关键资源合计：${entryTotal.toFixed(2)} KB（gzip ${((entry?.gzipKb ?? 0) + (entryCss?.gzipKb ?? 0)).toFixed(2)} KB）`)
  lines.push('')
  lines.push('## 体积 Top10')
  lines.push('')
  lines.push('| 文件 | 原始(KB) | gzip(KB) | 占比 |')
  lines.push('|---|---|---|---|')
  for (const f of files.slice(0, 10)) {
    lines.push(`| ${f.name} | ${f.sizeKb} | ${f.gzipKb} | ${((f.sizeBytes / totalRaw) * 100).toFixed(1)}% |`)
  }
  lines.push('')
  lines.push(`## 超限预警（>${LIMIT_WARN_KB} KB）`)
  lines.push('')
  const over = files.filter((f) => f.sizeKb > LIMIT_WARN_KB)
  if (over.length === 0) {
    lines.push('无。')
  } else {
    for (const f of over) {
      lines.push(`- ${f.name}：${f.sizeKb} KB（gzip ${f.gzipKb} KB）`)
    }
  }
  lines.push('')
  lines.push('> 数据来源：`node scripts/analyze-dist.mjs`（可复现）；首屏体积仅为网络层/渲染层输入，实际耗时需浏览器实测。')
  lines.push('')
  process.stdout.write(lines.join('\n'))
}

main()
