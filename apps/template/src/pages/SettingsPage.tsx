import { useState } from 'react';
import {
  ComboBox,
  SettingsCard,
  SettingsExpander,
  Switch,
  message,
} from '@fluent-jade/ui';
import { InfoRegular, PaintBrushRegular } from '@fluent-jade/icon';
import { applyBackdrop, hasJade, setThemeMode, useTheme, type ThemeMode } from '@fluent-jade/bridge';

export function SettingsPage({ hasBackdrop }: { hasBackdrop: boolean }) {
  const { dark, mode, backdrop } = useTheme();
  const [autosave, setAutosave] = useState(true);

  return (
    <>
      <h1 className="t-title">设置</h1>

      <h2 className="t-subtitle" style={{ margin: '16px 0 8px' }}>外观</h2>
      <div className="settings-group">
        <SettingsCard icon={<PaintBrushRegular />} title="颜色模式"
                      description={`选择应用的明暗外观(当前:${dark ? '深色' : '浅色'})`}>
          <ComboBox aria-label="颜色模式" value={mode}
                    onChange={(m) => void setThemeMode(m as ThemeMode)}
                    options={[{ value: 'light', label: '浅色' }, { value: 'dark', label: '深色' }, { value: 'system', label: '跟随系统' }]} />
        </SettingsCard>
        <SettingsCard title="窗口材质"
                      description={hasBackdrop ? 'Mica / Acrylic 需要透明窗口配合' : '当前环境无 DWM 材质,仅纯色可用'}>
          <ComboBox aria-label="窗口材质" value={backdrop}
                    onChange={(t) => void applyBackdrop(t)}
                    options={hasBackdrop
                      ? [{ value: 'mica', label: 'Mica 云母' }, { value: 'micaAlt', label: 'Mica 变体' }, { value: 'acrylic', label: 'Acrylic 亚克力' }, { value: 'none', label: '纯色' }]
                      : [{ value: 'none', label: '纯色' }]} />
        </SettingsCard>
      </div>

      <h2 className="t-subtitle" style={{ margin: '16px 0 8px' }}>行为</h2>
      <div className="settings-group">
        <SettingsCard title="自动保存" description="编辑内容时自动保存更改">
          <Switch checked={autosave} onChange={(e) => setAutosave(e.target.checked)} aria-label="自动保存" />
        </SettingsCard>
        <SettingsExpander icon={<InfoRegular />} title="通知"
                          description="Toast 通知的显示方式" defaultOpen>
          <SettingsCard title="显示操作按钮" description="通知中允许出现快捷操作">
            <Switch defaultChecked aria-label="显示操作按钮" />
          </SettingsCard>
          <SettingsCard title="错误通知常驻" description="error 级通知不自动消失">
            <Switch defaultChecked aria-label="错误通知常驻" />
          </SettingsCard>
        </SettingsExpander>
        <SettingsCard title="启动时检查更新">
          <Switch defaultChecked aria-label="启动时检查更新" />
        </SettingsCard>
        <SettingsCard title="关于本应用" description="版本与开源许可"
                      onClick={() => message.info('(演示)打开关于页')} />
      </div>

      <p className="t-caption">运行环境:{hasJade() ? (window.jade?._isMock ? 'mock 宿主' : 'JadeView 宿主') : '无宿主'}</p>
    </>
  );
}
