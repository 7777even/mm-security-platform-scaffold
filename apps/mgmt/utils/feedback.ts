import { ElMessage, ElMessageBox } from 'element-plus';
import 'element-plus/es/components/message/style/css';
import 'element-plus/es/components/message-box/style/css';
import { ApiError } from '@/services/http';

// 后台管理端统一反馈（避免各视图重复引 element-plus 全局 API 与样式）。
// mgmt 未启用 unplugin-auto-import，故显式引入 ElMessage / ElMessageBox 及其样式。

/** 从任意异常中提取可展示文案（优先后端 B3 message）。 */
export function errText(err: unknown): string {
  if (err instanceof ApiError) return err.message || `请求失败（code=${err.code}）`;
  if (err instanceof Error) return err.message;
  return String(err ?? '请求失败');
}

/** 成功轻提示 */
export function toastOk(message: string): void {
  ElMessage.success(message);
}

/** 失败轻提示 */
export function toastErr(err: unknown, prefix = ''): void {
  ElMessage.error(`${prefix}${errText(err)}`);
}

/** 二次确认（用户取消返回 false，不抛异常）。 */
export async function confirm(message: string, title = '操作确认'): Promise<boolean> {
  try {
    await ElMessageBox.confirm(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    return true;
  } catch {
    return false;
  }
}
