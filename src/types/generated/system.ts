export interface paths {
  '/system/users': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 用户分页查询
     * @description 分页查询系统用户。keyword 同时模糊匹配用户名与真实姓名；status / roleCode 为精确过滤。返回项不含口令哈希。
     */
    get: operations['listSystemUsers'];
    put?: never;
    /**
     * 新增用户
     * @description 新增系统用户。用户名唯一（冲突 409）；角色须为已启用角色（否则 100）；初始口令须通过复杂度策略。新用户置 mustChangePwd=true，首次登录强制改密。
     */
    post: operations['createSystemUser'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/users/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 用户详情
     * @description 按 id 查询用户详情；不存在返回 404。
     */
    get: operations['getSystemUser'];
    /**
     * 修改用户
     * @description 修改用户姓名 / 角色 / 状态。改角色或停用时执行硬防护：不可修改自己的角色（403）、不可停用自己（403）、不可使启用 ADMIN 归零（409）。
     */
    put: operations['updateSystemUser'];
    post?: never;
    /**
     * 删除用户
     * @description 逻辑删除用户（deleted=1）。禁删自己（403）、禁删最后一个启用 ADMIN（409）。
     */
    delete: operations['deleteSystemUser'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/users/{id}/status': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 启用 / 停用用户
     * @description status=1 启用、0 停用。停用执行硬防护：不可停用自己（403）、不可使启用 ADMIN 归零（409）。
     */
    put: operations['updateSystemUserStatus'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/users/{id}/role': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 分配用户角色
     * @description 单独调整用户角色（请求体只需 roleCode）。硬防护同修改用户：不可改自己角色（403）、不可使启用 ADMIN 归零（409）。
     */
    put: operations['assignSystemUserRole'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/users/{id}/password/reset': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * 重置用户口令
     * @description 由服务端生成随机临时口令（12 位、含多类字符，非固定值），置 mustChangePwd=true 并返回一次性临时口令。响应与审计均不含口令哈希。
     */
    post: operations['resetSystemUserPassword'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/roles': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 角色列表
     * @description 全部角色（按 sortOrder、id 排序），含各角色用户数（userCount），供角色管理列表与用户表单下拉共用。
     */
    get: operations['listSystemRoles'];
    put?: never;
    /**
     * 新增角色
     * @description 新增角色。roleCode 唯一（冲突 409，保存时统一大写）；dataScope 仅接受 ALL/DEPT/SELF（否则 100）。
     */
    post: operations['createSystemRole'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/roles/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 角色详情
     * @description 按 id 查询角色；不存在返回 404。
     */
    get: operations['getSystemRole'];
    /**
     * 修改角色
     * @description 修改角色。内置角色禁改 roleCode、禁停用（403）；roleCode 冲突返回 409。
     */
    put: operations['updateSystemRole'];
    post?: never;
    /**
     * 删除角色
     * @description 逻辑删除角色。内置角色禁删（403）；仍被用户引用时禁删（409）。同时清除该角色的菜单授权。
     */
    delete: operations['deleteSystemRole'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/roles/{id}/status': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 启用 / 停用角色
     * @description status=1 启用、0 停用。内置角色禁停用（403）。停用角色等价于回收该角色全部权限。
     */
    put: operations['updateSystemRoleStatus'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/roles/{id}/menus': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 查询角色已授权节点
     * @description 返回该角色已授权的菜单/权限节点 id 集合，供授权树回显。
     */
    get: operations['getSystemRoleMenus'];
    /**
     * 保存角色授权
     * @description 整体覆盖该角色的菜单/权限授权（空数组表示回收全部授权）。ADMIN 角色不可清空（409）。保存后权限解析缓存即时失效，授权立即生效。
     */
    put: operations['assignSystemRoleMenus'];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/menus': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 菜单权限树
     * @description 返回全量菜单/权限节点树（含 DIR/MENU/BUTTON 与停用节点），用于菜单维护与角色授权树。
     */
    get: operations['listSystemMenus'];
    put?: never;
    /**
     * 新增菜单/权限节点
     * @description 新增节点。code 唯一（冲突 409）；menuType 仅接受 DIR/MENU/BUTTON（否则 100）。BUTTON 节点不参与导航，仅贡献权限码。
     */
    post: operations['createSystemMenu'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/menus/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 修改菜单/权限节点
     * @description 修改节点。code 冲突返回 409；父节点不能是自己（100）。
     */
    put: operations['updateSystemMenu'];
    post?: never;
    /**
     * 删除菜单/权限节点
     * @description 删除节点。存在子节点（409）或已被角色授权（409）时拒绝，须先解绑 / 先删子节点。
     */
    delete: operations['deleteSystemMenu'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/permissions': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 权限码字典
     * @description 聚合所有 perm_code 非空的菜单/权限节点（去重、按权限码排序），供角色授权界面展示与前后端权限码核对。
     */
    get: operations['listSystemPermissions'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/dict-types': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 字典类型分页
     * @description 分页查询字典类型；keyword 模糊匹配字典标识与名称。
     */
    get: operations['listDictTypes'];
    put?: never;
    /**
     * 新增字典类型
     * @description 新增字典类型。dictCode 唯一（冲突 409，保存时归一为小写）。
     */
    post: operations['createDictType'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/dict-types/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 修改字典类型
     * @description 修改字典类型。内置字典禁改标识（403）；标识变更时同步迁移其字典项，避免孤儿项。
     */
    put: operations['updateDictType'];
    post?: never;
    /**
     * 删除字典类型
     * @description 删除字典类型。内置字典禁删（403）；仍有字典项时禁删（409）。
     */
    delete: operations['deleteDictType'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/dict-items': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 字典项分页
     * @description 分页查询指定字典下的字典项（含停用项）。dictCode 必填，缺失返回 100。
     */
    get: operations['listDictItems'];
    put?: never;
    /**
     * 新增字典项
     * @description 新增字典项。所属字典类型须已存在（否则 100）。
     */
    post: operations['createDictItem'];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/dict-items/{id}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * 修改字典项
     * @description 修改字典项；所属字典类型须已存在。
     */
    put: operations['updateDictItem'];
    post?: never;
    /**
     * 删除字典项
     * @description 逻辑删除字典项。
     */
    delete: operations['deleteDictItem'];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/dicts/{dictCode}': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 业务读取字典项
     * @description 按字典标识读取**启用**字典项（按 sortOrder 排序），供各业务下拉。任何已登录用户可访问（不要求 ADMIN），结果走服务端缓存。
     */
    get: operations['getDictOptions'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  '/system/zones': {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * 防区下拉列表
     * @description 返回启用且未删除的防区主数据（data_scope 行级 ABAC 维度源），供系统管理用户表单「可访问防区」多选。登录即可读（后端 @RequireAuth 仅要求登录，无 ADMIN 限制）。
     */
    get: operations['listSystemZones'];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @description B3 统一响应包络：code=0 成功，非 0 抛业务错误（src/services/http.ts unwrapBody）。各接口用 allOf 覆盖 data 的具体结构。 */
    ApiResponse: {
      /**
       * @description 业务状态码；0 表示成功
       * @example 0
       */
      code: number;
      /**
       * @description 提示文案（后端按 Accept-Language 翻译）
       * @example ok
       */
      message: string;
      /** @description 业务数据负载；结构随接口而定（见各接口 data 覆盖） */
      data: unknown;
      /**
       * @description 链路追踪 ID（可选）
       * @example a1b2c3d4
       */
      traceId?: string;
    };
    /** @description B3 统一分页包络（嵌于 data）。 */
    PageResult: {
      /** @description 当前页数据 */
      list: Record<string, never>[];
      /** @description 总条数 */
      total: number;
      /** @description 当前页 */
      page: number;
      /** @description 每页条数 */
      size: number;
    };
    /** @description 业务错误包络（code != 0）。 */
    ErrorEnvelope: {
      /** @example 40001 */
      code: number;
      /** @example 参数校验失败 */
      message: string;
      /** @description 错误上下文（可选） */
      data?: unknown;
      /** @example a1b2c3d4 */
      traceId?: string;
    };
    /** @description 删除结果（与后端 dto/DeleteResult 同名对齐）。 */
    DeleteResult: {
      /**
       * @description 删除是否成功（逻辑删除命中行数 > 0 为 true）
       * @example true
       */
      ok: boolean;
    };
    /** @description 系统用户列表项 / 详情。不含口令哈希；realName 在 ADMIN 端点明文返回（用户管理需可辨识）。 */
    SystemUserItem: {
      /**
       * @description 用户 id
       * @example 2
       */
      id: number;
      /**
       * @description 登录用户名
       * @example zhang.san
       */
      username: string;
      /**
       * @description 真实姓名
       * @example 张三
       */
      realName?: string;
      /**
       * @description 角色标识（引用 sys_role.role_code）
       * @example OUTER_OPER
       */
      roleCode: string;
      /**
       * @description 角色中文名
       * @example 外操
       */
      roleName?: string;
      /**
       * @description 状态：1 启用 / 0 停用
       * @example 1
       */
      status: number;
      /**
       * @description 可访问防区（逗号串，如「炼油区,罐区」；空=未分派，data_scope≠ALL 时看不到任何行）
       * @example 炼油区,罐区
       */
      zoneCodes?: string | null;
      /**
       * @description 是否需强制修改口令
       * @example false
       */
      mustChangePwd?: boolean;
      /**
       * @description 创建时间
       * @example 2026-09-10 12:30:00
       */
      createdAt?: string | null;
      /**
       * @description 更新时间
       * @example 2026-09-10 12:40:00
       */
      updatedAt?: string | null;
    };
    /** @description 新增用户入参。 */
    SystemUserCreate: {
      /**
       * @description 登录用户名（唯一）
       * @example zhang.san
       */
      username: string;
      /**
       * @description 初始口令（按复杂度策略校验后 BCrypt 存储）
       * @example Init@12345
       */
      password: string;
      /**
       * @description 真实姓名
       * @example 张三
       */
      realName?: string;
      /**
       * @description 角色标识（须为已启用角色）
       * @example OUTER_OPER
       */
      roleCode: string;
      /**
       * @description 状态：1 启用 / 0 停用，缺省 1
       * @example 1
       */
      status?: number;
      /**
       * @description 可访问防区（逗号串，如「炼油区,罐区」；空=未分派，data_scope≠ALL 时看不到任何行）
       * @example 炼油区,罐区
       */
      zoneCodes?: string | null;
    };
    /** @description 修改用户 / 分配角色入参（分配角色时只需 roleCode）。 */
    SystemUserUpdate: {
      /**
       * @description 真实姓名
       * @example 张三
       */
      realName?: string;
      /**
       * @description 角色标识（须为已启用角色）
       * @example SCHEDULER
       */
      roleCode?: string;
      /**
       * @description 状态：1 启用 / 0 停用
       * @example 1
       */
      status?: number;
      /**
       * @description 可访问防区（逗号串；空=未分派，data_scope≠ALL 时看不到任何行）
       * @example 炼油区,罐区
       */
      zoneCodes?: string | null;
    };
    /** @description 防区下拉项（GET /system/zones 出参，data_scope 行级 ABAC 维度主数据）。 */
    ZoneItem: {
      /**
       * @description 防区 id
       * @example 1
       */
      id: number;
      /**
       * @description 防区编码
       * @example LIANYOU
       */
      zoneCode: string;
      /**
       * @description 防区名称（严格对齐业务表 area 取值，如 fac_brigade_team.area）
       * @example 炼油区
       */
      zoneName: string;
      /**
       * @description 排序
       * @example 1
       */
      sortOrder?: number;
      /**
       * @description 状态：1 启用 / 0 停用
       * @example 1
       */
      status: number;
    };
    /** @description 用户分页结果（与前端 PageResult 同构）。 */
    SystemUserPageResult: {
      /** @description 当前页数据 */
      list: components['schemas']['SystemUserItem'][];
      /**
       * @description 总记录数
       * @example 12
       */
      total: number;
      /**
       * @description 当前页码（1-based）
       * @example 1
       */
      page: number;
      /**
       * @description 每页大小
       * @example 10
       */
      size: number;
    };
    /** @description 管理员重置口令结果。临时口令仅此一次可见。 */
    PasswordResetResult: {
      /**
       * @description 服务端随机生成的临时口令（非固定值）
       * @example Ab3!xyZ9Qw2t
       */
      temporaryPassword: string;
      /**
       * @description 是否需强制修改口令（重置后恒为 true）
       * @example true
       */
      mustChangePwd: boolean;
    };
    /** @description 角色列表项 / 详情。 */
    SystemRoleItem: {
      /**
       * @description 角色 id
       * @example 7
       */
      id: number;
      /**
       * @description 角色标识（唯一）
       * @example SCHEDULER
       */
      roleCode: string;
      /**
       * @description 角色中文名
       * @example 值班调度
       */
      roleName: string;
      /**
       * @description 角色说明
       * @example 值班调度岗
       */
      description?: string | null;
      /**
       * @description 数据范围（ALL/DEPT/SELF，本期仅登记不参与过滤）
       * @example DEPT
       */
      dataScope?: string | null;
      /**
       * @description 状态：1 启用 / 0 停用
       * @example 1
       */
      status: number;
      /**
       * @description 是否内置角色（内置禁删、禁改标识、禁停用）
       * @example false
       */
      builtIn: boolean;
      /**
       * @description 排序值
       * @example 20
       */
      sortOrder?: number;
      /**
       * @description 该角色下的用户数
       * @example 2
       */
      userCount?: number;
      /**
       * @description 创建时间
       * @example 2026-09-10 12:20:00
       */
      createdAt?: string | null;
    };
    /** @description 新增 / 修改角色入参。 */
    SystemRoleSaveRequest: {
      /**
       * @description 角色标识（唯一，保存时统一大写；内置角色禁改）
       * @example SCHEDULER
       */
      roleCode: string;
      /**
       * @description 角色中文名
       * @example 值班调度
       */
      roleName: string;
      /**
       * @description 角色说明
       * @example 值班调度岗
       */
      description?: string;
      /**
       * @description 数据范围：ALL / DEPT / SELF（缺省 SELF）
       * @example DEPT
       */
      dataScope?: string;
      /**
       * @description 状态：1 启用 / 0 停用，缺省 1
       * @example 1
       */
      status?: number;
      /**
       * @description 排序值，缺省 0
       * @example 20
       */
      sortOrder?: number;
    };
    /** @description 角色菜单授权入参（整表覆盖语义）。 */
    SystemRoleMenuAssign: {
      /**
       * @description 授权菜单/权限节点 id 集合（全量覆盖；空数组表示回收该角色全部授权）
       * @example [
       *       1,
       *       2,
       *       3,
       *       6,
       *       10,
       *       11
       *     ]
       */
      menuIds: number[];
    };
    /** @description 菜单 / 权限节点（children 递归）。menuType=BUTTON 的节点不参与导航，仅贡献 permCode。 */
    SystemMenuNode: {
      /**
       * @description 节点 id
       * @example 7
       */
      id: number;
      /**
       * @description 父节点 id（0 为顶层）
       * @example 6
       */
      parentId?: number | null;
      /**
       * @description 菜单名称
       * @example 用户管理
       */
      name: string;
      /**
       * @description 节点编码（fm-* 与前端路由 key 对齐）
       * @example system-user
       */
      code?: string | null;
      /**
       * @description 前端路由路径
       * @example /system/users
       */
      path?: string | null;
      /**
       * @description 图标标识
       * @example Setting
       */
      icon?: string | null;
      /**
       * @description 排序值
       * @example 901
       */
      sortOrder?: number | null;
      /**
       * @description 节点类型：DIR 目录 / MENU 菜单 / BUTTON 按钮
       * @example MENU
       */
      menuType: string | null;
      /**
       * @description 权限标识（如 system:user:view），DIR 可为空
       * @example system:user:view
       */
      permCode?: string | null;
      /**
       * @description 是否显示：1 显示 / 0 隐藏
       * @example 1
       */
      visible?: number | null;
      /**
       * @description 状态：1 启用 / 0 停用
       * @example 1
       */
      status?: number | null;
      /** @description 子节点 */
      children?: components['schemas']['SystemMenuNode'][] | null;
    };
    /** @description 新增 / 修改菜单权限节点入参。 */
    SystemMenuSaveRequest: {
      /**
       * @description 父节点 id（0 为顶层）
       * @example 7
       */
      parentId?: number;
      /**
       * @description 菜单名称
       * @example 导出用户
       */
      name: string;
      /**
       * @description 节点编码（唯一）
       * @example system-user-export
       */
      code: string;
      /**
       * @description 前端路由路径
       * @example /system/users
       */
      path?: string;
      /**
       * @description 图标标识
       * @example Setting
       */
      icon?: string;
      /**
       * @description 排序值，缺省 0
       * @example 9106
       */
      sortOrder?: number;
      /**
       * @description 节点类型：DIR / MENU / BUTTON
       * @example BUTTON
       */
      menuType: string;
      /**
       * @description 权限标识（如 system:user:export）
       * @example system:user:export
       */
      permCode?: string;
      /**
       * @description 是否显示：1 显示 / 0 隐藏，缺省 1
       * @example 0
       */
      visible?: number;
      /**
       * @description 状态：1 启用 / 0 停用，缺省 1
       * @example 1
       */
      status?: number;
    };
    /** @description 权限码字典项（由 perm_code 非空的菜单节点聚合）。 */
    PermissionCodeItem: {
      /**
       * @description 权限码（如 system:user:create）
       * @example system:user:create
       */
      permCode: string;
      /**
       * @description 权限中文名（取节点名称）
       * @example 新增用户
       */
      name?: string | null;
      /**
       * @description 所属节点 id
       * @example 12
       */
      menuId?: number | null;
    };
    /** @description 字典类型列表项 / 详情。 */
    DictTypeItem: {
      /**
       * @description 字典类型 id
       * @example 1
       */
      id: number;
      /**
       * @description 字典标识（唯一）
       * @example alarm_level
       */
      dictCode: string;
      /**
       * @description 字典名称
       * @example 报警等级
       */
      dictName: string;
      /**
       * @description 说明
       * @example 报警分级字典
       */
      description?: string | null;
      /**
       * @description 状态：1 启用 / 0 停用
       * @example 1
       */
      status: number;
      /**
       * @description 是否内置字典（内置禁删）
       * @example false
       */
      builtIn: boolean;
      /**
       * @description 创建时间
       * @example 2026-09-10 13:00:00
       */
      createdAt?: string | null;
    };
    /** @description 新增 / 修改字典类型入参。 */
    DictTypeSaveRequest: {
      /**
       * @description 字典标识（唯一，保存时归一为小写）
       * @example alarm_level
       */
      dictCode: string;
      /**
       * @description 字典名称
       * @example 报警等级
       */
      dictName: string;
      /**
       * @description 说明
       * @example 报警分级字典
       */
      description?: string;
      /**
       * @description 状态：1 启用 / 0 停用，缺省 1
       * @example 1
       */
      status?: number;
    };
    /** @description 字典类型分页结果（与前端 PageResult 同构）。 */
    DictTypePageResult: {
      /** @description 当前页数据 */
      list: components['schemas']['DictTypeItem'][];
      /**
       * @description 总记录数
       * @example 1
       */
      total: number;
      /**
       * @description 当前页码（1-based）
       * @example 1
       */
      page: number;
      /**
       * @description 每页大小
       * @example 10
       */
      size: number;
    };
    /** @description 字典项。 */
    DictItemItem: {
      /**
       * @description 字典项 id
       * @example 1
       */
      id: number;
      /**
       * @description 所属字典标识
       * @example alarm_level
       */
      dictCode?: string | null;
      /**
       * @description 字典值
       * @example 1
       */
      itemValue?: string | null;
      /**
       * @description 字典显示名
       * @example 一级
       */
      itemLabel?: string | null;
      /**
       * @description 排序值
       * @example 1
       */
      sortOrder?: number | null;
      /**
       * @description 状态：1 启用 / 0 停用
       * @example 1
       */
      status?: number | null;
      /**
       * @description 说明
       * @example 最高等级
       */
      description?: string | null;
    };
    /** @description 字典项分页结果（与前端 PageResult 同构）。 */
    DictItemPageResult: {
      /** @description 当前页数据 */
      list: components['schemas']['DictItemItem'][];
      /**
       * @description 总记录数
       * @example 1
       */
      total: number;
      /**
       * @description 当前页码（1-based）
       * @example 1
       */
      page: number;
      /**
       * @description 每页大小
       * @example 20
       */
      size: number;
    };
    /** @description 新增 / 修改字典项入参。 */
    DictItemSaveRequest: {
      /**
       * @description 所属字典标识（须为已存在的字典类型）
       * @example alarm_level
       */
      dictCode: string;
      /**
       * @description 字典值
       * @example 1
       */
      itemValue: string;
      /**
       * @description 字典显示名
       * @example 一级
       */
      itemLabel: string;
      /**
       * @description 排序值，缺省 0
       * @example 1
       */
      sortOrder?: number;
      /**
       * @description 状态：1 启用 / 0 停用，缺省 1
       * @example 1
       */
      status?: number;
      /**
       * @description 说明
       * @example 最高等级
       */
      description?: string;
    };
  };
  responses: {
    /** @description 未认证 / 令牌失效 */
    Unauthorized: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorEnvelope'];
      };
    };
    /** @description 参数校验失败 */
    BadRequest: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorEnvelope'];
      };
    };
    /** @description 无权限（含命中零下行控制硬控拦截，由 http 拦截器 guardHardControl 统一拦截） */
    Forbidden: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        'application/json': components['schemas']['ErrorEnvelope'];
      };
    };
  };
  parameters: {
    /** @description 页码（从 1 开始） */
    page: number;
    /** @description 每页条数 */
    size: number;
    /** @description i18n 语言头，后端据此返回翻译报文（详设 V1.5 §4.2.7） */
    lang: 'zh-CN' | 'en-US';
  };
  requestBodies: never;
  headers: {
    /** @description 毫秒级时间戳字符串（防重放签名） */
    'X-Timestamp': string;
    /** @description 单次随机数 UUID，防重放 */
    'X-Nonce': string;
    /** @description HMAC-SHA256 签名串 */
    'X-Signature': string;
  };
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  listSystemUsers: {
    parameters: {
      query?: {
        /** @description 页码（从 1 开始） */
        page?: components['parameters']['page'];
        /** @description 每页条数 */
        size?: components['parameters']['size'];
        /** @description 关键字（用户名或姓名模糊匹配） */
        keyword?: string;
        /** @description 状态过滤：1 启用 / 0 停用 */
        status?: 0 | 1;
        /** @description 角色标识精确过滤 */
        roleCode?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=SystemUserPageResult） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "list": [
           *           {
           *             "id": 1,
           *             "username": "admin",
           *             "realName": "系统管理员",
           *             "roleCode": "ADMIN",
           *             "roleName": "系统管理员",
           *             "status": 1,
           *             "mustChangePwd": true,
           *             "createdAt": "2026-09-10 12:00:00",
           *             "updatedAt": "2026-09-10 12:00:00"
           *           }
           *         ],
           *         "total": 1,
           *         "page": 1,
           *         "size": 10
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SystemUserPageResult'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  createSystemUser: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "username": "zhang.san",
         *       "password": "Init@12345",
         *       "realName": "张三",
         *       "roleCode": "OUTER_OPER",
         *       "status": 1
         *     }
         */
        'application/json': components['schemas']['SystemUserCreate'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=SystemUserItem） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 2,
           *         "username": "zhang.san",
           *         "realName": "张三",
           *         "roleCode": "OUTER_OPER",
           *         "roleName": "外操",
           *         "status": 1,
           *         "mustChangePwd": true,
           *         "createdAt": "2026-09-10 12:30:00",
           *         "updatedAt": "2026-09-10 12:30:00"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SystemUserItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  getSystemUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 用户 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=SystemUserItem） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 2,
           *         "username": "zhang.san",
           *         "realName": "张三",
           *         "roleCode": "OUTER_OPER",
           *         "roleName": "外操",
           *         "status": 1,
           *         "mustChangePwd": false,
           *         "createdAt": "2026-09-10 12:30:00",
           *         "updatedAt": "2026-09-10 12:31:00"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SystemUserItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  updateSystemUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 用户 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "realName": "张三",
         *       "roleCode": "SCHEDULER",
         *       "status": 1
         *     }
         */
        'application/json': components['schemas']['SystemUserUpdate'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=SystemUserItem） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 2,
           *         "username": "zhang.san",
           *         "realName": "张三",
           *         "roleCode": "SCHEDULER",
           *         "roleName": "值班调度",
           *         "status": 1,
           *         "mustChangePwd": false,
           *         "createdAt": "2026-09-10 12:30:00",
           *         "updatedAt": "2026-09-10 12:40:00"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SystemUserItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  deleteSystemUser: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 用户 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=DeleteResult） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "ok": true
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['DeleteResult'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  updateSystemUserStatus: {
    parameters: {
      query: {
        /** @description 目标状态：1 启用 / 0 停用 */
        status: 0 | 1;
      };
      header?: never;
      path: {
        /** @description 用户 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=SystemUserItem） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 2,
           *         "username": "zhang.san",
           *         "realName": "张三",
           *         "roleCode": "SCHEDULER",
           *         "roleName": "值班调度",
           *         "status": 0,
           *         "mustChangePwd": false,
           *         "createdAt": "2026-09-10 12:30:00",
           *         "updatedAt": "2026-09-10 12:45:00"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SystemUserItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  assignSystemUserRole: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 用户 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "roleCode": "SCHEDULER"
         *     }
         */
        'application/json': components['schemas']['SystemUserUpdate'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=SystemUserItem） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 2,
           *         "username": "zhang.san",
           *         "realName": "张三",
           *         "roleCode": "SCHEDULER",
           *         "roleName": "值班调度",
           *         "status": 1,
           *         "mustChangePwd": false,
           *         "createdAt": "2026-09-10 12:30:00",
           *         "updatedAt": "2026-09-10 12:50:00"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SystemUserItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  resetSystemUserPassword: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 用户 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=PasswordResetResult） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "temporaryPassword": "Ab3!xyZ9Qw2t",
           *         "mustChangePwd": true
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['PasswordResetResult'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  listSystemRoles: {
    parameters: {
      query?: {
        /** @description 关键字（角色标识或名称模糊匹配） */
        keyword?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=SystemRoleItem[]） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": [
           *         {
           *           "id": 1,
           *           "roleCode": "ADMIN",
           *           "roleName": "系统管理员",
           *           "description": "内置超级管理员，拥有全部菜单与权限",
           *           "dataScope": "ALL",
           *           "status": 1,
           *           "builtIn": true,
           *           "sortOrder": 0,
           *           "userCount": 1,
           *           "createdAt": "2026-09-10 12:00:00"
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SystemRoleItem'][];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  createSystemRole: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "roleCode": "scheduler",
         *       "roleName": "值班调度",
         *       "description": "值班调度岗",
         *       "dataScope": "DEPT",
         *       "status": 1,
         *       "sortOrder": 20
         *     }
         */
        'application/json': components['schemas']['SystemRoleSaveRequest'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=SystemRoleItem） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 7,
           *         "roleCode": "SCHEDULER",
           *         "roleName": "值班调度",
           *         "description": "值班调度岗",
           *         "dataScope": "DEPT",
           *         "status": 1,
           *         "builtIn": false,
           *         "sortOrder": 20,
           *         "userCount": 0,
           *         "createdAt": "2026-09-10 12:20:00"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SystemRoleItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  getSystemRole: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 角色 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=SystemRoleItem） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 7,
           *         "roleCode": "SCHEDULER",
           *         "roleName": "值班调度",
           *         "description": "值班调度岗",
           *         "dataScope": "DEPT",
           *         "status": 1,
           *         "builtIn": false,
           *         "sortOrder": 20,
           *         "userCount": 2,
           *         "createdAt": "2026-09-10 12:20:00"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SystemRoleItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  updateSystemRole: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 角色 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "roleCode": "SCHEDULER",
         *       "roleName": "值班调度员",
         *       "description": "值班调度岗",
         *       "dataScope": "DEPT",
         *       "status": 1,
         *       "sortOrder": 21
         *     }
         */
        'application/json': components['schemas']['SystemRoleSaveRequest'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=SystemRoleItem） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 7,
           *         "roleCode": "SCHEDULER",
           *         "roleName": "值班调度员",
           *         "description": "值班调度岗",
           *         "dataScope": "DEPT",
           *         "status": 1,
           *         "builtIn": false,
           *         "sortOrder": 21,
           *         "userCount": 2,
           *         "createdAt": "2026-09-10 12:20:00"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SystemRoleItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  deleteSystemRole: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 角色 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=DeleteResult） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "ok": true
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['DeleteResult'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  updateSystemRoleStatus: {
    parameters: {
      query: {
        /** @description 目标状态：1 启用 / 0 停用 */
        status: 0 | 1;
      };
      header?: never;
      path: {
        /** @description 角色 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=SystemRoleItem） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 7,
           *         "roleCode": "SCHEDULER",
           *         "roleName": "值班调度",
           *         "description": "值班调度岗",
           *         "dataScope": "DEPT",
           *         "status": 0,
           *         "builtIn": false,
           *         "sortOrder": 20,
           *         "userCount": 2,
           *         "createdAt": "2026-09-10 12:20:00"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SystemRoleItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  getSystemRoleMenus: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 角色 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=integer[]） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": [
           *         1,
           *         2,
           *         3,
           *         6,
           *         10,
           *         11
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: number[];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  assignSystemRoleMenus: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 角色 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "menuIds": [
         *         1,
         *         2,
         *         3,
         *         6,
         *         10,
         *         11
         *       ]
         *     }
         */
        'application/json': components['schemas']['SystemRoleMenuAssign'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=integer[]，返回保存后的授权 id 集合） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": [
           *         1,
           *         2,
           *         3,
           *         6,
           *         10,
           *         11
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: number[];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  listSystemMenus: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=SystemMenuNode[]，children 递归） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": [
           *         {
           *           "id": 6,
           *           "parentId": 0,
           *           "name": "系统管理",
           *           "code": "system",
           *           "path": "/system",
           *           "icon": "Setting",
           *           "sortOrder": 900,
           *           "menuType": "DIR",
           *           "permCode": null,
           *           "visible": 1,
           *           "status": 1,
           *           "children": [
           *             {
           *               "id": 7,
           *               "parentId": 6,
           *               "name": "用户管理",
           *               "code": "system-user",
           *               "path": "/system/users",
           *               "icon": null,
           *               "sortOrder": 901,
           *               "menuType": "MENU",
           *               "permCode": "system:user:view",
           *               "visible": 1,
           *               "status": 1,
           *               "children": [
           *                 {
           *                   "id": 12,
           *                   "parentId": 7,
           *                   "name": "新增用户",
           *                   "code": "system-user-create",
           *                   "path": null,
           *                   "icon": null,
           *                   "sortOrder": 9101,
           *                   "menuType": "BUTTON",
           *                   "permCode": "system:user:create",
           *                   "visible": 0,
           *                   "status": 1,
           *                   "children": null
           *                 }
           *               ]
           *             }
           *           ]
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SystemMenuNode'][];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  createSystemMenu: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "parentId": 7,
         *       "name": "导出用户",
         *       "code": "system-user-export",
         *       "menuType": "BUTTON",
         *       "permCode": "system:user:export",
         *       "visible": 0,
         *       "status": 1,
         *       "sortOrder": 9106
         *     }
         */
        'application/json': components['schemas']['SystemMenuSaveRequest'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=SystemMenuNode） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 40,
           *         "parentId": 7,
           *         "name": "导出用户",
           *         "code": "system-user-export",
           *         "path": null,
           *         "icon": null,
           *         "sortOrder": 9106,
           *         "menuType": "BUTTON",
           *         "permCode": "system:user:export",
           *         "visible": 0,
           *         "status": 1,
           *         "children": null
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SystemMenuNode'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  updateSystemMenu: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 节点 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "parentId": 7,
         *       "name": "用户导出",
         *       "code": "system-user-export",
         *       "menuType": "BUTTON",
         *       "permCode": "system:user:export",
         *       "visible": 0,
         *       "status": 1,
         *       "sortOrder": 9107
         *     }
         */
        'application/json': components['schemas']['SystemMenuSaveRequest'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=SystemMenuNode） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 40,
           *         "parentId": 7,
           *         "name": "用户导出",
           *         "code": "system-user-export",
           *         "path": null,
           *         "icon": null,
           *         "sortOrder": 9107,
           *         "menuType": "BUTTON",
           *         "permCode": "system:user:export",
           *         "visible": 0,
           *         "status": 1,
           *         "children": null
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['SystemMenuNode'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  deleteSystemMenu: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 节点 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=DeleteResult） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "ok": true
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['DeleteResult'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  listSystemPermissions: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=PermissionCodeItem[]） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": [
           *         {
           *           "permCode": "system:user:create",
           *           "name": "新增用户",
           *           "menuId": 12
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['PermissionCodeItem'][];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  listDictTypes: {
    parameters: {
      query?: {
        /** @description 页码（从 1 开始） */
        page?: components['parameters']['page'];
        /** @description 每页条数 */
        size?: components['parameters']['size'];
        /** @description 关键字（字典标识或名称模糊匹配） */
        keyword?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=DictTypePageResult） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "list": [
           *           {
           *             "id": 1,
           *             "dictCode": "alarm_level",
           *             "dictName": "报警等级",
           *             "description": "报警分级字典",
           *             "status": 1,
           *             "builtIn": false,
           *             "createdAt": "2026-09-10 13:00:00"
           *           }
           *         ],
           *         "total": 1,
           *         "page": 1,
           *         "size": 10
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['DictTypePageResult'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  createDictType: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "dictCode": "alarm_level",
         *       "dictName": "报警等级",
         *       "description": "报警分级字典",
         *       "status": 1
         *     }
         */
        'application/json': components['schemas']['DictTypeSaveRequest'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=DictTypeItem） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 1,
           *         "dictCode": "alarm_level",
           *         "dictName": "报警等级",
           *         "description": "报警分级字典",
           *         "status": 1,
           *         "builtIn": false,
           *         "createdAt": "2026-09-10 13:00:00"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['DictTypeItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  updateDictType: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 字典类型 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "dictCode": "alarm_level",
         *       "dictName": "报警级别",
         *       "description": "报警分级字典",
         *       "status": 1
         *     }
         */
        'application/json': components['schemas']['DictTypeSaveRequest'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=DictTypeItem） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 1,
           *         "dictCode": "alarm_level",
           *         "dictName": "报警级别",
           *         "description": "报警分级字典",
           *         "status": 1,
           *         "builtIn": false,
           *         "createdAt": "2026-09-10 13:00:00"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['DictTypeItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  deleteDictType: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 字典类型 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=DeleteResult） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "ok": true
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['DeleteResult'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  listDictItems: {
    parameters: {
      query: {
        /** @description 字典标识（必填） */
        dictCode: string;
        /** @description 页码（从 1 开始） */
        page?: components['parameters']['page'];
        /** @description 每页条数 */
        size?: components['parameters']['size'];
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=DictItemPageResult） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "list": [
           *           {
           *             "id": 1,
           *             "dictCode": "alarm_level",
           *             "itemValue": "1",
           *             "itemLabel": "一级",
           *             "sortOrder": 1,
           *             "status": 1,
           *             "description": "最高等级"
           *           }
           *         ],
           *         "total": 1,
           *         "page": 1,
           *         "size": 20
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['DictItemPageResult'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  createDictItem: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "dictCode": "alarm_level",
         *       "itemValue": "1",
         *       "itemLabel": "一级",
         *       "sortOrder": 1,
         *       "status": 1,
         *       "description": "最高等级"
         *     }
         */
        'application/json': components['schemas']['DictItemSaveRequest'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=DictItemItem） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 1,
           *         "dictCode": "alarm_level",
           *         "itemValue": "1",
           *         "itemLabel": "一级",
           *         "sortOrder": 1,
           *         "status": 1,
           *         "description": "最高等级"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['DictItemItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  updateDictItem: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 字典项 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        /**
         * @example {
         *       "dictCode": "alarm_level",
         *       "itemValue": "1",
         *       "itemLabel": "一级(红)",
         *       "sortOrder": 1,
         *       "status": 1,
         *       "description": "最高等级"
         *     }
         */
        'application/json': components['schemas']['DictItemSaveRequest'];
      };
    };
    responses: {
      /** @description B3 成功包络（data=DictItemItem） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "id": 1,
           *         "dictCode": "alarm_level",
           *         "itemValue": "1",
           *         "itemLabel": "一级(红)",
           *         "sortOrder": 1,
           *         "status": 1,
           *         "description": "最高等级"
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['DictItemItem'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  deleteDictItem: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 字典项 id */
        id: number;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=DeleteResult） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": {
           *         "ok": true
           *       }
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['DeleteResult'];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
  getDictOptions: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        /** @description 字典标识 */
        dictCode: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=DictItemItem[]） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": [
           *         {
           *           "id": 1,
           *           "dictCode": "alarm_level",
           *           "itemValue": "1",
           *           "itemLabel": "一级",
           *           "sortOrder": 1,
           *           "status": 1,
           *           "description": "最高等级"
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['DictItemItem'][];
          };
        };
      };
      401: components['responses']['Unauthorized'];
    };
  };
  listSystemZones: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description B3 成功包络（data=ZoneItem[]） */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          /**
           * @example {
           *       "code": 0,
           *       "message": "ok",
           *       "data": [
           *         {
           *           "id": 1,
           *           "zoneCode": "LIANYOU",
           *           "zoneName": "炼油区",
           *           "sortOrder": 1,
           *           "status": 1
           *         },
           *         {
           *           "id": 2,
           *           "zoneCode": "YIXI",
           *           "zoneName": "乙烯区",
           *           "sortOrder": 2,
           *           "status": 1
           *         },
           *         {
           *           "id": 3,
           *           "zoneCode": "GUANQU",
           *           "zoneName": "罐区",
           *           "sortOrder": 3,
           *           "status": 1
           *         }
           *       ]
           *     }
           */
          'application/json': components['schemas']['ApiResponse'] & {
            data?: components['schemas']['ZoneItem'][];
          };
        };
      };
      401: components['responses']['Unauthorized'];
      403: components['responses']['Forbidden'];
    };
  };
}
