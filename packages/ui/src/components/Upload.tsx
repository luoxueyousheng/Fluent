/* Upload / Upload.Dragger — antd API 规范(fileList/onChange/beforeUpload/
 * customRequest/maxCount/accept/multiple),WinUI 形态:虚线拖放区 + 文件行列表。
 *
 * 注意:JadeView 真机注意:宿主一旦注册 drag-drop 事件即接管拖拽,页面收不到
 * 原生 DOM drop——此时应由宿主经 IPC 转发路径,前端走业务逻辑;本组件的
 * DOM 拖放适用于浏览器预览与未注册 drag-drop 的宿主。点击选择始终可用。 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '../cn';
import {
  ArrowUploadRegular,
  CheckmarkCircleRegular,
  DismissRegular,
  DocumentRegular,
  ErrorCircleRegular,
} from '@fluent-jade/icon';
import { ProgressBar } from './Basics';
import { useMergedState } from '../useMergedState';

export interface UploadFile {
  uid: string;
  name: string;
  size: number;
  status: 'done' | 'uploading' | 'error';
  percent?: number;
  /** 原始 File(经 DOM 选择/拖放时存在) */
  raw?: File;
}

export interface UploadRequestOptions {
  file: File;
  onProgress: (percent: number) => void;
  onSuccess: () => void;
  onError: () => void;
}

export interface UploadProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  maxCount?: number;
  fileList?: UploadFile[];
  defaultFileList?: UploadFile[];
  onChange?: (info: { file: UploadFile; fileList: UploadFile[] }) => void;
  /** 返回 false / reject:拒收该文件(不加入列表) */
  beforeUpload?: (file: File) => boolean | Promise<boolean>;
  /** 自定义上传(不传则文件仅收集,直接 done——桌面应用常态) */
  customRequest?: (options: UploadRequestOptions) => void;
  onRemove?: (file: UploadFile) => void;
  /** 上传成功后自动移除该文件的状态行:true = 2000ms,或自定义毫秒数;
   *  仅移除 done 项(error 保留待用户处理),移除走 onChange、不触发 onRemove */
  autoDismiss?: boolean | number;
  showFileList?: boolean;
  children?: ReactNode;
  className?: string;
}

let seq = 0;
const fmtSize = (b: number) =>
  b >= 1 << 20 ? `${(b / (1 << 20)).toFixed(1)} MB` : b >= 1024 ? `${Math.round(b / 1024)} KB` : `${b} B`;

function useUploadCore(props: UploadProps) {
  const {
    disabled, maxCount, fileList: listProp, defaultFileList = [],
    onChange, beforeUpload, customRequest,
  } = props;
  const [list, setList] = useMergedState<UploadFile[]>(defaultFileList, listProp, undefined);
  const listRef = useRef(list);
  listRef.current = list;
  const controlled = listProp !== undefined;

  const commit = (next: UploadFile[], changed: UploadFile) => {
    // 受控时以 props 为准:listRef 由渲染期同步,这里不写,避免与 props 分叉
    if (!controlled) listRef.current = next;
    setList(next);
    onChange?.({ file: changed, fileList: next });
  };
  const patch = (uid: string, part: Partial<UploadFile>) => {
    // 文件可能已在上传中被移除:找不到 uid 直接放弃,不外抛 onChange
    if (!listRef.current.some((f) => f.uid === uid)) return;
    const next = listRef.current.map((f) => (f.uid === uid ? { ...f, ...part } : f));
    const changed = next.find((f) => f.uid === uid)!;
    commit(next, changed);
  };

  /* 成功后自动移除状态行(卸载时清空未触发的计时器) */
  const dismissMs = props.autoDismiss === true ? 2000 : typeof props.autoDismiss === 'number' ? props.autoDismiss : 0;
  const timersRef = useRef<number[]>([]);
  useEffect(() => () => timersRef.current.forEach(clearTimeout), []);
  const scheduleDismiss = (uid: string) => {
    if (dismissMs <= 0) return;
    timersRef.current.push(window.setTimeout(() => {
      const f = listRef.current.find((x) => x.uid === uid);
      if (f?.status === 'done') commit(listRef.current.filter((x) => x.uid !== uid), f);
    }, dismissMs));
  };

  const addFiles = async (files: File[]) => {
    if (disabled) return;
    for (const f of files) {
      if (maxCount && listRef.current.length >= maxCount) break;
      if (beforeUpload) {
        const ok = await Promise.resolve(beforeUpload(f)).catch(() => false);
        if (!ok) continue;
      }
      const uf: UploadFile = {
        uid: `upload-${++seq}`, name: f.name, size: f.size,
        status: customRequest ? 'uploading' : 'done',
        percent: 0, raw: f,
      };
      commit([...listRef.current, uf], uf);
      if (!customRequest) scheduleDismiss(uf.uid);
      customRequest?.({
        file: f,
        onProgress: (percent) => patch(uf.uid, { percent }),
        onSuccess: () => { patch(uf.uid, { status: 'done', percent: 100 }); scheduleDismiss(uf.uid); },
        onError: () => patch(uf.uid, { status: 'error' }),
      });
    }
  };

  const remove = (f: UploadFile) => {
    props.onRemove?.(f);
    const next = listRef.current.filter((x) => x.uid !== f.uid);
    commit(next, f);
  };

  return { list, addFiles, remove };
}

function FileList({ list, onRemove }: { list: UploadFile[]; onRemove: (f: UploadFile) => void }) {
  if (!list.length) return null;
  return (
    <ul className="upload-list">
      {list.map((f) => (
        <li key={f.uid} className={cn('upload-item', f.status)}>
          <DocumentRegular size={14} className="ul-icon" />
          <span className="ul-name" title={f.name}>{f.name}</span>
          <span className="ul-size">{fmtSize(f.size)}</span>
          {f.status === 'done' && <CheckmarkCircleRegular size={14} className="ul-status ok" />}
          {f.status === 'error' && <ErrorCircleRegular size={14} className="ul-status err" />}
          <button type="button" className="ul-remove" aria-label={`移除 ${f.name}`} onClick={() => onRemove(f)}>
            <DismissRegular size={10} />
          </button>
          {f.status === 'uploading' && <ProgressBar value={f.percent ?? 0} className="ul-progress" />}
        </li>
      ))}
    </ul>
  );
}

function usePicker(accept?: string, multiple?: boolean, onFiles?: (files: File[]) => void) {
  const inputRef = useRef<HTMLInputElement>(null);
  const input = (
    <input ref={inputRef} type="file" hidden accept={accept} multiple={multiple}
           onChange={(e) => {
             onFiles?.([...(e.target.files ?? [])]);
             e.target.value = '';               // 允许重复选同一文件
           }} />
  );
  return { input, pick: () => inputRef.current?.click() };
}

export function Upload(props: UploadProps) {
  const { accept, multiple, disabled, showFileList = true, children, className } = props;
  const { list, addFiles, remove } = useUploadCore(props);
  const { input, pick } = usePicker(accept, multiple, addFiles);
  return (
    <div className={cn('upload', className)}>
      <span className={cn('upload-trigger', disabled && 'disabled')}
            onClick={() => !disabled && pick()}>
        {children}
      </span>
      {input}
      {showFileList && <FileList list={list} onRemove={remove} />}
    </div>
  );
}

export interface DraggerProps extends UploadProps {
  /** 拖放区提示文字(默认「点击或拖拽文件到此处」) */
  hint?: ReactNode;
}

function Dragger(props: DraggerProps) {
  const { accept, multiple, disabled, showFileList = true, hint, children, className } = props;
  const { list, addFiles, remove } = useUploadCore(props);
  const { input, pick } = usePicker(accept, multiple, addFiles);
  const [over, setOver] = useState(false);

  return (
    <div className={cn('upload', className)}>
      <div className={cn('upload-dragger', over && 'over', disabled && 'disabled')}
           role="button" tabIndex={disabled ? -1 : 0}
           aria-label="上传文件"
           onClick={() => !disabled && pick()}
           onKeyDown={(e) => { if (!disabled && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pick(); } }}
           onDragOver={(e) => { e.preventDefault(); if (!disabled) setOver(true); }}
           onDragLeave={() => setOver(false)}
           onDrop={(e) => {
             e.preventDefault();
             setOver(false);
             if (!disabled) void addFiles([...(e.dataTransfer.files ?? [])]);
           }}>
        {children ?? (
          <>
            <ArrowUploadRegular size={28} className="ud-icon" />
            <div className="ud-text">{hint ?? '点击或拖拽文件到此处'}</div>
            {accept && <div className="ud-hint">支持:{accept}</div>}
          </>
        )}
      </div>
      {input}
      {showFileList && <FileList list={list} onRemove={remove} />}
    </div>
  );
}

Upload.Dragger = Dragger;
