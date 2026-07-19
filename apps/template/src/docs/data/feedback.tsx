/* 文档数据:反馈 — Toast / Modal / Drawer / Tooltip / TeachingTip / InfoBar / Progress */
import { useState } from 'react';
import {
  Button,
  Card,
  Drawer,
  Field,
  InfoBar,
  Modal,
  Popover,
  ProgressBar,
  ProgressRing,
  Skeleton,
  Spin,
  TeachingTip,
  TextBox,
  Switch,
  Tooltip,
  message,
  modal,
  notification,
  useConfirm,
  useToast,
} from '@fluent-react/ui';
import type { DocDef } from '../types';

const toast: DocDef = {
  key: 'toast',
  name: 'Toast',
  cn: '轻提示',
  description:
    '右下角通知横幅(z-2000,盖过模态属预期):四级语义色、默认 5 秒自动关闭、悬停暂停计时、同 id 去重、最多并存 5 条,带 action 的常驻等待处理。组件内用 useToast;组件外用 antd 风命令式 message / notification(duration 单位为秒)。',
  importCode: `import { useToast, message, notification } from '@fluent-react/ui';`,
  sections: [
    {
      title: 'useToast',
      description: 'Hook 形态,完整能力(级别 / 标题 / 时长 / action)。',
      demo: <ToastDemo />,
      code: `
import { Button, useToast } from '@fluent-react/ui';

export function ToastExample() {
  const toast = useToast();
  return (
    <>
      <Button onClick={() => toast({ level: 'success', title: '已保存', message: '配置写入完成。' })}>
        成功
      </Button>
      <Button onClick={() => toast({ level: 'error', title: '失败', message: '磁盘空间不足。' })}>
        错误
      </Button>
      <Button
        onClick={() =>
          toast({
            level: 'warning',
            title: '发现新版本',
            message: '是否立即更新?',
            action: { label: '更新' },
            // 带 action 的 Toast 常驻,直到用户处理
            onAction: () => toast({ level: 'info', message: '开始更新…' }),
          })
        }
      >
        带操作
      </Button>
    </>
  );
}`,
    },
    {
      title: '命令式 message / notification',
      description: 'antd 同形 API,可在任何模块调用(需应用树内已挂 FluentProvider,未挂载时仅告警不抛错);duration 单位秒。',
      demo: (
        <>
          <Button onClick={() => message.success('操作成功')}>message.success</Button>
          <Button onClick={() => message.error('操作失败', 8)}>message.error(8 秒)</Button>
          <Button onClick={() => notification.info({ message: '构建完成', description: '产物已输出到 dist/。' })}>
            notification.info
          </Button>
        </>
      ),
      code: `
import { Button, message, notification } from '@fluent-react/ui';

export function MessageNotificationExample() {
  return (
    <>
      <Button onClick={() => message.success('操作成功')}>message.success</Button>
      {/* 第二参为 duration,单位秒 */}
      <Button onClick={() => message.error('操作失败', 8)}>message.error(8 秒)</Button>
      <Button
        onClick={() =>
          notification.info({ message: '构建完成', description: '产物已输出到 dist/。' })
        }
      >
        notification.info
      </Button>
    </>
  );
}`,
    },
    {
      title: '弹出位置',
      description: '六方位:上 / 下 × 左 / 中 / 右。每条经 placement 指定;FluentProvider 的 toastPlacement 改全局默认(缺省 bottomRight)。顶部方位自动让出标题栏,新条在上;底部方位新条在下。',
      demo: <ToastPlacementDemo />,
      code: `
import type { ReactNode } from 'react';
import { Button, FluentProvider, useToast, type ToastPlacement } from '@fluent-react/ui';

export function PlacementExample() {
  const toast = useToast();
  const places: ToastPlacement[] = ['topLeft', 'top', 'topRight', 'bottomLeft', 'bottom', 'bottomRight'];
  return (
    <>
      {places.map((p) => (
        <Button key={p}
                onClick={() => toast({ level: 'info', title: p, message: '从这个方位弹出。', placement: p })}>
          {p}
        </Button>
      ))}
    </>
  );
}

// 全局默认改到顶部居中:<FluentProvider toastPlacement="top">
// 命令式同样支持:notification.info({ message: '标题', description: '内容', placement: 'topRight' });

// 应用入口处指定全局默认弹出位置(FluentProvider 的 toastPlacement):
export function AppWithTopToasts({ children }: { children: ReactNode }) {
  return <FluentProvider toastPlacement="top">{children}</FluentProvider>;
}`,
    },
    {
      title: '自动关闭进度',
      description: '底部 3px 进度条随剩余时间耗尽(等级同色);悬停时与计时一起暂停、移出继续。常驻条(带 action 或 duration=0)不显示进度。',
      demo: <ToastProgressDemo />,
      code: `
import { Button, useToast } from '@fluent-react/ui';

export function AutoCloseProgressExample() {
  const toast = useToast();
  return (
    <>
      {/* 8 秒:观察底部进度条;悬停暂停,移出继续 */}
      <Button onClick={() => toast({ level: 'success', title: '已保存', message: '悬停我暂停计时。', duration: 8000 })}>
        8 秒自动关闭
      </Button>
      {/* 带 action 常驻:无进度条 */}
      <Button onClick={() => toast({ level: 'warning', title: '发现新版本', message: '常驻等待处理。', action: { label: '更新' } })}>
        常驻(无进度)
      </Button>
    </>
  );
}`,
    },
    {
      title: '同 id 去重',
      description: '传相同 id 的 Toast 覆盖旧条而非新增:高频事件(下载进度、重连提示)只占一个位置,计时随每次覆盖重置。',
      demo: <ToastDedupeDemo />,
      code: `
import { useState } from 'react';
import { Button, useToast } from '@fluent-react/ui';

export function ToastDedupeExample() {
  const toast = useToast();
  const [count, setCount] = useState(0);
  return (
    <Button
      onClick={() => {
        const next = count + 1;
        setCount(next);
        // 同 id 覆盖旧条(去重):连点也只占一个位置
        toast({ id: 'sync-progress', level: 'info', title: '同步中', message: \`已触发 \${next} 次,始终只有一条。\` });
      }}
    >
      连点我(同 id 去重)
    </Button>
  );
}`,
    },
  ],
  props: [
    { name: 'level', type: "'info' | 'success' | 'warning' | 'error'", default: "'info'", description: '语义级别。' },
    { name: 'title', type: 'string', description: '标题行。' },
    { name: 'message', type: 'string', description: '正文(必填)。' },
    { name: 'duration', type: 'number', default: '5000', description: '自动关闭毫秒(带进度条);含 action 时忽略并常驻。' },
    { name: 'placement', type: "'topLeft' | 'top' | 'topRight' | 'bottomLeft' | 'bottom' | 'bottomRight'", default: 'Provider 的 toastPlacement', description: '弹出位置。' },
    { name: 'id', type: 'string', description: '同 id 的 Toast 覆盖旧条(去重)。' },
    { name: 'action', type: '{ label: string; command?: string }', description: '操作按钮。' },
    { name: 'onAction', type: '(command?: string) => void', description: '操作按钮点击。' },
  ],
  extraApis: [
    {
      title: 'FluentProvider Props',
      rows: [
        { name: 'toastPlacement', type: 'ToastPlacement', default: "'bottomRight'", description: 'Toast 全局默认弹出位置。' },
      ],
    },
  ],
};

function ToastDemo() {
  const t = useToast();
  return (
    <>
      <Button onClick={() => t({ level: 'success', title: '已保存', message: '配置写入完成。' })}>成功</Button>
      <Button onClick={() => t({ level: 'error', title: '失败', message: '磁盘空间不足。' })}>错误</Button>
      <Button onClick={() => t({
        level: 'warning', title: '发现新版本', message: '是否立即更新?',
        action: { label: '更新' }, onAction: () => t({ level: 'info', message: '开始更新…' }),
      })}>带操作</Button>
    </>
  );
}

const TOAST_PLACES = ['topLeft', 'top', 'topRight', 'bottomLeft', 'bottom', 'bottomRight'] as const;

function ToastPlacementDemo() {
  const t = useToast();
  return (
    <>
      {TOAST_PLACES.map((p) => (
        <Button key={p}
                onClick={() => t({ level: 'info', title: p, message: '从这个方位弹出。', placement: p })}>
          {p}
        </Button>
      ))}
    </>
  );
}

function ToastProgressDemo() {
  const t = useToast();
  return (
    <>
      <Button onClick={() => t({ level: 'success', title: '已保存', message: '悬停我暂停计时。', duration: 8000 })}>
        8 秒自动关闭
      </Button>
      <Button onClick={() => t({ level: 'warning', title: '发现新版本', message: '常驻等待处理。', action: { label: '更新' } })}>
        常驻(无进度)
      </Button>
    </>
  );
}

function ToastDedupeDemo() {
  const t = useToast();
  const [count, setCount] = useState(0);
  return (
    <Button onClick={() => {
      const next = count + 1;
      setCount(next);
      t({ id: 'sync-progress', level: 'info', title: '同步中', message: `已触发 ${next} 次,始终只有一条。` });
    }}>
      连点我(同 id 去重)
    </Button>
  );
}

const modalDoc: DocDef = {
  key: 'modal',
  name: 'Modal',
  cn: '模态框',
  description:
    'WinUI ContentDialog 形态的模态框。声明式 <Modal> 承载任意内容(antd API:受控 open、标题/内容/页脚三段、遮罩与 Esc 关闭可配、长内容体内滚动、onOk 返回 Promise 自动 loading);纯确认场景用 useConfirm(组件内,resolve 按钮序号)或 modal.confirm(组件外,resolve 布尔)。遮罩从标题栏下方开始,窗口拖动与控制钮始终可用。',
  importCode: `import { Modal, useConfirm, modal } from '@fluent-react/ui';`,
  sections: [
    {
      title: '声明式基础用法',
      description: '受控 open;onCancel 汇集所有关闭路径(遮罩 / Esc / 右上角 X / 取消钮),默认页脚为 确定 + 取消。',
      demo: <ModalBasic />,
      code: `
import { useState } from 'react';
import {
  Button,
  Field,
  Modal,
  TextBox,
  useToast,
} from '@fluent-react/ui';

export function ModalBasicExample() {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>重命名…</Button>
      {/* onCancel 汇集所有关闭路径:遮罩 / Esc / 右上角 X / 取消钮 */}
      <Modal
        open={open}
        title="重命名会话"
        okText="保存"
        onCancel={() => setOpen(false)}
        onOk={() => {
          setOpen(false);
          toast({ level: 'success', message: '已保存。' });
        }}
      >
        <Field label="新名称">
          <TextBox defaultValue="未命名会话" className="w-full" />
        </Field>
      </Modal>
    </>
  );
}`,
    },
    {
      title: '异步提交',
      description: 'onOk 返回 Promise 时,确定钮自动进入 loading 直到 settle;是否关闭由调用方在 then 里决定。',
      demo: <ModalAsync />,
      code: `
import { useState } from 'react';
import { Button, Modal, useToast } from '@fluent-react/ui';

export function ModalAsyncExample() {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return (
    <>
      <Button onClick={() => setOpen(true)}>应用配置…</Button>
      <Modal
        open={open}
        title="应用配置"
        okText="应用"
        onCancel={() => setOpen(false)}
        onOk={() =>
          // 返回 Promise → 确定钮自动 loading 直到 settle;是否关闭由调用方在 then 里决定
          new Promise((resolve) => setTimeout(resolve, 1200)).then(() => {
            setOpen(false);
            toast({ level: 'success', message: '配置已应用。' });
          })
        }
      >
        <p>将重启渲染进程并应用新配置,期间界面短暂不可用。</p>
      </Modal>
    </>
  );
}`,
    },
    {
      title: '长内容与自定义页脚',
      description: '内容超高时在体内滚动,不撑破视口;footer 传 null 隐藏页脚,传节点完全自定义。',
      demo: <ModalLong />,
      code: `
import { useState } from 'react';
import { Button, Modal } from '@fluent-react/ui';

export function ModalLongContentExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>许可协议…</Button>
      {/* footer 传节点完全自定义;传 null 隐藏页脚区 */}
      <Modal
        open={open}
        title="许可协议"
        width={520}
        onCancel={() => setOpen(false)}
        footer={
          <Button variant="accent" onClick={() => setOpen(false)}>我已阅读</Button>
        }
      >
        {/* 超高内容:modal-body 内滚动,不撑破视口 */}
        {Array.from({ length: 24 }, (_, i) => (
          <p key={i}>
            第 {i + 1} 条:本软件按「现状」提供,不附带任何明示或默示的担保;在适用法律允许的最大范围内,作者不对因使用本软件造成的任何损失承担责任。
          </p>
        ))}
      </Modal>
    </>
  );
}`,
    },
    {
      title: '危险操作与强制交互',
      description: 'okDanger 把确定钮标红;closable / maskClosable / keyboard 三者关掉后,遮罩、Esc 与右上角 X 均不可关闭,必须点按钮做出选择;cancelText 自定义取消文案。',
      demo: <ModalDangerDemo />,
      code: `
import { useState } from 'react';
import { Button, Modal, useToast } from '@fluent-react/ui';

export function ModalDangerExample() {
  const [open, setOpen] = useState(false);
  const toast = useToast();
  return (
    <>
      <Button danger onClick={() => setOpen(true)}>注销账户…</Button>
      {/* closable={false} + maskClosable={false} + keyboard={false}:只能通过按钮离开 */}
      <Modal
        open={open}
        title="注销账户"
        okText="永久注销"
        cancelText="再想想"
        okDanger
        closable={false}
        maskClosable={false}
        keyboard={false}
        onCancel={() => setOpen(false)}
        onOk={() => {
          setOpen(false);
          toast({ level: 'success', message: '已注销。' });
        }}
      >
        <p>注销后所有数据将被永久删除且无法恢复;遮罩、Esc 与右上角 X 均已禁用,请点按钮做出选择。</p>
      </Modal>
    </>
  );
}`,
    },
    {
      title: '受控 loading 与 destroyOnClose',
      description: 'confirmLoading 受控驱动确定钮 loading(不依赖 onOk 返回 Promise);destroyOnClose 关闭即卸载内容,重开时内部状态(如输入框)自动重置。',
      demo: <ModalLoadingDemo />,
      code: `
import { useState } from 'react';
import {
  Button,
  Field,
  Modal,
  TextBox,
  useToast,
} from '@fluent-react/ui';

export function ModalLoadingExample() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const submit = () => {
    // confirmLoading 受控:自行掌握 loading 的起止时机
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      toast({ level: 'success', message: '已提交。' });
    }, 1500);
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>提交申请…</Button>
      {/* destroyOnClose:关闭即卸载内容,重开时输入框回到初始值 */}
      <Modal
        open={open}
        title="提交申请"
        okText="提交"
        confirmLoading={loading}
        destroyOnClose
        onCancel={() => setOpen(false)}
        onOk={submit}
      >
        <Field label="备注">
          <TextBox placeholder="随便输入点什么,关闭重开会被重置" className="w-full" />
        </Field>
      </Modal>
    </>
  );
}`,
    },
    {
      title: 'useConfirm',
      description: 'buttons 自定义按钮组,resolve 被点按钮的序号;danger 把首按钮标红;defaultId 指定回车默认按钮。',
      demo: <ConfirmDemo />,
      code: `
import { Button, useConfirm, useToast } from '@fluent-react/ui';

export function ConfirmExample() {
  const confirm = useConfirm();
  const toast = useToast();
  const handleDelete = async () => {
    // resolve 被点按钮的序号(Esc = 最后一个)
    const i = await confirm({
      title: '删除 3 个文件?',
      message: '删除后无法恢复。',
      buttons: ['删除', '取消'],
      danger: true,
      // 回车默认落在「取消」(序号 1),避免误按回车直接删除
      defaultId: 1,
    });
    if (i === 0) toast({ level: 'success', message: '已删除。' });
    else toast({ level: 'info', message: '已取消。' });
  };
  return (
    <Button danger onClick={() => void handleDelete()}>删除文件…</Button>
  );
}`,
    },
    {
      title: '命令式 modal.confirm',
      description: 'antd 同形:okText / cancelText,resolve true=确定。',
      demo: (
        <Button onClick={() => { void modal.confirm({ title: '应用新配置?', content: '将重启渲染进程。', okText: '应用' }).then((ok) => ok && message.success('已应用')); }}>
          modal.confirm
        </Button>
      ),
      code: `
import { Button, message, modal } from '@fluent-react/ui';

export function ModalConfirmExample() {
  const handleApply = async () => {
    // 组件外也可调用;resolve true = 点了确定
    const ok = await modal.confirm({
      title: '应用新配置?',
      content: '将重启渲染进程。',
      okText: '应用',
    });
    if (ok) message.success('已应用');
  };
  return (
    <Button onClick={() => void handleApply()}>modal.confirm</Button>
  );
}`,
    },
  ],
  props: [
    { name: 'open', type: 'boolean', description: '受控开合(必填)。' },
    { name: 'title', type: 'ReactNode', description: '标题;与 closable 同为空时不渲染头部。' },
    { name: 'children', type: 'ReactNode', description: '内容区(超高时体内滚动)。' },
    { name: 'okText / cancelText', type: 'string', default: "'确定' / '取消'", description: '默认页脚按钮文案。' },
    { name: 'okDanger', type: 'boolean', default: 'false', description: '确定钮红色(破坏性操作)。' },
    { name: 'confirmLoading', type: 'boolean', description: '受控确定钮 loading;不传则由 onOk 的 Promise 自动驱动。' },
    { name: 'footer', type: 'ReactNode | null', default: '确定 + 取消', description: '自定义页脚;null 隐藏页脚区。' },
    { name: 'width', type: 'number', default: '420', description: '宽度(自动钳制在视口内)。' },
    { name: 'closable', type: 'boolean', default: 'true', description: '右上角关闭钮。' },
    { name: 'maskClosable', type: 'boolean', default: 'true', description: '点遮罩关闭。' },
    { name: 'keyboard', type: 'boolean', default: 'true', description: 'Esc 关闭。' },
    { name: 'destroyOnClose', type: 'boolean', default: 'false', description: '关闭后卸载内容(重开时重置内部状态)。' },
  ],
  events: [
    { name: 'onOk', type: '() => void | Promise<unknown>', description: '确定钮;返回 Promise 时按钮自动 loading 直到 settle。' },
    { name: 'onCancel', type: '() => void', description: '请求关闭:遮罩点击 / Esc / 关闭钮 / 取消钮。' },
  ],
  extraApis: [
    {
      title: 'useConfirm(ConfirmOptions)',
      rows: [
        { name: 'title', type: 'string', description: '标题(必填)。' },
        { name: 'message', type: 'string', description: '正文。' },
        { name: 'buttons', type: 'string[]', default: "['确定', '取消']", description: '按钮组,首个为主按钮;resolve 被点按钮序号(Esc = 最后一个)。' },
        { name: 'danger', type: 'boolean', default: 'false', description: '主按钮红色。' },
        { name: 'defaultId', type: 'number', default: '0', description: '回车默认按钮序号。' },
      ],
    },
  ],
};

function ModalBasic() {
  const [open, setOpen] = useState(false);
  const t = useToast();
  return (
    <>
      <Button variant="accent" onClick={() => setOpen(true)}>重命名…</Button>
      <Modal open={open} title="重命名会话" okText="保存"
             onCancel={() => setOpen(false)}
             onOk={() => { setOpen(false); t({ level: 'success', message: '已保存。' }); }}>
        <Field label="新名称">
          <TextBox defaultValue="未命名会话" aria-label="新名称" style={{ width: '100%' }} />
        </Field>
      </Modal>
    </>
  );
}

function ModalAsync() {
  const [open, setOpen] = useState(false);
  const t = useToast();
  return (
    <>
      <Button onClick={() => setOpen(true)}>应用配置…</Button>
      <Modal open={open} title="应用配置" okText="应用"
             onCancel={() => setOpen(false)}
             onOk={() => new Promise((r) => setTimeout(r, 1200))
               .then(() => { setOpen(false); t({ level: 'success', message: '配置已应用。' }); })}>
        <p>将重启渲染进程并应用新配置,期间界面短暂不可用。</p>
      </Modal>
    </>
  );
}

function ModalLong() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>许可协议…</Button>
      <Modal open={open} title="许可协议" width={520}
             onCancel={() => setOpen(false)}
             footer={<Button variant="accent" onClick={() => setOpen(false)}>我已阅读</Button>}>
        {Array.from({ length: 24 }, (_, i) => (
          <p key={i}>第 {i + 1} 条:本软件按「现状」提供,不附带任何明示或默示的担保;在适用法律允许的最大范围内,作者不对因使用本软件造成的任何损失承担责任。</p>
        ))}
      </Modal>
    </>
  );
}

function ModalDangerDemo() {
  const [open, setOpen] = useState(false);
  const t = useToast();
  return (
    <>
      <Button danger onClick={() => setOpen(true)}>注销账户…</Button>
      <Modal open={open} title="注销账户" okText="永久注销" cancelText="再想想"
             okDanger closable={false} maskClosable={false} keyboard={false}
             onCancel={() => setOpen(false)}
             onOk={() => { setOpen(false); t({ level: 'success', message: '已注销。' }); }}>
        <p>注销后所有数据将被永久删除且无法恢复;遮罩、Esc 与右上角 X 均已禁用,请点按钮做出选择。</p>
      </Modal>
    </>
  );
}

function ModalLoadingDemo() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const t = useToast();
  const submit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      t({ level: 'success', message: '已提交。' });
    }, 1500);
  };
  return (
    <>
      <Button onClick={() => setOpen(true)}>提交申请…</Button>
      <Modal open={open} title="提交申请" okText="提交" confirmLoading={loading} destroyOnClose
             onCancel={() => setOpen(false)}
             onOk={submit}>
        <Field label="备注">
          <TextBox placeholder="随便输入点什么,关闭重开会被重置" aria-label="备注" style={{ width: '100%' }} />
        </Field>
      </Modal>
    </>
  );
}

function ConfirmDemo() {
  const confirm = useConfirm();
  const t = useToast();
  return (
    <Button danger onClick={() => {
      void confirm({ title: '删除 3 个文件?', message: '删除后无法恢复。', buttons: ['删除', '取消'], danger: true, defaultId: 1 })
        .then((i) => t({ level: i === 0 ? 'success' : 'info', message: i === 0 ? '已删除。' : '已取消。' }));
    }}>删除文件…</Button>
  );
}

const drawer: DocDef = {
  key: 'drawer',
  name: 'Drawer',
  cn: '抽屉',
  description:
    '四方位滑出的侧栏面板:placement 定方位(左/右/上/下)、size 定尺寸,遮罩从标题栏下方开始、点遮罩或 Esc 关闭。适合详情查看、次级表单等不打断主界面的场景。',
  importCode: `import { Drawer } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <DrawerDemo />,
      code: `
import { useState } from 'react';
import { Button, Drawer, TextBox } from '@fluent-react/ui';

export function DrawerExample() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开抽屉</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="连接详情" width={380}>
        <p className="leading-[1.7]">
          这里是抽屉内容:遮罩从标题栏下方开始,窗口拖动与最小化/关闭钮不受影响;点遮罩或按 Esc 关闭。
        </p>
        <TextBox placeholder="次级表单示例" className="mt-3" />
      </Drawer>
    </>
  );
}`,
    },
    {
      title: '方位与尺寸',
      description:
        'placement 从左 / 右 / 上 / 下滑出;size 定面板尺寸(left/right 为宽、top/bottom 为高),数字为像素,\'default\' = 378、\'large\' = 736。',
      demo: <DrawerPlacementDemo />,
      code: `
import { useState } from 'react';
import { Button, Drawer } from '@fluent-react/ui';

type Placement = 'left' | 'right' | 'top' | 'bottom';

export function DrawerPlacementExample() {
  // open 与 placement 分开存:关闭时方位保持不变,收起动画才会留在原侧
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<Placement>('right');
  const show = (p: Placement) => { setPlacement(p); setOpen(true); };
  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <Button onClick={() => show('left')}>左侧</Button>
        <Button onClick={() => show('right')}>右侧</Button>
        <Button onClick={() => show('top')}>顶部</Button>
        <Button onClick={() => show('bottom')}>底部</Button>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)}
              placement={placement} size={placement === 'top' || placement === 'bottom' ? 260 : 'default'}
              title={'从' + placement + '滑出'}>
        <p className="leading-[1.7]">placement 决定滑出方位;size 也可传 'large'(736px)。</p>
      </Drawer>
    </>
  );
}`,
    },
  ],
  props: [
    { name: 'open', type: 'boolean', description: '受控开合(必填)。' },
    { name: 'title', type: 'string', description: '头部标题。' },
    { name: 'placement', type: "'left' | 'right' | 'top' | 'bottom'", default: "'right'", description: '滑出方位。' },
    { name: 'size', type: "number | 'default' | 'large'", description: "面板尺寸:left/right 为宽、top/bottom 为高;'default'=378、'large'=736。" },
    { name: 'width', type: 'number', default: '360', description: '已并入 size,保留兼容(仅 left/right)。' },
    { name: 'children', type: 'ReactNode', description: '面板内容。' },
  ],
  events: [
    { name: 'onClose', type: '() => void', description: '请求关闭(遮罩点击 / Esc / 关闭钮)。' },
  ],
};

function DrawerPlacementDemo() {
  // open 与 placement 分开存:关闭时方位保持,收起动画仍在原侧播放
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState<'left' | 'right' | 'top' | 'bottom'>('right');
  const show = (p: typeof placement) => { setPlacement(p); setOpen(true); };
  return (
    <>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button onClick={() => show('left')}>左侧</Button>
        <Button onClick={() => show('right')}>右侧</Button>
        <Button onClick={() => show('top')}>顶部</Button>
        <Button onClick={() => show('bottom')}>底部</Button>
      </div>
      <Drawer open={open} onClose={() => setOpen(false)}
              placement={placement} size={placement === 'top' || placement === 'bottom' ? 260 : 'default'}
              title={`从${placement === 'left' ? '左侧' : placement === 'top' ? '顶部' : placement === 'bottom' ? '底部' : '右侧'}滑出`}>
        <p style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>placement 决定滑出方位;size 也可传 'large'(736px)。</p>
      </Drawer>
    </>
  );
}

function DrawerDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>打开抽屉</Button>
      <Drawer open={open} onClose={() => setOpen(false)} title="连接详情" width={380}>
        <p style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>
          这里是抽屉内容:遮罩从标题栏下方开始,窗口拖动与最小化/关闭钮不受影响;点遮罩或按 Esc 关闭。
        </p>
        <TextBox placeholder="次级表单示例" aria-label="示例输入" style={{ marginTop: 12 }} />
      </Drawer>
    </>
  );
}

const tooltip: DocDef = {
  key: 'tooltip',
  name: 'Tooltip',
  cn: '工具提示',
  description:
    '悬停延迟浮现的纯文字气泡(CSS data-tip 实现,零 JS 定位)。单个元素子节点直接克隆注入,复杂内容自动包一层 span。仅限简短说明,富内容用 TeachingTip。',
  importCode: `import { Tooltip } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <>
          <Tooltip tip="立即同步全部数据"><Button>同步</Button></Tooltip>
          <Tooltip tip="上次构建:3 分钟前"><span style={{ color: 'var(--text-2)', textDecoration: 'underline dotted' }}>构建状态</span></Tooltip>
        </>
      ),
      code: `
import { Button, Tooltip } from '@fluent-react/ui';

export function TooltipExample() {
  return (
    <>
      {/* 单个元素子节点直接克隆注入 */}
      <Tooltip tip="立即同步全部数据">
        <Button>同步</Button>
      </Tooltip>
      <Tooltip tip="上次构建:3 分钟前">
        <span className="underline decoration-dotted">构建状态</span>
      </Tooltip>
    </>
  );
}`,
    },
  ],
  props: [
    { name: 'tip', type: 'string', description: '提示文本(必填)。' },
    { name: 'children', type: 'ReactNode', description: '触发元素。' },
  ],
};

const popover: DocDef = {
  key: 'popover',
  name: 'Popover',
  cn: '气泡浮层',
  description:
    '富内容气泡(WinUI Flyout 形态,无箭头):Tooltip 只放一句纯文本,Popover 承载标题 + 任意内容(表单控件、按钮、说明段落)。portal 到 body(z-850)不被父容器裁切,锚点下方展开、放不下自动上翻、滚动跟随;支持 click / hover 触发与受控开合。',
  importCode: `import { Popover } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法(click 触发)',
      description: '点击锚点开合;点浮层外部或按 Esc 关闭。',
      demo: (
        <Popover title="代理设置" content={
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Switch defaultChecked>使用系统代理</Switch>
            <TextBox placeholder="127.0.0.1:7890" aria-label="代理地址" size="small" />
          </div>
        }>
          <Button>网络选项</Button>
        </Popover>
      ),
      code: `
import { Button, Popover, TextBox, Switch } from '@fluent-react/ui';

export function PopoverExample() {
  return (
    // 点击锚点开合;点浮层外部或按 Esc 关闭
    <Popover
      title="代理设置"
      content={
        <div className="flex flex-col gap-2">
          <Switch defaultChecked>使用系统代理</Switch>
          <TextBox placeholder="127.0.0.1:7890" size="small" />
        </div>
      }
    >
      <Button>网络选项</Button>
    </Popover>
  );
}`,
    },
    {
      title: 'hover 触发',
      description: '移入锚点展开,移出 150ms 后收起;移入浮层本身不收,便于点击其中内容。',
      demo: (
        <Popover trigger="hover" title="构建产物"
                 content={<span>dist/index.js · 364 kB(gzip 114 kB)<br />构建于 2 分钟前。</span>}>
          <Button variant="subtle">最近构建</Button>
        </Popover>
      ),
      code: `
import { Button, Popover } from '@fluent-react/ui';

export function PopoverHoverExample() {
  return (
    // 移入锚点展开,移出 150ms 后收起;移入浮层本身不收,便于点击其中内容
    <Popover
      trigger="hover"
      title="构建产物"
      content={
        <span>
          dist/index.js · 364 kB(gzip 114 kB)
          <br />
          构建于 2 分钟前。
        </span>
      }
    >
      <Button variant="subtle">最近构建</Button>
    </Popover>
  );
}`,
    },
    {
      title: '受控开合',
      demo: <PopoverControlled />,
      code: `
import { useState } from 'react';
import { Button, Popover } from '@fluent-react/ui';

export function PopoverControlledExample() {
  const [open, setOpen] = useState(false);
  return (
    // onOpenChange 同步外点 / Esc 引起的关闭
    <Popover
      open={open}
      onOpenChange={setOpen}
      title="受控浮层"
      content={
        <Button size="small" onClick={() => setOpen(false)}>完成并关闭</Button>
      }
    >
      <Button onClick={() => setOpen(!open)}>受控锚点({open ? '开' : '关'})</Button>
    </Popover>
  );
}`,
    },
    {
      title: '非受控初始展开(defaultOpen)',
      description: 'defaultOpen 让浮层挂载即展开,之后开合完全由内部状态管理(外点 / Esc / 再点锚点均生效),适合引导用户注意某个入口。',
      demo: <PopoverDefaultOpenDemo />,
      code: `
import { useState } from 'react';
import { Button, Popover } from '@fluent-react/ui';

export function PopoverDefaultOpenExample() {
  const [mounted, setMounted] = useState(false);
  return (
    <>
      <Button onClick={() => setMounted(!mounted)}>
        {mounted ? '卸载浮层' : '挂载 defaultOpen 浮层'}
      </Button>
      {mounted && (
        // defaultOpen:挂载即展开,之后开合由内部状态管理
        <Popover defaultOpen title="非受控浮层" content={<span>挂载即展开;点外部或按 Esc 关闭。</span>}>
          <Button variant="subtle">锚点</Button>
        </Popover>
      )}
    </>
  );
}`,
    },
  ],
  props: [
    { name: 'content', type: 'ReactNode', description: '浮层内容(必填)。' },
    { name: 'title', type: 'ReactNode', description: '浮层标题行。' },
    { name: 'trigger', type: "'click' | 'hover'", default: "'click'", description: '触发方式;hover 离开 150ms 延迟收起。' },
    { name: 'open / defaultOpen', type: 'boolean', description: '受控 / 非受控初始开合。' },
    { name: 'children', type: 'ReactNode', description: '锚点元素。' },
  ],
  events: [
    { name: 'onOpenChange', type: '(open: boolean) => void', description: '开合变化(含外点/Esc 关闭)。' },
  ],
};

function PopoverControlled() {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen} title="受控浮层"
             content={<Button size="small" onClick={() => setOpen(false)}>完成并关闭</Button>}>
      <Button onClick={() => setOpen(!open)}>受控锚点({open ? '开' : '关'})</Button>
    </Popover>
  );
}

function PopoverDefaultOpenDemo() {
  const [mounted, setMounted] = useState(false);
  return (
    <>
      <Button onClick={() => setMounted(!mounted)}>
        {mounted ? '卸载浮层' : '挂载 defaultOpen 浮层'}
      </Button>
      {mounted && (
        <Popover defaultOpen title="非受控浮层" content={<span>挂载即展开;点外部或按 Esc 关闭。</span>}>
          <Button variant="subtle">锚点</Button>
        </Popover>
      )}
    </>
  );
}

const teachingtip: DocDef = {
  key: 'teachingtip',
  name: 'TeachingTip',
  cn: '教学提示',
  description:
    '锚定某控件的富内容气泡(WinUI TeachingTip):标题 + 正文 + 操作区,带指向箭头。portal 到 body 的 fixed 定位,滚动/缩放实时跟随锚点,z-700 不被导航遮挡。',
  importCode: `import { TeachingTip } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <TeachingDemo />,
      code: `
import { useState } from 'react';
import { Button, TeachingTip } from '@fluent-react/ui';

export function TeachingTipExample() {
  const [open, setOpen] = useState(false);
  return (
    // children 即锚点元素,气泡带箭头指向它
    <TeachingTip
      open={open}
      onClose={() => setOpen(false)}
      title="新功能:自动保存"
      content="编辑将每 30 秒自动保存到本地。"
      actions={
        <Button size="small" variant="accent" onClick={() => setOpen(false)}>知道了</Button>
      }
    >
      <Button onClick={() => setOpen(true)}>展示提示</Button>
    </TeachingTip>
  );
}`,
    },
    {
      title: '指向方位',
      description: 'placement 控制气泡相对锚点的方位:默认 bottom 在锚点下方,top 时出现在上方、箭头朝下。',
      demo: <TeachingPlacementDemo />,
      code: `
import { useState } from 'react';
import { Button, TeachingTip } from '@fluent-react/ui';

export function TeachingTipPlacementExample() {
  const [open, setOpen] = useState(false);
  return (
    // placement="top":气泡出现在锚点上方,箭头朝下
    <TeachingTip
      open={open}
      onClose={() => setOpen(false)}
      placement="top"
      title="向上指向"
      content="placement 为 top 时气泡出现在锚点上方。"
      actions={
        <Button size="small" onClick={() => setOpen(false)}>关闭</Button>
      }
    >
      <Button onClick={() => setOpen(true)}>上方展示</Button>
    </TeachingTip>
  );
}`,
    },
  ],
  props: [
    { name: 'open', type: 'boolean', description: '受控开合(必填)。' },
    { name: 'title', type: 'ReactNode', description: '标题(必填)。' },
    { name: 'content', type: 'ReactNode', description: '正文。' },
    { name: 'actions', type: 'ReactNode', description: '操作区按钮。' },
    { name: 'placement', type: "'bottom' | 'top'", default: "'bottom'", description: '相对锚点方位。' },
    { name: 'children', type: 'ReactNode', description: '锚点元素。' },
  ],
  events: [
    { name: 'onClose', type: '() => void', description: '请求关闭(Esc / 关闭钮)。' },
  ],
};

function TeachingDemo() {
  const [open, setOpen] = useState(false);
  return (
    <TeachingTip open={open} onClose={() => setOpen(false)} title="新功能:自动保存"
                 content="编辑将每 30 秒自动保存到本地。"
                 actions={<Button size="small" variant="accent" onClick={() => setOpen(false)}>知道了</Button>}>
      <Button onClick={() => setOpen(true)}>展示提示</Button>
    </TeachingTip>
  );
}

function TeachingPlacementDemo() {
  const [open, setOpen] = useState(false);
  return (
    <TeachingTip open={open} onClose={() => setOpen(false)} placement="top" title="向上指向"
                 content="placement 为 top 时气泡出现在锚点上方。"
                 actions={<Button size="small" onClick={() => setOpen(false)}>关闭</Button>}>
      <Button onClick={() => setOpen(true)}>上方展示</Button>
    </TeachingTip>
  );
}

const infobar: DocDef = {
  key: 'infobar',
  name: 'InfoBar',
  cn: '信息栏',
  description:
    '页面内嵌的常驻状态条(非浮层):四级语义色 + 图标 + 标题/正文,error 级别 role=alert。适合表单顶部错误汇总、页面级公告。',
  importCode: `import { InfoBar } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
          <InfoBar level="info" title="提示">当前处于独立预览(mock 宿主)。</InfoBar>
          <InfoBar level="success" title="已连接">IPC 通道工作正常。</InfoBar>
          <InfoBar level="warning" title="注意">磁盘剩余空间不足 10%。</InfoBar>
          <InfoBar level="error" title="失败">配置文件解析出错。</InfoBar>
        </div>
      ),
      code: `
import { InfoBar } from '@fluent-react/ui';

export function InfoBarExample() {
  return (
    <div className="flex flex-col gap-2">
      <InfoBar level="info" title="提示">当前处于独立预览(mock 宿主)。</InfoBar>
      <InfoBar level="success" title="已连接">IPC 通道工作正常。</InfoBar>
      <InfoBar level="warning" title="注意">磁盘剩余空间不足 10%。</InfoBar>
      {/* error 级别自动带 role=alert */}
      <InfoBar level="error" title="失败">配置文件解析出错。</InfoBar>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'level', type: "'info' | 'success' | 'warning' | 'error'", default: "'info'", description: '语义级别。' },
    { name: 'title', type: 'string', description: '加粗标题。' },
    { name: 'children', type: 'ReactNode', description: '正文。' },
  ],
};

const spin: DocDef = {
  key: 'spin',
  name: 'Spin',
  cn: '加载容器',
  description:
    '包住任意区域的加载态(antd API):spinning 时内容压暗禁交互、居中 ProgressRing + tip;delay 毫秒内结束的加载不闪遮罩。不包 children 时为独立居中指示器。区别:Skeleton 用于首屏占位,Spin 用于已有内容的刷新 / 提交。',
  importCode: `import { Spin } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <SpinDemo />,
      code: `
import { useState } from 'react';
import { Button, Card, Spin } from '@fluent-react/ui';

export function SpinExample() {
  const [loading, setLoading] = useState(false);
  // 模拟一次 1.8 秒的刷新
  const load = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1800);
  };
  return (
    <div className="flex flex-col gap-2.5 w-[340px]">
      {/* delay 毫秒内结束的加载不闪遮罩 */}
      <Spin spinning={loading} tip="正在刷新…" delay={200}>
        <Card className="p-4">
          <b>数据面板</b>
          <p>被包住的内容区:spinning 时压暗禁交互。</p>
        </Card>
      </Spin>
      <Button size="small" onClick={load} disabled={loading}>模拟刷新</Button>
    </div>
  );
}`,
    },
    {
      title: '独立指示器',
      demo: (
        <>
          <Spin size={20} />
          <Spin tip="加载中" />
        </>
      ),
      code: `
import { Spin } from '@fluent-react/ui';

export function SpinIndicatorExample() {
  return (
    <>
      {/* 不包 children 时为独立居中指示器 */}
      <Spin size={20} />
      <Spin tip="加载中" />
    </>
  );
}`,
    },
    {
      title: '着色',
      description: 'color 作用于加载圆环。',
      demo: (
        <div className="flex flex-wrap gap-6 items-center">
          <Spin color="success" tip="成功" />
          <Spin color="warning" tip="警告" />
          <Spin color="danger" tip="危险" />
        </div>
      ),
      code: `
import { Spin } from '@fluent-react/ui';

export function SpinColorExample() {
  return (
    <div className="flex flex-wrap gap-6 items-center">
      <Spin color="success" tip="成功" />
      <Spin color="warning" tip="警告" />
      <Spin color="danger" tip="危险" />
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色:圆环随之变色。' },
    { name: 'spinning', type: 'boolean', default: 'true', description: '是否处于加载态。' },
    { name: 'tip', type: 'string', description: '圆环下方文案。' },
    { name: 'size', type: 'number', default: '28', description: '圆环直径。' },
    { name: 'delay', type: 'number', default: '0', description: '延迟显示毫秒,短加载不闪遮罩。' },
    { name: 'children', type: 'ReactNode', description: '被包住的内容;不传则渲染独立指示器。' },
  ],
};

function SpinDemo() {
  const [loading, setLoading] = useState(false);
  const load = () => { setLoading(true); setTimeout(() => setLoading(false), 1800); };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: 340 }}>
      <Spin spinning={loading} tip="正在刷新…" delay={200}>
        <Card style={{ padding: 16 }}>
          <b>数据面板</b>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
            <Skeleton style={{ height: 12, width: '85%' }} />
            <Skeleton style={{ height: 12, width: '60%' }} />
          </div>
        </Card>
      </Spin>
      <Button size="small" style={{ alignSelf: 'flex-start' }} onClick={load} disabled={loading}>模拟刷新</Button>
    </div>
  );
}

const progress: DocDef = {
  key: 'progress',
  name: 'Progress',
  cn: '进度',
  description:
    'ProgressBar 横向进度条:确定态按百分比填充、showInfo 右侧显示文字,indeterminate 为往返滑动;ProgressRing 双形态:传 value 为环形进度(可环心显示百分比),不传为不定态旋转圆环(WinUI 弧长呼吸)。',
  importCode: `import { ProgressBar, ProgressRing } from '@fluent-react/ui';`,
  sections: [
    {
      title: '基础用法',
      demo: <ProgressDemo />,
      code: `
import { useState } from 'react';
import { Button, ProgressBar, ProgressRing } from '@fluent-react/ui';

export function ProgressExample() {
  const [value, setValue] = useState(65);
  return (
    <div className="flex flex-col gap-3.5 w-[300px]">
      <ProgressBar value={value} />
      <ProgressBar indeterminate />
      <div className="flex items-center gap-3">
        {/* 不传 value:不定态旋转圆环 */}
        <ProgressRing />
        <Button size="small" onClick={() => setValue((value + 20) % 120)}>推进进度</Button>
      </div>
    </div>
  );
}`,
    },
    {
      title: '文字显示',
      description: 'showInfo 在条右侧显示百分比;format 自定义文案。',
      demo: <ProgressInfoDemo />,
      code: `
import { useState } from 'react';
import { Button, ProgressBar } from '@fluent-react/ui';

export function ProgressInfoExample() {
  const [value, setValue] = useState(42);
  return (
    <div className="flex flex-col gap-3.5 w-[320px]">
      <ProgressBar value={value} showInfo />
      {/* format 自定义文案 */}
      <ProgressBar value={value} showInfo format={(n) => \`\${n} / 100 项\`} />
      <Button size="small" onClick={() => setValue((value + 19) % 119)}>推进进度</Button>
    </div>
  );
}`,
    },
    {
      title: '圆形进度',
      description: '传 value 即为确定态环形(默认 64px,accent 圆头描边,进度变化平滑过渡);showInfo 环心显示百分比,size 自定义直径。',
      demo: <ProgressCircleDemo />,
      code: `
import { useState } from 'react';
import { Button, ProgressRing } from '@fluent-react/ui';

export function ProgressRingExample() {
  const [value, setValue] = useState(65);
  return (
    <div className="flex items-center gap-5">
      {/* 传 value 即为确定态环形,进度变化平滑过渡 */}
      <ProgressRing value={value} showInfo />
      <ProgressRing value={value} size={48} />
      <ProgressRing
        value={value}
        size={96}
        showInfo
        format={(n) => (n >= 100 ? '完成' : \`\${Math.round(n)}%\`)}
      />
      <Button size="small" onClick={() => setValue(Math.min(100, value + 15) % 101 || 5)}>
        推进进度
      </Button>
    </div>
  );
}`,
    },
    {
      title: '着色',
      description: 'color 作用于 ProgressBar 填充与 ProgressRing 圆环。',
      demo: (
        <div className="flex flex-col gap-3 w-[280px]">
          <ProgressBar value={60} color="success" showInfo />
          <ProgressBar value={40} color="warning" showInfo />
          <ProgressBar value={25} color="danger" showInfo />
          <div className="flex gap-4 items-center">
            <ProgressRing value={70} color="success" showInfo size={56} />
            <ProgressRing value={45} color="warning" showInfo size={56} />
            <ProgressRing color="danger" size={28} />
          </div>
        </div>
      ),
      code: `
import { ProgressBar, ProgressRing } from '@fluent-react/ui';

export function ProgressColorExample() {
  return (
    <div className="flex flex-col gap-3 w-[280px]">
      <ProgressBar value={60} color="success" showInfo />
      <ProgressBar value={40} color="warning" showInfo />
      <ProgressBar value={25} color="danger" showInfo />
      <div className="flex gap-4 items-center">
        <ProgressRing value={70} color="success" showInfo size={56} />
        <ProgressRing value={45} color="warning" showInfo size={56} />
        <ProgressRing color="danger" size={28} />
      </div>
    </div>
  );
}`,
    },
  ],
  props: [
    { name: 'color', type: "'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger'", default: "'default'", description: '语义着色:Bar 填充 / Ring 圆环随之变色。' },
    { name: 'value', type: 'number', description: '进度 0~100(ProgressBar)。' },
    { name: 'indeterminate', type: 'boolean', default: 'false', description: '不定态往返滑动(忽略 value)。' },
    { name: 'showInfo', type: 'boolean', default: 'false', description: '右侧显示进度文字。' },
    { name: 'format', type: '(value: number) => string', default: '`${v}%`', description: '文字内容自定义。' },
  ],
  extraApis: [
    {
      title: 'ProgressRing Props',
      rows: [
        { name: 'value', type: 'number', description: '进度 0~100;缺省为不定态旋转圆环。' },
        { name: 'size', type: 'number', default: '不定态 24 / 确定态 64', description: '像素直径。' },
        { name: 'showInfo', type: 'boolean', default: 'false', description: '环心显示进度文字(仅确定态)。' },
        { name: 'format', type: '(value: number) => string', default: '`${v}%`', description: '文字内容自定义。' },
      ],
    },
  ],
};

function ProgressDemo() {
  const [v, setV] = useState(65);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 300 }}>
      <ProgressBar value={v} />
      <ProgressBar indeterminate />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ProgressRing />
        <Button size="small" onClick={() => setV((v + 20) % 120)}>推进进度</Button>
      </div>
    </div>
  );
}

function ProgressInfoDemo() {
  const [v, setV] = useState(42);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 320 }}>
      <ProgressBar value={v} showInfo />
      <ProgressBar value={v} showInfo format={(n) => `${n} / 100 项`} />
      <Button size="small" style={{ alignSelf: 'flex-start' }} onClick={() => setV((v + 19) % 119)}>推进进度</Button>
    </div>
  );
}

function ProgressCircleDemo() {
  const [v, setV] = useState(65);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <ProgressRing value={v} showInfo />
      <ProgressRing value={v} size={48} />
      <ProgressRing value={v} size={96} showInfo format={(n) => (n >= 100 ? '完成' : `${Math.round(n)}%`)} />
      <Button size="small" onClick={() => setV(Math.min(100, v + 15) % 101 || 5)}>推进进度</Button>
    </div>
  );
}

export const feedbackDocs: DocDef[] = [toast, modalDoc, drawer, tooltip, popover, teachingtip, infobar, spin, progress];
