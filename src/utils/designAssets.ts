export type DesignModule =
  'fire' | 'fireEmergency' | 'accidentRescue' | 'production' | 'preliminary' | 'security' | 'tv';

const MODULE_PREFIX: Record<DesignModule, string> = {
  fire: '消防监测一张图_',
  fireEmergency: '消防应急一张图_',
  accidentRescue: '事故应急救援_',
  production: '生产应急监测_',
  preliminary: '前序应急一张图_',
  security: '安全防恐_',
  tv: '工业电视一张图_',
};

export function designImg(suffix: string, module: DesignModule = 'fire'): string {
  return `/design/${encodeURIComponent(`${MODULE_PREFIX[module]}${suffix}`)}`;
}

export type FirePanelVariant = 'rescue' | 'equipment' | 'monitoring' | 'alarm' | 'duty';
export type ProductionPanelVariant = 'facilities' | 'devices' | 'alarm' | 'risk';
export type PreliminaryPanelVariant = 'eventList' | 'duty' | 'rescue' | 'knowledge';
export type AccidentRescuePanelVariant =
  'incidentDetail' | 'guidance' | 'duty' | 'auxiliary' | 'dynamics' | 'facilityDetail';
export type SecurityPanelVariant = 'entryStats' | 'patrolLeft' | 'alarmTrend' | 'patrolAlarm';
export type TvPanelVariant =
  | 'videoOverview'
  | 'videoAnalysis'
  | 'maintenance'
  | 'eventAnalysis'
  | 'importantVideo'
  | 'plantInspection';
export type PanelVariant =
  | FirePanelVariant
  | ProductionPanelVariant
  | PreliminaryPanelVariant
  | AccidentRescuePanelVariant
  | SecurityPanelVariant
  | TvPanelVariant;

const firePanelBodyMap: Record<FirePanelVariant, string> = {
  rescue: '矩形_4_0001.png',
  equipment: '矩形_4_0002.png',
  monitoring: '矩形_4_0003.png',
  alarm: '矩形_4_0005.png',
  duty: '矩形_4_0004.png',
};

const firePanelHeaderMap: Record<FirePanelVariant, string> = {
  rescue: '矩形_5.png',
  equipment: '矩形_5_0001.png',
  monitoring: '矩形_5_0002.png',
  alarm: '矩形_5_0004.png',
  duty: '矩形_5_0003.png',
};

const firePanelBottomMap: Record<FirePanelVariant, string> = {
  rescue: '路径_3722.png',
  equipment: '路径_3722_0001.png',
  monitoring: '路径_3722_0002.png',
  alarm: '路径_3722_0004.png',
  duty: '路径_3722_0003.png',
};

const firePanelIconMap: Record<FirePanelVariant, string> = {
  rescue: '路径_0012.png',
  equipment: '路径_0013.png',
  monitoring: '路径_0014.png',
  alarm: '路径_0016.png',
  duty: '路径_0015.png',
};

const productionPanelBodyMap: Record<ProductionPanelVariant, string> = {
  facilities: '矩形_4_0001.png',
  devices: '矩形_4_0004.png',
  alarm: '矩形_4_0003.png',
  risk: '矩形_4_0002.png',
};

const productionPanelHeaderMap: Record<ProductionPanelVariant, string> = {
  facilities: '矩形_5.png',
  devices: '矩形_5_0003.png',
  alarm: '矩形_5_0002.png',
  risk: '矩形_5_0001.png',
};

const productionPanelBottomMap: Record<ProductionPanelVariant, string> = {
  facilities: '路径_3722.png',
  devices: '路径_3722_0003.png',
  alarm: '路径_3722_0002.png',
  risk: '路径_3722_0001.png',
};

const productionPanelIconMap: Record<ProductionPanelVariant, string> = {
  facilities: '路径_0011.png',
  devices: '路径_0014.png',
  alarm: '路径_0013.png',
  risk: '路径_0012.png',
};

const preliminaryPanelBodyMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '矩形_4_0004.png',
  duty: '矩形_4_0001.png',
  rescue: '矩形_4_0002.png',
  knowledge: '矩形_4_0003.png',
};

const preliminaryPanelHeaderMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '矩形_5.png',
  duty: '矩形_4_0001.png',
  rescue: '矩形_4_0002.png',
  knowledge: '矩形_4_0003.png',
};

const preliminaryPanelBottomMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '路径_3722_0003.png',
  duty: '路径_3722.png',
  rescue: '路径_3722_0001.png',
  knowledge: '路径_3722_0002.png',
};

const preliminaryPanelIconMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '路径_0015.png',
  duty: '路径_0011.png',
  rescue: '路径_0012.png',
  knowledge: '路径_0013.png',
};

const fireEmergencyPanelBodyMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '矩形_4_0001.png',
  duty: '矩形_4_0002.png',
  rescue: '矩形_4_0003.png',
  knowledge: '矩形_4_0004.png',
};

const fireEmergencyPanelHeaderMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '/images/title.png',
  duty: '矩形_4_0002.png',
  rescue: '矩形_4_0003.png',
  knowledge: '矩形_4_0004.png',
};

const fireEmergencyPanelBottomMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '路径_3722.png',
  duty: '路径_3722_0001.png',
  rescue: '路径_3722_0002.png',
  knowledge: '路径_3722_0003.png',
};

const fireEmergencyPanelIconMap: Record<PreliminaryPanelVariant, string> = {
  eventList: '路径_0011.png',
  duty: '路径_0013.png',
  rescue: '路径_0014.png',
  knowledge: '路径_0015.png',
};

const accidentRescuePanelBodyMap: Record<AccidentRescuePanelVariant, string> = {
  incidentDetail: '矩形_4_0005.png',
  guidance: '矩形_4_0002.png',
  duty: '矩形_4_0001.png',
  auxiliary: '矩形_4_0003.png',
  dynamics: '矩形_4_0004.png',
  facilityDetail: '矩形_4_0004.png',
};

const accidentRescuePanelHeaderMap: Record<AccidentRescuePanelVariant, string> = {
  incidentDetail: '矩形_5.png',
  guidance: '矩形_4_0002.png',
  duty: '矩形_4_0001.png',
  auxiliary: '矩形_4_0003.png',
  dynamics: '矩形_4_0004.png',
  facilityDetail: '矩形_5.png',
};

const accidentRescuePanelBottomMap: Record<AccidentRescuePanelVariant, string> = {
  incidentDetail: '路径_3722_0004.png',
  guidance: '路径_3722_0001.png',
  duty: '路径_3722.png',
  auxiliary: '路径_3722_0002.png',
  dynamics: '路径_3722_0003.png',
  facilityDetail: '路径_3722_0003.png',
};

const accidentRescuePanelIconMap: Record<AccidentRescuePanelVariant, string> = {
  incidentDetail: '路径_0010.png',
  guidance: '路径_0006.png',
  duty: '路径_0005.png',
  auxiliary: '路径_0007.png',
  dynamics: '路径_0008.png',
  facilityDetail: '路径_0015.png',
};

const securityPanelBodyMap: Record<SecurityPanelVariant, string> = {
  entryStats: '矩形_4_0001.png',
  patrolLeft: '矩形_4_0003.png',
  alarmTrend: '矩形_4_0002.png',
  patrolAlarm: '矩形_4_0004.png',
};

const securityPanelHeaderMap: Record<SecurityPanelVariant, string> = {
  entryStats: '矩形_5.png',
  patrolLeft: '矩形_5.png',
  alarmTrend: '矩形_5_0001.png',
  patrolAlarm: '矩形_5_0001.png',
};

const securityPanelBottomMap: Record<SecurityPanelVariant, string> = {
  entryStats: '路径_3722.png',
  patrolLeft: '路径_3722_0002.png',
  alarmTrend: '路径_3722_0001.png',
  patrolAlarm: '路径_3722_0003.png',
};

const securityPanelIconMap: Record<SecurityPanelVariant, string> = {
  entryStats: '路径_0011.png',
  patrolLeft: '路径_0094.png',
  alarmTrend: '路径_0012.png',
  patrolAlarm: '路径_0095.png',
};

const tvPanelBodyMap: Record<TvPanelVariant, string> = {
  videoOverview: '矩形_4_0001.png',
  videoAnalysis: '矩形_4_0002.png',
  eventAnalysis: '矩形_4_0003.png',
  maintenance: '矩形_4_0004.png',
  importantVideo: '矩形_4_0005.png',
  plantInspection: '矩形_4_0006.png',
};

const tvPanelHeaderMap: Record<TvPanelVariant, string> = {
  videoOverview: '矩形_5.png',
  videoAnalysis: '矩形_5_0001.png',
  eventAnalysis: '矩形_5_0002.png',
  maintenance: '矩形_5_0003.png',
  importantVideo: '矩形_5.png',
  plantInspection: '矩形_5_0001.png',
};

const tvPanelBottomMap: Record<TvPanelVariant, string> = {
  videoOverview: '路径_3722.png',
  videoAnalysis: '路径_3722_0001.png',
  eventAnalysis: '路径_3722_0002.png',
  maintenance: '路径_3722_0003.png',
  importantVideo: '路径_3722_0004.png',
  plantInspection: '路径_3722_0005.png',
};

const tvPanelIconMap: Record<TvPanelVariant, string> = {
  videoOverview: '路径_0011.png',
  videoAnalysis: '路径_0012.png',
  eventAnalysis: '路径_0013.png',
  maintenance: '路径_0014.png',
  importantVideo: '路径_0015.png',
  plantInspection: '路径_0016.png',
};

function createAssets(module: DesignModule) {
  const img = (suffix: string) => designImg(suffix, module);
  // 消防设计稿无地图切换按钮切图，复用生产应急监测同款 108×38 按钮
  const mapToggleModule: DesignModule =
    module === 'fire' || module === 'fireEmergency' || module === 'accidentRescue'
      ? 'production'
      : module;

  // 生产/前序用 _0001 变体；消防/安全防恐仅有基础文件名
  const footerBg =
    module === 'production' || module === 'preliminary' ? '矩形_6_0001.png' : '矩形_6.png';
  const footerDeco =
    module === 'production' || module === 'preliminary' ? '路径_3723_0001.png' : '路径_3723.png';
  const systemMessageStrip =
    module === 'production'
      ? 'image_0027.png'
      : module === 'preliminary'
        ? 'image_0016.png'
        : module === 'fireEmergency'
          ? 'image_0001.png'
          : module === 'security'
            ? 'image_0009.png'
            : module === 'tv'
              ? 'image_0008.png'
              : 'image_0001.png';
  const footerTickerBg =
    module === 'production'
      ? 'image_0028.png'
      : module === 'preliminary'
        ? 'image_0017.png'
        : module === 'fireEmergency'
          ? 'image_0002.png'
          : module === 'security'
            ? 'image_0010.png'
            : module === 'tv'
              ? 'image_0009.png'
              : 'image_0002.png';
  const footerMoreButton =
    module === 'production'
      ? 'image_0029.png'
      : module === 'preliminary'
        ? 'image_0018.png'
        : module === 'fireEmergency'
          ? 'image_0003.png'
          : module === 'security'
            ? 'image_0011.png'
            : module === 'tv'
              ? 'image_0010.png'
              : 'image_0003.png';
  const moreArrow = 'Color_Overlay-3.png';

  return {
    mapBg: img('image.png'),
    headerBg: img('路径_1.png'),
    headerTitleDeco: img('路径_3720.png'),
    headerTitleAccent: img('路径_3721.png'),
    headerTitleLine: img('矩形_4.png'),
    navActiveBg: img('矩形_1.png'),
    navActiveLine: img('矩形_2.png'),
    navIcons: [
      img('路径_0004.png'),
      img('路径_0005.png'),
      img('路径_0006.png'),
      img('路径_0007.png'),
      img('路径_0008.png'),
      img('路径_0009.png'),
    ],
    weatherIcon: img('路径_0010.png'),
    userAvatar: img('图层121.png'),
    userArrow: img('路径_4.png'),
    footerBg: img(footerBg),
    footerDeco: img(footerDeco),
    systemMessageStrip: img(systemMessageStrip),
    footerTickerBg: img(footerTickerBg),
    footerMoreButton: img(footerMoreButton),
    zoneOverlays: [img('路径_3724.png'), img('路径_3727.png'), img('路径_3726.png')],
    zoneLabelBg: img('矩形_52.png'),
    alarmPopupBg: img('矩形_31.png'),
    alarmStatusDot: img('圆形_30.png'),
    fireMarkerOuter: img('圆形_41.png'),
    fireMarkerInner: img('圆形_42.png'),
    fireMarkerIcon: img(
      module === 'production'
        ? '路径_0015.png'
        : module === 'preliminary'
          ? '路径_0014.png'
          : module === 'fireEmergency'
            ? '路径_0012.png'
            : module === 'accidentRescue'
              ? '路径_0009.png'
              : module === 'tv'
                ? '路径_0025.png'
                : '路径_0011.png',
    ),
    fireMarkerShadow1: img('圆形_45.png'),
    fireMarkerShadow2: img('圆形_46.png'),
    fireMarkerBase: img('圆形_44.png'),
    fireMarkerLine: img('矩形_60.png'),
    fireMarkerDot: img('圆形_43.png'),
    moreArrow: img(moreArrow),
    mapToggleActive: designImg('矩形_58.png', mapToggleModule),
    mapToggleInactive: designImg('矩形_59.png', mapToggleModule),
    statsBarBg: module === 'production' ? img('image_0017.png') : undefined,
    riskSummaryBg: module === 'production' ? img('image_0013.png') : undefined,
    riskWarningBg: module === 'production' ? img('image_0025.png') : undefined,
  } as const;
}

export const assets = createAssets('fire');
export const productionAssets = createAssets('production');
export const preliminaryAssets = createAssets('preliminary');
export const fireEmergencyAssets = createAssets('fireEmergency');
export const accidentRescueAssets = {
  ...createAssets('accidentRescue'),
  routeOverlayMain: designImg('路径_3729.png', 'accidentRescue'),
  routeOverlayBranch: designImg('路径_3730.png', 'accidentRescue'),
  gateLabelBg: designImg('矩形_52.png', 'accidentRescue'),
  gateMarkerOuter: designImg('圆形_28.png', 'accidentRescue'),
  gateMarkerInner: designImg('圆形_29.png', 'accidentRescue'),
  gateFlowIcon: designImg('圆形_27.png', 'accidentRescue'),
  /** 合并后的车辆标点（圆环 + 箭头），默认朝右 */
  vehicleMarkerCar: '/design/car.png',
  fireMarkerGroundGlow: designImg('圆形_45_0001.png', 'accidentRescue'),
  replayButtonBg: designImg('矩形_58.png', 'accidentRescue'),
  vehiclePopupBg: designImg('矩形_31.png', 'accidentRescue'),
  firePopupBg: designImg('矩形_31_0001.png', 'accidentRescue'),
  backButtonOuter: designImg('圆形_42_0001.png', 'accidentRescue'),
  backButtonIcon: designImg('路径_0010.png', 'accidentRescue'),
} as const;
export const securityAssets = {
  ...createAssets('security'),
  zoneHighlight: designImg('路径_3728.png', 'security'),
  gateLabelBg: designImg('矩形_52.png', 'security'),
  gateMarkerOuter: designImg('圆形_28.png', 'security'),
  gateMarkerInner: designImg('圆形_29.png', 'security'),
  gateFlowIcon: designImg('圆形_27.png', 'security'),
  mapToolbar: designImg('image_0014.png', 'security'),
  linkageStatusGreen: designImg('矩形_59.png', 'security'),
  linkageStatusOrange: designImg('矩形_59_0003.png', 'security'),
  linkageIcons: [
    designImg('图层_2.png', 'security'),
    designImg('图层_3.png', 'security'),
    designImg('图层_4.png', 'security'),
    designImg('图层_5.png', 'security'),
  ],
} as const;

export const tvAssets = {
  ...createAssets('tv'),
  inspectionCircleOverlays: [
    {
      inner: designImg('圆形_48.png', 'tv'),
      line: designImg('直线_14.png', 'tv'),
    },
    {
      inner: designImg('圆形_48_0001.png', 'tv'),
      line: designImg('直线_14_0001.png', 'tv'),
    },
  ],
  zoneLabelBgs: [
    designImg('矩形_31.png', 'tv'),
    designImg('矩形_31_0001.png', 'tv'),
    designImg('矩形_31_0002.png', 'tv'),
    designImg('矩形_31_0003.png', 'tv'),
  ],
  cameraMarkers: [
    {
      outer: designImg('圆形_45.png', 'tv'),
      icon: designImg('路径_0021.png', 'tv'),
      line: designImg('矩形_60.png', 'tv'),
      dot: designImg('圆形_43.png', 'tv'),
    },
    {
      outer: designImg('圆形_45_0001.png', 'tv'),
      icon: designImg('路径_0022.png', 'tv'),
      line: designImg('矩形_60_0001.png', 'tv'),
      dot: designImg('圆形_43_0001.png', 'tv'),
    },
    {
      outer: designImg('圆形_45_0002.png', 'tv'),
      icon: designImg('路径_0023.png', 'tv'),
      line: designImg('矩形_60_0002.png', 'tv'),
      dot: designImg('圆形_43_0002.png', 'tv'),
    },
    {
      outer: designImg('圆形_45_0003.png', 'tv'),
      icon: designImg('路径_0024.png', 'tv'),
      line: designImg('矩形_60_0003.png', 'tv'),
      dot: designImg('圆形_43_0003.png', 'tv'),
    },
  ],
  alarmPopupBg: designImg('矩形_31_0004.png', 'tv'),
  alarmMarker: {
    shadow1: designImg('圆形_45_0004.png', 'tv'),
    shadow2: designImg('圆形_46.png', 'tv'),
    base: designImg('圆形_44.png', 'tv'),
    outer: designImg('圆形_41.png', 'tv'),
    inner: designImg('圆形_42.png', 'tv'),
    icon: designImg('路径_0025.png', 'tv'),
    line: designImg('矩形_60_0004.png', 'tv'),
    dot: designImg('圆形_43_0004.png', 'tv'),
  },
  videoMonitorDetail: {
    icon: designImg('路径_0015.png', 'tv'),
  },
} as const;

export function getAssets(module: DesignModule) {
  if (module === 'production') return productionAssets;
  if (module === 'preliminary') return preliminaryAssets;
  if (module === 'fireEmergency') return fireEmergencyAssets;
  if (module === 'accidentRescue') return accidentRescueAssets;
  if (module === 'security') return securityAssets;
  if (module === 'tv') return tvAssets;
  return assets;
}

export function panelAssets(variant: PanelVariant, module: DesignModule = 'fire') {
  const more = getAssets(module).moreArrow;

  if (module === 'accidentRescue') {
    const v = variant as AccidentRescuePanelVariant;
    const assetModule: DesignModule = v === 'facilityDetail' ? 'preliminary' : module;
    return {
      body: designImg(accidentRescuePanelBodyMap[v], assetModule),
      header: designImg(accidentRescuePanelHeaderMap[v], assetModule),
      bottom: designImg(accidentRescuePanelBottomMap[v], assetModule),
      icon: designImg(accidentRescuePanelIconMap[v], assetModule),
      more,
    };
  }

  if (module === 'preliminary' || module === 'fireEmergency') {
    const v = variant as PreliminaryPanelVariant;
    const bodyMap =
      module === 'fireEmergency' ? fireEmergencyPanelBodyMap : preliminaryPanelBodyMap;
    const headerMap =
      module === 'fireEmergency' ? fireEmergencyPanelHeaderMap : preliminaryPanelHeaderMap;
    const bottomMap =
      module === 'fireEmergency' ? fireEmergencyPanelBottomMap : preliminaryPanelBottomMap;
    const iconMap =
      module === 'fireEmergency' ? fireEmergencyPanelIconMap : preliminaryPanelIconMap;
    const headerSrc = headerMap[v];
    return {
      body: designImg(bodyMap[v], module),
      header: headerSrc.startsWith('/') ? headerSrc : designImg(headerSrc, module),
      bottom: designImg(bottomMap[v], module),
      icon: designImg(iconMap[v], module),
      more,
    };
  }

  if (module === 'security') {
    const v = variant as SecurityPanelVariant;
    return {
      body: designImg(securityPanelBodyMap[v], module),
      header: designImg(securityPanelHeaderMap[v], module),
      bottom: designImg(securityPanelBottomMap[v], module),
      icon: designImg(securityPanelIconMap[v], module),
      more,
    };
  }

  if (module === 'tv') {
    const v = variant as TvPanelVariant;
    return {
      body: designImg(tvPanelBodyMap[v], module),
      header: designImg(tvPanelHeaderMap[v], module),
      bottom: designImg(tvPanelBottomMap[v], module),
      icon: designImg(tvPanelIconMap[v], module),
      more,
    };
  }

  if (module === 'production') {
    const v = variant as ProductionPanelVariant;
    return {
      body: designImg(productionPanelBodyMap[v], module),
      header: designImg(productionPanelHeaderMap[v], module),
      bottom: designImg(productionPanelBottomMap[v], module),
      icon: designImg(productionPanelIconMap[v], module),
      more,
    };
  }

  const v = variant as FirePanelVariant;
  return {
    body: designImg(firePanelBodyMap[v], module),
    header: designImg(firePanelHeaderMap[v], module),
    bottom: designImg(firePanelBottomMap[v], module),
    icon: designImg(firePanelIconMap[v], module),
    more,
  };
}
