/* Calendar / DatePicker / TimePicker — antd API 规范,WinUI 3 形态自研(无 dayjs,原生 Date)。
 * Calendar = WinUI CalendarView:日/月/年三级缩放(点标题上钻,点格下钻),
 * 周一起始、今日 accent 描边、选中 accent 实底;上下 chevron 翻页。 */
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../cn';
import {
  CalendarLtrRegular,
  ChevronDownRegular,
  ChevronUpRegular,
  DismissRegular,
} from '@fluent-react/icon';
import { useMergedState } from '../useMergedState';
import { useFixedPlacement, useFlyout } from './Flyout';

/* ---- 日期工具 ---- */
const pad = (n: number) => String(n).padStart(2, '0');
export const formatDate = (d: Date, fmt = 'YYYY-MM-DD'): string =>
  fmt.replace('YYYY', String(d.getFullYear())).replace('MM', pad(d.getMonth() + 1)).replace('DD', pad(d.getDate()))
     .replace('HH', pad(d.getHours())).replace('mm', pad(d.getMinutes()));
const sameDay = (a: Date | null | undefined, b: Date) =>
  !!a && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/* ==================== Calendar ==================== */

export interface CalendarProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date) => void;
  disabledDate?: (date: Date) => boolean;
  /** 区间着色(RangePicker 驱动):两端实底,之间浅充 */
  rangeStart?: Date | null;
  rangeEnd?: Date | null;
  /** 日格悬停回调(RangePicker 选终点时预览) */
  onHoverDate?: (date: Date | null) => void;
  className?: string;
}

const WEEK = ['一', '二', '三', '四', '五', '六', '日'];

export function Calendar({
  value: valueProp, defaultValue = null, onChange, disabledDate,
  rangeStart, rangeEnd, onHoverDate, className,
}: CalendarProps) {
  const [value, setValue] = useMergedState<Date | null>(defaultValue, valueProp, onChange as (d: Date | null) => void);
  const today = new Date();
  const anchor = value ?? today;
  const [view, setView] = useState<'day' | 'month' | 'year'>('day');
  const [vy, setVy] = useState(anchor.getFullYear());
  const [vm, setVm] = useState(anchor.getMonth());

  /* 日视图 42 格(周一起始) */
  const dayCells = (): Date[] => {
    const first = new Date(vy, vm, 1);
    const lead = (first.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, i) => new Date(vy, vm, 1 - lead + i));
  };
  const nav = (d: 1 | -1) => {
    if (view === 'day') {
      const m = vm + d;
      if (m < 0) { setVm(11); setVy(vy - 1); }
      else if (m > 11) { setVm(0); setVy(vy + 1); }
      else setVm(m);
    } else if (view === 'month') setVy(vy + d);
    else setVy(vy + d * 10);
  };
  const decade = Math.floor(vy / 10) * 10;

  return (
    <div className={cn('calendar', className)}>
      <div className="cal-head">
        <button className="cal-title" onClick={() => setView(view === 'day' ? 'month' : 'year')}
                aria-live="polite">
          {view === 'day' ? `${vy}年 ${vm + 1}月` : view === 'month' ? `${vy}年` : `${decade} - ${decade + 9}`}
        </button>
        <span className="cal-nav">
          <button aria-label="上一页" onClick={() => nav(-1)}><ChevronUpRegular size={12} /></button>
          <button aria-label="下一页" onClick={() => nav(1)}><ChevronDownRegular size={12} /></button>
        </span>
      </div>

      {view === 'day' && (
        <div className="cal-zoom" key={`d-${vy}-${vm}`}>
          <div className="cal-week">{WEEK.map((w) => <span key={w}>{w}</span>)}</div>
          <div className="cal-grid days" onMouseLeave={() => onHoverDate?.(null)}>
            {dayCells().map((d) => {
              const off = d.getMonth() !== vm;
              const dis = disabledDate?.(d);
              // 区间着色:两端排序后,端点实底、之间浅充
              const [lo, hi] = rangeStart && rangeEnd && rangeStart > rangeEnd
                ? [rangeEnd, rangeStart] : [rangeStart, rangeEnd];
              const isEdge = sameDay(lo, d) || sameDay(hi, d);
              const inRange = !!lo && !!hi && !isEdge && d > lo && d < hi;
              return (
                <button key={d.toISOString()}
                        className={cn('cal-cell', off && 'off', sameDay(today, d) && 'today',
                                      sameDay(value, d) && 'selected', isEdge && 'range-edge', inRange && 'in-range')}
                        disabled={dis}
                        onMouseEnter={onHoverDate ? () => onHoverDate(d) : undefined}
                        onClick={() => { setValue(d); if (off) { setVy(d.getFullYear()); setVm(d.getMonth()); } }}>
                  {d.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {view === 'month' && (
        <div className="cal-grid months cal-zoom" key={`m-${vy}`}>
          {Array.from({ length: 12 }, (_, m) => (
            <button key={m}
                    className={cn('cal-cell', today.getFullYear() === vy && today.getMonth() === m && 'today',
                                  value && value.getFullYear() === vy && value.getMonth() === m && 'selected')}
                    onClick={() => { setVm(m); setView('day'); }}>
              {m + 1}月
            </button>
          ))}
        </div>
      )}

      {view === 'year' && (
        <div className="cal-grid months cal-zoom" key={`y-${decade}`}>
          {Array.from({ length: 12 }, (_, i) => {
            const y = decade - 1 + i;
            return (
              <button key={y}
                      className={cn('cal-cell', (y < decade || y > decade + 9) && 'off',
                                    today.getFullYear() === y && 'today',
                                    value?.getFullYear() === y && 'selected')}
                      onClick={() => { setVy(y); setView('month'); }}>
                {y}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ==================== DatePicker ==================== */

export interface DatePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  format?: string;
  placeholder?: string;
  disabledDate?: (date: Date) => boolean;
  allowClear?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function DatePicker({
  value: valueProp, defaultValue = null, onChange, format = 'YYYY-MM-DD',
  placeholder = '选择日期', disabledDate, allowClear = true, className, ...aria
}: DatePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  // portal 到 body + fixed:祖先 overflow 裁不到;popRef 参与外点判定
  const fly = useFlyout(rootRef, popRef);
  const placement = useFixedPlacement(rootRef, popRef, fly.isOpen);
  const [value, setValue] = useMergedState<Date | null>(defaultValue, valueProp, onChange);

  return (
    <div ref={rootRef} className={cn('datepicker', className)}>
      <button className="combo-trigger" aria-haspopup="dialog" aria-expanded={fly.isOpen}
              onClick={fly.toggle} aria-label={aria['aria-label'] ?? placeholder}>
        <span className={cn('combo-value', !value && 'placeholder')}>
          {value ? formatDate(value, format) : placeholder}
        </span>
        {allowClear && value ? (
          <span className="dp-clear" role="button" aria-label="清除"
                onClick={(e) => { e.stopPropagation(); setValue(null); }}>
            <DismissRegular size={11} />
          </span>
        ) : (
          <CalendarLtrRegular size={13} className="combo-chev" style={{ transform: 'none' }} />
        )}
      </button>
      {fly.isOpen && createPortal(
        <div ref={popRef} className={cn('dp-pop', placement.cls, fly.closing && 'closing')}
             style={placement.style} role="dialog">
          <Calendar value={value} disabledDate={disabledDate}
                    onChange={(d) => { setValue(d); fly.close(true); }} />
        </div>,
        document.body,
      )}
    </div>
  );
}

/* ==================== TimePicker ==================== */

export interface TimePickerProps {
  value?: Date | null;
  defaultValue?: Date | null;
  onChange?: (date: Date | null) => void;
  minuteStep?: number;
  placeholder?: string;
  className?: string;
  'aria-label'?: string;
}

export function TimePicker({
  value: valueProp, defaultValue = null, onChange, minuteStep = 1,
  placeholder = '选择时间', className, ...aria
}: TimePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const fly = useFlyout(rootRef, popRef);
  const placement = useFixedPlacement(rootRef, popRef, fly.isOpen);
  const [value, setValue] = useMergedState<Date | null>(defaultValue, valueProp, onChange);
  const [tempH, setTempH] = useState<number | null>(null);

  const apply = (h: number, m: number) => {
    const d = new Date(value ?? new Date());
    d.setHours(h, m, 0, 0);
    setValue(d);
    setTempH(null);
    fly.close(true);   // 提交立即关闭,避免淡出期选中着色迁移闪烁
  };
  const curH = tempH ?? value?.getHours() ?? null;
  const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);

  return (
    <div ref={rootRef} className={cn('timepicker', className)}>
      <button className="combo-trigger" aria-haspopup="listbox" aria-expanded={fly.isOpen}
              onClick={fly.toggle} aria-label={aria['aria-label'] ?? placeholder}>
        <span className={cn('combo-value', !value && 'placeholder')}>
          {value ? formatDate(value, 'HH:mm') : placeholder}
        </span>
        <ChevronDownRegular size={12} className="combo-chev" />
      </button>
      {fly.isOpen && createPortal(
        <div ref={popRef} className={cn('tp-pop', placement.cls, fly.closing && 'closing')}
             style={placement.style} role="listbox">
          <div className="tp-col" aria-label="时">
            {Array.from({ length: 24 }, (_, h) => (
              <button key={h} className={cn('tp-item', curH === h && 'selected')}
                      onClick={() => setTempH(h)}>{pad(h)}</button>
            ))}
          </div>
          <div className="tp-col" aria-label="分">
            {minutes.map((m) => (
              <button key={m}
                      className={cn('tp-item', value && curH === value.getHours() && value.getMinutes() === m && tempH == null && 'selected')}
                      onClick={() => apply(curH ?? 0, m)}>{pad(m)}</button>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

/* ==================== RangePicker ==================== */

export interface RangePickerProps {
  value?: [Date, Date] | null;
  defaultValue?: [Date, Date] | null;
  onChange?: (range: [Date, Date] | null) => void;
  format?: string;
  placeholder?: [string, string];
  disabledDate?: (date: Date) => boolean;
  allowClear?: boolean;
  className?: string;
  'aria-label'?: string;
}

/** 日期范围:单面板两次点击(起点 → 终点,自动排序),悬停实时预览区间;
 * 选完终点立即提交并关闭。重新打开后再点击即开始新一轮选择。 */
export function RangePicker({
  value: valueProp, defaultValue = null, onChange, format = 'YYYY-MM-DD',
  placeholder = ['开始日期', '结束日期'], disabledDate, allowClear = true, className, ...aria
}: RangePickerProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const fly = useFlyout(rootRef, popRef);
  const placement = useFixedPlacement(rootRef, popRef, fly.isOpen);
  const [value, setValue] = useMergedState<[Date, Date] | null>(defaultValue, valueProp, onChange);
  const [start, setStart] = useState<Date | null>(null);   // 本轮已点的起点
  const [hover, setHover] = useState<Date | null>(null);

  /* 关闭(含未选完就点走)即丢弃半程状态 */
  const reset = () => { setStart(null); setHover(null); };
  const pick = (d: Date) => {
    if (!start) { setStart(d); setHover(null); return; }
    setValue(start <= d ? [start, d] : [d, start]);
    reset();
    fly.close(true);
  };

  const rs = start ?? value?.[0] ?? null;
  const re = start ? hover : value?.[1] ?? null;

  return (
    <div ref={rootRef} className={cn('rangepicker', className)}>
      <button className="combo-trigger rp-trigger" aria-haspopup="dialog" aria-expanded={fly.isOpen}
              onClick={() => { if (fly.isOpen) fly.close(); else { reset(); fly.open(); } }}
              aria-label={aria['aria-label'] ?? '选择日期范围'}>
        <span className={cn('combo-value', !value && !start && 'placeholder')}>
          {start
            ? `${formatDate(start, format)} ~ ${hover ? formatDate(hover, format) : placeholder[1]}`
            : value
              ? `${formatDate(value[0], format)} ~ ${formatDate(value[1], format)}`
              : `${placeholder[0]} ~ ${placeholder[1]}`}
        </span>
        {allowClear && value ? (
          <span className="dp-clear" role="button" aria-label="清除"
                onClick={(e) => { e.stopPropagation(); setValue(null); reset(); }}>
            <DismissRegular size={11} />
          </span>
        ) : (
          <CalendarLtrRegular size={13} className="combo-chev" style={{ transform: 'none' }} />
        )}
      </button>
      {fly.isOpen && createPortal(
        <div ref={popRef} className={cn('dp-pop', placement.cls, fly.closing && 'closing')}
             style={placement.style} role="dialog">
          <Calendar value={null} disabledDate={disabledDate}
                    rangeStart={rs} rangeEnd={re}
                    onHoverDate={start ? setHover : undefined}
                    onChange={pick} />
        </div>,
        document.body,
      )}
    </div>
  );
}
