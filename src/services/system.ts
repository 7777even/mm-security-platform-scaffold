import { request } from '@/services/http';

// 系统管理域（契约 docs/api/system.openapi.json）：用户 / 角色 / 菜单权限 / 字典。
// 全部端点要求 ADMIN 角色（后端 @RequireAuth(role="ADMIN")），唯一例外是 fetchDictOptions（登录即可读）。
// 后端硬防护：禁操作自己、保护最后一个启用 ADMIN（409）、内置对象禁删（403）、被引用禁删（409）。

/** 分页包络（与 src/types/index.ts PageResult 同构） */
export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  size: number;
}

/** 系统用户列表项 / 详情（不含口令哈希） */
export interface SystemUserItem {
  id: number;
  username: string;
  realName?: string | null;
  roleCode: string;
  roleName?: string | null;
  status: number;
  zoneCodes?: string | null;
  mustChangePwd?: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
}

/** 新增用户入参 */
export interface SystemUserCreate {
  username: string;
  password: string;
  realName?: string;
  roleCode: string;
  status?: number;
  zoneCodes?: string;
}

/** 修改用户 / 分配角色入参 */
export interface SystemUserUpdate {
  realName?: string;
  roleCode?: string;
  status?: number;
  zoneCodes?: string;
}

/** 防区下拉项（GET /system/zones 出参） */
export interface ZoneItem {
  id: number;
  zoneCode: string;
  zoneName: string;
  sortOrder?: number;
  status: number;
}

/** 重置口令结果（临时口令仅此一次可见） */
export interface PasswordResetResult {
  temporaryPassword: string;
  mustChangePwd: boolean;
}

/** 角色列表项 / 详情 */
export interface SystemRoleItem {
  id: number;
  roleCode: string;
  roleName: string;
  description?: string | null;
  dataScope?: string | null;
  status: number;
  builtIn: boolean;
  sortOrder?: number | null;
  userCount?: number | null;
  createdAt?: string | null;
}

/** 新增 / 修改角色入参 */
export interface SystemRoleSaveRequest {
  roleCode: string;
  roleName: string;
  description?: string;
  dataScope?: string;
  status?: number;
  sortOrder?: number;
}

/** 菜单 / 权限节点（children 递归） */
export interface SystemMenuNode {
  id: number;
  parentId?: number | null;
  name: string;
  code?: string | null;
  path?: string | null;
  icon?: string | null;
  sortOrder?: number | null;
  menuType?: string | null;
  permCode?: string | null;
  visible?: number | null;
  status?: number | null;
  children?: SystemMenuNode[] | null;
}

/** 新增 / 修改菜单权限节点入参 */
export interface SystemMenuSaveRequest {
  parentId?: number;
  name: string;
  code: string;
  path?: string;
  icon?: string;
  sortOrder?: number;
  menuType: string;
  permCode?: string;
  visible?: number;
  status?: number;
}

/** 权限码字典项 */
export interface PermissionCodeItem {
  permCode: string;
  name?: string | null;
  menuId?: number | null;
}

/** 字典类型 */
export interface DictTypeItem {
  id: number;
  dictCode: string;
  dictName: string;
  description?: string | null;
  status: number;
  builtIn: boolean;
  createdAt?: string | null;
}

/** 新增 / 修改字典类型入参 */
export interface DictTypeSaveRequest {
  dictCode: string;
  dictName: string;
  description?: string;
  status?: number;
}

/** 字典项 */
export interface DictItemItem {
  id: number;
  dictCode?: string | null;
  itemValue?: string | null;
  itemLabel?: string | null;
  sortOrder?: number | null;
  status?: number | null;
  description?: string | null;
}

/** 新增 / 修改字典项入参 */
export interface DictItemSaveRequest {
  dictCode: string;
  itemValue: string;
  itemLabel: string;
  sortOrder?: number;
  status?: number;
  description?: string;
}

// ---------------------------------------------------------------- 用户

export interface SystemUserQuery {
  page?: number;
  size?: number;
  keyword?: string;
  status?: number;
  roleCode?: string;
}

/** 用户分页查询 */
export function fetchSystemUsers(query: SystemUserQuery = {}): Promise<PageResult<SystemUserItem>> {
  return request<PageResult<SystemUserItem>>({
    url: '/system/users',
    method: 'GET',
    params: query,
  });
}

/** 用户详情 */
export function fetchSystemUser(id: number): Promise<SystemUserItem> {
  return request<SystemUserItem>({
    url: `/system/users/${encodeURIComponent(String(id))}`,
    method: 'GET',
  });
}

/** 新增用户 */
export function createSystemUser(body: SystemUserCreate): Promise<SystemUserItem> {
  return request<SystemUserItem>({ url: '/system/users', method: 'POST', data: body });
}

/** 修改用户 */
export function updateSystemUser(id: number, body: SystemUserUpdate): Promise<SystemUserItem> {
  return request<SystemUserItem>({
    url: `/system/users/${encodeURIComponent(String(id))}`,
    method: 'PUT',
    data: body,
  });
}

/** 删除用户 */
export function deleteSystemUser(id: number): Promise<boolean> {
  return request<{ ok: boolean }>({
    url: `/system/users/${encodeURIComponent(String(id))}`,
    method: 'DELETE',
  }).then((r) => Boolean(r?.ok));
}

/** 启用 / 停用用户 */
export function updateSystemUserStatus(id: number, status: number): Promise<SystemUserItem> {
  return request<SystemUserItem>({
    url: `/system/users/${encodeURIComponent(String(id))}/status`,
    method: 'PUT',
    params: { status },
  });
}

/** 分配角色 */
export function assignSystemUserRole(id: number, roleCode: string): Promise<SystemUserItem> {
  return request<SystemUserItem>({
    url: `/system/users/${encodeURIComponent(String(id))}/role`,
    method: 'PUT',
    data: { roleCode },
  });
}

/** 重置口令（返回一次性临时口令） */
export function resetSystemUserPassword(id: number): Promise<PasswordResetResult> {
  return request<PasswordResetResult>({
    url: `/system/users/${encodeURIComponent(String(id))}/password/reset`,
    method: 'POST',
  });
}

// ---------------------------------------------------------------- 角色

/** 角色列表 */
export function fetchSystemRoles(keyword?: string): Promise<SystemRoleItem[]> {
  return request<SystemRoleItem[]>({
    url: '/system/roles',
    method: 'GET',
    params: keyword ? { keyword } : undefined,
  });
}

/** 角色详情 */
export function fetchSystemRole(id: number): Promise<SystemRoleItem> {
  return request<SystemRoleItem>({
    url: `/system/roles/${encodeURIComponent(String(id))}`,
    method: 'GET',
  });
}

/** 新增角色 */
export function createSystemRole(body: SystemRoleSaveRequest): Promise<SystemRoleItem> {
  return request<SystemRoleItem>({ url: '/system/roles', method: 'POST', data: body });
}

/** 修改角色 */
export function updateSystemRole(id: number, body: SystemRoleSaveRequest): Promise<SystemRoleItem> {
  return request<SystemRoleItem>({
    url: `/system/roles/${encodeURIComponent(String(id))}`,
    method: 'PUT',
    data: body,
  });
}

/** 删除角色 */
export function deleteSystemRole(id: number): Promise<boolean> {
  return request<{ ok: boolean }>({
    url: `/system/roles/${encodeURIComponent(String(id))}`,
    method: 'DELETE',
  }).then((r) => Boolean(r?.ok));
}

/** 启用 / 停用角色 */
export function updateSystemRoleStatus(id: number, status: number): Promise<SystemRoleItem> {
  return request<SystemRoleItem>({
    url: `/system/roles/${encodeURIComponent(String(id))}/status`,
    method: 'PUT',
    params: { status },
  });
}

/** 角色已授权的菜单/权限节点 id 集合 */
export function fetchSystemRoleMenus(id: number): Promise<number[]> {
  return request<number[]>({
    url: `/system/roles/${encodeURIComponent(String(id))}/menus`,
    method: 'GET',
  });
}

/** 保存角色授权（整表覆盖） */
export function assignSystemRoleMenus(id: number, menuIds: number[]): Promise<number[]> {
  return request<number[]>({
    url: `/system/roles/${encodeURIComponent(String(id))}/menus`,
    method: 'PUT',
    data: { menuIds },
  });
}

// ---------------------------------------------------------------- 菜单 / 权限

/** 菜单权限树 */
export function fetchSystemMenus(): Promise<SystemMenuNode[]> {
  return request<SystemMenuNode[]>({ url: '/system/menus', method: 'GET' });
}

/** 新增菜单/权限节点 */
export function createSystemMenu(body: SystemMenuSaveRequest): Promise<SystemMenuNode> {
  return request<SystemMenuNode>({ url: '/system/menus', method: 'POST', data: body });
}

/** 修改菜单/权限节点 */
export function updateSystemMenu(id: number, body: SystemMenuSaveRequest): Promise<SystemMenuNode> {
  return request<SystemMenuNode>({
    url: `/system/menus/${encodeURIComponent(String(id))}`,
    method: 'PUT',
    data: body,
  });
}

/** 删除菜单/权限节点 */
export function deleteSystemMenu(id: number): Promise<boolean> {
  return request<{ ok: boolean }>({
    url: `/system/menus/${encodeURIComponent(String(id))}`,
    method: 'DELETE',
  }).then((r) => Boolean(r?.ok));
}

/** 权限码字典 */
export function fetchPermissionCodes(): Promise<PermissionCodeItem[]> {
  return request<PermissionCodeItem[]>({ url: '/system/permissions', method: 'GET' });
}

// ---------------------------------------------------------------- 字典

/** 字典类型分页 */
export function fetchDictTypes(
  query: { page?: number; size?: number; keyword?: string } = {},
): Promise<PageResult<DictTypeItem>> {
  return request<PageResult<DictTypeItem>>({
    url: '/system/dict-types',
    method: 'GET',
    params: query,
  });
}

/** 新增字典类型 */
export function createDictType(body: DictTypeSaveRequest): Promise<DictTypeItem> {
  return request<DictTypeItem>({ url: '/system/dict-types', method: 'POST', data: body });
}

/** 修改字典类型 */
export function updateDictType(id: number, body: DictTypeSaveRequest): Promise<DictTypeItem> {
  return request<DictTypeItem>({
    url: `/system/dict-types/${encodeURIComponent(String(id))}`,
    method: 'PUT',
    data: body,
  });
}

/** 删除字典类型 */
export function deleteDictType(id: number): Promise<boolean> {
  return request<{ ok: boolean }>({
    url: `/system/dict-types/${encodeURIComponent(String(id))}`,
    method: 'DELETE',
  }).then((r) => Boolean(r?.ok));
}

/** 字典项分页 */
export function fetchDictItems(
  dictCode: string,
  query: { page?: number; size?: number } = {},
): Promise<PageResult<DictItemItem>> {
  return request<PageResult<DictItemItem>>({
    url: '/system/dict-items',
    method: 'GET',
    params: { dictCode, ...query },
  });
}

/** 新增字典项 */
export function createDictItem(body: DictItemSaveRequest): Promise<DictItemItem> {
  return request<DictItemItem>({ url: '/system/dict-items', method: 'POST', data: body });
}

/** 修改字典项 */
export function updateDictItem(id: number, body: DictItemSaveRequest): Promise<DictItemItem> {
  return request<DictItemItem>({
    url: `/system/dict-items/${encodeURIComponent(String(id))}`,
    method: 'PUT',
    data: body,
  });
}

/** 删除字典项 */
export function deleteDictItem(id: number): Promise<boolean> {
  return request<{ ok: boolean }>({
    url: `/system/dict-items/${encodeURIComponent(String(id))}`,
    method: 'DELETE',
  }).then((r) => Boolean(r?.ok));
}

/** 业务读取：按字典标识取启用项（登录即可，供业务下拉） */
export function fetchDictOptions(dictCode: string): Promise<DictItemItem[]> {
  return request<DictItemItem[]>({
    url: `/system/dicts/${encodeURIComponent(dictCode)}`,
    method: 'GET',
  });
}

/** 防区下拉（登录即可读，供用户表单「可访问防区」多选） */
export function fetchSystemZones(): Promise<ZoneItem[]> {
  return request<ZoneItem[]>({ url: '/system/zones', method: 'GET' });
}
